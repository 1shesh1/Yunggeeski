/**
 * Instagram Graph API client (IG Business/Creator account linked to a Facebook Page).
 *
 * ⚠ UNVERIFIED AGAINST LIVE API. The endpoints/fields below follow the documented
 * Graph API shape, but they cannot be exercised until Meta app review grants the
 * `instagram_manage_insights` / `instagram_basic` permissions and real tokens
 * exist. Treat this as the wiring to validate during the credential rollout, not
 * as battle-tested code. The refresh job wraps every call in try/catch so a wrong
 * field here can never crash the cron or blank the page (the read service falls
 * back to the last snapshot, then fixtures).
 *
 * Docs: https://developers.facebook.com/docs/instagram-api
 */

import type { InstagramApiConfig } from "@/lib/env";
import type { SocialTokenRow } from "@/lib/supabase";
import {
  NOTABLE_VIEWS_THRESHOLD,
  type PlatformFetchResult,
  type PlatformPost,
  type RefreshedToken,
} from "./types";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";
const MEDIA_LIMIT = 30;
const REFRESH_SKEW_MS = 7 * 86_400_000; // extend when <7 days to expiry

interface IgMedia {
  id: string;
  permalink?: string;
  media_type?: string;
  thumbnail_url?: string;
  media_url?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GRAPH_BASE}/${path}?${qs}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Instagram Graph ${path} ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Sum a daily-value account insight (e.g. reach) over the last `days` days. */
async function fetchWindowReach(
  igId: string,
  token: string,
  metric: string,
  days: number,
): Promise<number | null> {
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86_400;
  try {
    const data = await graphGet<{ data: { values: { value: number }[] }[] }>(`${igId}/insights`, {
      metric,
      period: "day",
      since: String(since),
      until: String(until),
      access_token: token,
    });
    const values = data.data?.[0]?.values ?? [];
    if (!values.length) return null;
    return values.reduce((a, v) => a + (v.value ?? 0), 0);
  } catch {
    return null;
  }
}

/** Best-effort per-media view + save counts (reels report `plays`). */
async function fetchMediaViews(
  mediaId: string,
  token: string,
): Promise<{ views: number; saves: number | null }> {
  try {
    const data = await graphGet<{ data: { name: string; values: { value: number }[] }[] }>(
      `${mediaId}/insights`,
      { metric: "plays,saved", access_token: token },
    );
    const byName = new Map(data.data?.map((d) => [d.name, d.values?.[0]?.value ?? 0]));
    return { views: byName.get("plays") ?? 0, saves: byName.get("saved") ?? null };
  } catch {
    return { views: 0, saves: null };
  }
}

export function isInstagramConfigured(config: InstagramApiConfig, token: SocialTokenRow | null): boolean {
  return Boolean(config.businessAccountId && (token?.access_token || config.longLivedToken));
}

/**
 * Best-effort long-lived token extension via `fb_exchange_token`, when the
 * stored token is near expiry and app credentials are present. UNVERIFIED —
 * the exact refresh flow depends on the final token type (Page vs long-lived
 * user token); returns null on any failure so the caller keeps the old token.
 */
async function maybeRefreshToken(
  config: InstagramApiConfig,
  storedToken: SocialTokenRow | null,
  currentToken: string,
): Promise<{ accessToken: string; refreshed: RefreshedToken } | null> {
  const nearExpiry = storedToken?.expires_at
    ? Date.parse(storedToken.expires_at) - Date.now() < REFRESH_SKEW_MS
    : false;
  if (!nearExpiry || !config.appId || !config.appSecret) return null;
  try {
    const data = await graphGet<{ access_token?: string; expires_in?: number }>("oauth/access_token", {
      grant_type: "fb_exchange_token",
      client_id: config.appId,
      client_secret: config.appSecret,
      fb_exchange_token: currentToken,
    });
    if (!data.access_token) return null;
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null;
    return {
      accessToken: data.access_token,
      refreshed: { accessToken: data.access_token, expiresAt },
    };
  } catch {
    return null;
  }
}

/**
 * Fetch account snapshot + recent posts for the configured IG account.
 * Throws if not configured or if the account call fails.
 */
export async function fetchInstagramMetrics(
  config: InstagramApiConfig,
  storedToken: SocialTokenRow | null,
): Promise<PlatformFetchResult> {
  let token = storedToken?.access_token ?? config.longLivedToken;
  const igId = config.businessAccountId;
  if (!token || !igId) {
    throw new Error("Instagram not configured (need IG_BUSINESS_ACCOUNT_ID + token)");
  }

  let refreshedToken: RefreshedToken | undefined;
  const refresh = await maybeRefreshToken(config, storedToken, token);
  if (refresh) {
    token = refresh.accessToken;
    refreshedToken = refresh.refreshed;
  }

  const account = await graphGet<{ followers_count?: number; media_count?: number }>(igId, {
    fields: "followers_count,media_count",
    access_token: token,
  });

  const mediaResp = await graphGet<{ data: IgMedia[] }>(`${igId}/media`, {
    fields: "id,permalink,media_type,thumbnail_url,media_url,like_count,comments_count,timestamp",
    limit: String(MEDIA_LIMIT),
    access_token: token,
  });
  const media = mediaResp.data ?? [];

  const posts: PlatformPost[] = [];
  for (const m of media) {
    const isVideo = m.media_type === "VIDEO" || m.media_type === "REELS";
    const { views, saves } = isVideo ? await fetchMediaViews(m.id, token) : { views: 0, saves: null };
    posts.push({
      externalId: m.id,
      permalink: m.permalink ?? null,
      thumbnailUrl: m.thumbnail_url ?? m.media_url ?? null,
      views,
      likes: m.like_count ?? 0,
      comments: m.comments_count ?? 0,
      shares: null,
      saves,
    });
  }

  const [reach30d, reach90d] = await Promise.all([
    fetchWindowReach(igId, token, "reach", 30),
    fetchWindowReach(igId, token, "reach", 90),
  ]);

  const videoViews = posts.map((p) => p.views);
  const bestVideoViews = videoViews.length ? Math.max(...videoViews) : null;
  const videosAboveThreshold = videoViews.filter((v) => v >= NOTABLE_VIEWS_THRESHOLD).length;

  return {
    snapshot: {
      followers: account.followers_count ?? 0,
      reach30d,
      reach90d,
      bestVideoViews,
      videosAboveThreshold,
      notableViewsThreshold: NOTABLE_VIEWS_THRESHOLD,
      raw: { account, media_count: account.media_count },
    },
    posts,
    token: refreshedToken,
  };
}
