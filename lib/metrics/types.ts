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
  /** The post's own caption — shown in the overlay when whyItWorked is empty. */
  caption?: string | null;
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

/** Default "notable views" threshold for counting standout videos. */
export const NOTABLE_VIEWS_THRESHOLD = 4_000_000;

// —— Platform client contracts (refresh job side) ——

/** Normalized account snapshot returned by a platform client. */
export interface PlatformSnapshot {
  followers: number;
  reach30d: number | null;
  reach90d: number | null;
  bestVideoViews: number | null;
  videosAboveThreshold: number | null;
  notableViewsThreshold: number | null;
  raw: Record<string, unknown>;
}

/** Normalized post returned by a platform client. */
export interface PlatformPost {
  externalId: string;
  permalink: string | null;
  thumbnailUrl: string | null;
  /** The post's own caption (IG `caption`, TikTok `title`). */
  caption: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  saves: number | null;
}

/** A possibly-refreshed OAuth token the refresh job should persist. */
export interface RefreshedToken {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string | null;
  scope?: string;
}

export interface PlatformFetchResult {
  snapshot: PlatformSnapshot;
  posts: PlatformPost[];
  token?: RefreshedToken;
}
