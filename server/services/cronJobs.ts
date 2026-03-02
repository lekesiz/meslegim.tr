import cron from 'node-cron';
import { getDb, getPlatformSettingNumber } from '../db';
import { userStages, stages, users } from '../../drizzle/schema';
import { eq, and, lt, gt, between } from 'drizzle-orm';
import { sendEmail } from '../_core/resend-email';
import { getNewStageActivatedEmailTemplate, getStageReminderEmailTemplate } from './emailService';

/**
 * Check and activate stages that should be unlocked based on configurable delay
 */
export async function checkAndActivateStages() {
  const db = await getDb();
  if (!db) {
    console.warn('[Cron] Database not available');
    return;
  }

  try {
    console.log('[Cron] Stage activation check started...');

    // Find locked stages whose unlockedAt has passed
    const stagesToActivate = await db
      .select({
        userId: userStages.userId,
        stageId: userStages.stageId,
        unlockedAt: userStages.unlockedAt,
        userEmail: users.email,
        userName: users.name,
        ageGroup: users.ageGroup,
      })
      .from(userStages)
      .innerJoin(users, eq(userStages.userId, users.id))
      .where(
        and(
          eq(userStages.status, 'locked'),
          lt(userStages.unlockedAt, new Date())
        )
      );

    for (const stage of stagesToActivate) {
      // Activate the stage
      await db
        .update(userStages)
        .set({
          status: 'active',
          unlockedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userStages.userId, stage.userId),
            eq(userStages.stageId, stage.stageId)
          )
        );

      // Get stage name for email
      const stageData = await db
        .select()
        .from(stages)
        .where(eq(stages.id, stage.stageId))
        .limit(1);

      const stageName = stageData[0]?.name || 'Yeni Etap';

      console.log(`[Cron] Activated stage ${stageName} for user ${stage.userId}`);

      // Send email notification
      if (stage.userEmail && stage.userName) {
        try {
          const emailHtml = getNewStageActivatedEmailTemplate(
            stage.userName,
            stageName
          );
          await sendEmail({
            to: stage.userEmail,
            subject: `🔓 Yeni Etap Açıldı: ${stageName}`,
            html: emailHtml,
          });
        } catch (emailErr) {
          console.warn(`[Cron] Email send failed for user ${stage.userId}:`, emailErr);
        }
      }
    }

    console.log(`[Cron] Stage activation check complete: ${stagesToActivate.length} stages activated`);
  } catch (error) {
    console.error('[Cron] Error in checkAndActivateStages:', error);
  }
}

/**
 * Send reminder emails to students whose locked stages are opening in X days
 * Reads reminder_days_before setting (default: 2 days before opening)
 */
export async function sendStageReminderEmails() {
  const db = await getDb();
  if (!db) {
    console.warn('[Cron] Database not available for reminders');
    return;
  }

  try {
    // Read configurable reminder lead time (default 2 days before opening)
    const reminderDaysBefore = await getPlatformSettingNumber('stage_reminder_days_before', 2);
    if (reminderDaysBefore <= 0) {
      console.log('[Cron] Reminders disabled (stage_reminder_days_before = 0)');
      return;
    }

    // Calculate the window: stages opening in exactly reminderDaysBefore days
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() + reminderDaysBefore);
    windowStart.setHours(0, 0, 0, 0);

    const windowEnd = new Date(windowStart);
    windowEnd.setHours(23, 59, 59, 999);

    console.log(`[Cron] Reminder check: looking for stages opening between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`);

    const stagesToRemind = await db
      .select({
        userId: userStages.userId,
        stageId: userStages.stageId,
        unlockedAt: userStages.unlockedAt,
        userEmail: users.email,
        userName: users.name,
        stageName: stages.name,
      })
      .from(userStages)
      .innerJoin(users, eq(userStages.userId, users.id))
      .innerJoin(stages, eq(userStages.stageId, stages.id))
      .where(
        and(
          eq(userStages.status, 'locked'),
          gt(userStages.unlockedAt, windowStart),
          lt(userStages.unlockedAt, windowEnd)
        )
      );

    console.log(`[Cron] Found ${stagesToRemind.length} stages to send reminders for`);

    for (const item of stagesToRemind) {
      if (!item.userEmail || !item.userName || !item.unlockedAt) continue;

      try {
        const openDate = new Date(item.unlockedAt).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const emailHtml = getStageReminderEmailTemplate(
          item.userName,
          item.stageName,
          reminderDaysBefore,
          openDate
        );

        await sendEmail({
          to: item.userEmail,
          subject: `⏳ ${item.stageName} etabınız ${reminderDaysBefore} gün sonra açılıyor!`,
          html: emailHtml,
        });

        console.log(`[Cron] Reminder sent to user ${item.userId} for stage ${item.stageName}`);
      } catch (emailErr) {
        console.warn(`[Cron] Reminder email failed for user ${item.userId}:`, emailErr);
      }
    }

    console.log(`[Cron] Reminder emails complete: ${stagesToRemind.length} sent`);
  } catch (error) {
    console.error('[Cron] Error in sendStageReminderEmails:', error);
  }
}

/**
 * Initialize cron jobs
 * Stage activation: daily at 00:00 (midnight)
 * Reminder emails: daily at 09:00 (morning)
 */
export function initializeCronJobs() {
  // Stage activation: every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily stage activation check...');
    await checkAndActivateStages();
  });

  // Reminder emails: every day at 09:00
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running daily stage reminder emails...');
    await sendStageReminderEmails();
  });

  console.log('[Cron] Cron jobs initialized (activation at 00:00, reminders at 09:00)');

  // Run activation once on startup
  setTimeout(() => {
    console.log('[Cron] Running initial stage activation check...');
    checkAndActivateStages();
  }, 5000);
}
