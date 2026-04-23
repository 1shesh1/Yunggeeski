import { NextRequest, NextResponse } from "next/server";
import { MOCK_MODE } from "@/lib/env";
import { buildCourseSessionTokenFromMockSessionId } from "@/lib/courseAccessClaim";
import { COURSE_SESSION_COOKIE, courseSessionCookieOptions } from "@/lib/courseSessionCookie";

const FOURTEEN_DAYS = 14 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  if (!MOCK_MODE) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim() ?? "";
  const sessionJwt = await buildCourseSessionTokenFromMockSessionId(sessionId);
  const dest = new URL("/workflow/access", request.url);
  const res = NextResponse.redirect(dest, 302);
  if (sessionJwt) {
    res.cookies.set(COURSE_SESSION_COOKIE, sessionJwt, courseSessionCookieOptions(FOURTEEN_DAYS));
  }
  return res;
}
