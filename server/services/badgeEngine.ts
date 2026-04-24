/**
 * Badge Engine - Otomatik rozet kazanım kontrol motoru
 * Her etap tamamlandığında, rapor oluşturulduğunda vb. çağrılır
 * ve kullanıcının yeni rozet kazanıp kazanmadığını kontrol eder.
 */

import { getDb } from "../db";
import { badges, userBadges, userStages, reports, certificates, pilotFeedbacks, users } from "../../drizzle/schema";
import { eq, and, count, sql, desc } from "drizzle-orm";
import logger from '../utils/logger';

export interface BadgeCheckResult {
  newBadges: Array<{
    id: number;
    slug: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    category: string;
    rarity: string;
    xpReward: number;
  }>;
  totalXP: number;
}

/** Award a badge to a user if not already earned */
async function awardBadge(userId: number, badgeSlug: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [badge] = await db.select().from(badges).where(eq(badges.slug, badgeSlug)).limit(1);
  if (!badge) return false;

  // Check if already earned
  const [existing] = await db
    .select()
    .from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badge.id)))
    .limit(1);
  if (existing) return false;

  // Award the badge
  await db.insert(userBadges).values({
    userId,
    badgeId: badge.id,
    notified: false,
  });
  return true;
}

/** Get all badge slugs a user has earned */
async function getUserBadgeSlugs(userId: number): Promise<Set<string>> {
  const db = await getDb();
  if (!db) return new Set();

  const rows = await db
    .select({ slug: badges.slug })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
  return new Set(rows.map((r: { slug: string }) => r.slug));
}

/** Count completed stages for a user */
async function getCompletedStageCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ cnt: count() })
    .from(userStages)
    .where(and(eq(userStages.userId, userId), eq(userStages.status, "completed")));
  return result?.cnt ?? 0;
}

/** Get completed stage names for a user */
async function getCompletedStageNames(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({ stageName: sql<string>`(SELECT name FROM stages WHERE stages.id = user_stages.stageId)` })
    .from(userStages)
    .where(and(eq(userStages.userId, userId), eq(userStages.status, "completed")));
  return rows.map((r: { stageName: string }) => r.stageName).filter(Boolean);
}

/** Check how many reports a user has */
async function getUserReportCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ cnt: count() })
    .from(reports)
    .where(eq(reports.userId, userId));
  return result?.cnt ?? 0;
}

/** Check if user has a certificate */
async function hasCertificate(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [result] = await db
    .select({ cnt: count() })
    .from(certificates)
    .where(eq(certificates.studentId, userId));
  return (result?.cnt ?? 0) > 0;
}

/** Check if user gave pilot feedback */
async function gaveFeedback(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [result] = await db
    .select({ cnt: count() })
    .from(pilotFeedbacks)
    .where(eq(pilotFeedbacks.userId, userId));
  return (result?.cnt ?? 0) > 0;
}

/** Check if user was activated by mentor (status = active) */
async function isMentorApproved(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [user] = await db
    .select({ status: users.status, mentorId: users.mentorId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.status === "active" && user?.mentorId !== null;
}

/** Check total user count for pioneer badge */
async function getTotalUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db.select({ cnt: count() }).from(users);
  return result?.cnt ?? 0;
}

/** Get user registration date */
async function getUserCreatedAt(userId: number): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select({ createdAt: users.createdAt }).from(users).where(eq(users.id, userId)).limit(1);
  return user?.createdAt ?? null;
}

/** Check if a stage was completed within 10 minutes */
async function hasSpeedCompletion(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const rows = await db
    .select({
      createdAt: userStages.createdAt,
      updatedAt: userStages.updatedAt,
    })
    .from(userStages)
    .where(and(eq(userStages.userId, userId), eq(userStages.status, "completed")));

  for (const row of rows) {
    const diff = row.updatedAt.getTime() - row.createdAt.getTime();
    if (diff > 0 && diff < 10 * 60 * 1000) {
      return true;
    }
  }
  return false;
}

/** Check if user has comprehensive profile report */
async function hasComprehensiveReport(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [result] = await db
    .select({ cnt: count() })
    .from(reports)
    .where(and(eq(reports.userId, userId), eq(reports.type, "comprehensive")));
  return (result?.cnt ?? 0) > 0;
}

/**
 * Main badge check function - runs all badge eligibility checks
 * and awards any newly earned badges.
 * Returns list of newly awarded badges.
 */
export async function checkAndAwardBadges(userId: number): Promise<BadgeCheckResult> {
  const db = await getDb();
  if (!db) return { newBadges: [], totalXP: 0 };

  const earnedSlugs = await getUserBadgeSlugs(userId);
  const newBadges: BadgeCheckResult["newBadges"] = [];

  // Helper to check and award
  async function tryAward(slug: string, condition: boolean) {
    if (!earnedSlugs.has(slug) && condition) {
      const awarded = await awardBadge(userId, slug);
      if (awarded) {
        const [badge] = await db!.select().from(badges).where(eq(badges.slug, slug)).limit(1);
        if (badge) {
          newBadges.push(badge);
        }
      }
    }
  }

  // Gather data
  const completedCount = await getCompletedStageCount(userId);
  const completedNames = await getCompletedStageNames(userId);
  const reportCount = await getUserReportCount(userId);
  const hasCert = await hasCertificate(userId);
  const hasFeedback = await gaveFeedback(userId);
  const mentorApproved = await isMentorApproved(userId);
  const totalUsers = await getTotalUserCount();
  const hasSpeed = await hasSpeedCompletion(userId);
  const hasProfile = await hasComprehensiveReport(userId);
  const createdAt = await getUserCreatedAt(userId);

  // === MILESTONE BADGES ===
  await tryAward("first-stage", completedCount >= 1);
  await tryAward("three-stages", completedCount >= 3);
  await tryAward("all-stages", completedCount >= 5);
  await tryAward("first-report", reportCount >= 1);
  await tryAward("profile-complete", hasProfile);
  await tryAward("certificate-earned", hasCert);

  // === SPEED BADGES ===
  await tryAward("speed-stage", hasSpeed);

  // Early bird: completed a stage within 24 hours of registration
  if (createdAt) {
    const completedStages = await db
      .select({ updatedAt: userStages.updatedAt })
      .from(userStages)
      .where(and(eq(userStages.userId, userId), eq(userStages.status, "completed")))
      .orderBy(userStages.updatedAt)
      .limit(1);

    if (completedStages.length > 0) {
      const diff = completedStages[0].updatedAt.getTime() - createdAt.getTime();
      await tryAward("early-bird", diff < 24 * 60 * 60 * 1000);
    }
  }

  // === MASTERY BADGES ===
  const lowerNames = completedNames.map((n: string) => n.toLowerCase());
  await tryAward("riasec-master", lowerNames.some((n: string) => n.includes("ilgi") || n.includes("riasec")));
  await tryAward("values-master", lowerNames.some((n: string) => n.includes("değer") || n.includes("deger")));
  await tryAward("risk-master", lowerNames.some((n: string) => n.includes("risk")));
  await tryAward("personality-master", lowerNames.some((n: string) => n.includes("kişilik") || n.includes("kisilik")));

  // === SOCIAL BADGES ===
  await tryAward("feedback-giver", hasFeedback);
  await tryAward("mentor-approved", mentorApproved);

  // === SPECIAL BADGES ===
  await tryAward("pioneer", totalUsers <= 100);

  // Explorer: completed at least one from each test category
  const hasRiasec = lowerNames.some((n: string) => n.includes("ilgi") || n.includes("riasec"));
  const hasValues = lowerNames.some((n: string) => n.includes("değer") || n.includes("deger"));
  const hasRisk = lowerNames.some((n: string) => n.includes("risk"));
  const hasPersonality = lowerNames.some((n: string) => n.includes("kişilik") || n.includes("kisilik"));
  await tryAward("explorer", hasRiasec && hasValues && hasRisk && hasPersonality);

  // Calculate total XP
  const xpRows = await db
    .select({ xp: badges.xpReward })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
  const totalXP = xpRows.reduce((sum: number, r: { xp: number }) => sum + r.xp, 0);

  // Send notifications for newly earned badges
  if (newBadges.length > 0) {
    try {
      const { notify } = await import('./notificationService');
      for (const badge of newBadges) {
        await notify({
          userId,
          title: `🏆 Yeni Rozet: ${badge.name}`,
          message: badge.description || `Tebrikler! "${badge.name}" rozetini kazandınız! (+${badge.xpReward} XP)`,
          event: 'badge_earned',
          link: '/dashboard/student/achievements',
          pushPayload: {
            body: `Tebrikler! "${badge.name}" rozetini kazandınız! (+${badge.xpReward} XP)`,
            url: '/dashboard/student/achievements',
            tag: `badge-earned-${badge.id}`,
          },
          emailSubject: `Tebrikler! "${badge.name}" rozetini kazandınız!`,
          emailHtml: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px;">
                <div style="font-size: 64px;">${badge.icon}</div>
                <h1 style="color: white; margin: 16px 0 8px;">Yeni Rozet Kazandınız!</h1>
                <h2 style="color: rgba(255,255,255,0.9); margin: 0;">${badge.name}</h2>
              </div>
              <div style="padding: 24px; text-align: center;">
                <p style="color: #374151; font-size: 16px;">${badge.description || ''}</p>
                <p style="color: #6b7280; font-size: 14px;">+${badge.xpReward} XP kazanıldı!</p>
                <a href="https://meslegim.tr/dashboard/student/achievements" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px;">Başarılarımı Gör</a>
              </div>
            </div>
          `,
        });
      }
    } catch (err) {
      logger.error('Badge notification failed:', err);
    }
  }

  return { newBadges, totalXP };
}

/** Get all badges with user's earned status */
export async function getUserBadgesWithStatus(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const allBadges = await db.select().from(badges).orderBy(badges.sortOrder);
  const earned = await db
    .select({ badgeId: userBadges.badgeId, earnedAt: userBadges.earnedAt })
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  const earnedMap = new Map(earned.map((e: { badgeId: number; earnedAt: Date }) => [e.badgeId, e.earnedAt]));

  return allBadges.map((badge: typeof allBadges[number]) => ({
    ...badge,
    earned: earnedMap.has(badge.id),
    earnedAt: earnedMap.get(badge.id) ?? null,
  }));
}

/** Get user's total XP */
export async function getUserTotalXP(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ xp: badges.xpReward })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
  return rows.reduce((sum: number, r: { xp: number }) => sum + r.xp, 0);
}

/** Get leaderboard - top users by XP */
export async function getLeaderboard(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      userId: userBadges.userId,
      userName: users.name,
      totalXP: sql<number>`SUM(${badges.xpReward})`,
      badgeCount: count(),
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .innerJoin(users, eq(userBadges.userId, users.id))
    .groupBy(userBadges.userId, users.name)
    .orderBy(desc(sql`SUM(${badges.xpReward})`))
    .limit(limit);

  return rows;
}

/** Mark badges as notified */
export async function markBadgesNotified(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(userBadges)
    .set({ notified: true })
    .where(and(eq(userBadges.userId, userId), eq(userBadges.notified, false)));
}

/** Get unnotified badges for a user */
export async function getUnnotifiedBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: badges.id,
      slug: badges.slug,
      name: badges.name,
      description: badges.description,
      icon: badges.icon,
      color: badges.color,
      category: badges.category,
      rarity: badges.rarity,
      xpReward: badges.xpReward,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(and(eq(userBadges.userId, userId), eq(userBadges.notified, false)));
  return rows;
}
