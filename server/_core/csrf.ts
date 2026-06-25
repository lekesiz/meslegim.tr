import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@shared/const";
import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";

function normalizeHeaderValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function createCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function validateCsrfToken(req: Request): boolean {
  const headerToken = normalizeHeaderValue(req.headers[CSRF_HEADER_NAME]).trim();
  const parsedCookies = parseCookieHeader(req.headers.cookie ?? "");
  const cookieToken = (parsedCookies[CSRF_COOKIE_NAME] ?? "").trim();

  if (!headerToken || !cookieToken) return false;
  if (headerToken.length !== cookieToken.length) return false;

  try {
    return timingSafeEqual(
      Buffer.from(headerToken, "utf8"),
      Buffer.from(cookieToken, "utf8"),
    );
  } catch {
    return false;
  }
}
