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
  kvkkConsent: boolean("kvkkConsent").default(false).notNull(),
  kvkkConsentDate: timestamp("kvkkConsentDate"),
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
  type: mysqlEnum("type", ["stage", "final"]).notNull(),
  content: text("content"), // AI-generated report content (markdown)
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
