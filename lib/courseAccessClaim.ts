import { MOCK_MODE } from "./env";
import { getMockCoursePurchaseBySessionId } from "./mockStore";
import { signCourseSessionToken } from "./courseJwt";

/** One-time mock checkout: exchange `session_id` for a session JWT string (caller sets cookie). */
export async function buildCourseSessionTokenFromMockSessionId(sessionId: string): Promise<string | null> {
  if (!MOCK_MODE || !sessionId.startsWith("mock_course_")) return null;
  const row = getMockCoursePurchaseBySessionId(sessionId);
  if (!row) return null;
  return signCourseSessionToken(row.customer_email, row.course_tier);
}
