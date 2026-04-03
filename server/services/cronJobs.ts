import cron from 'node-cron';
import { getDb, getPlatformSettingNumber, getInactiveStudents, logInactivityNotification } from '../db';
import { userStages, stages, users } from '../../drizzle/schema';
import { eq, and, lt, gt, between } from 'drizzle-orm';
import { sendEmail, getInactivityReminderEmailTemplate } from '../_core/resend-email';
import { getNewStageActivatedEmailTemplate, getStageReminderEmailTemplate } from './emailService';
import { startReminderService } from './reminderService';
import { sendScheduledKPIReport } from './scheduledReports';
import { runDailyAnomalyCheck } from './anomalyDetection';

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

      // Send email + push notification
      if (stage.userEmail && stage.userName) {
        try {
          const { notify } = await import('./notificationService');
          const emailHtml = getNewStageActivatedEmailTemplate(
            stage.userName,
            stageName
          );
          await notify({
            userId: stage.userId,
            title: '🔓 Yeni Etap Açıldı!',
            message: `"${stageName}" etabı açıldı. Hemen başlayabilirsiniz!`,
            event: 'stage_activation',
            link: '/dashboard/student',
            emailSubject: `🔓 Yeni Etap Açıldı: ${stageName}`,
            emailHtml,
            pushPayload: {
              body: `"${stageName}" etabı açıldı. Hemen başlayabilirsiniz!`,
              url: '/dashboard/student',
              tag: `cron-stage-activated-${stage.stageId}`,
            },
          });
        } catch (err) {
          console.warn(`[Cron] Notification failed for user ${stage.userId}:`, err);
        }
      }
    }

    console.log(`[Cron] Stage activation check complete: ${stagesToActivate.length} stages activated`);
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT')) {
      console.warn('[Cron] DB ba\u011flant\u0131 hatas\u0131 (checkAndActivateStages), sonraki d\u00f6ng\u00fcde tekrar denenecek');
    } else {
      console.error('[Cron] checkAndActivateStages hatas\u0131:', msg);
    }
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

        const { notify } = await import('./notificationService');
        await notify({
          userId: item.userId,
          title: `⏳ ${item.stageName} etabınız ${reminderDaysBefore} gün sonra açılıyor!`,
          message: `"${item.stageName}" etabınız ${openDate} tarihinde açılacak. Hazır olun!`,
          event: 'stage_reminder',
          link: '/dashboard/student',
          emailSubject: `⏳ ${item.stageName} etabınız ${reminderDaysBefore} gün sonra açılıyor!`,
          emailHtml,
          pushPayload: {
            body: `"${item.stageName}" etabınız ${openDate} tarihinde açılacak. Hazır olun!`,
            url: '/dashboard/student',
            tag: `stage-opening-reminder-${item.stageId}`,
          },
        });

        console.log(`[Cron] Reminder sent to user ${item.userId} for stage ${item.stageName}`);
      } catch (err) {
        console.warn(`[Cron] Reminder failed for user ${item.userId}:`, err);
      }
    }

    console.log(`[Cron] Reminder emails complete: ${stagesToRemind.length} sent`);
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT')) {
      console.warn('[Cron] DB ba\u011flant\u0131 hatas\u0131 (sendStageReminderEmails), sonraki d\u00f6ng\u00fcde tekrar denenecek');
    } else {
      console.error('[Cron] sendStageReminderEmails hatas\u0131:', msg);
    }
  }
}

/**
 * Send daily inactivity reminder emails to students inactive for 7+ days
 * Called automatically by cron job at 07:00 every day
 */
export async function sendDailyInactivityReminders() {
  try {
    const inactiveDays = await getPlatformSettingNumber('inactivity_reminder_days', 7);
    if (inactiveDays <= 0) {
      console.log('[Cron] Inactivity reminders disabled (inactivity_reminder_days = 0)');
      return { total: 0, sentCount: 0, failCount: 0 };
    }

    const inactiveStudents = await getInactiveStudents(inactiveDays);
    console.log(`[Cron] Found ${inactiveStudents.length} inactive students (${inactiveDays}+ days)`);

    let sentCount = 0;
    let failCount = 0;
    const baseUrl = process.env.VITE_APP_URL || 'https://meslegim.tr';

    for (const student of inactiveStudents) {
      try {
        const html = getInactivityReminderEmailTemplate(
          student.name || 'De\u011ferli \u00d6\u011frenci',
          Number(student.daysSinceLastActivity),
          `${baseUrl}/dashboard`
        );
        const success = await sendEmail({
          to: student.email,
          subject: `Merhaba ${student.name || ''}, seni \u00f6zledik!`,
          html,
        });
        await logInactivityNotification(student.id, Number(student.daysSinceLastActivity), success);
        if (success) sentCount++;
        else failCount++;
      } catch (e) {
        console.error(`[Cron] Inactivity reminder failed for user ${student.id}:`, e);
        await logInactivityNotification(student.id, Number(student.daysSinceLastActivity), false);
        failCount++;
      }
    }

    console.log(`[Cron] Inactivity reminders complete: ${sentCount} sent, ${failCount} failed out of ${inactiveStudents.length}`);
    return { total: inactiveStudents.length, sentCount, failCount };
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT')) {
      console.warn('[Cron] DB ba\u011flant\u0131 hatas\u0131 (sendDailyInactivityReminders), sonraki d\u00f6ng\u00fcde tekrar denenecek');
    } else {
      console.error('[Cron] sendDailyInactivityReminders hatas\u0131:', msg);
    }
    return { total: 0, sentCount: 0, failCount: 0 };
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

  // Weekly KPI report: every Monday at 08:00
  cron.schedule('0 8 * * 1', async () => {
    console.log('[Cron] Sending weekly KPI report...');
    await sendScheduledKPIReport('weekly');
  });

  // Monthly KPI report: 1st of each month at 08:00
  cron.schedule('0 8 1 * *', async () => {
    console.log('[Cron] Sending monthly KPI report...');
    await sendScheduledKPIReport('monthly');
  });

  // Daily KPI anomaly detection: every day at 07:00
  cron.schedule('0 7 * * *', async () => {
    console.log('[Cron] Running daily KPI anomaly detection...');
    await runDailyAnomalyCheck();
  });

  // Daily inactivity reminder: every day at 07:00 (TR time)
  cron.schedule('0 7 * * *', async () => {
    console.log('[Cron] Running daily inactivity reminder emails...');
    await sendDailyInactivityReminders();
  });

  console.log('[Cron] Cron jobs initialized (activation at 00:00, reminders at 09:00, anomaly check at 07:00, inactivity reminders at 07:00, weekly report Mon 08:00, monthly report 1st 08:00)');

  // Run activation once on startup
  setTimeout(() => {
    console.log('[Cron] Running initial stage activation check...');
    checkAndActivateStages();
  }, 5000);

  // Start push notification reminder service
  startReminderService();
}
