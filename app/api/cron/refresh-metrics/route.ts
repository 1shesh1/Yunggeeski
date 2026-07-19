import { NextRequest, NextResponse } from "next/server";
import { getInstagramConfig, getTikTokConfig, getMetricsRefreshSecret } from "@/lib/env";
import {
  getSupabase,
  getSocialToken,
  insertSnapshot,
  upsertApiPost,
  upsertSocialToken,
  deleteSnapshotsOlderThan,
  getLatestSnapshots,
  getMetricOverride,
  upsertMetricOverride,
  claimNewThresholdCrossings,
  type MetricOverrideWrite,
} from "@/lib/supabase";
import { fetchInstagramMetrics, isInstagramConfigured } from "@/lib/metrics/instagram";
import { fetchTikTokMetrics, isTikTokConfigured } from "@/lib/metrics/tiktok";
import { NOTABLE_VIEWS_THRESHOLD, type PlatformFetchResult } from "@/lib/metrics/types";

export const dynamic = "force-dynamic";

type PlatformResult =
  | { platform: string; skipped: true; reason: string }
  | { platform: string; ok: true; followers: number; posts: number }
  | { platform: string; error: string };

function extractSecret(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return request.headers.get("x-refresh-secret");
}

async function persist(platform: "instagram" | "tiktok", result: PlatformFetchResult): Promise<void> {
  const fetchedAt = new Date().toISOString();
  await insertSnapshot({
    platform,
    followers: result.snapshot.followers,
    reach_30d: result.snapshot.reach30d,
    reach_90d: result.snapshot.reach90d,
    best_video_views: result.snapshot.bestVideoViews,
    videos_above_threshold: result.snapshot.videosAboveThreshold,
    notable_views_threshold: result.snapshot.notableViewsThreshold,
    raw: result.snapshot.raw,
  });
  for (const p of result.posts) {
    await upsertApiPost({
      platform,
      external_id: p.externalId,
      permalink: p.permalink,
      thumbnail_url: p.thumbnailUrl,
      views: p.views,
      likes: p.likes,
      comments: p.comments,
      shares: p.shares,
      saves: p.saves,
      fetched_at: fetchedAt,
    });
  }
  if (result.token) {
    await upsertSocialToken({
      platform,
      access_token: result.token.accessToken,
      refresh_token: result.token.refreshToken,
      expires_at: result.token.expiresAt,
      scope: result.token.scope,
    });
  }
}

async function runInstagram(): Promise<PlatformResult> {
  const config = getInstagramConfig();
  const token = await getSocialToken("instagram");
  if (!isInstagramConfigured(config, token)) {
    return { platform: "instagram", skipped: true, reason: "not configured" };
  }
  try {
    const result = await fetchInstagramMetrics(config, token);
    await persist("instagram", result);
    return { platform: "instagram", ok: true, followers: result.snapshot.followers, posts: result.posts.length };
  } catch (e) {
    return { platform: "instagram", error: e instanceof Error ? e.message : String(e) };
  }
}

async function runTikTok(): Promise<PlatformResult> {
  const config = getTikTokConfig();
  const token = await getSocialToken("tiktok");
  if (!isTikTokConfigured(config, token)) {
    return { platform: "tiktok", skipped: true, reason: "not configured" };
  }
  try {
    const result = await fetchTikTokMetrics(config, token);
    await persist("tiktok", result);
    return { platform: "tiktok", ok: true, followers: result.snapshot.followers, posts: result.posts.length };
  } catch (e) {
    return { platform: "tiktok", error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Ratchet the two all-time override stats UP from fresh data (never down):
 *   - best_video_views  → max(current, latest best across platforms)
 *   - videos_above_threshold → += posts that newly crossed the threshold
 * Only runs for fields the admin has seeded with a baseline. Best-effort.
 */
async function ratchetAllTimeStats(): Promise<void> {
  try {
    const override = await getMetricOverride();
    if (!override) return;
    const threshold = override.notable_views_threshold ?? NOTABLE_VIEWS_THRESHOLD;
    const patch: MetricOverrideWrite = {};

    if (override.best_video_views != null) {
      const snaps = await getLatestSnapshots();
      const liveBest = Math.max(0, ...snaps.map((s) => s.best_video_views ?? 0));
      if (liveBest > override.best_video_views) patch.best_video_views = liveBest;
    }

    if (override.videos_above_threshold != null) {
      const newCrossings = await claimNewThresholdCrossings(threshold);
      if (newCrossings > 0) {
        patch.videos_above_threshold = override.videos_above_threshold + newCrossings;
      }
    }

    if (Object.keys(patch).length > 0) await upsertMetricOverride(patch);
  } catch (e) {
    console.error("[refresh-metrics] ratchet failed:", e);
  }
}

async function handle(request: NextRequest) {
  const expected = getMetricsRefreshSecret();
  if (!expected) {
    return NextResponse.json({ error: "Refresh not configured (set METRICS_REFRESH_SECRET)" }, { status: 503 });
  }
  if (extractSecret(request) !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (getSupabase() === null) {
    return NextResponse.json({ ok: true, skipped: "no database configured", results: [] });
  }

  const results = await Promise.all([runInstagram(), runTikTok()]);
  // Ratchet the all-time override stats up from the fresh posts/snapshots.
  await ratchetAllTimeStats();
  // Retention sweep — keep ~90 days of snapshots (reads only use the latest).
  await deleteSnapshotsOlderThan(90);
  return NextResponse.json({ ok: true, results });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

// Allow GET as well so an external scheduler that can only issue GETs still works.
export async function GET(request: NextRequest) {
  return handle(request);
}
