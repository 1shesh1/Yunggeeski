/**
 * Typed shapes for social metrics consumed by the /brands sponsor page.
 *
 * The page reads exclusively through `lib/metrics/service.ts`, which currently
 * returns provisional fixtures. Issue #4 (live TikTok + Instagram service) will
 * back these same shapes with cached API data — no page changes required.
 */

export type MetricSource = "live" | "snapshot" | "override" | "fallback";

export type Platform = "instagram" | "tiktok";

/** Account-level headline metrics shown in the hero proof line + performance row. */
export interface AccountMetrics {
  /** Combined follower total across platforms. */
  totalFollowers: number;
  /** Views on the single best-performing video. */
  bestVideoViews: number;
  /** Count of videos above the notable-views threshold (see `notableViewsThreshold`). */
  videosAboveThreshold: number;
  notableViewsThreshold: number;
  /** Reach in the trailing 30 days. */
  monthlyReach: number;
  /** Human label for the content category. */
  category: string;
}

/** A single featured portfolio post shown in the performance grid. */
export interface PortfolioPost {
  id: string;
  platform: Platform | "cross";
  /** Short topic/title, e.g. "Pelosi vs Buffett". */
  topic: string;
  /** One-sentence explanation of why the post performed. */
  whyItWorked: string;
  views: number;
  likes: number;
  comments: number;
  /** Optional — not every platform exposes these per post. */
  shares?: number;
  saves?: number;
  /** Public permalink to the post, when available. */
  permalink?: string | null;
  /** Thumbnail image URL. Null until a real asset is wired (PortfolioCard falls back). */
  thumbnailUrl?: string | null;
}

/**
 * A metrics read result. `source` lets the UI render an honest provenance note
 * (e.g. a subtle "provisional" hint while `source === "fallback"`), and `asOf`
 * carries the snapshot time once live data flows.
 */
export interface MetricsResult<T> {
  data: T;
  source: MetricSource;
  /** ISO timestamp of the underlying snapshot, or null for static fallback. */
  asOf: string | null;
}
