import { SignJWT, jwtVerify } from "jose";
import { getCourseAccessJwtSecret } from "./env";
import type { CourseTierId } from "./course";

const encoder = () => new TextEncoder().encode(getCourseAccessJwtSecret());

export type CourseJwtTyp = "course_magic" | "course_session";

export async function signCourseMagicToken(email: string, tier: CourseTierId): Promise<string> {
  return new SignJWT({ typ: "course_magic" as const, tier })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(encoder());
}

export async function signCourseSessionToken(email: string, tier: CourseTierId): Promise<string> {
  return new SignJWT({ typ: "course_session" as const, tier })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(encoder());
}

export async function verifyCourseToken(
  token: string,
  expectedTyp: CourseJwtTyp
): Promise<{ email: string; tier: CourseTierId }> {
  const { payload } = await jwtVerify(token, encoder(), { algorithms: ["HS256"] });
  if (payload.typ !== expectedTyp) {
    throw new Error("Invalid token type");
  }
  const email = typeof payload.sub === "string" ? payload.sub : "";
  const tier = payload.tier as CourseTierId;
  if (!email || (tier !== "tier1" && tier !== "tier2" && tier !== "tier3")) {
    throw new Error("Invalid token payload");
  }
  return { email, tier };
}
