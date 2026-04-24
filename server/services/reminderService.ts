/**
 * Zamanlı Hatırlatma Servisi
 * Tamamlanmamış etaplar için otomatik hatırlatma bildirimleri gönderir.
 * Server başlatıldığında interval ile çalışır.
 */

import { getDb } from '../db';
import { userStages, users, stages, scheduledReminders } from '../../drizzle/schema';
import { eq, and, ne, lte, isNull, sql } from 'drizzle-orm';
import { notify } from './notificationService';
import logger from '../utils/logger';

const REMINDER_INTERVAL_MS = 60 * 60 * 1000; // Check every hour
const STAGE_INACTIVE_DAYS = 3; // Send reminder after 3 days of inactivity
const MAX_REMINDERS_PER_STAGE = 3; // Max 3 reminders per stage

let reminderTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Check for inactive stages and create reminders
 */
export async function checkAndCreateReminders() {
  const db = await getDb();
  if (!db) return { created: 0 };

  let created = 0;

  try {
    // Find active stages that haven't been touched in STAGE_INACTIVE_DAYS
    const cutoffDate = new Date(Date.now() - STAGE_INACTIVE_DAYS * 24 * 60 * 60 * 1000);

    const inactiveStages = await db
      .select({
        userId: userStages.userId,
        stageId: userStages.stageId,
        stageName: stages.name,
        userName: users.name,
        userEmail: users.email,
        updatedAt: userStages.updatedAt,
      })
      .from(userStages)
      .innerJoin(stages, eq(userStages.stageId, stages.id))
      .innerJoin(users, eq(userStages.userId, users.id))
      .where(
        and(
          eq(userStages.status, 'active'),
          lte(userStages.updatedAt, cutoffDate),
          eq(users.status, 'active')
        )
      );

    for (const stage of inactiveStages) {
      // Check how many reminders already sent for this stage
      const existingReminders = await db
        .select({ count: sql<number>`count(*)` })
        .from(scheduledReminders)
        .where(
          and(
            eq(scheduledReminders.userId, stage.userId),
            eq(scheduledReminders.relatedId, stage.stageId),
            eq(scheduledReminders.type, 'stage_reminder')
          )
        );

      const reminderCount = existingReminders[0]?.count || 0;
      if (reminderCount >= MAX_REMINDERS_PER_STAGE) continue;

      // Create a scheduled reminder
      const scheduledFor = new Date(); // Send immediately
      await db.insert(scheduledReminders).values({
        userId: stage.userId,
        type: 'stage_reminder',
        relatedId: stage.stageId,
        scheduledFor,
        sent: false,
      });

      // Send notification
      await notify({
        userId: stage.userId,
        title: '⏰ Etap Hatırlatması',
        message: `"${stage.stageName}" etabını tamamlamayı unutmayın! Son güncellemenizden ${STAGE_INACTIVE_DAYS} gün geçti.`,
        event: 'stage_reminder',
        link: `/dashboard/student/stage/${stage.stageId}`,
        pushPayload: {
          body: `"${stage.stageName}" etabını tamamlamayı unutmayın! Son güncellemenizden ${STAGE_INACTIVE_DAYS} gün geçti.`,
          url: `/dashboard/student/stage/${stage.stageId}`,
          tag: `stage-reminder-${stage.stageId}`,
        },
        emailSubject: `Hatırlatma: "${stage.stageName}" etabınız sizi bekliyor!`,
        emailHtml: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 12px;">
              <div style="font-size: 48px;">⏰</div>
              <h1 style="color: white; margin: 16px 0 8px;">Etap Hatırlatması</h1>
            </div>
            <div style="padding: 24px;">
              <p style="color: #374151; font-size: 16px;">Merhaba ${stage.userName || 'Değerli Öğrenci'},</p>
              <p style="color: #374151; font-size: 16px;"><strong>"${stage.stageName}"</strong> etabını tamamlamayı unutmayın!</p>
              <p style="color: #6b7280; font-size: 14px;">Son güncellemenizden ${STAGE_INACTIVE_DAYS} gün geçti. Kariyer keşif yolculuğunuza devam edin.</p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://meslegim.tr/dashboard/student/stage/${stage.stageId}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Etaba Devam Et</a>
              </div>
            </div>
          </div>
        `,
      });

      // Mark reminder as sent
      await db
        .update(scheduledReminders)
        .set({ sent: true })
        .where(
          and(
            eq(scheduledReminders.userId, stage.userId),
            eq(scheduledReminders.relatedId, stage.stageId),
            eq(scheduledReminders.sent, false)
          )
        );

      created++;
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('ECONNRESET') || errMsg.includes('PROTOCOL_CONNECTION_LOST') || errMsg.includes('ETIMEDOUT')) {
      logger.warn('[ReminderService] DB ba\u011flant\u0131 hatas\u0131, sonraki d\u00f6ng\u00fcde tekrar denenecek');
    } else {
      logger.error('[ReminderService] Beklenmeyen hata:', errMsg);
    }
  }

  if (created > 0) {
    logger.info(`[ReminderService] Created ${created} stage reminders`);
  }

  return { created };
}

/**
 * Start the reminder service interval
 */
export function startReminderService() {
  if (reminderTimer) {
    logger.info('[ReminderService] Already running');
    return;
  }

  logger.info(`[ReminderService] Starting (check every ${REMINDER_INTERVAL_MS / 1000 / 60} minutes)`);

  // Initial check after 5 minutes (let server warm up)
  setTimeout(() => {
    checkAndCreateReminders();
  }, 5 * 60 * 1000);

  // Then check periodically
  reminderTimer = setInterval(() => {
    checkAndCreateReminders();
  }, REMINDER_INTERVAL_MS);
}

/**
 * Stop the reminder service
 */
export function stopReminderService() {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
    logger.info('[ReminderService] Stopped');
  }
}
