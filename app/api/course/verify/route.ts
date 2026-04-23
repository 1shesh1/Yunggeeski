import { NextRequest, NextResponse } from "next/server";
import { verifyCourseToken, signCourseSessionToken } from "@/lib/courseJwt";
import { COURSE_SESSION_COOKIE, courseSessionCookieOptions } from "@/lib/courseSessionCookie";

const FOURTEEN_DAYS = 14 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.redirect(new URL("/workflow/access", request.url), 302);
  }
  try {
    const { email, tier } = await verifyCourseToken(token, "course_magic");
    const sessionJwt = await signCourseSessionToken(email, tier);
    const dest = new URL("/workflow/access", request.url);
    const res = NextResponse.redirect(dest, 302);
    res.cookies.set(COURSE_SESSION_COOKIE, sessionJwt, courseSessionCookieOptions(FOURTEEN_DAYS));
    return res;
  } catch {
    return NextResponse.redirect(new URL("/workflow/access?error=invalid_link", request.url), 302);
  }
}
