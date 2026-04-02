import express from 'express';
import Stripe from 'stripe';
import { getDb, notifyAdmins } from './db';
import { users, purchases, userStages, stages } from '../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { PACKAGE_ACCESS } from './products';

// Singleton Stripe instance
let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-03-31.basil' as any,
    });
  }
  return stripeInstance;
}

export { getStripe };

export function registerStripeWebhook(app: express.Application) {
  // CRITICAL: This must be registered BEFORE express.json() middleware
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }

      event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle test events
    if (event.id.startsWith('evt_test_')) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Stripe Webhook] Event received: ${event.type}`, event.id);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`[Stripe Webhook] PaymentIntent succeeded: ${paymentIntent.id}`);
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`[Stripe Webhook] PaymentIntent failed: ${paymentIntent.id}`);
          await handlePaymentFailed(paymentIntent);
          break;
        }
        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err: any) {
      console.error(`[Stripe Webhook] Error processing ${event.type}: ${err.message}`);
    }

    res.json({ received: true });
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    console.error('[Stripe Webhook] Database not available');
    return;
  }

  const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;
  const productId = session.metadata?.product_id;

  if (!userId || !productId) {
    console.error('[Stripe Webhook] Missing user_id or product_id in metadata', session.id);
    return;
  }

  console.log(`[Stripe Webhook] Checkout completed for user ${userId}, product: ${productId}`);

  // Update purchase record
  await db
    .update(purchases)
    .set({
      status: 'completed',
      stripePaymentIntentId: session.payment_intent as string,
      completedAt: new Date(),
    })
    .where(eq(purchases.stripeSessionId, session.id));

  // Update user's purchased package
  const packageProducts = ['basic_package', 'professional_package', 'enterprise_package'];
  if (packageProducts.includes(productId)) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const packageRank: Record<string, number> = {
      basic_package: 1,
      professional_package: 2,
      enterprise_package: 3,
    };
    
    const currentRank = packageRank[user?.purchasedPackage || ''] || 0;
    const newRank = packageRank[productId] || 0;

    if (newRank > currentRank) {
      await db
        .update(users)
        .set({
          purchasedPackage: productId,
          stripeCustomerId: session.customer as string,
        })
        .where(eq(users.id, userId));
    }

    // Paket bazlı etap açma
    await unlockStagesForPackage(userId, productId);
  }

  // If it's a single AI report purchase
  if (productId === 'ai_career_report') {
    await db
      .update(users)
      .set({
        stripeCustomerId: session.customer as string,
      })
      .where(eq(users.id, userId));
  }

  // If it's a single stage unlock
  if (productId === 'single_stage_unlock') {
    const stageIdStr = session.metadata?.stage_id;
    if (stageIdStr) {
      const stageId = parseInt(stageIdStr);
      await unlockSingleStage(userId, stageId);
    }
  }

  console.log(`[Stripe Webhook] Purchase completed for user ${userId}, product: ${productId}`);

  // Admin'lere satın alma bildirimi gönder
  try {
    const [user] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, userId));
    const productNames: Record<string, string> = {
      basic_package: 'Temel Paket',
      professional_package: 'Profesyonel Paket',
      enterprise_package: 'Kurumsal Paket',
      ai_career_report: 'AI Kariyer Raporu',
      single_stage_unlock: 'Tekli Etap Açma',
    };
    const productName = productNames[productId] || productId;
    const amount = session.amount_total ? `${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase() || 'TRY'}` : '';
    await notifyAdmins({
      title: '💳 Yeni Satın Alma',
      message: `${user?.name || 'Kullanıcı'} (${user?.email || ''}) ${productName} satın aldı.${amount ? ` Tutar: ${amount}` : ''}`,
      type: 'success',
      link: '/dashboard/admin?tab=payments',
    });
  } catch (e) {
    console.warn('Failed to notify admins about purchase:', e);
  }
}

/**
 * Paket bazlı etap açma - satın alınan pakete göre kilitli etapları açar
 */
async function unlockStagesForPackage(userId: number, packageId: string) {
  const db = await getDb();
  if (!db) return;

  const access = PACKAGE_ACCESS[packageId];
  if (!access) return;

  // Kullanıcının mevcut etaplarını al
  const currentStages = await db
    .select({
      id: userStages.id,
      stageId: userStages.stageId,
      status: userStages.status,
      stageOrder: stages.order,
    })
    .from(userStages)
    .innerJoin(stages, eq(userStages.stageId, stages.id))
    .where(eq(userStages.userId, userId))
    .orderBy(stages.order);

  // Paket erişim hakkına göre kilitli etapları aç
  // maxStages: kaç etaba erişim hakkı var
  const lockedStages = currentStages.filter(s => s.status === 'locked');
  const completedOrActive = currentStages.filter(s => s.status !== 'locked').length;
  
  // Sıradaki kilitli etabı aç (bir önceki tamamlanmışsa)
  // Mantık: Tamamlanan etap sayısı + 1 <= maxStages ise, sıradaki kilitli etabı aç
  for (const lockedStage of lockedStages) {
    if (lockedStage.stageOrder <= access.maxStages) {
      // Bu etabın önceki etabı tamamlanmış mı kontrol et
      const previousStage = currentStages.find(s => s.stageOrder === lockedStage.stageOrder - 1);
      const canUnlock = !previousStage || previousStage.status === 'completed';
      
      if (canUnlock) {
        await db
          .update(userStages)
          .set({ 
            status: 'active', 
            unlockedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userStages.id, lockedStage.id));
        
        console.log(`[Stripe Webhook] Unlocked stage ${lockedStage.stageId} (order: ${lockedStage.stageOrder}) for user ${userId} via package ${packageId}`);
        // Sadece sıradaki bir etabı aç, geri kalanı tamamlandıkça açılacak
        break;
      }
    }
  }
}

/**
 * Tekli etap açma - belirli bir etabı açar
 */
async function unlockSingleStage(userId: number, stageId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(userStages)
    .set({ 
      status: 'active', 
      unlockedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(
      eq(userStages.userId, userId),
      eq(userStages.stageId, stageId),
      eq(userStages.status, 'locked'),
    ));

  console.log(`[Stripe Webhook] Single stage unlock: stage ${stageId} for user ${userId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(purchases)
    .set({ status: 'failed' })
    .where(eq(purchases.stripePaymentIntentId, paymentIntent.id));

  console.error(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);
}
