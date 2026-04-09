import { NextRequest, NextResponse } from "next/server";
import { MOCK_MODE } from "@/lib/env";
import { getOrderBySessionId } from "@/lib/supabase";
import { getMockOrderBySessionId } from "@/lib/mockStore";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  if (MOCK_MODE) {
    const order = getMockOrderBySessionId(sessionId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({
      order: {
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
      },
    });
  }

  const order = await getOrderBySessionId(sessionId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
