import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@meslegim.tr",
    name: "Admin User",
    loginMethod: "local",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://meslegim.tr" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createNonAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "student-user",
    email: "student@test.com",
    name: "Student User",
    loginMethod: "local",
    role: "student",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Session 16 - Hareketsizlik Uyarıları", () => {
  it("getInactiveStudents returns an array", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getInactiveStudents({ inactiveDays: 7 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getInactiveStudents accepts custom inactiveDays parameter", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getInactiveStudents({ inactiveDays: 30 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getInactivityNotificationHistory returns notifications and total", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getInactivityNotificationHistory({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("notifications");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.notifications)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("non-admin cannot access getInactiveStudents", async () => {
    const { ctx } = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.getInactiveStudents({ inactiveDays: 7 })).rejects.toThrow();
  });
});

describe("Session 16 - Toplu Email Kampanyaları", () => {
  it("getSegmentCounts returns segment counts object", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getSegmentCounts();
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
    // Should have segment keys
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("active");
    expect(result).toHaveProperty("inactive");
    expect(result).toHaveProperty("trial");
    expect(result).toHaveProperty("premium");
    expect(result).toHaveProperty("pending");
  });

  it("getUsersBySegment returns users array and count", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getUsersBySegment({ segment: "all" });
    expect(result).toHaveProperty("users");
    expect(result).toHaveProperty("count");
    expect(Array.isArray(result.users)).toBe(true);
    expect(typeof result.count).toBe("number");
  });

  it("getBulkEmailCampaigns returns campaigns array", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getBulkEmailCampaigns({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("campaigns");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.campaigns)).toBe(true);
  });

  it("non-admin cannot access getSegmentCounts", async () => {
    const { ctx } = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.getSegmentCounts()).rejects.toThrow();
  });

  it("non-admin cannot access sendBulkCampaignEmail", async () => {
    const { ctx } = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.sendBulkCampaignEmail({
        subject: "Test",
        htmlContent: "<p>Test</p>",
        segment: "all",
      })
    ).rejects.toThrow();
  });
});

describe("Session 16 - Segment Counts Validation", () => {
  it("all segment counts are non-negative numbers", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getSegmentCounts();
    for (const [key, value] of Object.entries(result)) {
      expect(typeof value).toBe("number");
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it("getUsersBySegment works for each segment type", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const segments = ["all", "active", "inactive", "trial", "premium", "pending"];
    for (const segment of segments) {
      const result = await caller.admin.getUsersBySegment({ segment });
      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("count");
      expect(Array.isArray(result.users)).toBe(true);
    }
  });
});
