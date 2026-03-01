import cron from 'node-cron';
import { getDb } from '../db';
import { userStages, stages, users } from '../../drizzle/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { sendEmail } from '../_core/resend-email';
import { getNewStageActivatedEmailTemplate } from './emailService';

/**
 * Check and activate stages that should be unlocked (7 days after previous stage completion)
 */
export async function checkAndActivateStages() {
  const db = await getDb();
  if (!db) {
    console.warn('[Cron] Database not available');
    return;
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find all completed stages that were completed 7+ days ago
    const completedStages = await db
      .select({
        userId: userStages.userId,
        stageId: userStages.stageId,
        completedAt: userStages.completedAt,
        userEmail: users.email,
        userName: users.name,
        ageGroup: users.ageGroup,
      })
      .from(userStages)
      .innerJoin(users, eq(userStages.userId, users.id))
      .where(
        and(
          eq(userStages.status, 'completed'),
          lt(userStages.completedAt, sevenDaysAgo)
        )
      );

    for (const completed of completedStages) {
      // Find the next stage for this user's age group
      const currentStage = await db
        .select()
        .from(stages)
        .where(eq(stages.id, completed.stageId))
        .limit(1);

      if (currentStage.length === 0) continue;

      const nextStageOrder = currentStage[0].order + 1;

      // Find next stage in same age group
      const nextStage = await db
        .select()
        .from(stages)
        .where(
          and(
            eq(stages.ageGroup, completed.ageGroup!),
            eq(stages.order, nextStageOrder)
          )
        )
        .limit(1);

      if (nextStage.length === 0) continue; // No more stages

      // Check if user already has this stage
      const existingUserStage = await db
        .select()
        .from(userStages)
        .where(
          and(
            eq(userStages.userId, completed.userId),
            eq(userStages.stageId, nextStage[0].id)
          )
        )
        .limit(1);

      if (existingUserStage.length > 0) continue; // Already exists

      // Create and activate the next stage
      await db.insert(userStages).values({
        userId: completed.userId,
        stageId: nextStage[0].id,
        status: 'active',
        unlockedAt: new Date(),
      });

      console.log(
        `[Cron] Activated stage ${nextStage[0].name} for user ${completed.userId}`
      );

      // Send email notification
      if (completed.userEmail && completed.userName) {
        const emailHtml = getNewStageActivatedEmailTemplate(
          completed.userName,
          nextStage[0].name
        );
        await sendEmail({
          to: completed.userEmail,
          subject: `🔓 Yeni Etap Açıldı: ${nextStage[0].name}`,
          html: emailHtml,
        });
      }
    }

    console.log(`[Cron] Checked and activated stages: ${completedStages.length} processed`);
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

  // Run once on startup for testing
  setTimeout(() => {
    console.log('[Cron] Running initial stage activation check...');
    checkAndActivateStages();
  }, 5000);
}
