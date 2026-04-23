import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyCourseToken } from "@/lib/courseJwt";
import { COURSE_SESSION_COOKIE } from "@/lib/courseSessionCookie";
import { CourseAccessContent } from "@/components/CourseAccessContent";
import type { CourseTierId } from "@/lib/course";

export async function CourseAccessPageWrapper({
  searchParams,
  heading = "Workflow access",
}: {
  searchParams: { session_id?: string; error?: string };
  /** e.g. "Course access" on /downloads */
  heading?: string;
}) {
  const sid = searchParams.session_id;
  if (sid?.startsWith("mock_course_")) {
    redirect(`/api/course/claim-mock?session_id=${encodeURIComponent(sid)}`);
  }

  const cookie = cookies().get(COURSE_SESSION_COOKIE)?.value;
  let initialTier: CourseTierId | null = null;
  if (cookie) {
    try {
      const v = await verifyCourseToken(cookie, "course_session");
      initialTier = v.tier;
    } catch {
      initialTier = null;
    }
  }

  const invalidLink = searchParams.error === "invalid_link";

  return (
    <CourseAccessContent initialTier={initialTier} invalidLink={invalidLink} heading={heading} />
  );
}
