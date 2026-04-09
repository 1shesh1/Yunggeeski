import { NextRequest, NextResponse } from "next/server";
import { createCourseCheckoutSession } from "@/lib/stripe";
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
