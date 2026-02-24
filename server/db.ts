import { eq, and, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, stages, questions, answers, userStages, reports, mentorNotes, messages, feedbacks } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "tcKimlik"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    // Set role - admin if owner, otherwise use provided role or default to student
    if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
      values.status = 'active'; // Admin is always active
      updateSet.status = 'active';
    } else if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    // Handle other fields
    if (user.status !== undefined) {
      values.status = user.status;
      updateSet.status = user.status;
    }
    if (user.ageGroup !== undefined) {
      values.ageGroup = user.ageGroup;
      updateSet.ageGroup = user.ageGroup;
    }
    if (user.mentorId !== undefined) {
      values.mentorId = user.mentorId;
      updateSet.mentorId = user.mentorId;
    }
    if (user.kvkkConsent !== undefined) {
      values.kvkkConsent = user.kvkkConsent;
      updateSet.kvkkConsent = user.kvkkConsent;
    }
    if (user.kvkkConsentDate !== undefined) {
      values.kvkkConsentDate = user.kvkkConsentDate;
      updateSet.kvkkConsentDate = user.kvkkConsentDate;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: Omit<InsertUser, 'openId'> & { openId?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate a temporary openId if not provided (for registration without OAuth)
  const openId = data.openId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const result = await db.insert(users).values({
    ...data,
    openId,
    kvkkConsent: true,
    kvkkConsentDate: new Date(),
    lastSignedIn: new Date(),
  });
  
  // Return the created user
  const userId = result[0].insertId;
  const user = await getUserById(userId);
  if (!user) throw new Error("Failed to create user");
  return user;
}

// Admin functions
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// Mentor functions
export async function getPendingStudents(mentorId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(users.status, 'pending'), eq(users.role, 'student')];
  if (mentorId) {
    conditions.push(eq(users.mentorId, mentorId));
  }
  
  return await db.select().from(users).where(and(...conditions));
}

export async function getStudentsByMentor(mentorId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(
    and(eq(users.mentorId, mentorId), eq(users.role, 'student'))
  );
}

// Stage functions
export async function getStagesByAgeGroup(ageGroup: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stages).where(eq(stages.ageGroup, ageGroup as any));
}

export async function getAllStages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stages);
}

export async function getStageById(stageId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stages).where(eq(stages.id, stageId));
  return result[0] || null;
}

// Question functions
export async function getQuestionsByStage(stageId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questions).where(eq(questions.stageId, stageId));
}

// User stage functions
export async function getUserStages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Join with stages table to get stage details
  const result = await db
    .select({
      id: userStages.id,
      userId: userStages.userId,
      stageId: userStages.stageId,
      status: userStages.status,
      unlockedAt: userStages.unlockedAt,
      completedAt: userStages.completedAt,
      createdAt: userStages.createdAt,
      updatedAt: userStages.updatedAt,
      name: stages.name,
      description: stages.description,
      ageGroup: stages.ageGroup,
      order: stages.order,
    })
    .from(userStages)
    .leftJoin(stages, eq(userStages.stageId, stages.id))
    .where(eq(userStages.userId, userId))
    .orderBy(stages.order);
  
  return result;
}

export async function getAllUserStages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userStages);
}

export async function getActiveStage(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userStages).where(
    and(eq(userStages.userId, userId), eq(userStages.status, 'active'))
  ).limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// Answer functions
export async function saveAnswer(userId: number, questionId: number, answer: string) {
  const db = await getDb();
  if (!db) return;
  
  // Check if answer exists
  const existing = await db.select().from(answers).where(
    and(eq(answers.userId, userId), eq(answers.questionId, questionId))
  ).limit(1);
  
  if (existing.length > 0) {
    // Update existing answer
    await db.update(answers).set({ answer }).where(
      and(eq(answers.userId, userId), eq(answers.questionId, questionId))
    );
  } else {
    // Insert new answer
    await db.insert(answers).values({ userId, questionId, answer });
  }
}

export async function getAnswersByUserAndStage(userId: number, stageId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all questions for this stage
  const stageQuestions = await getQuestionsByStage(stageId);
  const questionIds = stageQuestions.map(q => q.id);
  
  if (questionIds.length === 0) return [];
  
  return await db.select().from(answers).where(
    and(
      eq(answers.userId, userId),
      or(...questionIds.map(id => eq(answers.questionId, id)))
    )
  );
}

// Report functions
export async function createReport(data: typeof reports.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reports).values(data);
}

export async function getReportsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reports).where(eq(reports.userId, userId));
}

export async function getReportById(reportId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  return result[0] || null;
}

export async function getPendingReports(mentorId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get reports that are pending approval
  const pendingReports = await db.select().from(reports).where(
    eq(reports.status, 'pending')
  );
  
  // If mentorId is provided, filter by students assigned to this mentor
  if (mentorId) {
    const mentorStudents = await getStudentsByMentor(mentorId);
    const studentIds = mentorStudents.map(s => s.id);
    return pendingReports.filter(r => studentIds.includes(r.userId));
  }
  
  return pendingReports;
}

export async function approveReport(reportId: number, mentorId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(reports).set({
    status: 'approved',
    approvedBy: mentorId,
    approvedAt: new Date()
  }).where(eq(reports.id, reportId));
}


export async function updateUserStage(userId: number, stageId: number, status: 'active' | 'completed') {
  const db = await getDb();
  if (!db) return;

  await db.update(userStages)
    .set({ 
      status,
      completedAt: status === 'completed' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(userStages.userId, userId), eq(userStages.stageId, stageId)));
}

export async function scheduleNextStage(userId: number, currentStageId: number) {
  const db = await getDb();
  if (!db) return;

  // Get current stage
  const allStages = await getAllStages();
  const currentStage = allStages.find(s => s.id === currentStageId);
  if (!currentStage) return;

  // Find next stage in the same age group
  const nextStage = allStages.find(s => 
    s.ageGroup === currentStage.ageGroup && 
    s.order === currentStage.order + 1
  );

  if (!nextStage) {
    // No more stages, mark user as completed all stages
    return;
  }

  // Schedule next stage activation (7 days from now)
  const unlockedAt = new Date();
  unlockedAt.setDate(unlockedAt.getDate() + 7);

  await db.insert(userStages).values({
    userId,
    stageId: nextStage.id,
    status: 'locked',
    unlockedAt,
  });
}

export async function getStageWithAnswers(userId: number, stageId: number) {
  const db = await getDb();
  if (!db) return null;

  const stage = (await getAllStages()).find(s => s.id === stageId);
  if (!stage) return null;

  const questions = await getQuestionsByStage(stageId);
  const answers = await getAnswersByUserAndStage(userId, stageId);

  return {
    stage,
    questions,
    answers,
  };
}


export async function getFirstStageForAgeGroup(ageGroup: string) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  const [stage] = await dbInstance
    .select()
    .from(stages)
    .where(eq(stages.order, 1))
    .limit(1);
  return stage;
}

export async function createUserStage(data: { userId: number; stageId: number; status: 'locked' | 'active' | 'completed' }) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  await dbInstance.insert(userStages).values({
    userId: data.userId,
    stageId: data.stageId,
    status: data.status,
    unlockedAt: data.status === 'active' ? new Date() : null,
  });
  // Return the created user stage
  const [userStage] = await dbInstance
    .select()
    .from(userStages)
    .where(and(eq(userStages.userId, data.userId), eq(userStages.stageId, data.stageId)))
    .limit(1);
  return userStage;
}


export async function getAllReports() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reports);
}

export async function getAllQuestions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questions);
}

export async function updateReport(reportId: number, data: Partial<{ fileUrl: string; status: 'pending' | 'approved' | 'rejected'; content: string; mentorFeedback: string }>) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  await dbInstance
    .update(reports)
    .set(data)
    .where(eq(reports.id, reportId));
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  await dbInstance
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));
}


/**
 * Calculate student progress percentage based on completed stages
 * @param userId - Student user ID
 * @returns Progress percentage (0-100) and completed/total stage counts
 */
export async function calculateStudentProgress(userId: number): Promise<{
  progressPercentage: number;
  completedStages: number;
  totalStages: number;
  stageProgress: Array<{ stageId: number; stageName: string; status: string; completedAt: Date | null }>;
}> {
  const dbInstance = await getDb();
  if (!dbInstance) {
    return { progressPercentage: 0, completedStages: 0, totalStages: 0, stageProgress: [] };
  }

  // Get user's age group to filter relevant stages
  const user = await getUserById(userId);
  if (!user) {
    return { progressPercentage: 0, completedStages: 0, totalStages: 0, stageProgress: [] };
  }

  // Get all stages for user's age group
  const allStages = await dbInstance
    .select()
    .from(stages)
    .where(eq(stages.ageGroup, user.ageGroup || '14-17'));

  const totalStages = allStages.length;

  // Get user's stage progress
  const userStageProgress = await dbInstance
    .select({
      stageId: userStages.stageId,
      status: userStages.status,
      completedAt: userStages.completedAt,
      stageName: stages.name,
    })
    .from(userStages)
    .innerJoin(stages, eq(userStages.stageId, stages.id))
    .where(eq(userStages.userId, userId));

  const completedStages = userStageProgress.filter(s => s.status === 'completed').length;
  const progressPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const stageProgress = userStageProgress.map(s => ({
    stageId: s.stageId,
    stageName: s.stageName,
    status: s.status,
    completedAt: s.completedAt,
  }));

  return {
    progressPercentage,
    completedStages,
    totalStages,
    stageProgress,
  };
}


/**
 * Mentor Notes CRUD operations
 */
export async function getMentorNotesByStudent(studentId: number): Promise<any[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  
  const { mentorNotes } = await import('../drizzle/schema');
  return await dbInstance
    .select()
    .from(mentorNotes)
    .where(eq(mentorNotes.studentId, studentId))
    .orderBy(desc(mentorNotes.createdAt));
}

export async function createMentorNote(data: { mentorId: number; studentId: number; note: string }) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  
  const { mentorNotes } = await import('../drizzle/schema');
  await dbInstance.insert(mentorNotes).values(data);
  
  // Return the created note
  const [note] = await dbInstance
    .select()
    .from(mentorNotes)
    .where(and(eq(mentorNotes.mentorId, data.mentorId), eq(mentorNotes.studentId, data.studentId)))
    .orderBy(desc(mentorNotes.createdAt))
    .limit(1);
  return note;
}

export async function updateMentorNote(noteId: number, note: string) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  
  const { mentorNotes } = await import('../drizzle/schema');
  await dbInstance
    .update(mentorNotes)
    .set({ note, updatedAt: new Date() })
    .where(eq(mentorNotes.id, noteId));
}

export async function deleteMentorNote(noteId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  
  const { mentorNotes } = await import('../drizzle/schema');
  await dbInstance
    .delete(mentorNotes)
    .where(eq(mentorNotes.id, noteId));
}

export async function getMentorNoteById(noteId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;
  
  const { mentorNotes } = await import('../drizzle/schema');
  const [note] = await dbInstance
    .select()
    .from(mentorNotes)
    .where(eq(mentorNotes.id, noteId))
    .limit(1);
  return note;
}


// Mentor performance statistics
export async function getMentorStats(mentorId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) {
    return {
      totalStudents: 0,
      approvedReports: 0,
      pendingReports: 0,
      avgResponseTimeDays: 0,
    };
  }
  
  // Total students
  const students = await dbInstance.select().from(users).where(
    and(
      eq(users.mentorId, mentorId),
      eq(users.role, 'student')
    )
  );
  
  // Get student IDs for this mentor
  const studentIds = students.map(s => s.id);
  
  // Approved reports count
  const allReports = await dbInstance.select().from(reports);
  const approvedReports = allReports.filter(r => 
    studentIds.includes(r.userId) && r.status === 'approved'
  );
  
  // Pending reports count
  const pendingReports = allReports.filter(r => 
    studentIds.includes(r.userId) && r.status === 'pending'
  );
  
  // Average response time (days) - from report creation to approval
  const reportsWithApproval = approvedReports.filter(r => r.approvedAt !== null);
  
  let avgResponseTime = 0;
  if (reportsWithApproval.length > 0) {
    const totalDays = reportsWithApproval.reduce((sum, report) => {
      if (!report.approvedAt) return sum;
      const days = Math.floor(
        (new Date(report.approvedAt).getTime() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);
    avgResponseTime = Math.round(totalDays / reportsWithApproval.length);
  }
  
  return {
    totalStudents: students.length,
    approvedReports: approvedReports.length,
    pendingReports: pendingReports.length,
    avgResponseTimeDays: avgResponseTime,
  };
}

export async function getMentorPerformanceTrends(mentorId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) {
    return {
      studentGrowth: [],
      approvalSpeed: [],
      stageCompletion: [],
    };
  }
  
  // Get students for this mentor
  const students = await dbInstance.select().from(users).where(
    and(
      eq(users.mentorId, mentorId),
      eq(users.role, 'student')
    )
  );
  const studentIds = students.map(s => s.id);
  
  // Get all reports for these students
  const allReports = await dbInstance.select().from(reports);
  const mentorReports = allReports.filter(r => studentIds.includes(r.userId));
  
  // Get all user stages for these students
  const allUserStages = await dbInstance.select().from(userStages);
  const mentorUserStages = allUserStages.filter(us => studentIds.includes(us.userId));
  
  // Generate last 6 months data
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
      monthStart: new Date(date.getFullYear(), date.getMonth(), 1),
      monthEnd: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
    });
  }
  
  // Student Growth (new students per month)
  const studentGrowth = months.map(m => {
    const count = students.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= m.monthStart && createdAt <= m.monthEnd;
    }).length;
    return { month: m.month, count };
  });
  
  // Approval Speed (average days to approve reports per month)
  const approvalSpeed = months.map(m => {
    const monthReports = mentorReports.filter(r => {
      if (!r.approvedAt) return false;
      const approvedAt = new Date(r.approvedAt);
      return approvedAt >= m.monthStart && approvedAt <= m.monthEnd;
    });
    
    if (monthReports.length === 0) {
      return { month: m.month, avgDays: 0 };
    }
    
    const totalDays = monthReports.reduce((sum, report) => {
      if (!report.approvedAt) return sum;
      const days = Math.floor(
        (new Date(report.approvedAt).getTime() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);
    
    return { month: m.month, avgDays: Math.round(totalDays / monthReports.length) };
  });
  
  // Stage Completion (completed stages per month)
  const stageCompletion = months.map(m => {
    const count = mentorUserStages.filter(us => {
      if (us.status !== 'completed' || !us.completedAt) return false;
      const completedAt = new Date(us.completedAt);
      return completedAt >= m.monthStart && completedAt <= m.monthEnd;
    }).length;
    return { month: m.month, count };
  });
  
  return {
    studentGrowth,
    approvalSpeed,
    stageCompletion,
  };
}

// ============================================================
// Messages Functions
// ============================================================

export async function sendMessage(data: { senderId: number; receiverId: number; message: string }) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const [newMessage] = await db.insert(messages).values(data);
  return newMessage;
}

export async function getConversation(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  const conversation = await db.select().from(messages).where(
    or(
      and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
      and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
    )
  ).orderBy(messages.createdAt);
  
  return conversation;
}

export async function markMessagesAsRead(userId: number, otherUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.senderId, otherUserId),
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      )
    );
}

export async function getUnreadCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const unreadMessages = await db.select().from(messages).where(
    and(
      eq(messages.receiverId, userId),
      eq(messages.isRead, false)
    )
  );
  
  return unreadMessages.length;
}

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Get all unique users this user has conversations with
  const sentMessages = await db.select({ otherUserId: messages.receiverId }).from(messages).where(eq(messages.senderId, userId));
  const receivedMessages = await db.select({ otherUserId: messages.senderId }).from(messages).where(eq(messages.receiverId, userId));
  
  const uniqueUserIds = Array.from(new Set([
    ...sentMessages.map((m: { otherUserId: number }) => m.otherUserId),
    ...receivedMessages.map((m: { otherUserId: number }) => m.otherUserId)
  ]));
  
  // Get user details and last message for each conversation
  const conversations = await Promise.all(
    uniqueUserIds.map(async (otherUserId) => {
      const otherUser = await getUserById(otherUserId);
      const conversation = await getConversation(userId, otherUserId);
      const lastMessage = conversation[conversation.length - 1];
      const unread = conversation.filter((m: any) => m.receiverId === userId && !m.isRead).length;
      
      return {
        otherUser,
        lastMessage,
        unreadCount: unread,
      };
    })
  );
  
  return conversations;
}

// Mentor Comparison Report
export async function getMentorComparison() {
  const dbInstance = await getDb();
  if (!dbInstance) {
    return [];
  }
  
  // Get all mentors
  const allUsers = await dbInstance.select().from(users);
  const mentors = allUsers.filter(u => u.role === 'mentor' || (u.role && u.role.includes('mentor')));
  
  // Get all students, reports, and user stages
  const students = allUsers.filter(u => u.role === 'student');
  const allReports = await dbInstance.select().from(reports);
  const allUserStages = await dbInstance.select().from(userStages);
  
  // Calculate stats for each mentor
  const mentorStats = mentors.map(mentor => {
    // Students assigned to this mentor
    const mentorStudents = students.filter(s => s.mentorId === mentor.id);
    const studentIds = mentorStudents.map(s => s.id);
    
    // Reports for this mentor's students
    const mentorReports = allReports.filter(r => studentIds.includes(r.userId));
    const approvedReports = mentorReports.filter(r => r.status === 'approved');
    const pendingReports = mentorReports.filter(r => r.status === 'pending');
    
    // Average approval time (in days)
    let avgApprovalTime = 0;
    if (approvedReports.length > 0) {
      const totalDays = approvedReports.reduce((sum, report) => {
        if (report.approvedAt && report.createdAt) {
          const days = Math.floor((new Date(report.approvedAt).getTime() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0);
      avgApprovalTime = totalDays / approvedReports.length;
    }
    
    // Completed stages for this mentor's students
    const completedStages = allUserStages.filter(us => 
      studentIds.includes(us.userId) && us.status === 'completed'
    );
    
    // Active students (status = 'active')
    const activeStudents = mentorStudents.filter(s => s.status === 'active');
    
    return {
      mentorId: mentor.id,
      mentorName: mentor.name || 'İsimsiz Mentor',
      mentorEmail: mentor.email,
      totalStudents: mentorStudents.length,
      activeStudents: activeStudents.length,
      pendingStudents: mentorStudents.filter(s => s.status === 'pending').length,
      totalReports: mentorReports.length,
      approvedReports: approvedReports.length,
      pendingReports: pendingReports.length,
      avgApprovalTimeDays: Math.round(avgApprovalTime * 10) / 10,
      completedStages: completedStages.length,
      approvalRate: mentorReports.length > 0 ? Math.round((approvedReports.length / mentorReports.length) * 100) : 0,
    };
  });
  
  // Sort by total students (descending)
  return mentorStats.sort((a, b) => b.totalStudents - a.totalStudents);
}

// ============================================================
// Feedback Functions
// ============================================================

export async function createFeedback(data: { studentId: number; mentorId: number; reportId?: number; rating: number; comment?: string }) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');
  
  await dbInstance.insert(feedbacks).values(data);
  
  // Return the created feedback
  const [feedback] = await dbInstance
    .select()
    .from(feedbacks)
    .where(and(eq(feedbacks.studentId, data.studentId), eq(feedbacks.mentorId, data.mentorId)))
    .orderBy(desc(feedbacks.createdAt))
    .limit(1);
  return feedback;
}

export async function getFeedbacksByMentor(mentorId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  
  return await dbInstance
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.mentorId, mentorId))
    .orderBy(desc(feedbacks.createdAt));
}

export async function getFeedbacksByStudent(studentId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  
  return await dbInstance
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.studentId, studentId))
    .orderBy(desc(feedbacks.createdAt));
}

export async function getAllFeedbacks() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  
  return await dbInstance
    .select()
    .from(feedbacks)
    .orderBy(desc(feedbacks.createdAt));
}

export async function getMentorFeedbackStats(mentorId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
  
  const mentorFeedbacks = await dbInstance
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.mentorId, mentorId));
  
  if (mentorFeedbacks.length === 0) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
  
  const totalRating = mentorFeedbacks.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = Math.round((totalRating / mentorFeedbacks.length) * 10) / 10;
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  mentorFeedbacks.forEach(f => {
    ratingDistribution[f.rating as 1 | 2 | 3 | 4 | 5]++;
  });
  
  return {
    totalFeedbacks: mentorFeedbacks.length,
    averageRating,
    ratingDistribution,
  };
}
