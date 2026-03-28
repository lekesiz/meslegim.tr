import { eq, and, or, desc, inArray, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, stages, questions, answers, userStages, reports, mentorNotes, messages, feedbacks, certificates, platformSettings, stageUnlockLogs, notifications, pilotFeedbacks } from "../drizzle/schema";
import { ENV } from './_core/env';
import { sql } from 'drizzle-orm';

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
  const mentors = users as any;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      ageGroup: users.ageGroup,
      mentorId: users.mentorId,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
  // Attach mentor names
  const mentorMap = new Map(rows.filter(u => u.role === 'mentor').map(m => [m.id, m.name]));
  return rows.map(u => ({
    ...u,
    mentorName: u.mentorId ? (mentorMap.get(u.mentorId) || null) : null,
  }));
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
  const userReports = await db.select().from(reports).where(eq(reports.userId, userId));
  
  // Enrich with stage name
  const enriched = await Promise.all(userReports.map(async (r) => {
    let stageName = null;
    if (r.stageId) {
      const stageInfo = await db.select({ name: stages.name }).from(stages).where(eq(stages.id, r.stageId)).limit(1);
      if (stageInfo[0]) stageName = stageInfo[0].name;
    }
    return { ...r, stageName };
  }));
  
  return enriched;
}

export async function getReportById(reportId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get report
  const result = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  const report = result[0];
  if (!report) return null;
  
  // Get student to find mentor
  const student = await getUserById(report.userId);
  if (!student) return report;
  
  // Get mentor info if exists
  let mentorName = null;
  if (student.mentorId) {
    const mentor = await getUserById(student.mentorId);
    mentorName = mentor?.name || null;
  }
  
  // Get stage name
  let stageName = null;
  if (report.stageId) {
    const stageInfo = await db.select({ name: stages.name }).from(stages).where(eq(stages.id, report.stageId)).limit(1);
    if (stageInfo[0]) stageName = stageInfo[0].name;
  }
  
  return {
    ...report,
    mentorId: student.mentorId,
    mentorName,
    stageName
  };
}

export async function getPendingReports(mentorId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get reports that are pending approval with student and stage info
  const pendingReports = await db
    .select({
      id: reports.id,
      userId: reports.userId,
      stageId: reports.stageId,
      type: reports.type,
      content: reports.content,
      fileUrl: reports.fileUrl,
      status: reports.status,
      mentorFeedback: reports.mentorFeedback,
      approvedBy: reports.approvedBy,
      approvedAt: reports.approvedAt,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .where(eq(reports.status, 'pending'));
  
  // Enrich with stage info and summary
  const enriched = await Promise.all(pendingReports.map(async (r) => {
    let stageName = 'Etap';
    let completedAt: Date | null = null;
    let summary: string | null = null;
    
    if (r.stageId) {
      const stageInfo = await db.select({ name: stages.name, order: stages.order })
        .from(stages)
        .where(eq(stages.id, r.stageId))
        .limit(1);
      if (stageInfo[0]) stageName = stageInfo[0].name || `Etap ${stageInfo[0].order}`;
      
      // Get completion date from user_stages
      const userStage = await db.select({ completedAt: userStages.completedAt })
        .from(userStages)
        .where(and(eq(userStages.userId, r.userId), eq(userStages.stageId, r.stageId)))
        .limit(1);
      if (userStage[0]) completedAt = userStage[0].completedAt;
    }
    
    // Extract summary from content (first 200 chars of non-markdown text)
    if (r.content) {
      const plainText = r.content.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
      summary = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
    }
    
    return { ...r, stageName, completedAt, summary };
  }));
  
  // If mentorId is provided, filter by students assigned to this mentor
  if (mentorId) {
    const mentorStudents = await getStudentsByMentor(mentorId);
    const studentIds = mentorStudents.map(s => s.id);
    return enriched.filter(r => studentIds.includes(r.userId));
  }
  
  return enriched;
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

  // Schedule next stage activation - use age-group specific delay if set, else global
  const delayDays = await getTransitionDelayForAgeGroup(currentStage.ageGroup, 7);
  const unlockedAt = new Date();
  unlockedAt.setDate(unlockedAt.getDate() + delayDays);

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
  
  // Check if user stage already exists to prevent duplicates
  const [existing] = await dbInstance
    .select()
    .from(userStages)
    .where(and(eq(userStages.userId, data.userId), eq(userStages.stageId, data.stageId)))
    .limit(1);
  
  if (existing) {
    // Update status if needed (e.g., locked -> active)
    if (existing.status !== data.status) {
      await dbInstance.update(userStages)
        .set({ 
          status: data.status,
          unlockedAt: data.status === 'active' ? new Date() : existing.unlockedAt,
          updatedAt: new Date(),
        })
        .where(and(eq(userStages.userId, data.userId), eq(userStages.stageId, data.stageId)));
    }
    return existing;
  }
  
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
  const rows = await db
    .select({
      id: reports.id,
      userId: reports.userId,
      stageId: reports.stageId,
      type: reports.type,
      status: reports.status,
      content: reports.content,
      summary: reports.summary,
      fileUrl: reports.fileUrl,
      mentorFeedback: reports.mentorFeedback,
      createdAt: reports.createdAt,
      studentName: users.name,
      stageName: stages.name,
    })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .leftJoin(stages, eq(reports.stageId, stages.id))
    .orderBy(reports.createdAt);
  return rows;
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


// ============================================
// Student Dashboard Functions
// ============================================

export async function getStudentDashboardStats(studentId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) {
    return {
      totalStages: 0,
      completedStages: 0,
      activeStage: null,
      progress: 0,
      totalReports: 0,
      approvedReports: 0,
      mentor: null,
    };
  }

  // Get student info with mentor
  const student = await dbInstance
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (student.length === 0) {
    throw new Error("Student not found");
  }

  const studentData = student[0];

  // Get mentor info
  let mentorData = null;
  if (studentData.mentorId) {
    const mentor = await dbInstance
      .select()
      .from(users)
      .where(eq(users.id, studentData.mentorId))
      .limit(1);
    
    if (mentor.length > 0) {
      mentorData = {
        id: mentor[0].id,
        name: mentor[0].name,
        email: mentor[0].email,
      };
    }
  }

  // Get progress stats
  const progressStats = await calculateStudentProgress(studentId);

  // Get reports stats
  const studentReports = await dbInstance
    .select()
    .from(reports)
    .where(eq(reports.userId, studentId));

  const approvedReports = studentReports.filter(r => r.status === 'approved').length;

  // Get active stage
  const activeStages = await dbInstance
    .select()
    .from(userStages)
    .innerJoin(stages, eq(userStages.stageId, stages.id))
    .where(and(
      eq(userStages.userId, studentId),
      eq(userStages.status, 'active')
    ))
    .limit(1);

  const activeStage = activeStages.length > 0 ? {
    id: activeStages[0].stages.id,
    name: activeStages[0].stages.name,
    description: activeStages[0].stages.description,
    order: activeStages[0].stages.order,
  } : null;

  return {
    totalStages: progressStats.totalStages,
    completedStages: progressStats.completedStages,
    activeStage,
    progress: progressStats.progressPercentage,
    totalReports: studentReports.length,
    approvedReports,
    mentor: mentorData,
  };
}

export async function getStudentStagesWithProgress(studentId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const student = await dbInstance
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (student.length === 0) {
    throw new Error("Student not found");
  }

  const ageGroup = student[0].ageGroup;
  if (!ageGroup) {
    return [];
  }

  // Get all stages for age group
  const allStages = await dbInstance
    .select()
    .from(stages)
    .where(eq(stages.ageGroup, ageGroup))
    .orderBy(stages.order);

  // Get user stages
  const userStagesData = await dbInstance
    .select()
    .from(userStages)
    .where(eq(userStages.userId, studentId));

  // Combine data
  return allStages.map(stage => {
    const userStage = userStagesData.find(us => us.stageId === stage.id);
    return {
      ...stage,
      status: userStage?.status || 'locked',
      unlockedAt: userStage?.unlockedAt || null,
      completedAt: userStage?.completedAt || null,
    };
  });
}

// ============================================
// Certificate Functions
// ============================================

export async function checkCertificateEligibility(studentId: number): Promise<boolean> {
  const dbInstance = await getDb();
  if (!dbInstance) return false;

  const progressStats = await calculateStudentProgress(studentId);
  return progressStats.progressPercentage === 100;
}

export async function generateCertificateNumber(studentId: number): Promise<string> {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MSLGM-${studentId}-${timestamp}-${random}`;
}

export async function createCertificate(studentId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) {
    throw new Error("Database not available");
  }

  // Check if certificate already exists
  const existing = await dbInstance
    .select()
    .from(certificates)
    .where(eq(certificates.studentId, studentId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Check eligibility
  const isEligible = await checkCertificateEligibility(studentId);
  if (!isEligible) {
    throw new Error("Student has not completed all stages");
  }

  // Get student info
  const student = await dbInstance
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (student.length === 0) {
    throw new Error("Student not found");
  }

  // Generate certificate number
  const certificateNumber = await generateCertificateNumber(studentId);

  // Generate PDF
  const { generateCertificatePDF } = await import("./pdfCertificate");
  const { url: pdfUrl } = await generateCertificatePDF({
    studentName: student[0].name || "Öğrenci",
    certificateNumber,
    completionDate: new Date(),
    ageGroup: student[0].ageGroup || "18-21",
  });

  // Create certificate
  await dbInstance.insert(certificates).values({
    studentId,
    certificateNumber,
    pdfUrl,
  });

  const newCertificate = await dbInstance
    .select()
    .from(certificates)
    .where(eq(certificates.certificateNumber, certificateNumber))
    .limit(1);

  return newCertificate[0];
}

export async function getCertificateByStudent(studentId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const result = await dbInstance
    .select()
    .from(certificates)
    .where(eq(certificates.studentId, studentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateCertificatePdf(certificateId: number, pdfUrl: string) {
  const dbInstance = await getDb();
  if (!dbInstance) {
    throw new Error("Database not available");
  }

  await dbInstance
    .update(certificates)
    .set({ pdfUrl })
    .where(eq(certificates.id, certificateId));
}

export async function getCertificateByNumber(certificateNumber: string) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const result = await dbInstance
    .select()
    .from(certificates)
    .innerJoin(users, eq(certificates.studentId, users.id))
    .where(eq(certificates.certificateNumber, certificateNumber))
    .limit(1);

  if (result.length === 0) return null;

  return {
    ...result[0].certificates,
    student: {
      id: result[0].users.id,
      name: result[0].users.name,
      email: result[0].users.email,
    },
  };
}


// Get all feedbacks with stats for admin dashboard
export async function getAllFeedbacksWithStats() {
  const db = await getDb();
  if (!db) return null;

  // Get all feedbacks with student and mentor info using raw SQL to avoid Drizzle subquery issues
  const conn = await import('mysql2/promise').then(m => m.createConnection(process.env.DATABASE_URL!));
  const [rawFeedbacks] = await conn.execute<any[]>(`
    SELECT f.id, f.rating, f.comment, f.createdAt, f.mentorId,
      s.name as studentName,
      m.name as mentorName
    FROM feedbacks f
    LEFT JOIN users s ON f.studentId = s.id
    LEFT JOIN users m ON f.mentorId = m.id
    ORDER BY f.createdAt DESC
  `);
  await conn.end();
  const allFeedbacks = rawFeedbacks as Array<{id: number, rating: number, comment: string|null, createdAt: Date, mentorId: number, studentName: string|null, mentorName: string|null}>;

  // Calculate overall stats
  const totalFeedbacks = allFeedbacks.length;
  const averageRating = totalFeedbacks > 0 
    ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks 
    : 0;

  // Group by mentor
  const mentorStats = allFeedbacks.reduce((acc, feedback) => {
    const mentorId = feedback.mentorId;
    if (!acc[mentorId]) {
      acc[mentorId] = {
        mentorId,
        mentorName: feedback.mentorName,
        totalFeedbacks: 0,
        averageRating: 0,
        ratings: [] as number[],
      };
    }
    acc[mentorId].totalFeedbacks++;
    acc[mentorId].ratings.push(feedback.rating);
    return acc;
  }, {} as Record<number, any>);

  // Calculate average for each mentor
  Object.values(mentorStats).forEach((mentor: any) => {
    mentor.averageRating = mentor.ratings.reduce((sum: number, r: number) => sum + r, 0) / mentor.ratings.length;
    delete mentor.ratings; // Remove ratings array from final output
  });

  return {
    totalFeedbacks,
    averageRating: Math.round(averageRating * 10) / 10,
    mentorStats: Object.values(mentorStats),
    recentFeedbacks: allFeedbacks.slice(0, 10), // Last 10 feedbacks
  };
}


// Verify certificate by certificate number
export async function verifyCertificate(certificateNumber: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: certificates.id,
    certificateNumber: certificates.certificateNumber,
    issueDate: certificates.issueDate,
    studentName: sql<string>`(SELECT name FROM ${users} WHERE id = ${certificates.studentId})`,
    studentAgeGroup: sql<string>`(SELECT ageGroup FROM ${users} WHERE id = ${certificates.studentId})`,
  })
  .from(certificates)
  .where(eq(certificates.certificateNumber, certificateNumber))
  .limit(1);

  return result[0] || null;
}

// ============================================
// Platform Settings Functions
// ============================================

export async function getPlatformSetting(key: string): Promise<string | null> {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  const [setting] = await dbInstance
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, key))
    .limit(1);

  return setting?.value ?? null;
}

export async function getPlatformSettingNumber(key: string, defaultValue: number): Promise<number> {
  const value = await getPlatformSetting(key);
  if (value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export async function setPlatformSetting(key: string, value: string, description?: string): Promise<void> {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error('Database not initialized');

  const [existing] = await dbInstance
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, key))
    .limit(1);

  if (existing) {
    await dbInstance
      .update(platformSettings)
      .set({ value, ...(description ? { description } : {}) })
      .where(eq(platformSettings.key, key));
  } else {
    await dbInstance.insert(platformSettings).values({ key, value, description });
  }
}

export async function getAllPlatformSettings(): Promise<Array<{ key: string; value: string; description: string | null; updatedAt: Date }>> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return await dbInstance
    .select()
    .from(platformSettings)
    .orderBy(platformSettings.key);
}


/**
 * Instantly unlock a locked stage for a user (admin/mentor action)
 * Returns the stage name for notification purposes
 */
/**
 * Log a manual stage unlock action (audit trail)
 */
export async function logStageUnlock(params: {
  unlockedByUserId: number;
  unlockedByRole: string;
  studentId: number;
  stageId: number;
  stageName: string;
  studentName?: string | null;
  note?: string | null;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return;
  await dbInstance.insert(stageUnlockLogs).values({
    unlockedByUserId: params.unlockedByUserId,
    unlockedByRole: params.unlockedByRole,
    studentId: params.studentId,
    stageId: params.stageId,
    stageName: params.stageName,
    studentName: params.studentName ?? null,
    note: params.note ?? null,
  });
}

/**
 * Get stage unlock audit logs (admin: all logs; mentor: only their students)
 */
export async function getStageUnlockLogs(options?: {
  mentorId?: number;
  studentId?: number;
  limit?: number;
  role?: 'admin' | 'mentor';
  studentName?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const limit = options?.limit ?? 100;

  // Build base conditions
  const conditions: ReturnType<typeof eq>[] = [];

  if (options?.role) {
    conditions.push(eq(stageUnlockLogs.unlockedByRole, options.role));
  }

  if (options?.studentId) {
    conditions.push(eq(stageUnlockLogs.studentId, options.studentId));
  }

  if (options?.dateFrom) {
    conditions.push(gte(stageUnlockLogs.createdAt, options.dateFrom));
  }

  if (options?.dateTo) {
    conditions.push(lte(stageUnlockLogs.createdAt, options.dateTo));
  }

  if (options?.mentorId) {
    // Mentor: only logs for students assigned to this mentor
    const mentorStudents = await dbInstance
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.mentorId, options.mentorId), eq(users.role, 'student')));
    const studentIds = mentorStudents.map(s => s.id);
    if (studentIds.length === 0) return [];
    conditions.push(inArray(stageUnlockLogs.studentId, studentIds));
  }

  let query = dbInstance
    .select()
    .from(stageUnlockLogs)
    .orderBy(desc(stageUnlockLogs.createdAt))
    .limit(limit);

  if (conditions.length > 0) {
    // @ts-ignore - drizzle where chaining
    query = query.where(and(...conditions));
  }

  let results = await query;

  // Client-side filter for studentName (partial match)
  if (options?.studentName && options.studentName.trim()) {
    const needle = options.studentName.trim().toLowerCase();
    results = results.filter(r =>
      r.studentName?.toLowerCase().includes(needle)
    );
  }

  return results;
}

export async function unlockStageNow(userId: number, userStageId: number): Promise<{ stageName: string; userEmail: string | null; userName: string | null; stageId: number } | null> {
  const dbInstance = await getDb();
  if (!dbInstance) return null;

  // Get the userStage with user and stage info
  const [us] = await dbInstance
    .select({
      id: userStages.id,
      userId: userStages.userId,
      stageId: userStages.stageId,
      status: userStages.status,
      stageName: stages.name,
      userEmail: users.email,
      userName: users.name,
    })
    .from(userStages)
    .innerJoin(stages, eq(userStages.stageId, stages.id))
    .innerJoin(users, eq(userStages.userId, users.id))
    .where(and(eq(userStages.id, userStageId), eq(userStages.userId, userId)))
    .limit(1);

  if (!us || us.status !== 'locked') return null;

  // Unlock immediately
  await dbInstance
    .update(userStages)
    .set({ status: 'active', unlockedAt: new Date(), updatedAt: new Date() })
    .where(eq(userStages.id, userStageId));

  return {
    stageName: us.stageName,
    userEmail: us.userEmail,
    userName: us.userName,
    stageId: us.stageId,
  };
}

/**
 * Get all locked stages for a specific user (for admin view)
 */
export async function getLockedStagesForUser(userId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  return await dbInstance
    .select({
      id: userStages.id,
      userId: userStages.userId,
      stageId: userStages.stageId,
      status: userStages.status,
      unlockedAt: userStages.unlockedAt,
      stageName: stages.name,
      stageOrder: stages.order,
      ageGroup: stages.ageGroup,
    })
    .from(userStages)
    .innerJoin(stages, eq(userStages.stageId, stages.id))
    .where(and(eq(userStages.userId, userId), eq(userStages.status, 'locked')))
    .orderBy(stages.order);
}

/**
 * Get all students with their locked stage counts (for admin overview)
 */
export async function getStudentsWithLockedStages() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  const allUsers = await getAllUsers();
  const students = allUsers.filter(u => u.role === 'student' && u.status === 'active');

  const result = [];
  for (const student of students) {
    const lockedStages = await getLockedStagesForUser(student.id);
    if (lockedStages.length > 0) {
      result.push({
        userId: student.id,
        userName: student.name,
        userEmail: student.email,
        ageGroup: student.ageGroup,
        lockedStages,
      });
    }
  }
  return result;
}

/**
 * Get the stage_transition_delay_days for a specific age group
 * Falls back to global setting, then to defaultValue
 */
export async function getTransitionDelayForAgeGroup(ageGroup: string, defaultValue = 7): Promise<number> {
  const key = `stage_transition_delay_days_${ageGroup.replace('-', '_')}`;
  const ageGroupValue = await getPlatformSetting(key);
  if (ageGroupValue !== null) {
    const parsed = parseInt(ageGroupValue, 10);
    if (!isNaN(parsed)) return parsed;
  }
  // Fall back to global setting
  return await getPlatformSettingNumber('stage_transition_delay_days', defaultValue);
}

/**
 * Count how many times a mentor has unlocked stages in a given time window.
 * Used for quota enforcement.
 */
export async function getMentorUnlockCount(mentorId: number, since: Date): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(stageUnlockLogs)
    .where(and(
      eq(stageUnlockLogs.unlockedByUserId, mentorId),
      gte(stageUnlockLogs.createdAt, since)
    ));
  return Number(result[0]?.count ?? 0);
}

/**
 * Export stage unlock logs as CSV string.
 * Accepts the same filter params as getStageUnlockLogs.
 */
export async function exportStageUnlockLogsCsv(params: {
  role?: 'admin' | 'mentor';
  studentName?: string;
  studentId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}): Promise<string> {
  const logs = await getStageUnlockLogs({ ...params, limit: params.limit ?? 5000 });

  const header = ['ID', 'Tarih', 'Açan Kullanıcı ID', 'Rol', 'Öğrenci', 'Etap', 'Not'].join(',');
  const rows = logs.map(l => [
    l.id,
    new Date(l.createdAt).toLocaleString('tr-TR'),
    l.unlockedByUserId,
    l.unlockedByRole,
    `"${(l.studentName ?? '').replace(/"/g, '""')}"`,
    `"${l.stageName.replace(/"/g, '""')}"`,
    `"${(l.note ?? '').replace(/"/g, '""')}"`,
  ].join(','));

  return [header, ...rows].join('\n');
}


// ============ PROFILE MANAGEMENT ============

export async function updateUserProfile(userId: number, data: {
  name?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
  return await getUserById(userId);
}

export async function changeUserPassword(userId: number, newHashedPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ password: newHashedPassword }).where(eq(users.id, userId));
}

// ============ EMAIL VERIFICATION ============

export async function setEmailVerificationToken(userId: number, token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ emailVerificationToken: token }).where(eq(users.id, userId));
}

export async function verifyEmailByToken(token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
  if (result.length === 0) return false;
  
  await db.update(users).set({ 
    emailVerified: true, 
    emailVerificationToken: null 
  }).where(eq(users.id, result[0].id));
  
  return true;
}

export async function getUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
  return result[0] || null;
}

// ============ IN-APP NOTIFICATIONS ============

export async function createNotification(data: {
  userId: number;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    link: data.link || null,
  });
}

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count || 0;
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true })
    .where(eq(notifications.userId, userId));
}


// ========== Pilot Feedback ==========
export async function createPilotFeedback(data: {
  userId?: number;
  npsScore: number;
  whatWorkedWell?: string;
  whatNeedsImprovement?: string;
  wouldRecommend?: boolean;
  additionalComments?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(pilotFeedbacks).values(data);
  return result.insertId;
}

export async function getAllPilotFeedbacks() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: pilotFeedbacks.id,
    userId: pilotFeedbacks.userId,
    userName: users.name,
    userEmail: users.email,
    npsScore: pilotFeedbacks.npsScore,
    whatWorkedWell: pilotFeedbacks.whatWorkedWell,
    whatNeedsImprovement: pilotFeedbacks.whatNeedsImprovement,
    wouldRecommend: pilotFeedbacks.wouldRecommend,
    additionalComments: pilotFeedbacks.additionalComments,
    createdAt: pilotFeedbacks.createdAt,
  })
    .from(pilotFeedbacks)
    .leftJoin(users, eq(pilotFeedbacks.userId, users.id))
    .orderBy(desc(pilotFeedbacks.createdAt));
}

export async function getPilotFeedbackStats() {
  const db = await getDb();
  if (!db) return { total: 0, avgNps: 0, promoters: 0, passives: 0, detractors: 0, npsScore: 0 };
  
  const allFeedbacks = await db.select({ npsScore: pilotFeedbacks.npsScore }).from(pilotFeedbacks);
  const total = allFeedbacks.length;
  if (total === 0) return { total: 0, avgNps: 0, promoters: 0, passives: 0, detractors: 0, npsScore: 0 };
  
  const avgNps = allFeedbacks.reduce((sum, f) => sum + f.npsScore, 0) / total;
  const promoters = allFeedbacks.filter(f => f.npsScore >= 9).length;
  const passives = allFeedbacks.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length;
  const detractors = allFeedbacks.filter(f => f.npsScore <= 6).length;
  const npsScore = Math.round(((promoters - detractors) / total) * 100);
  
  return { total, avgNps: Math.round(avgNps * 10) / 10, promoters, passives, detractors, npsScore };
}
