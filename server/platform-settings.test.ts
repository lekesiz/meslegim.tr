import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "email",
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
      cookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "email",
    role: "user",
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
      cookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Platform Settings (Global) ───────────────────────────────────────────────

describe("admin.getPlatformSettings", () => {
  it("returns platform settings for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.admin.getPlatformSettings();
    expect(Array.isArray(settings)).toBe(true);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getPlatformSettings()).rejects.toThrow();
  });
});

describe("admin.setPlatformSetting", () => {
  it("allows admin to set stage_transition_delay_days", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.setPlatformSetting({
      key: "stage_transition_delay_days",
      value: "5",
      description: "Test description",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("allows admin to set stage_reminder_days_before", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.setPlatformSetting({
      key: "stage_reminder_days_before",
      value: "3",
      description: "Reminder lead time",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("allows admin to set age-group specific delay for 14-17", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.setPlatformSetting({
      key: "stage_transition_delay_days_14_17",
      value: "5",
      description: "14-17 yaş grubu için etap geçiş bekleme süresi",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("allows admin to set age-group specific delay for 18-21", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.setPlatformSetting({
      key: "stage_transition_delay_days_18_21",
      value: "7",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("allows admin to set age-group specific delay for 22-24", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.setPlatformSetting({
      key: "stage_transition_delay_days_22_24",
      value: "10",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.setPlatformSetting({
        key: "stage_transition_delay_days",
        value: "5",
      })
    ).rejects.toThrow();
  });
});

// ─── Locked Stages Queries ─────────────────────────────────────────────────────

describe("admin.getStudentsWithLockedStages", () => {
  it("returns array for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getStudentsWithLockedStages();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getStudentsWithLockedStages()).rejects.toThrow();
  });
});

describe("admin.getLockedStagesForUser", () => {
  it("returns array for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getLockedStagesForUser({ userId: 999 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.getLockedStagesForUser({ userId: 1 })
    ).rejects.toThrow();
  });
});

// ─── db helper tests ───────────────────────────────────────────────────────────

describe("db.getPlatformSetting", () => {
  it("returns a string or null for stage_transition_delay_days", async () => {
    const value = await db.getPlatformSetting("stage_transition_delay_days");
    expect(value === null || typeof value === "string").toBe(true);
  });

  it("returns null for a nonexistent key", async () => {
    const value = await db.getPlatformSetting("__nonexistent_key_xyz__");
    expect(value).toBeNull();
  });
});

describe("db.getTransitionDelayForAgeGroup", () => {
  it("returns a number for each age group", async () => {
    const delay1417 = await db.getTransitionDelayForAgeGroup("14-17", 7);
    const delay1821 = await db.getTransitionDelayForAgeGroup("18-21", 7);
    const delay2224 = await db.getTransitionDelayForAgeGroup("22-24", 7);

    expect(typeof delay1417).toBe("number");
    expect(typeof delay1821).toBe("number");
    expect(typeof delay2224).toBe("number");
    expect(delay1417).toBeGreaterThanOrEqual(0);
    expect(delay1821).toBeGreaterThanOrEqual(0);
    expect(delay2224).toBeGreaterThanOrEqual(0);
  });
});
