/**
 * Public read API for social metrics used by the /brands sponsor page.
 *
 * The page imports ONLY from here. Resolution order (fallback chain):
 *   1. Live cache  — latest snapshot per platform written by the refresh job
 *   2. Override    — admin manual overrides win per-field (safety valve)
 *   3. Fallback    — seeded fixtures, so the page always renders
 *
 * Any read error degrades to fixtures rather than blanking the page.
 */

import type { AccountMetrics, MetricsResult, PortfolioPost } from "./types";
import { FALLBACK_ACCOUNT_METRICS, FALLBACK_PORTFOLIO } from "./fixtures";
import {
  getLatestSnapshots,
  getMetricOverride,
  getFeaturedSocialPosts,
  type SocialSnapshotRow,
  type MetricOverrideRow,
  type SocialPostRow,
} from "@/lib/supabase";

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/**
 * Aggregate the latest snapshot per platform into headline metrics. A metric
 * that no platform reports (e.g. reach — TikTok never returns it, and IG reach
 * fails closed to null) falls back to the fixture value rather than rendering a
 * misleading "0" stamped with an "as of" date. Admin overrides can then correct
 * any field precisely.
 */
function computeFromSnapshots(snapshots: SocialSnapshotRow[]): {
  metrics: AccountMetrics;
  asOf: string;
} {
  const present = <T>(vals: (T | null | undefined)[]): T[] =>
    vals.filter((v): v is T => v != null);

  const followers = snapshots.map((s) => s.followers).filter((v) => v > 0);
  const totalFollowers = followers.length ? sum(followers) : FALLBACK_ACCOUNT_METRICS.totalFollowers;

  const bestVals = present(snapshots.map((s) => s.best_video_views)).filter((v) => v > 0);
  const bestVideoViews = bestVals.length
    ? Math.max(...bestVals)
    : FALLBACK_ACCOUNT_METRICS.bestVideoViews;

  const aboveVals = present(snapshots.map((s) => s.videos_above_threshold));
  const videosAboveThreshold = aboveVals.length
    ? sum(aboveVals)
    : FALLBACK_ACCOUNT_METRICS.videosAboveThreshold;

  const thresholds = present(snapshots.map((s) => s.notable_views_threshold)).filter((v) => v > 0);
  const notableViewsThreshold = thresholds.length
    ? Math.max(...thresholds)
    : FALLBACK_ACCOUNT_METRICS.notableViewsThreshold;

  const reach = present(snapshots.map((s) => s.reach_30d)).filter((v) => v > 0);
  const monthlyReach = reach.length ? sum(reach) : FALLBACK_ACCOUNT_METRICS.monthlyReach;

  const asOf = snapshots
    .map((s) => s.created_at)
    .sort()
    .at(-1) as string;
  return {
    metrics: {
      totalFollowers,
      bestVideoViews,
      videosAboveThreshold,
      notableViewsThreshold,
      monthlyReach,
      category: FALLBACK_ACCOUNT_METRICS.category,
    },
    asOf,
  };
}

function overrideHasValue(o: MetricOverrideRow): boolean {
  return (
    o.total_followers != null ||
    o.best_video_views != null ||
    o.videos_above_threshold != null ||
    o.notable_views_threshold != null ||
    o.monthly_reach != null ||
    o.category != null
  );
}

function applyOverride(base: AccountMetrics, o: MetricOverrideRow): AccountMetrics {
  return {
    totalFollowers: o.total_followers ?? base.totalFollowers,
    bestVideoViews: o.best_video_views ?? base.bestVideoViews,
    videosAboveThreshold: o.videos_above_threshold ?? base.videosAboveThreshold,
    notableViewsThreshold: o.notable_views_threshold ?? base.notableViewsThreshold,
    monthlyReach: o.monthly_reach ?? base.monthlyReach,
    category: o.category ?? base.category,
  };
}

/** Headline account metrics for the hero proof line + performance row. */
export async function getAccountMetrics(): Promise<MetricsResult<AccountMetrics>> {
  try {
    const [snapshots, override] = await Promise.all([getLatestSnapshots(), getMetricOverride()]);

    let base: AccountMetrics | null = null;
    let asOf: string | null = null;
    if (snapshots.length > 0) {
      const computed = computeFromSnapshots(snapshots);
      base = computed.metrics;
      asOf = computed.asOf;
    }

    if (override && overrideHasValue(override)) {
      const merged = applyOverride(base ?? FALLBACK_ACCOUNT_METRICS, override);
      return { data: merged, source: "override", asOf: base ? asOf : override.updated_at };
    }

    if (base) {
      return { data: base, source: "snapshot", asOf };
    }

    return { data: FALLBACK_ACCOUNT_METRICS, source: "fallback", asOf: null };
  } catch (e) {
    console.error("[metrics] getAccountMetrics failed, using fallback:", e);
    return { data: FALLBACK_ACCOUNT_METRICS, source: "fallback", asOf: null };
  }
}

function mapRow(row: SocialPostRow): PortfolioPost {
  return {
    id: row.id,
    platform: row.platform,
    topic: row.topic,
    whyItWorked: row.why_it_worked,
    caption: row.caption,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares ?? undefined,
    saves: row.saves ?? undefined,
    permalink: row.permalink,
    thumbnailUrl: row.thumbnail_url,
  };
}

/** The featured portfolio posts for the performance grid. */
export async function getFeaturedPortfolio(limit = 6): Promise<MetricsResult<PortfolioPost[]>> {
  try {
    const posts = await getFeaturedSocialPosts(limit);
    if (posts.length > 0) {
      const asOf = posts
        .map((p) => p.fetched_at ?? p.updated_at)
        .sort()
        .at(-1) as string;
      return { data: posts.map(mapRow), source: "snapshot", asOf };
    }
    return { data: FALLBACK_PORTFOLIO.slice(0, limit), source: "fallback", asOf: null };
  } catch (e) {
    console.error("[metrics] getFeaturedPortfolio failed, using fallback:", e);
    return { data: FALLBACK_PORTFOLIO.slice(0, limit), source: "fallback", asOf: null };
  }
}
