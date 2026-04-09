import { NextRequest, NextResponse } from "next/server";
import { MOCK_MODE } from "@/lib/env";
import { getOrderBySessionId, updateOrder, uploadLogo, isSupabaseAvailable } from "@/lib/supabase";
import { getMockOrderBySessionId, updateMockOrder } from "@/lib/mockStore";
import { orderFormSchema, RESOLUTION_OPTIONS } from "@/lib/schemas";
import { sendCustomerConfirmation, sendAdminOrderSummary } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const sessionId = formData.get("session_id") as string | null;
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  const chart_title = formData.get("chart_title") as string;
  const series_to_compare = formData.get("series_to_compare") as string;
  const date_range = formData.get("date_range") as string;
  const starting_value_type = formData.get("starting_value_type") as string;
  const starting_value = formData.get("starting_value") as string;
  const intended_resolution = formData.get("intended_resolution") as string;
  const custom_resolution = formData.get("custom_resolution") as string | null;
  const brand_colors = formData.get("brand_colors") as string;
  const background_color_hex = formData.get("background_color_hex") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const logoFile = formData.get("logo_file") as File | null;

  const resolution =
    intended_resolution === "custom" && custom_resolution
      ? custom_resolution
      : RESOLUTION_OPTIONS.includes(intended_resolution as (typeof RESOLUTION_OPTIONS)[number])
        ? intended_resolution
        : intended_resolution;

  const raw = {
    chart_title,
    series_to_compare,
    date_range,
    starting_value_type,
    starting_value,
    intended_resolution,
    custom_resolution: custom_resolution ?? undefined,
    brand_colors,
    background_color_hex,
    notes,
    agree_to_terms: true,
  };

  if (!logoFile || logoFile.size === 0) {
    return NextResponse.json({ error: "Logo file is required" }, { status: 400 });
  }

  const parsed = orderFormSchema.safeParse({
    ...raw,
    logo_file: logoFile,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(first)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
      .join("; ");
    return NextResponse.json({ error: msg || "Validation failed" }, { status: 400 });
  }

  const form_data = {
    chart_title: parsed.data.chart_title,
    series_to_compare: parsed.data.series_to_compare,
    date_range: parsed.data.date_range,
    starting_value_type: parsed.data.starting_value_type,
    starting_value: parsed.data.starting_value,
    intended_resolution: parsed.data.intended_resolution,
    custom_resolution: parsed.data.custom_resolution,
    brand_colors: parsed.data.brand_colors,
    background_color_hex: parsed.data.background_color_hex,
    notes: parsed.data.notes,
  };

  if (MOCK_MODE) {
    const order = getMockOrderBySessionId(sessionId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.scope_locked) {
      return NextResponse.json({ error: "Order already submitted" }, { status: 400 });
    }

    const logoUrl = logoFile?.size
      ? `/mock-uploads/${order.id}/logo.${logoFile.name.split(".").pop() ?? "png"}`
      : null;

    updateMockOrder(sessionId, {
      order_status: "in_production",
      scope_locked: true,
      form_data,
      logo_url: logoUrl,
      resolution,
    });

    console.log("[MOCK EMAIL] Customer confirmation:", {
      to: order.customer_email,
      orderId: order.id,
      tier: order.tier,
      chartTitle: form_data.chart_title,
    });
    console.log("[MOCK EMAIL] Admin order summary:", {
      orderId: order.id,
      tier: order.tier,
      customerEmail: order.customer_email,
      chartTitle: form_data.chart_title,
      resolution,
    });

    return NextResponse.json({ success: true });
  }

  const order = await getOrderBySessionId(sessionId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.scope_locked) {
    return NextResponse.json({ error: "Order already submitted" }, { status: 400 });
  }

  let logoUrl: string | null = null;
  if (logoFile?.size && isSupabaseAvailable()) {
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const mime = logoFile.type || "image/png";
    logoUrl = await uploadLogo(order.id, buffer, mime);
  }

  if (isSupabaseAvailable()) {
    const updated = await updateOrder(order.id, {
      order_status: "in_production",
      scope_locked: true,
      form_data,
      logo_url: logoUrl,
      resolution,
    });
    if (!updated) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
  }

  const customerEmail = order.customer_email ?? "customer@example.com";
  await sendCustomerConfirmation({
    orderId: order.id,
    tier: order.tier,
    customerEmail,
    chartTitle: form_data.chart_title,
    resolution,
  });
  await sendAdminOrderSummary({
    orderId: order.id,
    tier: order.tier,
    customerEmail,
    chartTitle: form_data.chart_title,
    resolution,
  });

  return NextResponse.json({ success: true });
}
