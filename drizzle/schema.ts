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
  schoolId: int("schoolId"), // Okul ilişkisi
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


/**
 * Schools - Okul yönetimi
 */
export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).unique(), // Okul kodu (kısa tanımlayıcı)
  address: text("address"),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  logo: text("logo"), // S3 URL
  type: mysqlEnum("type", ["public", "private", "university", "vocational", "other"]).default("public").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("active").notNull(),
  maxStudents: int("maxStudents").default(500),
  maxMentors: int("maxMentors").default(50),
  subscriptionPlan: varchar("subscriptionPlan", { length: 50 }), // Okul abonelik paketi
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  metadata: text("metadata"), // JSON - ek bilgiler
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("school_code_idx").on(table.code),
  cityIdx: index("school_city_idx").on(table.city),
  statusIdx: index("school_status_idx").on(table.status),
}));
export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

/**
 * School-Mentor ilişki tablosu (many-to-many: bir mentor birden fazla okula atanabilir)
 */
export const schoolMentors = mysqlTable("school_mentors", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull(),
  mentorId: int("mentorId").notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(), // Ana mentor mu?
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignedBy: int("assignedBy"), // Kim atadı
}, (table) => ({
  schoolIdIdx: index("sm_school_id_idx").on(table.schoolId),
  mentorIdIdx: index("sm_mentor_id_idx").on(table.mentorId),
  uniquePair: index("sm_unique_pair_idx").on(table.schoolId, table.mentorId),
}));
export type SchoolMentor = typeof schoolMentors.$inferSelect;

/**
 * Promotion Codes - İndirim kodları
 */
export const promotionCodes = mysqlTable("promotion_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed_amount"]).notNull(),
  discountValue: int("discountValue").notNull(), // Yüzde veya kuruş cinsinden sabit tutar
  currency: varchar("currency", { length: 10 }).default("try"),
  minPurchaseAmount: int("minPurchaseAmount").default(0), // Minimum alışveriş tutarı (kuruş)
  maxUses: int("maxUses"), // null = sınırsız
  currentUses: int("currentUses").default(0).notNull(),
  maxUsesPerUser: int("maxUsesPerUser").default(1), // Kullanıcı başına max kullanım
  applicableProducts: text("applicableProducts"), // JSON array of product IDs, null = tümü
  applicableSchools: text("applicableSchools"), // JSON array of school IDs, null = tümü
  isActive: boolean("isActive").default(true).notNull(),
  startsAt: timestamp("startsAt"),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("promo_code_idx").on(table.code),
  activeIdx: index("promo_active_idx").on(table.isActive),
}));
export type PromotionCode = typeof promotionCodes.$inferSelect;
export type InsertPromotionCode = typeof promotionCodes.$inferInsert;

/**
 * Promotion Code Usages - Kod kullanım geçmişi
 */
export const promotionCodeUsages = mysqlTable("promotion_code_usages", {
  id: int("id").autoincrement().primaryKey(),
  promotionCodeId: int("promotionCodeId").notNull(),
  userId: int("userId").notNull(),
  purchaseId: int("purchaseId"),
  discountApplied: int("discountApplied").notNull(), // Uygulanan indirim (kuruş)
  usedAt: timestamp("usedAt").defaultNow().notNull(),
}, (table) => ({
  promoIdIdx: index("pcu_promo_id_idx").on(table.promotionCodeId),
  userIdIdx: index("pcu_user_id_idx").on(table.userId),
}));
export type PromotionCodeUsage = typeof promotionCodeUsages.$inferSelect;

/**
 * Activity Logs - Sistem aktivite kaydı (audit trail)
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null = sistem aksiyonu
  action: varchar("action", { length: 100 }).notNull(), // e.g., "user.login", "stage.complete", "payment.success"
  entityType: varchar("entityType", { length: 50 }), // e.g., "user", "stage", "report", "payment"
  entityId: int("entityId"), // İlgili kayıt ID'si
  details: text("details"), // JSON - ek detaylar
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("al_user_id_idx").on(table.userId),
  actionIdx: index("al_action_idx").on(table.action),
  entityIdx: index("al_entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("al_created_at_idx").on(table.createdAt),
}));
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;


/**
 * CSV Export Logs - Admin CSV dışa aktarma geçmişi
 */
export const csvExportLogs = mysqlTable("csv_export_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Export yapan admin
  exportType: varchar("exportType", { length: 50 }).notNull(), // "kpi", "daily_registrations", "monthly_revenue", "daily_revenue", "report_stats", "user_activity", "package_distribution", "all"
  fileName: varchar("fileName", { length: 255 }).notNull(),
  recordCount: int("recordCount"), // Dışa aktarılan kayıt sayısı
  dateFilterPreset: varchar("dateFilterPreset", { length: 20 }), // "today", "last7", "last30", "last90", "all", "custom"
  dateFilterStart: timestamp("dateFilterStart"),
  dateFilterEnd: timestamp("dateFilterEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("cel_user_id_idx").on(table.userId),
  exportTypeIdx: index("cel_export_type_idx").on(table.exportType),
  createdAtIdx: index("cel_created_at_idx").on(table.createdAt),
}));
export type CsvExportLog = typeof csvExportLogs.$inferSelect;
export type InsertCsvExportLog = typeof csvExportLogs.$inferInsert;

/**
 * KPI Anomalies - Günlük KPI anomali tespiti kayıtları
 */
export const kpiAnomalies = mysqlTable("kpi_anomalies", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(), // Anomali tespit edilen gün
  kpiName: varchar("kpiName", { length: 100 }).notNull(), // "daily_registrations", "test_completion_rate", "premium_conversion"
  kpiLabel: varchar("kpiLabel", { length: 255 }).notNull(), // Türkçe etiket
  currentValue: int("currentValue").notNull(), // O günkü değer
  avgValue: int("avgValue").notNull(), // Son 7 günlük ortalama (x100 hassasiyet)
  deviationPercent: int("deviationPercent").notNull(), // Sapma yüzdesi (x100)
  direction: mysqlEnum("direction", ["up", "down"]).notNull(), // Artış mı düşüş mü
  severity: mysqlEnum("severity", ["warning", "critical"]).default("warning").notNull(), // %30-50 = warning, %50+ = critical
  alertSent: boolean("alertSent").default(false).notNull(), // Email gönderildi mi
  acknowledged: boolean("acknowledged").default(false).notNull(), // Admin tarafından onaylandı mı
  acknowledgedBy: int("acknowledgedBy"), // Onaylayan admin ID
  acknowledgedAt: timestamp("acknowledgedAt"),
  notes: text("notes"), // Admin notları
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("ka_date_idx").on(table.date),
  kpiNameIdx: index("ka_kpi_name_idx").on(table.kpiName),
  severityIdx: index("ka_severity_idx").on(table.severity),
  acknowledgedIdx: index("ka_acknowledged_idx").on(table.acknowledged),
}));
export type KpiAnomaly = typeof kpiAnomalies.$inferSelect;
export type InsertKpiAnomaly = typeof kpiAnomalies.$inferInsert;

/**
 * Admin Widget Preferences - Dashboard widget düzeni ve görünürlük tercihleri
 */
export const adminWidgetPreferences = mysqlTable("admin_widget_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Admin kullanıcı ID
  widgetLayout: text("widgetLayout").notNull(), // JSON - widget sırası ve görünürlük ayarları
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("awp_user_id_idx").on(table.userId),
}));
export type AdminWidgetPreference = typeof adminWidgetPreferences.$inferSelect;
export type InsertAdminWidgetPreference = typeof adminWidgetPreferences.$inferInsert;
