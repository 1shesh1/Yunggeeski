/**
 * In-memory store for orders when MOCK_MODE is true.
 * Used when Supabase is not configured.
 */

import type { TierId } from "./pricing";
import type { AddOnId } from "./pricing";

export interface MockOrder {
  id: string;
  created_at: string;
  tier: TierId;
  addons: AddOnId[];
  amount_total: number;
  currency: string;
  customer_email: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  payment_status: string;
  order_status: string;
  scope_locked: boolean;
  form_data: Record<string, unknown> | null;
  logo_url: string | null;
  resolution: string | null;
  delivery_png_url: string | null;
  delivery_csv_url: string | null;
}

const store = new Map<string, MockOrder>();

export function getMockOrderBySessionId(sessionId: string): MockOrder | null {
  const orders = Array.from(store.values());
  return orders.find((o) => o.stripe_session_id === sessionId) ?? null;
}

export function getMockOrdersByEmail(email: string): MockOrder[] {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  return Array.from(store.values())
    .filter((o) => o.customer_email.toLowerCase() === normalized)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getAllMockOrders(): MockOrder[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getMockOrderById(id: string): MockOrder | null {
  return store.get(id) ?? null;
}

export function createMockOrder(params: {
  sessionId: string;
  tier: TierId;
  addons: AddOnId[];
  amountTotal: number;
  customerEmail: string;
  form_data?: Record<string, unknown> | null;
  scope_locked?: boolean;
  order_status?: string;
}): MockOrder {
  const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const order: MockOrder = {
    id,
    created_at: new Date().toISOString(),
    tier: params.tier,
    addons: params.addons,
    amount_total: params.amountTotal,
    currency: "usd",
    customer_email: params.customerEmail,
    stripe_session_id: params.sessionId,
    stripe_payment_intent: `pi_mock_${id}`,
    payment_status: "paid",
    order_status: params.order_status ?? (params.form_data ? "in_production" : "awaiting_form"),
    scope_locked: params.scope_locked ?? !!params.form_data,
    form_data: params.form_data ?? null,
    logo_url: (params.form_data?.logo_url as string) ?? null,
    resolution: null,
    delivery_png_url: null,
    delivery_csv_url: null,
  };
  store.set(id, order);
  return order;
}

export function updateMockOrder(
  sessionId: string,
  updates: Partial<Pick<MockOrder, "order_status" | "scope_locked" | "form_data" | "logo_url" | "resolution">>
): MockOrder | null {
  const order = getMockOrderBySessionId(sessionId);
  if (!order) return null;
  Object.assign(order, updates);
  store.set(order.id, order);
  return order;
}
