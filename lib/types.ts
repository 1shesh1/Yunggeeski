/**
 * Shared order type for API responses (Supabase or mock).
 */

export interface Order {
  id: string;
  created_at: string;
  tier: string;
  addons: string[] | unknown;
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
}
