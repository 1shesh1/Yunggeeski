import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createCourseCheckoutSession } from "@/lib/stripe";
import { MOCK_MODE, getBaseUrl } from "@/lib/env";
import { createMockCoursePurchase } from "@/lib/mockStore";
import { normalizeCourseEmail, isValidEmailFormat } from "@/lib/courseEmail";
import type { CourseTierId } from "@/lib/course";

const VALID_TIERS: CourseTierId[] = ["tier1", "tier2", "tier3"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tier = typeof body.tier === "string" ? body.tier.trim().toLowerCase() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : undefined;

    if (!VALID_TIERS.includes(tier as CourseTierId)) {
      return NextResponse.json({ error: "Invalid tier. Use tier1, tier2, or tier3." }, { status: 400 });
    }

    if (MOCK_MODE) {
      const mockSessionId = `mock_course_${Date.now()}_${randomBytes(8).toString("hex")}`;
      const email =
        customerEmail && isValidEmailFormat(customerEmail)
          ? normalizeCourseEmail(customerEmail)
          : "mock+buyer@example.com";
      createMockCoursePurchase({
        stripe_session_id: mockSessionId,
        customer_email: email,
        course_tier: tier as CourseTierId,
      });
      const base = getBaseUrl();
      return NextResponse.json({
        url: `${base}/workflow/access?session_id=${encodeURIComponent(mockSessionId)}`,
      });
    }

    const result = await createCourseCheckoutSession(tier as CourseTierId, customerEmail || null);
    return NextResponse.json({ url: result.url });
  } catch (e) {
    console.error("[create-course-session]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
