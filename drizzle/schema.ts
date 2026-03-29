import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based fields for the Meslegim.tr platform.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  tcKimlik: varchar("tcKimlik", { length: 11 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 50 }).default("student").notNull(),
  status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
  ageGroup: mysqlEnum("ageGroup", ["14-17", "18-21", "22-24"]),
  mentorId: int("mentorId"),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }),
  profileImage: text("profileImage"),
  bio: text("bio"),
  kvkkConsent: boolean("kvkkConsent").default(false).notNull(),
  kvkkConsentDate: timestamp("kvkkConsentDate"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  purchasedPackage: varchar("purchasedPackage", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  statusIdx: index("status_idx").on(table.status),
  roleIdx: index("role_idx").on(table.role),
  mentorIdIdx: index("mentor_id_idx").on(table.mentorId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stages (étapes) table - defines evaluation stages for each age group
 */
export const stages = mysqlTable("stages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ageGroup: mysqlEnum("ageGroup", ["14-17", "18-21", "22-24"]).notNull(),
  order: int("order").notNull(), // 1, 2, 3, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Stage = typeof stages.$inferSelect;
export type InsertStage = typeof stages.$inferInsert;

/**
 * Questions table - stores questions for each stage
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  stageId: int("stageId").notNull(),
  text: text("text").notNull(),
  type: mysqlEnum("type", ["multiple_choice", "likert", "ranking", "text"]).notNull(),
  options: json("options"), // JSON array of options for multiple_choice, likert, ranking
  category: varchar("category", { length: 50 }), // RIASEC, Big Five, Values, Skills, etc.
  metadata: json("metadata"), // Scoring weights, dimension mappings, etc.
  required: boolean("required").default(true).notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Answers table - stores student answers to questions
 */
export const answers = mysqlTable("answers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  answer: text("answer").notNull(), // JSON string or plain text depending on question type
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = typeof answers.$inferInsert;

/**
 * User stages table - tracks student progress through stages
 */
export const userStages = mysqlTable("user_stages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stageId: int("stageId").notNull(),
  status: mysqlEnum("status", ["locked", "active", "completed"]).default("locked").notNull(),
  unlockedAt: timestamp("unlockedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  stageIdIdx: index("stage_id_idx").on(table.stageId),
  statusIdx: index("status_idx").on(table.status),
}));

export type UserStage = typeof userStages.$inferSelect;
export type InsertUserStage = typeof userStages.$inferInsert;

/**
 * Reports table - stores generated PDF reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stageId: int("stageId"), // NULL for final report
  type: mysqlEnum("type", ["stage", "final", "comprehensive"]).notNull(),
  content: text("content"), // AI-generated report content (markdown)
  summary: text("summary"), // Short summary of the report
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileKey: varchar("fileKey", { length: 500 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  mentorFeedback: text("mentorFeedback"),
  approvedBy: int("approvedBy"), // mentor ID who approved
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Mentor notes table - stores mentor's private notes about students
 */
export const mentorNotes = mysqlTable("mentor_notes", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull(),
  studentId: int("studentId").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  mentorIdIdx: index("mentor_id_idx").on(table.mentorId),
  studentIdIdx: index("student_id_idx").on(table.studentId),
}));

export type MentorNote = typeof mentorNotes.$inferSelect;
export type InsertMentorNote = typeof mentorNotes.$inferInsert;

/**
 * Messages table - stores student-mentor communication
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  senderIdIdx: index("sender_id_idx").on(table.senderId),
  receiverIdIdx: index("receiver_id_idx").on(table.receiverId),
  isReadIdx: index("is_read_idx").on(table.isRead),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Feedbacks table - stores student feedback on mentors and reports
 */
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  mentorId: int("mentorId").notNull(),
  reportId: int("reportId"),
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  studentIdIdx: index("student_id_idx").on(table.studentId),
  mentorIdIdx: index("mentor_id_idx").on(table.mentorId),
  reportIdIdx: index("report_id_idx").on(table.reportId),
  ratingIdx: index("rating_idx").on(table.rating),
}));

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

/**
 * Certificates table - stores completion certificates for students
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  certificateNumber: varchar("certificateNumber", { length: 50 }).unique().notNull(),
  pdfUrl: text("pdfUrl"),
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  studentIdIdx: index("student_id_idx").on(table.studentId),
  certificateNumberIdx: index("certificate_number_idx").on(table.certificateNumber),
}));

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Platform settings table - configurable platform parameters
 */
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;

/**
 * Stage unlock logs table - audit trail for manual stage unlocks
 * Records who (admin/mentor) unlocked which student's stage and when
 */
export const stageUnlockLogs = mysqlTable("stage_unlock_logs", {
  id: int("id").autoincrement().primaryKey(),
  unlockedByUserId: int("unlockedByUserId").notNull(),   // admin or mentor
  unlockedByRole: varchar("unlockedByRole", { length: 50 }).notNull(), // 'admin' | 'mentor'
  studentId: int("studentId").notNull(),
  stageId: int("stageId").notNull(),
  stageName: varchar("stageName", { length: 255 }).notNull(),
  studentName: varchar("studentName", { length: 255 }),
  note: text("note"),  // optional reason / note from admin/mentor
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  unlockedByIdx: index("unlock_by_idx").on(table.unlockedByUserId),
  studentIdIdx: index("unlock_student_idx").on(table.studentId),
  stageIdIdx: index("unlock_stage_idx").on(table.stageId),
  createdAtIdx: index("unlock_created_at_idx").on(table.createdAt),
}));
export type StageUnlockLog = typeof stageUnlockLogs.$inferSelect;
export type InsertStageUnlockLog = typeof stageUnlockLogs.$inferInsert;


/**
 * In-app notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info").notNull(), // info, success, warning, error
  link: text("link"), // optional link to navigate to
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notif_user_id_idx").on(table.userId),
  isReadIdx: index("notif_is_read_idx").on(table.isRead),
  createdAtIdx: index("notif_created_at_idx").on(table.createdAt),
}));
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


/**
 * Pilot kullanıcı geri bildirim tablosu
 * NPS skoru + açık uçlu sorular
 */
export const pilotFeedbacks = mysqlTable("pilot_feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  npsScore: int("npsScore").notNull(), // 0-10 NPS skoru
  whatWorkedWell: text("whatWorkedWell"), // Ne iyi çalıştı?
  whatNeedsImprovement: text("whatNeedsImprovement"), // Ne iyileştirilmeli?
  wouldRecommend: boolean("wouldRecommend"), // Arkadaşına önerir misin?
  additionalComments: text("additionalComments"), // Ek yorumlar
  userAgent: text("userAgent"), // Tarayıcı bilgisi
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("pf_user_id_idx").on(table.userId),
  npsScoreIdx: index("pf_nps_score_idx").on(table.npsScore),
  createdAtIdx: index("pf_created_at_idx").on(table.createdAt),
}));
export type PilotFeedback = typeof pilotFeedbacks.$inferSelect;
export type InsertPilotFeedback = typeof pilotFeedbacks.$inferInsert;


/**
 * Badges (rozetler) tablosu - platform genelinde tanımlı rozetler
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(), // unique identifier e.g. "first-stage"
  name: varchar("name", { length: 255 }).notNull(), // display name e.g. "İlk Adım"
  description: text("description"), // e.g. "İlk etabınızı tamamladınız!"
  icon: varchar("icon", { length: 50 }).notNull(), // lucide icon name e.g. "rocket"
  color: varchar("color", { length: 50 }).notNull(), // tailwind color e.g. "amber"
  category: mysqlEnum("category", ["milestone", "speed", "mastery", "social", "special"]).notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  xpReward: int("xpReward").default(10).notNull(), // XP points awarded
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("badge_slug_idx").on(table.slug),
  categoryIdx: index("badge_category_idx").on(table.category),
}));
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User badges (kullanıcı rozetleri) - hangi kullanıcı hangi rozeti kazandı
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  notified: boolean("notified").default(false).notNull(), // kullanıcıya bildirildi mi
}, (table) => ({
  userIdIdx: index("ub_user_id_idx").on(table.userId),
  badgeIdIdx: index("ub_badge_id_idx").on(table.badgeId),
  userBadgeIdx: index("ub_user_badge_idx").on(table.userId, table.badgeId),
}));
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;


/**
 * Push notification subscriptions - tarayıcı push bildirim abonelikleri
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(), // public key
  auth: text("auth").notNull(), // auth secret
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("ps_user_id_idx").on(table.userId),
}));
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Email preferences - kullanıcı e-posta tercihleri
 */
export const emailPreferences = mysqlTable("email_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  stageActivation: boolean("stageActivation").default(true).notNull(), // etap açılma
  reportReady: boolean("reportReady").default(true).notNull(), // rapor hazır
  badgeEarned: boolean("badgeEarned").default(true).notNull(), // rozet kazanım
  certificateReady: boolean("certificateReady").default(true).notNull(), // sertifika hazır
  stageReminder: boolean("stageReminder").default(true).notNull(), // etap hatırlatma
  weeklyDigest: boolean("weeklyDigest").default(false).notNull(), // haftalık özet
  marketingEmails: boolean("marketingEmails").default(false).notNull(), // pazarlama
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("ep_user_id_idx").on(table.userId),
}));
export type EmailPreference = typeof emailPreferences.$inferSelect;
export type InsertEmailPreference = typeof emailPreferences.$inferInsert;

/**
 * Scheduled reminders - zamanlı hatırlatma bildirimleri
 */
export const scheduledReminders = mysqlTable("scheduled_reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["stage_incomplete", "stage_upcoming", "weekly_digest", "stage_reminder"]).notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  sent: boolean("sent").default(false).notNull(),
  relatedId: int("relatedId"), // stageId, etc.
  metadata: text("metadata"), // JSON string for extra data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("sr_user_id_idx").on(table.userId),
  scheduledForIdx: index("sr_scheduled_for_idx").on(table.scheduledFor),
  sentIdx: index("sr_sent_idx").on(table.sent),
}));
export type ScheduledReminder = typeof scheduledReminders.$inferSelect;
export type InsertScheduledReminder = typeof scheduledReminders.$inferInsert;


/**
 * Purchases - Stripe ödeme kayıtları
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: varchar("productId", { length: 50 }).notNull(), // products.ts'deki ProductId
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  amountInCents: int("amountInCents").notNull(),
  currency: varchar("currency", { length: 10 }).default("try").notNull(),
  metadata: text("metadata"), // JSON string for extra data (e.g., stageId for single_stage_unlock)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  userIdIdx: index("p_user_id_idx").on(table.userId),
  stripeSessionIdx: index("p_stripe_session_idx").on(table.stripeSessionId),
  statusIdx: index("p_status_idx").on(table.status),
}));
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;
