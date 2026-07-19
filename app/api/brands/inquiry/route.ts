import { NextRequest, NextResponse } from "next/server";
import { brandInquirySchema } from "@/lib/schemas";
import { isRateLimited } from "@/lib/rateLimit";
import { getSupabase, insertBrandInquiry } from "@/lib/supabase";
import { sendBrandInquiryEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    if (isRateLimited(`brand-inquiry:${ip}`, { max: 5, windowMs: 60_000 })) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = brandInquirySchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const msg =
        Object.entries(fieldErrors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join("; ") || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const additionalInfo = d.additional_info?.trim() ? d.additional_info.trim() : null;
    const paidAds = d.paid_ads_required === "yes";
    const exclusivity = d.category_exclusivity_required === "yes";

    // Capture is decoupled from the global MOCK_MODE flag (which folds in unrelated
    // Stripe/Resend keys). Persist whenever Supabase is configured, regardless of
    // whether other integrations are; a missing Resend key must never drop a lead.
    let persisted = false;
    if (getSupabase() !== null) {
      const saved = await insertBrandInquiry({
        name: d.name,
        company: d.company,
        work_email: d.work_email,
        company_website: d.company_website,
        product_or_service: d.product_or_service,
        campaign_objective: d.campaign_objective,
        budget: d.budget,
        launch_date: d.launch_date,
        deliverables: d.deliverables,
        paid_ads_required: paidAds,
        category_exclusivity_required: exclusivity,
        additional_info: additionalInfo,
      });
      if (!saved.ok) {
        console.error("[brands/inquiry] persist failed:", saved.error);
        return NextResponse.json({ error: "Could not submit. Try again later." }, { status: 502 });
      }
      persisted = true;
    }

    // Best-effort notification. Self-guards and no-ops (ok:false) when no Resend key.
    const notified = await sendBrandInquiryEmail({
      name: d.name,
      company: d.company,
      workEmail: d.work_email,
      companyWebsite: d.company_website,
      productOrService: d.product_or_service,
      campaignObjective: d.campaign_objective,
      budget: d.budget,
      launchDate: d.launch_date,
      deliverables: d.deliverables,
      paidAdsRequired: paidAds,
      categoryExclusivityRequired: exclusivity,
      additionalInfo: additionalInfo,
    });

    if (!persisted && !notified.ok) {
      // No DB and no email configured — dev/mock with no keys. Log (no PII) and succeed.
      console.info("[brands/inquiry] no DB or email configured — inquiry not persisted:", {
        company: d.company,
        budget: d.budget,
      });
    } else if (!notified.ok) {
      console.error("[brands/inquiry] notify failed (lead saved):", notified.error);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[brands/inquiry]", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
