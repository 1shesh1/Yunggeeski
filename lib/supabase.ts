/**
 * Supabase client for server-side DB and Storage.
 * In MOCK_MODE or when keys are missing, all operations are no-op or use mockStore.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { MOCK_MODE, getSupabaseUrl, getSupabaseServiceRoleKey, getSupabaseStorageBucket } from "./env";
import type { CourseTierId } from "./course";

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

export function isSupabaseAvailable(): boolean {
  return !MOCK_MODE && getSupabase() !== null;
}

export function getOrderAssetsBucket(): string {
  return getSupabaseStorageBucket();
}

export interface OrderRow {
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

export async function getOrderBySessionId(sessionId: string): Promise<OrderRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single();
  if (error || !data) return null;
  return data as OrderRow;
}

export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client.from("orders").select("*").eq("id", orderId).single();
  if (error || !data) return null;
  return data as OrderRow;
}

export async function getOrdersByEmail(email: string): Promise<OrderRow[]> {
  const client = getSupabase();
  if (!client) return [];
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  const { data, error } = await client
    .from("orders")
    .select("*")
    .ilike("customer_email", normalized)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as OrderRow[];
}

export async function getAllOrders(): Promise<OrderRow[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as OrderRow[];
}

export async function updateOrder(
  orderId: string,
  updates: Partial<Pick<OrderRow, "order_status" | "scope_locked" | "form_data" | "logo_url" | "resolution">>
): Promise<OrderRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client.from("orders").update(updates).eq("id", orderId).select().single();
  if (error) return null;
  return data as OrderRow;
}

export interface CoursePurchaseRow {
  id: string;
  created_at: string;
  customer_email: string;
  course_tier: CourseTierId;
  stripe_session_id: string;
  amount_total: number;
  currency: string;
  payment_status: string;
}

export async function insertCoursePurchase(row: {
  customer_email: string;
  course_tier: CourseTierId;
  stripe_session_id: string;
  amount_total: number;
  currency: string;
  payment_status?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: "Supabase not configured" };
  const { error } = await client.from("course_purchases").insert({
    customer_email: row.customer_email,
    course_tier: row.course_tier,
    stripe_session_id: row.stripe_session_id,
    amount_total: row.amount_total,
    currency: row.currency,
    payment_status: row.payment_status ?? "paid",
  });
  if (error) {
    if (error.code === "23505") return { ok: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function getCoursePurchasesByEmail(normalizedEmail: string): Promise<CoursePurchaseRow[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("course_purchases")
    .select("*")
    .eq("customer_email", normalizedEmail)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as CoursePurchaseRow[];
}

export async function uploadLogo(orderId: string, file: Buffer, mimeType: string): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;
  const ext = mimeType.split("/")[1] ?? "png";
  const path = `${orderId}/logo.${ext}`;
  const bucket = getOrderAssetsBucket();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) return null;
  const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}
