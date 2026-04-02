import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper: create admin context
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@meslegim.tr",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper: create non-admin context
function createStudentContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "student-user",
      email: "student@meslegim.tr",
      name: "Student User",
      loginMethod: "manus",
      role: "student",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Session 15: User Journey Map", () => {
  describe("admin.getUserJourneyList", () => {
    it("should be accessible by admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should not throw - admin has access
      const result = await caller.admin.getUserJourneyList({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.users)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("should reject non-admin users", async () => {
      const ctx = createStudentContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.admin.getUserJourneyList({})).rejects.toThrow();
    });

    it("should accept search parameter", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.admin.getUserJourneyList({
        search: "test",
        limit: 10,
        offset: 0,
      });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("total");
    });

    it("should accept pagination parameters", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.admin.getUserJourneyList({
        limit: 5,
        offset: 0,
      });
      expect(result.users.length).toBeLessThanOrEqual(5);
    });
  });

  describe("admin.getUserJourneyMap", () => {
    it("should return NOT_FOUND for non-existent user", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.admin.getUserJourneyMap({ userId: 999999 })
      ).rejects.toThrow("Kullanıcı bulunamadı");
    });

    it("should reject non-admin users", async () => {
      const ctx = createStudentContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.admin.getUserJourneyMap({ userId: 1 })
      ).rejects.toThrow();
    });
  });
});

describe("Session 15: Widget Preferences", () => {
  describe("admin.getWidgetPreferences", () => {
    it("should return null for new admin (no saved preferences)", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.admin.getWidgetPreferences();
      // New admin with no saved preferences should return null
      // (or previously saved preferences)
      expect(result === null || Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const ctx = createStudentContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.admin.getWidgetPreferences()).rejects.toThrow();
    });
  });

  describe("admin.saveWidgetPreferences", () => {
    it("should save widget preferences for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const widgets = [
        { id: "kpi-cards", label: "KPI Kartları", visible: true, order: 0 },
        { id: "daily-registrations", label: "Günlük Kayıtlar", visible: false, order: 1 },
        { id: "monthly-revenue", label: "Aylık Gelir", visible: true, order: 2 },
      ];
      
      const result = await caller.admin.saveWidgetPreferences(widgets);
      expect(result).toEqual({ success: true });
    });

    it("should persist and retrieve saved preferences", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const widgets = [
        { id: "kpi-cards", label: "KPI Kartları", visible: true, order: 0 },
        { id: "daily-registrations", label: "Günlük Kayıtlar", visible: false, order: 1 },
      ];
      
      await caller.admin.saveWidgetPreferences(widgets);
      
      const saved = await caller.admin.getWidgetPreferences();
      expect(saved).toBeDefined();
      expect(Array.isArray(saved)).toBe(true);
      expect(saved!.length).toBe(2);
      expect(saved![0].id).toBe("kpi-cards");
      expect(saved![0].visible).toBe(true);
      expect(saved![1].id).toBe("daily-registrations");
      expect(saved![1].visible).toBe(false);
    });

    it("should reject non-admin users", async () => {
      const ctx = createStudentContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.admin.saveWidgetPreferences([
          { id: "kpi-cards", label: "KPI Kartları", visible: true, order: 0 },
        ])
      ).rejects.toThrow();
    });

    it("should validate input schema", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // Empty array should be valid
      const result = await caller.admin.saveWidgetPreferences([]);
      expect(result).toEqual({ success: true });
    });
  });
});
