import { NextRequest, NextResponse } from "next/server";
import { MOCK_MODE, getStripeWebhookSecret } from "@/lib/env";
import { getSupabase, isSupabaseAvailable } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getTierById } from "@/lib/pricing";
import Stripe from "stripe";
import type { TierId } from "@/lib/pricing";
import type { AddOnId } from "@/lib/pricing";

// Next.js doesn't parse body for webhooks by default; we need raw body for signature verification.
// In real mode we'd use the raw body; for mock we just return 200.
export async function POST(request: NextRequest) {
  if (MOCK_MODE) {
    return NextResponse.json({ received: true });
  }

  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    console.warn("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ received: true });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const { getStripeSecretKey } = await import("@/lib/env");
    const key = getStripeSecretKey();
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    const StripeSDK = (await import("stripe")).default;
    const stripe = new StripeSDK(key, { apiVersion: "2023-10-16" });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // After customer pays on Stripe: create order in DB with form data from session metadata.
  if (event.type === "checkout.session.completed" && isSupabaseAvailable()) {
    const session = event.data.object as Stripe.Checkout.Session;
    const client = getSupabase();
    if (!client) return NextResponse.json({ received: true });

    const tier = (session.metadata?.tier as TierId) ?? "basic";
    let addons: AddOnId[] = [];
    try {
      const parsed = session.metadata?.addons ? JSON.parse(session.metadata.addons) : [];
      addons = Array.isArray(parsed) ? parsed : [];
    } catch {
      // ignore
    }

    let form_data: Record<string, unknown> | null = null;
    const meta = session.metadata ?? {};
    const chunks: string[] = [];
    let i = 0;
    while (meta[`form_data_${i}`]) {
      chunks.push(meta[`form_data_${i}`] as string);
      i++;
    }
    if (chunks.length > 0) {
      try {
        form_data = JSON.parse(chunks.join("")) as Record<string, unknown>;
      } catch {
        // ignore invalid form_data
      }
    }

    const amountTotal = session.amount_total ?? 0;
    const customerEmail = (session.customer_details?.email ?? session.customer_email) as string | null;
    const hasFormData = form_data && Object.keys(form_data).length > 0;

    // Flatten series array into series_1_* .. series_5_* columns
    const seriesArr = Array.isArray(form_data?.series) ? form_data.series as { value?: string; color?: string; image_url?: string }[] : [];
    const seriesCols: Record<string, string | undefined> = {};
    for (let i = 0; i < 5; i++) {
      const s = seriesArr[i];
      const n = i + 1;
      seriesCols[`series_${n}_value`] = s?.value as string | undefined;
      seriesCols[`series_${n}_color`] = s?.color as string | undefined;
      seriesCols[`series_${n}_image_url`] = s?.image_url as string | undefined;
    }

    const { error } = await client.from("orders").insert({
      tier,
      addons,
      amount_total: amountTotal,
      currency: session.currency ?? "usd",
      customer_email: customerEmail,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string | null,
      payment_status: "paid",
      order_status: hasFormData ? "in_production" : "awaiting_form",
      scope_locked: hasFormData,
      form_data: form_data ?? undefined,
      // Separate columns (populated from form_data for queries/UI)
      chart_title: form_data?.chart_title as string | undefined,
      series: form_data?.series != null ? form_data.series : undefined,
      ...seriesCols,
      date_start: form_data?.date_start as string | undefined,
      date_end: form_data?.date_end as string | undefined,
      units: form_data?.units as string | undefined,
      currency_code: form_data?.currency_code as string | undefined,
      background_color: form_data?.background_color as string | undefined,
      logo_url: (form_data?.logo_url as string) ?? undefined,
      logo_placement: form_data?.logo_placement as string | undefined,
      concept_description: form_data?.concept_description as string | undefined,
      order_notes: form_data?.order_notes as string | undefined,
    });

    if (error) {
      console.error("[webhook] Supabase insert failed", error);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    // Send confirmation email to customer (non-blocking; log on failure)
    if (customerEmail?.trim()) {
      const tierDef = getTierById(tier);
      sendOrderConfirmationEmail({
        to: customerEmail.trim(),
        tierName: tierDef?.name ?? tier,
        amountTotalCents: amountTotal,
        orderStatus: hasFormData ? "in_production" : "awaiting_form",
        sessionId: session.id,
      }).then((result) => {
        if (!result.ok) console.error("[webhook] Confirmation email failed:", result.error);
      });
    }
  }

  return NextResponse.json({ received: true });
}
