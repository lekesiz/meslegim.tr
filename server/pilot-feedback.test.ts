import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db") as any;
  return {
    ...actual,
    createPilotFeedback: vi.fn().mockResolvedValue(1),
    getAllPilotFeedbacks: vi.fn().mockResolvedValue([
      {
        id: 1,
        userId: 1,
        userName: "Test Öğrenci",
        userEmail: "test@example.com",
        npsScore: 9,
        whatWorkedWell: "Sorular çok iyi hazırlanmış",
        whatNeedsImprovement: "Daha fazla kariyer seçeneği olabilir",
        wouldRecommend: true,
        additionalComments: null,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: null,
        userName: null,
        userEmail: null,
        npsScore: 5,
        whatWorkedWell: null,
        whatNeedsImprovement: "Arayüz biraz karmaşık",
        wouldRecommend: false,
        additionalComments: "Genel olarak faydalı",
        createdAt: new Date(),
      },
    ]),
    getPilotFeedbackStats: vi.fn().mockResolvedValue({
      total: 10,
      avgNps: 7.5,
      promoters: 4,
      passives: 3,
      detractors: 3,
      npsScore: 10,
    }),
  };
});

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "user-agent": "test-agent" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createStudentContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "student-1",
    email: "student@example.com",
    name: "Test Öğrenci",
    loginMethod: "password",
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: { "user-agent": "test-agent" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 99,
    openId: "admin-1",
    email: "admin@example.com",
    name: "Admin",
    loginMethod: "password",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("pilotFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submit", () => {
    it("anonim kullanıcı geri bildirim gönderebilir", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pilotFeedback.submit({
        npsScore: 8,
        whatWorkedWell: "Harika platform",
        whatNeedsImprovement: "Daha fazla soru olabilir",
        wouldRecommend: true,
        additionalComments: "Teşekkürler",
      });

      expect(result).toEqual({ success: true, id: 1 });
    });

    it("giriş yapmış öğrenci geri bildirim gönderebilir", async () => {
      const ctx = createStudentContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pilotFeedback.submit({
        npsScore: 10,
        whatWorkedWell: "Her şey mükemmel",
      });

      expect(result).toEqual({ success: true, id: 1 });
    });

    it("sadece NPS skoru ile geri bildirim gönderebilir", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pilotFeedback.submit({
        npsScore: 5,
      });

      expect(result).toEqual({ success: true, id: 1 });
    });

    it("NPS skoru 0-10 aralığında olmalı", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pilotFeedback.submit({ npsScore: -1 })
      ).rejects.toThrow();

      await expect(
        caller.pilotFeedback.submit({ npsScore: 11 })
      ).rejects.toThrow();
    });

    it("NPS skoru 0 geçerli olmalı (minimum)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pilotFeedback.submit({ npsScore: 0 });
      expect(result).toEqual({ success: true, id: 1 });
    });

    it("NPS skoru 10 geçerli olmalı (maksimum)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pilotFeedback.submit({ npsScore: 10 });
      expect(result).toEqual({ success: true, id: 1 });
    });
  });

  describe("getAll (admin only)", () => {
    it("admin tüm geri bildirimleri görebilir", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pilotFeedback.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].npsScore).toBe(9);
      expect(result[1].npsScore).toBe(5);
    });

    it("giriş yapmamış kullanıcı geri bildirimleri göremez", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.pilotFeedback.getAll()).rejects.toThrow();
    });

    it("öğrenci geri bildirimleri göremez", async () => {
      const ctx = createStudentContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.pilotFeedback.getAll()).rejects.toThrow();
    });
  });

  describe("getStats (admin only)", () => {
    it("admin NPS istatistiklerini görebilir", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pilotFeedback.getStats();
      expect(result.total).toBe(10);
      expect(result.avgNps).toBe(7.5);
      expect(result.promoters).toBe(4);
      expect(result.passives).toBe(3);
      expect(result.detractors).toBe(3);
      expect(result.npsScore).toBe(10);
    });

    it("öğrenci NPS istatistiklerini göremez", async () => {
      const ctx = createStudentContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.pilotFeedback.getStats()).rejects.toThrow();
    });
  });
});
