import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock db module
vi.mock("./db");

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMentorContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 100,
    openId: "mentor-user",
    email: "mentor@example.com",
    name: "Test Mentor",
    loginMethod: "manus",
    role: "mentor",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("mentor.initiateStudentStages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initiates stages for a student successfully", async () => {
    const ctx = createMentorContext();
    const caller = appRouter.createCaller(ctx);

    // Mock database functions
    vi.mocked(db.getUserById).mockResolvedValue({
      id: 1,
      openId: "student-user",
      email: "student@example.com",
      name: "Test Student",
      password: null,
      phone: null,
      tcKimlik: null,
      loginMethod: "manus",
      role: "student",
      status: "active",
      ageGroup: "18-21",
      mentorId: 100,
      kvkkConsent: true,
      kvkkConsentDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    vi.mocked(db.getStagesByAgeGroup).mockResolvedValue([
      {
        id: 1,
        name: "Stage 1",
        description: "First stage",
        ageGroup: "18-21",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Stage 2",
        description: "Second stage",
        ageGroup: "18-21",
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    vi.mocked(db.getUserStages).mockResolvedValue([]);

    vi.mocked(db.createUserStage).mockImplementation(async (data) => ({
      id: Math.floor(Math.random() * 1000),
      userId: data.userId,
      stageId: data.stageId,
      status: data.status || "locked",
      unlockedAt: data.unlockedAt || null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await caller.mentor.initiateStudentStages({
      studentId: 1,
    });

    expect(result.success).toBe(true);
    expect(result.stagesCreated).toBe(2);
    expect(db.createUserStage).toHaveBeenCalledTimes(2);
  });

  it("throws error if student not found", async () => {
    const ctx = createMentorContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getUserById).mockResolvedValue(null);

    await expect(
      caller.mentor.initiateStudentStages({
        studentId: 999,
      })
    ).rejects.toThrow("Étudiant non trouvé");
  });

  it("throws error if student already has stages", async () => {
    const ctx = createMentorContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getUserById).mockResolvedValue({
      id: 1,
      openId: "student-user",
      email: "student@example.com",
      name: "Test Student",
      password: null,
      phone: null,
      tcKimlik: null,
      loginMethod: "manus",
      role: "student",
      status: "active",
      ageGroup: "18-21",
      mentorId: 100,
      kvkkConsent: true,
      kvkkConsentDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    vi.mocked(db.getUserStages).mockResolvedValue([
      {
        id: 1,
        userId: 1,
        stageId: 1,
        status: "active",
        unlockedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await expect(
      caller.mentor.initiateStudentStages({
        studentId: 1,
      })
    ).rejects.toThrow("Öğrencinin etapları zaten başlatılmış");
  });
});
