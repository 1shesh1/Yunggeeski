import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  getSupabase,
  getMetricOverride,
  upsertMetricOverride,
  listSocialPosts,
  markPostsCountedOverThreshold,
  type MetricOverrideWrite,
} from "@/lib/supabase";
import { NOTABLE_VIEWS_THRESHOLD } from "@/lib/metrics/types";

const OVERRIDE_NUMERIC_KEYS = [
  "total_followers",
  "best_video_views",
  "videos_above_threshold",
  "notable_views_threshold",
  "monthly_reach",
] as const;

/** Coerce a client value to a non-negative integer, or null to clear. */
function toIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export async function GET(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;

  const supabaseConfigured = getSupabase() !== null;
  if (!supabaseConfigured) {
    return NextResponse.json({ supabaseConfigured: false, override: null, posts: [] });
  }
  const [override, posts] = await Promise.all([getMetricOverride(), listSocialPosts()]);
  return NextResponse.json({ supabaseConfigured: true, override, posts });
}

export async function PATCH(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  if (getSupabase() === null) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: MetricOverrideWrite = {};
  for (const key of OVERRIDE_NUMERIC_KEYS) {
    patch[key] = toIntOrNull(body[key]);
  }
  const category = typeof body.category === "string" ? body.category.trim() : "";
  patch.category = category.length ? category : null;

  const saved = await upsertMetricOverride(patch);
  if (!saved) {
    return NextResponse.json({ error: "Failed to save override" }, { status: 500 });
  }

  // Setting a videos-above-threshold baseline means "this count already covers
  // every current post," so mark them counted; the cron only adds NEW crossings.
  if (patch.videos_above_threshold != null) {
    const threshold = patch.notable_views_threshold ?? NOTABLE_VIEWS_THRESHOLD;
    await markPostsCountedOverThreshold(threshold);
  }

  return NextResponse.json({ override: saved });
}
