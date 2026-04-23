import { MOCK_MODE } from "./env";
import { maxCourseTier, type CourseTierId } from "./course";
import { normalizeCourseEmail } from "./courseEmail";
import { getCoursePurchasesByEmail } from "./supabase";
import { getMockCoursePurchasesByEmail } from "./mockStore";

export async function getMaxCourseTierForPurchaserEmail(email: string): Promise<CourseTierId | null> {
  const n = normalizeCourseEmail(email);
  if (!n) return null;
  if (MOCK_MODE) {
    const rows = getMockCoursePurchasesByEmail(n);
    return maxCourseTier(rows.map((r) => r.course_tier));
  }
  const rows = await getCoursePurchasesByEmail(n);
  return maxCourseTier(rows.map((r) => r.course_tier as CourseTierId));
}
