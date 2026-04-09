import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { createMockOrder } from "@/lib/mockStore";
import { MOCK_MODE } from "@/lib/env";
import { getTierById, ADDONS } from "@/lib/pricing";
import type { TierId } from "@/lib/pricing";
import type { AddOnId } from "@/lib/pricing";

const tierSchema = ["basic", "standard", "premium"] as const;
const addonSchema = ["rush_24h", "revision", "csv_export", "research_concept", "caption_pinned", "collab_instagram"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tier = body.tier as string;
    const addonIds = Array.isArray(body.addonIds) ? body.addonIds : [];
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    const formData =
      body.formData && typeof body.formData === "object" ? (body.formData as Record<string, unknown>) : undefined;

    if (!tier || !tierSchema.includes(tier as (typeof tierSchema)[number])) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    const validAddons = addonIds.filter((id: string) =>
      addonSchema.includes(id as (typeof addonSchema)[number])
    ) as AddOnId[];

    // Real mode: creates Stripe Checkout session with formData in metadata; returns Stripe payment URL.
    // User is redirected to Stripe → after payment, webhook stores order (with form) in DB.
    const result = await createCheckoutSession({
      tier: tier as TierId,
      addonIds: validAddons,
      customerEmail,
      formData: formData ?? null,
    });

    if (MOCK_MODE && result.sessionId) {
      const tierDef = getTierById(tier as TierId);
      const amountTotal =
        (tierDef?.price ?? 0) +
        validAddons.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
      createMockOrder({
        sessionId: result.sessionId,
        tier: tier as TierId,
        addons: validAddons,
        amountTotal,
        customerEmail,
        form_data: formData ?? undefined,
        scope_locked: true,
        order_status: "in_production",
      });
    }

    return NextResponse.json({ url: result.url, sessionId: result.sessionId });
  } catch (e) {
    console.error("[create-session]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
