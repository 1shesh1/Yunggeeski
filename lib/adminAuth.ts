/**
 * Admin auth via shared secret. No login link anywhere; only /admin URL.
 * Cookie is set after submitting correct password on the admin page.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSecret } from "./env";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getExpectedToken(): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update("admin").digest("hex");
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null;
}

export function isAdminRequest(request: NextRequest): boolean {
  const token = getAdminTokenFromRequest(request);
  const expected = getExpectedToken();
  if (!token || !expected || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/** Returns a 401 NextResponse if not authenticated; otherwise returns null (caller proceeds). */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (isAdminRequest(request)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function setAdminCookie(response: NextResponse): NextResponse {
  const expected = getExpectedToken();
  if (!expected) return response;
  response.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
