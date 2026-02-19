import { eq, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, stages, questions, answers, userStages, reports } from "../drizzle/schema";
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
  return await db.select().from(userStages).where(eq(userStages.userId, userId));
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

export async function getPendingReports(mentorId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get reports that are pending approval
  const pendingReports = await db.select().from(reports).where(
    eq(reports.status, 'pending_approval')
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
