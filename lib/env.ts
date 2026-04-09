/**
 * Central env checks for mock vs real mode.
 * Never hardcode secrets; always read from process.env.
 */

function getBool(key: string): boolean {
  const v = process.env[key];
  if (v === undefined || v === "") return false;
  return v.toLowerCase() === "true" || v === "1";
}

function getStr(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() ? v.trim() : undefined;
}

export const MOCK_MODE =
  getBool("MOCK_MODE") ||
  !getStr("STRIPE_SECRET_KEY") ||
  !getStr("SUPABASE_SERVICE_ROLE_KEY") ||
  !getStr("RESEND_API_KEY");

export function getStripePublishableKey(): string | undefined {
  return getStr("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

export function getStripeSecretKey(): string | undefined {
  return getStr("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string | undefined {
  return getStr("STRIPE_WEBHOOK_SECRET");
}

export function getStripePriceId(envKey: string): string | undefined {
  return getStr(envKey);
}

export function getSupabaseUrl(): string | undefined {
  return getStr("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string | undefined {
  return getStr("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return getStr("SUPABASE_SERVICE_ROLE_KEY");
}

export function getResendApiKey(): string | undefined {
  return getStr("RESEND_API_KEY");
}

export function getResendFromEmail(): string {
  return getStr("EMAIL_FROM") ?? getStr("RESEND_FROM_EMAIL") ?? "orders@example.com";
}

export function getResendAdminEmail(): string {
  return getStr("ADMIN_EMAIL") ?? getStr("RESEND_ADMIN_EMAIL") ?? "admin@example.com";
}

export function getBaseUrl(): string {
  const base = getStr("NEXT_PUBLIC_BASE_URL") ?? getStr("NEXT_PUBLIC_SITE_URL");
  if (!base) return "http://localhost:3000";
  const trimmed = base.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getSupabaseStorageBucket(): string {
  return getStr("SUPABASE_STORAGE_BUCKET") ?? "order-assets";
}

export function getAdminSecret(): string | undefined {
  return getStr("ADMIN_SECRET");
}
