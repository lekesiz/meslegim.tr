import express from 'express';
import Stripe from 'stripe';
import { getDb } from './db';
import { users, purchases } from '../drizzle/schema';
import { eq } from 'drizzle-orm';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any,
});

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

      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle test events
    if (event.id.startsWith('evt_test_')) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ 
        verified: true,
      });
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

  console.log(`[Stripe Webhook] Purchase completed for user ${userId}, product: ${productId}`);
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
