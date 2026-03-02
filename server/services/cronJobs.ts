import cron from 'node-cron';
import { getDb, getPlatformSettingNumber } from '../db';
import { userStages, stages, users } from '../../drizzle/schema';
import { eq, and, lt } from 'drizzle-orm';
import { sendEmail } from '../_core/resend-email';
import { getNewStageActivatedEmailTemplate } from './emailService';

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
    // Read configurable delay (default 7 days)
    const delayDays = await getPlatformSettingNumber('stage_transition_delay_days', 7);
    const cutoffDate = new Date(Date.now() - delayDays * 24 * 60 * 60 * 1000);

    console.log(`[Cron] Stage transition delay: ${delayDays} days. Cutoff: ${cutoffDate.toISOString()}`);

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
 * Initialize cron jobs
 * Runs daily at 00:00 (midnight)
 */
export function initializeCronJobs() {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily stage activation check...');
    await checkAndActivateStages();
  });

  console.log('[Cron] Cron jobs initialized');

  // Run once on startup
  setTimeout(() => {
    console.log('[Cron] Running initial stage activation check...');
    checkAndActivateStages();
  }, 5000);
}
