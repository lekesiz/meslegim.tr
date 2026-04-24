/**
 * Birleşik Bildirim Servisi
 * E-posta, push ve in-app bildirimleri tek bir yerden yönetir.
 */
import webpush from 'web-push';
import { getDb } from '../db';
import { pushSubscriptions, emailPreferences, notifications, scheduledReminders, users, stages as stagesTable } from '../../drizzle/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { sendEmail } from '../_core/resend-email';
import logger from '../utils/logger';

// VAPID configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:noreply@meslegim.tr',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// ─── Push Subscription Management ────────────────────────────────────────────

export async function savePushSubscription(userId: number, subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}, userAgent?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // Remove existing subscription with same endpoint
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, subscription.endpoint));
  // Insert new
  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    userAgent: userAgent || null,
  });
}

export async function removePushSubscription(userId: number, endpoint: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(pushSubscriptions).where(
    and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint))
  );
}

export async function getUserPushSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
}

// ─── Email Preferences ──────────────────────────────────────────────────────

export async function getEmailPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [prefs] = await db.select().from(emailPreferences).where(eq(emailPreferences.userId, userId));
  if (!prefs) {
    // Create default preferences
    await db.insert(emailPreferences).values({ userId });
    const [newPrefs] = await db.select().from(emailPreferences).where(eq(emailPreferences.userId, userId));
    return newPrefs!;
  }
  return prefs;
}

export async function updateEmailPreferences(userId: number, prefs: Partial<{
  stageActivation: boolean;
  reportReady: boolean;
  badgeEarned: boolean;
  certificateReady: boolean;
  stageReminder: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const existing = await getEmailPreferences(userId);
  await db.update(emailPreferences).set(prefs).where(eq(emailPreferences.userId, userId));
  return { ...existing, ...prefs };
}

// ─── Send Push Notification ─────────────────────────────────────────────────

export async function sendPushNotification(userId: number, payload: {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    logger.warn('VAPID keys not configured, skipping push notification');
    return { sent: 0, failed: 0 };
  }

  const subs = await getUserPushSubscriptions(userId);
  let sent = 0;
  let failed = 0;

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/logo.png',
    data: { url: payload.url || '/dashboard' },
    tag: payload.tag || 'meslegim-notification',
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        notificationPayload
      );
      sent++;
    } catch (error: any) {
      failed++;
      // Remove invalid subscriptions (410 Gone or 404)
      if (error.statusCode === 410 || error.statusCode === 404) {
        const db = await getDb();
        if (db) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
      logger.error(`Push notification failed for sub ${sub.id}:`, error.message);
    }
  }

  return { sent, failed };
}

// ─── Unified Notification Dispatcher ────────────────────────────────────────

export type NotificationEvent =
  | 'stage_activation'
  | 'report_ready'
  | 'report_approved'
  | 'report_rejected'
  | 'badge_earned'
  | 'certificate_ready'
  | 'stage_reminder'
  | 'mentor_assigned'
  | 'account_approved';

interface NotifyOptions {
  userId: number;
  event: NotificationEvent;
  title: string;
  message: string;
  link?: string;
  emailHtml?: string;
  emailSubject?: string;
  pushPayload?: {
    body: string;
    url?: string;
    tag?: string;
  };
}

/**
 * Birleşik bildirim gönderici - in-app, e-posta ve push bildirimlerini tek çağrıda gönderir
 */
export async function notify(options: NotifyOptions) {
  const results = { inApp: false, email: false, push: { sent: 0, failed: 0 } };
  const db = await getDb();
  if (!db) return results;

  // 1. In-app notification (her zaman)
  try {
    await db.insert(notifications).values({
      userId: options.userId,
      title: options.title,
      message: options.message,
      type: getNotificationType(options.event),
      link: options.link,
    });
    results.inApp = true;
  } catch (err) {
    logger.error('In-app notification failed:', err);
  }

  // 2. E-posta bildirimi (kullanıcı tercihine göre)
  if (options.emailHtml && options.emailSubject) {
    try {
      const prefs = await getEmailPreferences(options.userId);
      const shouldSendEmail = checkEmailPreference(prefs, options.event);

      if (shouldSendEmail) {
        const [user] = await db.select({ email: users.email, name: users.name })
          .from(users).where(eq(users.id, options.userId));
        if (user?.email) {
          results.email = await sendEmail({
            to: user.email,
            subject: options.emailSubject,
            html: options.emailHtml,
          });
        }
      }
    } catch (err) {
      logger.error('Email notification failed:', err);
    }
  }

  // 3. Push bildirimi
  if (options.pushPayload) {
    try {
      results.push = await sendPushNotification(options.userId, {
        title: options.title,
        body: options.pushPayload.body,
        url: options.pushPayload.url || options.link,
        tag: options.pushPayload.tag,
      });
    } catch (err) {
      logger.error('Push notification failed:', err);
    }
  }

  return results;
}

function getNotificationType(event: NotificationEvent): string {
  switch (event) {
    case 'badge_earned':
    case 'certificate_ready':
    case 'account_approved':
    case 'report_approved':
      return 'success';
    case 'report_rejected':
    case 'stage_reminder':
      return 'warning';
    default:
      return 'info';
  }
}

function checkEmailPreference(prefs: any, event: NotificationEvent): boolean {
  switch (event) {
    case 'stage_activation': return prefs.stageActivation;
    case 'report_ready': return prefs.reportReady;
    case 'report_approved': return prefs.reportReady;
    case 'report_rejected': return prefs.reportReady;
    case 'badge_earned': return prefs.badgeEarned;
    case 'certificate_ready': return prefs.certificateReady;
    case 'stage_reminder': return prefs.stageReminder;
    default: return true;
  }
}

// ─── Badge Earned Email Template ────────────────────────────────────────────

export function getBadgeEarnedEmailTemplate(name: string, badgeName: string, badgeDescription: string, badgeIcon: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .badge-card { background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .badge-icon { font-size: 48px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">🏆 Yeni Rozet Kazandınız!</h1>
        </div>
        <div class="content">
          <h2>Tebrikler, ${name}!</h2>
          <p>Kariyer değerlendirme sürecinizde yeni bir başarı elde ettiniz!</p>
          <div class="badge-card">
            <div class="badge-icon">${badgeIcon}</div>
            <h3 style="margin: 5px 0;">${badgeName}</h3>
            <p style="color: #6b7280; margin: 5px 0;">${badgeDescription}</p>
          </div>
          <p>Tüm rozetlerinizi ve başarılarınızı görmek için dashboard'unuzu ziyaret edin.</p>
          <p style="text-align: center;">
            <a href="https://meslegim.tr/dashboard/student/achievements" class="button">Başarılarımı Gör</a>
          </p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ─── Stage Reminder Email Template ──────────────────────────────────────────

export function getStageReminderEmailTemplate(name: string, stageName: string, daysRemaining: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
        .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
          <h1 style="margin: 0;">⏰ Etap Hatırlatması</h1>
        </div>
        <div class="content">
          <h2>Merhaba, ${name}!</h2>
          <div class="reminder-box">
            <strong>📋 ${stageName}</strong> etabınız henüz tamamlanmadı.
            ${daysRemaining > 0 ? `<p>Bir sonraki etabın açılmasına <strong>${daysRemaining} gün</strong> kaldı.</p>` : ''}
          </div>
          <p>Kariyer değerlendirme sürecinize devam etmek için etabınızı tamamlamanızı öneriyoruz.</p>
          <p>Her etap, kariyer profilinizin daha doğru ve kapsamlı olmasına katkı sağlar.</p>
          <p style="text-align: center;">
            <a href="https://meslegim.tr/dashboard" class="button">Etabı Tamamla</a>
          </p>
          <div class="footer">
            <p>Bu e-posta Meslegim.tr tarafından otomatik olarak gönderilmiştir.</p>
            <p>E-posta tercihlerinizi dashboard ayarlarından değiştirebilirsiniz.</p>
            <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ─── Scheduled Reminders ────────────────────────────────────────────────────

export async function createStageReminder(userId: number, stageId: number, scheduledFor: Date) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // Don't create duplicate reminders
  const existing = await db.select().from(scheduledReminders).where(
    and(
      eq(scheduledReminders.userId, userId),
      eq(scheduledReminders.relatedId, stageId),
      eq(scheduledReminders.type, 'stage_incomplete'),
      eq(scheduledReminders.sent, false)
    )
  );
  if (existing.length > 0) return existing[0];

  const [reminder] = await db.insert(scheduledReminders).values({
    userId,
    type: 'stage_incomplete',
    scheduledFor,
    relatedId: stageId,
  }).$returningId();
  return reminder;
}

export async function processPendingReminders() {
  const db = await getDb();
  if (!db) return { processed: 0, total: 0 };
  const now = new Date();

  // Get all pending reminders that are due
  const pendingReminders = await db.select().from(scheduledReminders)
    .where(and(
      eq(scheduledReminders.sent, false),
      lte(scheduledReminders.scheduledFor, now)
    ));

  let processed = 0;

  for (const reminder of pendingReminders) {
    try {
      if (reminder.type === 'stage_incomplete' && reminder.relatedId) {
        // Get user and stage info
        const [user] = await db.select().from(users).where(eq(users.id, reminder.userId));
        if (!user) continue;

        const [stage] = await db.select().from(stagesTable).where(eq(stagesTable.id, reminder.relatedId));
        if (!stage) continue;

        // Send reminder via unified notify
        await notify({
          userId: reminder.userId,
          event: 'stage_reminder',
          title: 'Etap Hatırlatması',
          message: `"${stage.name}" etabınız henüz tamamlanmadı. Kariyer değerlendirme sürecinize devam etmenizi öneriyoruz.`,
          link: '/dashboard',
          emailSubject: `⏰ Etap Hatırlatması: ${stage.name}`,
          emailHtml: getStageReminderEmailTemplate(user.name || 'Öğrenci', stage.name, 0),
          pushPayload: {
            body: `"${stage.name}" etabınız henüz tamamlanmadı.`,
            url: '/dashboard',
            tag: `stage-reminder-${stage.id}`,
          },
        });
      }

      // Mark as sent
      await db.update(scheduledReminders).set({ sent: true }).where(eq(scheduledReminders.id, reminder.id));
      processed++;
    } catch (err) {
      logger.error(`Failed to process reminder ${reminder.id}:`, err);
    }
  }

  return { processed, total: pendingReminders.length };
}
