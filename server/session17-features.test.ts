import { describe, expect, it } from "vitest";
import { encodeTrackingData, getTrackingPixelUrl, getTrackedLinkUrl } from "./emailTracking";
import { generateTrackingId } from "./db";

describe("Email Tracking - encodeTrackingData", () => {
  it("encodes campaign and email into base64url string", () => {
    const result = encodeTrackingData(1, "test@example.com");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    // Should be decodable
    const decoded = Buffer.from(result, "base64url").toString("utf-8");
    expect(decoded).toBe("1:test@example.com");
  });

  it("encodes campaign, email and linkUrl into base64url string", () => {
    const result = encodeTrackingData(42, "user@test.com", "https://example.com/page");
    const decoded = Buffer.from(result, "base64url").toString("utf-8");
    expect(decoded).toBe("42:user@test.com:https://example.com/page");
  });

  it("handles special characters in email", () => {
    const result = encodeTrackingData(1, "user+tag@example.com");
    const decoded = Buffer.from(result, "base64url").toString("utf-8");
    expect(decoded).toContain("user+tag@example.com");
  });
});

describe("Email Tracking - getTrackingPixelUrl", () => {
  it("generates correct pixel tracking URL", () => {
    const url = getTrackingPixelUrl("https://meslegim.tr", 5, "test@example.com");
    expect(url).toContain("https://meslegim.tr/api/track/open/");
    expect(url.length).toBeGreaterThan("https://meslegim.tr/api/track/open/".length);
  });

  it("generates different URLs for different campaigns", () => {
    const url1 = getTrackingPixelUrl("https://meslegim.tr", 1, "test@example.com");
    const url2 = getTrackingPixelUrl("https://meslegim.tr", 2, "test@example.com");
    expect(url1).not.toBe(url2);
  });

  it("generates different URLs for different emails", () => {
    const url1 = getTrackingPixelUrl("https://meslegim.tr", 1, "a@example.com");
    const url2 = getTrackingPixelUrl("https://meslegim.tr", 1, "b@example.com");
    expect(url1).not.toBe(url2);
  });
});

describe("Email Tracking - getTrackedLinkUrl", () => {
  it("generates correct click tracking URL", () => {
    const url = getTrackedLinkUrl("https://meslegim.tr", 5, "test@example.com", "https://example.com/target");
    expect(url).toContain("https://meslegim.tr/api/track/click/");
  });

  it("encodes the original URL in the tracking data", () => {
    const url = getTrackedLinkUrl("https://meslegim.tr", 5, "test@example.com", "https://example.com/target");
    // Extract the tracking ID from the URL
    const trackingId = url.replace("https://meslegim.tr/api/track/click/", "");
    const decoded = Buffer.from(trackingId, "base64url").toString("utf-8");
    expect(decoded).toContain("https://example.com/target");
  });
});

describe("Email Tracking - generateTrackingId", () => {
  it("generates consistent hash for same inputs", () => {
    const id1 = generateTrackingId(1, "test@example.com", "open");
    const id2 = generateTrackingId(1, "test@example.com", "open");
    expect(id1).toBe(id2);
  });

  it("generates different hashes for different campaigns", () => {
    const id1 = generateTrackingId(1, "test@example.com", "open");
    const id2 = generateTrackingId(2, "test@example.com", "open");
    expect(id1).not.toBe(id2);
  });

  it("generates different hashes for different event types", () => {
    const id1 = generateTrackingId(1, "test@example.com", "open");
    const id2 = generateTrackingId(1, "test@example.com", "click");
    expect(id1).not.toBe(id2);
  });

  it("generates 32-character hex string", () => {
    const id = generateTrackingId(1, "test@example.com", "open");
    expect(id).toHaveLength(32);
    expect(id).toMatch(/^[a-f0-9]+$/);
  });

  it("includes linkUrl in hash when provided", () => {
    const id1 = generateTrackingId(1, "test@example.com", "click", "https://a.com");
    const id2 = generateTrackingId(1, "test@example.com", "click", "https://b.com");
    expect(id1).not.toBe(id2);
  });
});

describe("Cron Job - sendDailyInactivityReminders", () => {
  it("sendDailyInactivityReminders function is exported from cronJobs", async () => {
    const { sendDailyInactivityReminders } = await import("./services/cronJobs");
    expect(typeof sendDailyInactivityReminders).toBe("function");
  });

  it("returns expected result structure", async () => {
    const { sendDailyInactivityReminders } = await import("./services/cronJobs");
    // The function should return { total, sentCount, failCount } even on error
    const result = await sendDailyInactivityReminders();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("sentCount");
    expect(result).toHaveProperty("failCount");
    expect(typeof result.total).toBe("number");
    expect(typeof result.sentCount).toBe("number");
    expect(typeof result.failCount).toBe("number");
  }, 30000);
});

describe("Campaign Metrics - getCampaignMetrics", () => {
  it("getCampaignMetrics function is exported from db", async () => {
    const db = await import("./db");
    expect(typeof db.getCampaignMetrics).toBe("function");
  });

  it("getAllCampaignMetrics function is exported from db", async () => {
    const db = await import("./db");
    expect(typeof db.getAllCampaignMetrics).toBe("function");
  });

  it("recordEmailOpen function is exported from db", async () => {
    const db = await import("./db");
    expect(typeof db.recordEmailOpen).toBe("function");
  });

  it("recordEmailClick function is exported from db", async () => {
    const db = await import("./db");
    expect(typeof db.recordEmailClick).toBe("function");
  });
});

describe("Email Tracking Routes - registerEmailTrackingRoutes", () => {
  it("registerEmailTrackingRoutes function is exported", async () => {
    const { registerEmailTrackingRoutes } = await import("./emailTracking");
    expect(typeof registerEmailTrackingRoutes).toBe("function");
  });
});
