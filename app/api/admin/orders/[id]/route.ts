import { NextRequest, NextResponse } from "next/server";
import { MOCK_MODE } from "@/lib/env";
import { requireAdmin } from "@/lib/adminAuth";
import { getOrderById, updateOrder } from "@/lib/supabase";
import { getMockOrderById, updateMockOrder } from "@/lib/mockStore";

const ALLOWED_STATUSES = ["awaiting_form", "in_production", "fulfilled"] as const;

function toOrderResponse(order: {
  id: string;
  created_at: string;
  tier: string;
  addons: unknown;
  amount_total: number;
  currency: string;
  customer_email: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  payment_status: string;
  order_status: string;
  scope_locked: boolean;
  form_data: Record<string, unknown> | null;
  logo_url: string | null;
  resolution: string | null;
  delivery_png_url: string | null;
  delivery_csv_url: string | null;
}) {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (MOCK_MODE) {
    const order = getMockOrderById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order: toOrderResponse(order) });
  }

  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order: toOrderResponse(order) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let body: { order_status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const orderStatus = body.order_status?.trim();
  if (!orderStatus || !ALLOWED_STATUSES.includes(orderStatus as (typeof ALLOWED_STATUSES)[number])) {
    return NextResponse.json(
      { error: `order_status must be one of: ${ALLOWED_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  if (MOCK_MODE) {
    const order = getMockOrderById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const updated = updateMockOrder(order.stripe_session_id, { order_status: orderStatus });
    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json({ order: toOrderResponse(updated) });
  }

  const updated = await updateOrder(id, { order_status: orderStatus });
  if (!updated) return NextResponse.json({ error: "Order not found or update failed" }, { status: 404 });
  return NextResponse.json({ order: toOrderResponse(updated) });
}
