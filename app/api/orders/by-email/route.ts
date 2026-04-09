import { NextRequest, NextResponse } from "next/server";
import { MOCK_MODE } from "@/lib/env";
import { getOrdersByEmail } from "@/lib/supabase";
import { getMockOrdersByEmail } from "@/lib/mockStore";

function toOrderResponse(order: { id: string; created_at: string; tier: string; addons: unknown; amount_total: number; currency: string; customer_email: string | null; stripe_session_id: string | null; stripe_payment_intent: string | null; payment_status: string; order_status: string; scope_locked: boolean; form_data: Record<string, unknown> | null; logo_url: string | null; resolution: string | null; delivery_png_url: string | null; delivery_csv_url: string | null }) {
  return {
    id: order.id,
    created_at: order.created_at,
    tier: order.tier,
    addons: order.addons,
    amount_total: order.amount_total,
    currency: order.currency,
    customer_email: order.customer_email,
    stripe_session_id: order.stripe_session_id,
    stripe_payment_intent: order.stripe_payment_intent,
    payment_status: order.payment_status,
    order_status: order.order_status,
    scope_locked: order.scope_locked,
    form_data: order.form_data,
    logo_url: order.logo_url,
    resolution: order.resolution,
    delivery_png_url: order.delivery_png_url,
    delivery_csv_url: order.delivery_csv_url,
  };
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (MOCK_MODE) {
    const orders = getMockOrdersByEmail(email);
    return NextResponse.json({ orders: orders.map(toOrderResponse) });
  }

  const orders = await getOrdersByEmail(email);
  return NextResponse.json({ orders: orders.map(toOrderResponse) });
}
