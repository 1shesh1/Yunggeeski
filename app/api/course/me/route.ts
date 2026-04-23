import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCourseToken } from "@/lib/courseJwt";
import { COURSE_SESSION_COOKIE } from "@/lib/courseSessionCookie";
import type { CourseTierId } from "@/lib/course";

export async function GET() {
  const jar = cookies();
  const raw = jar.get(COURSE_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ tier: null as CourseTierId | null, email: null as string | null });
  }
  try {
    const { email, tier } = await verifyCourseToken(raw, "course_session");
    return NextResponse.json({ tier, email });
  } catch {
    return NextResponse.json({ tier: null, email: null });
  }
}
