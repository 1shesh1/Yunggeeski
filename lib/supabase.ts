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

export interface BrandInquiryInsert {
  name: string;
  company: string;
  work_email: string;
  company_website: string;
  product_or_service: string;
  campaign_objective: string;
  budget: string;
  launch_date: string;
  deliverables: string;
  paid_ads_required: boolean;
  category_exclusivity_required: boolean;
  additional_info?: string | null;
}

export async function insertBrandInquiry(
  row: BrandInquiryInsert,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: "Supabase not configured" };
  const { error } = await client.from("brand_inquiries").insert({
    ...row,
    additional_info: row.additional_info ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
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

// —— Social metrics (/brands live data) ——

export type SocialPlatform = "instagram" | "tiktok";

export interface SocialSnapshotRow {
  id: string;
  created_at: string;
  platform: SocialPlatform;
  followers: number;
  reach_30d: number | null;
  reach_90d: number | null;
  best_video_views: number | null;
  videos_above_threshold: number | null;
  notable_views_threshold: number | null;
  raw: Record<string, unknown> | null;
}

export interface SocialPostRow {
  id: string;
  created_at: string;
  updated_at: string;
  platform: "instagram" | "tiktok" | "cross";
  external_id: string | null;
  permalink: string | null;
  thumbnail_url: string | null;
  topic: string;
  why_it_worked: string;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  saves: number | null;
  is_featured: boolean;
  sort_order: number;
  fetched_at: string | null;
  counted_over_threshold: boolean;
  views_backfilled: boolean;
  caption: string | null;
}

export interface MetricOverrideRow {
  id: string;
  total_followers: number | null;
  best_video_views: number | null;
  videos_above_threshold: number | null;
  notable_views_threshold: number | null;
  monthly_reach: number | null;
  category: string | null;
  updated_at: string;
}

export interface SocialTokenRow {
  id: string;
  platform: SocialPlatform;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
  updated_at: string;
}

/** Latest snapshot for a single platform, or null. */
export async function getLatestSnapshot(platform: SocialPlatform): Promise<SocialSnapshotRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("social_metrics_snapshots")
    .select("*")
    .eq("platform", platform)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as SocialSnapshotRow;
}

/** Latest snapshot per platform (instagram + tiktok), skipping any missing. */
export async function getLatestSnapshots(): Promise<SocialSnapshotRow[]> {
  const results = await Promise.all([getLatestSnapshot("instagram"), getLatestSnapshot("tiktok")]);
  return results.filter((r): r is SocialSnapshotRow => r !== null);
}

export async function insertSnapshot(row: {
  platform: SocialPlatform;
  followers: number;
  reach_30d?: number | null;
  reach_90d?: number | null;
  best_video_views?: number | null;
  videos_above_threshold?: number | null;
  notable_views_threshold?: number | null;
  raw?: Record<string, unknown> | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: "Supabase not configured" };
  const { error } = await client.from("social_metrics_snapshots").insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** The featured posts shown on /brands, ordered for display. */
export async function getFeaturedSocialPosts(limit = 6): Promise<SocialPostRow[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("social_posts")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .order("views", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as SocialPostRow[];
}

/** All posts, for the admin management view. */
export async function listSocialPosts(): Promise<SocialPostRow[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("social_posts")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("views", { ascending: false });
  if (error) return [];
  return (data ?? []) as SocialPostRow[];
}

export type SocialPostWrite = Partial<
  Pick<
    SocialPostRow,
    | "platform"
    | "external_id"
    | "caption"
    | "permalink"
    | "thumbnail_url"
    | "topic"
    | "why_it_worked"
    | "views"
    | "likes"
    | "comments"
    | "shares"
    | "saves"
    | "is_featured"
    | "sort_order"
    | "fetched_at"
  >
>;

export async function createSocialPost(row: SocialPostWrite): Promise<SocialPostRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client.from("social_posts").insert(row).select().single();
  if (error || !data) return null;
  return data as SocialPostRow;
}

export async function updateSocialPost(id: string, patch: SocialPostWrite): Promise<SocialPostRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("social_posts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return null;
  return data as SocialPostRow;
}

export async function deleteSocialPost(id: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  const { error } = await client.from("social_posts").delete().eq("id", id);
  return !error;
}

/** Upsert an API-sourced post keyed on the unique (platform, external_id) index.
 * The payload omits admin-curated columns (topic, why_it_worked, is_featured,
 * sort_order) so ON CONFLICT preserves them; new rows get their DB defaults. */
export async function upsertApiPost(row: {
  platform: "instagram" | "tiktok";
  external_id: string;
  caption?: string | null;
  permalink?: string | null;
  thumbnail_url?: string | null;
  views: number;
  likes: number;
  comments: number;
  shares?: number | null;
  saves?: number | null;
  fetched_at: string;
}): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  await client.from("social_posts").upsert(
    {
      platform: row.platform,
      external_id: row.external_id,
      caption: row.caption ?? null,
      permalink: row.permalink ?? null,
      thumbnail_url: row.thumbnail_url ?? null,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares ?? null,
      saves: row.saves ?? null,
      fetched_at: row.fetched_at,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "platform,external_id" },
  );
}

/** Upsert list-level fields only (no views) — used by the backfill list crawl,
 * where view counts come later from insights. Preserves existing views. */
export async function upsertListPost(row: {
  platform: "instagram" | "tiktok";
  external_id: string;
  caption?: string | null;
  permalink?: string | null;
  thumbnail_url?: string | null;
  likes: number;
  comments: number;
  fetched_at: string;
}): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  await client.from("social_posts").upsert(
    {
      platform: row.platform,
      external_id: row.external_id,
      caption: row.caption ?? null,
      permalink: row.permalink ?? null,
      thumbnail_url: row.thumbnail_url ?? null,
      likes: row.likes,
      comments: row.comments,
      fetched_at: row.fetched_at,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "platform,external_id" },
  );
}

/** External IDs to keep re-fetching daily beyond the recent window: the top
 * posts by views (above a floor) plus every featured post. */
export async function getTrackedExternalIds(
  platform: "instagram" | "tiktok",
  { limit, floor }: { limit: number; floor: number },
): Promise<string[]> {
  const client = getSupabase();
  if (!client) return [];
  const ids = new Set<string>();
  const [top, feat] = await Promise.all([
    client
      .from("social_posts")
      .select("external_id")
      .eq("platform", platform)
      .not("external_id", "is", null)
      .gte("views", floor)
      .order("views", { ascending: false })
      .limit(limit),
    client
      .from("social_posts")
      .select("external_id")
      .eq("platform", platform)
      .not("external_id", "is", null)
      .eq("is_featured", true),
  ]);
  for (const r of [...(top.data ?? []), ...(feat.data ?? [])]) {
    if (r.external_id) ids.add(r.external_id as string);
  }
  return Array.from(ids);
}

/** After a list crawl, skip posts whose views we already know. */
export async function markBackfilledWhereViewsKnown(platform: "instagram" | "tiktok"): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  await client
    .from("social_posts")
    .update({ views_backfilled: true })
    .eq("platform", platform)
    .gt("views", 0)
    .eq("views_backfilled", false);
}

/** Highest-engagement posts still missing a real view count — the ones worth an
 * insights call during backfill (likes come free in the list; views don't). */
export async function getBackfillCandidates(
  platform: "instagram" | "tiktok",
  { likeFloor, limit }: { likeFloor: number; limit: number },
): Promise<{ id: string; external_id: string }[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("social_posts")
    .select("id, external_id")
    .eq("platform", platform)
    .not("external_id", "is", null)
    .eq("views_backfilled", false)
    .gte("likes", likeFloor)
    .order("likes", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data
    .filter((r) => r.external_id)
    .map((r) => ({ id: r.id as string, external_id: r.external_id as string }));
}

export async function markPostsBackfilled(ids: string[]): Promise<void> {
  const client = getSupabase();
  if (!client || ids.length === 0) return;
  await client.from("social_posts").update({ views_backfilled: true }).in("id", ids);
}

export async function countBackfillRemaining(
  platform: "instagram" | "tiktok",
  likeFloor: number,
): Promise<number> {
  const client = getSupabase();
  if (!client) return 0;
  const { count } = await client
    .from("social_posts")
    .select("id", { count: "exact", head: true })
    .eq("platform", platform)
    .not("external_id", "is", null)
    .eq("views_backfilled", false)
    .gte("likes", likeFloor);
  return count ?? 0;
}

/** Baseline: mark every post currently over the threshold as counted, so the
 * admin's manual count already accounts for them (called when the override is
 * set). Prevents double-counting the existing catalog. */
export async function markPostsCountedOverThreshold(threshold: number): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  await client.from("social_posts").update({ counted_over_threshold: true }).gte("views", threshold);
}

/** Claim posts that have crossed the threshold since the last check: flip them
 * to counted and return how many there were. Used to increment the override. */
export async function claimNewThresholdCrossings(threshold: number): Promise<number> {
  const client = getSupabase();
  if (!client) return 0;
  const { data, error } = await client
    .from("social_posts")
    .update({ counted_over_threshold: true })
    .gte("views", threshold)
    .eq("counted_over_threshold", false)
    .select("id");
  if (error || !data) return 0;
  return data.length;
}

/** Retention sweep for the append-only snapshots table. */
export async function deleteSnapshotsOlderThan(days: number): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  await client.from("social_metrics_snapshots").delete().lt("created_at", cutoff);
}

export async function getMetricOverride(): Promise<MetricOverrideRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("social_metric_overrides")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();
  if (error || !data) return null;
  return data as MetricOverrideRow;
}

export type MetricOverrideWrite = Partial<
  Pick<
    MetricOverrideRow,
    | "total_followers"
    | "best_video_views"
    | "videos_above_threshold"
    | "notable_views_threshold"
    | "monthly_reach"
    | "category"
  >
>;

export async function upsertMetricOverride(patch: MetricOverrideWrite): Promise<MetricOverrideRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("social_metric_overrides")
    .upsert({ id: "singleton", ...patch, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select()
    .single();
  if (error || !data) return null;
  return data as MetricOverrideRow;
}

export async function getSocialToken(platform: SocialPlatform): Promise<SocialTokenRow | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("social_api_tokens")
    .select("*")
    .eq("platform", platform)
    .maybeSingle();
  if (error || !data) return null;
  return data as SocialTokenRow;
}

export async function upsertSocialToken(row: {
  platform: SocialPlatform;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: string | null;
  scope?: string | null;
}): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  await client
    .from("social_api_tokens")
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "platform" });
}
