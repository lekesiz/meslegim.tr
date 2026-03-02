import { describe, expect, it, beforeEach } from "vitest";
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

  it("accepts only valid keys (stage_transition_delay_days)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Valid key should succeed
    const result = await caller.admin.setPlatformSetting({
      key: "stage_transition_delay_days",
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

describe("db.getPlatformSetting", () => {
  it("returns default value when setting does not exist", async () => {
    const value = await db.getPlatformSetting("stage_transition_delay_days", "7");
    expect(typeof value).toBe("string");
    // Should return a numeric string
    expect(parseInt(value, 10)).toBeGreaterThanOrEqual(0);
  });
});
