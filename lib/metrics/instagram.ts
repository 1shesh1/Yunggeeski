/**
 * Instagram client — "Instagram API with Instagram Login" (graph.instagram.com).
 *
 * This targets the Instagram-Login flavor (tokens issued by the Instagram app,
 * used against graph.instagram.com), NOT the Facebook Graph / Page flavor
 * (graph.facebook.com). Sending an Instagram-Login token to graph.facebook.com
 * returns OAuthException code 190 "Cannot parse access token" — which is why we
 * call graph.instagram.com and address the account as `me`.
 *
 * ⚠ Still UNVERIFIED end-to-end without a live token: exact media-insight metric
 * names (e.g. `views` vs `plays`) can vary by account/media type. Every insight
 * call is best-effort and degrades to 0/null; the refresh job wraps the whole
 * client in try/catch and the read service falls back to the last snapshot then
 * fixtures, so a wrong field never crashes the cron or blanks the page.
 *
 * Requires a Business/Creator account for insights (reach, views).
 * Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
 */

import type { InstagramApiConfig } from "@/lib/env";
import type { SocialTokenRow } from "@/lib/supabase";
import {
  NOTABLE_VIEWS_THRESHOLD,
  type PlatformFetchResult,
  type PlatformPost,
  type RefreshedToken,
} from "./types";

const API_BASE = "https://graph.instagram.com/v21.0";
const REFRESH_URL = "https://graph.instagram.com/refresh_access_token";
const MEDIA_LIMIT = 30;
const REFRESH_SKEW_MS = 7 * 86_400_000; // refresh when <7 days to expiry
/**
 * Parallel Instagram calls in flight at once. Netlify cuts synchronous
 * functions off at ~10s, so per-post calls can't run one by one; a small pool
 * keeps well under that without bursting the API.
 */
const IG_CONCURRENCY = 6;

/** Map with at most `limit` promises in flight; preserves input order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

interface IgMedia {
  id: string;
  caption?: string;
  permalink?: string;
  media_type?: string;
  thumbnail_url?: string;
  media_url?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
}

async function igGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/${path}?${qs}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Instagram ${path} ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/**
 * Best-effort long-lived token refresh (ig_refresh_token). Long-lived Instagram
 * tokens last ~60 days and can be refreshed once they're >24h old. Returns null
 * on failure so the caller keeps the existing token.
 *
 * An UNKNOWN expiry counts as due: a token pasted into IG_LONG_LIVED_TOKEN has
 * no stored expiry, and skipping it is how the env token silently lapsed after
 * 60 days. Once refreshed, the expiry is persisted and this only fires in the
 * final week.
 */
async function maybeRefreshToken(
  expiresAt: string | null | undefined,
  currentToken: string,
): Promise<{ accessToken: string; refreshed: RefreshedToken } | null> {
  const due = expiresAt ? Date.parse(expiresAt) - Date.now() < REFRESH_SKEW_MS : true;
  if (!due) return null;
  try {
    const qs = new URLSearchParams({
      grant_type: "ig_refresh_token",
      access_token: currentToken,
    }).toString();
    const res = await fetch(`${REFRESH_URL}?${qs}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
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

/** Best-effort per-media view + save counts (reels report `views`). */
async function fetchMediaViews(
  mediaId: string,
  token: string,
): Promise<{ views: number; saves: number | null }> {
  try {
    const data = await igGet<{ data: { name: string; values: { value: number }[] }[] }>(
      `${mediaId}/insights`,
      { metric: "views,saved", access_token: token },
    );
    const byName = new Map(data.data?.map((d) => [d.name, d.values?.[0]?.value ?? 0]));
    return { views: byName.get("views") ?? 0, saves: byName.get("saved") ?? null };
  } catch {
    return { views: 0, saves: null };
  }
}

/** Sum a daily account insight (reach) over the last `days` days. */
async function fetchWindowReach(token: string, days: number): Promise<number | null> {
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86_400;
  try {
    const data = await igGet<{ data: { values: { value: number }[] }[] }>("me/insights", {
      metric: "reach",
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

/** True when Instagram accepts the token (cheap `me?fields=id` probe). */
async function tokenWorks(token: string): Promise<boolean> {
  try {
    await igGet<{ id?: string }>("me", { fields: "id", access_token: token });
    return true;
  } catch {
    return false;
  }
}

/**
 * Pick a working token: the DB-stored one (kept fresh by refreshes) first, then
 * IG_LONG_LIVED_TOKEN. Falling through to the env token is what lets a newly
 * pasted token replace a dead stored one — before, the stored token always won,
 * so updating the env var alone changed nothing.
 */
export async function resolveToken(
  config: InstagramApiConfig,
  storedToken: SocialTokenRow | null,
): Promise<{ token: string; expiresAt: string | null; fromEnv: boolean }> {
  const stored = storedToken?.access_token ?? null;
  const env = config.longLivedToken ?? null;
  if (stored && (await tokenWorks(stored))) {
    return { token: stored, expiresAt: storedToken?.expires_at ?? null, fromEnv: false };
  }
  if (env && env !== stored && (await tokenWorks(env))) {
    return { token: env, expiresAt: null, fromEnv: true };
  }
  throw new Error(
    "Instagram token rejected — generate a new long-lived token and set IG_LONG_LIVED_TOKEN",
  );
}

export function isInstagramConfigured(_config: InstagramApiConfig, token: SocialTokenRow | null): boolean {
  return Boolean(token?.access_token || _config.longLivedToken);
}

/**
 * Fetch account snapshot + recent posts for the authenticated IG account.
 * Throws only if there is no usable token; API failures degrade per-call.
 */
export async function fetchInstagramMetrics(
  config: InstagramApiConfig,
  storedToken: SocialTokenRow | null,
): Promise<PlatformFetchResult> {
  if (!storedToken?.access_token && !config.longLivedToken) {
    throw new Error("Instagram not configured (need an access token)");
  }
  const resolved = await resolveToken(config, storedToken);
  let token = resolved.token;

  // Persist an env token we fell back to, so the refresh below (and future
  // runs) operate on it and its expiry gets recorded.
  let refreshedToken: RefreshedToken | undefined = resolved.fromEnv
    ? { accessToken: token, expiresAt: null }
    : undefined;
  const refresh = await maybeRefreshToken(resolved.expiresAt, token);
  if (refresh) {
    token = refresh.accessToken;
    refreshedToken = refresh.refreshed;
  }

  // The Instagram-Login token is scoped to one account, so `me` resolves it —
  // IG_BUSINESS_ACCOUNT_ID is not needed for this flavor.
  const account = await igGet<{
    followers_count?: number;
    media_count?: number;
    username?: string;
    account_type?: string;
  }>("me", {
    fields: "followers_count,media_count,username,account_type",
    access_token: token,
  });

  const mediaResp = await igGet<{ data: IgMedia[] }>("me/media", {
    fields: "id,caption,permalink,media_type,thumbnail_url,media_url,like_count,comments_count,timestamp",
    limit: String(MEDIA_LIMIT),
    access_token: token,
  });
  const media = mediaResp.data ?? [];

  const posts: PlatformPost[] = await mapLimit(media, IG_CONCURRENCY, async (m) => {
    const isVideo = m.media_type === "VIDEO" || m.media_type === "REELS";
    const { views, saves } = isVideo ? await fetchMediaViews(m.id, token) : { views: 0, saves: null };
    return {
      externalId: m.id,
      caption: m.caption ?? null,
      permalink: m.permalink ?? null,
      thumbnailUrl: m.thumbnail_url ?? m.media_url ?? null,
      views,
      likes: m.like_count ?? 0,
      comments: m.comments_count ?? 0,
      shares: null,
      saves,
    };
  });

  const [reach30d, reach90d] = await Promise.all([
    fetchWindowReach(token, 30),
    fetchWindowReach(token, 90),
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
      raw: { account },
    },
    posts,
    token: refreshedToken,
  };
}

export interface IgListItem {
  externalId: string;
  caption: string | null;
  permalink: string | null;
  thumbnailUrl: string | null;
  likes: number;
  comments: number;
}

/**
 * One slice of the full media-list crawl: up to `maxPages` pages of 100,
 * starting after `after` (an opaque cursor from a previous slice). Returns the
 * cursor for the next slice, or null when the list is exhausted. Sliced so each
 * backfill request stays inside the serverless time limit.
 */
export async function fetchInstagramMediaList(
  token: string,
  { after = null, maxPages = 3 }: { after?: string | null; maxPages?: number } = {},
): Promise<{ items: IgListItem[]; next: string | null }> {
  const items: IgListItem[] = [];
  let cursor = after;
  for (let page = 0; page < maxPages; page++) {
    const params: Record<string, string> = {
      fields: "id,caption,permalink,media_type,thumbnail_url,media_url,like_count,comments_count",
      limit: "100",
      access_token: token,
    };
    if (cursor) params.after = cursor;
    const json = await igGet<{
      data?: (IgMedia & { id: string })[];
      paging?: { next?: string; cursors?: { after?: string } };
    }>("me/media", params);
    for (const m of json.data ?? []) {
      items.push({
        externalId: m.id,
        caption: m.caption ?? null,
        permalink: m.permalink ?? null,
        thumbnailUrl: m.thumbnail_url ?? m.media_url ?? null,
        likes: m.like_count ?? 0,
        comments: m.comments_count ?? 0,
      });
    }
    // Only a `next` link means another page exists; the cursor alone doesn't.
    cursor = json.paging?.next ? (json.paging.cursors?.after ?? null) : null;
    if (!cursor) break;
  }
  return { items, next: cursor };
}

/**
 * Fetch specific posts by ID (media fields + insights) — for keeping tracked
 * posts fresh beyond the recent window, and for backfilling view counts.
 * Skips (omits) any ID that errors so callers can retry those later.
 */
export async function fetchInstagramPostsByIds(token: string, ids: string[]): Promise<PlatformPost[]> {
  const results = await mapLimit(ids, IG_CONCURRENCY, async (id): Promise<PlatformPost | null> => {
    try {
      const m = await igGet<IgMedia & { id: string }>(id, {
        fields: "id,caption,permalink,media_type,thumbnail_url,media_url,like_count,comments_count",
        access_token: token,
      });
      const isVideo = m.media_type === "VIDEO" || m.media_type === "REELS";
      const { views, saves } = isVideo
        ? await fetchMediaViews(m.id, token)
        : { views: 0, saves: null };
      return {
        externalId: m.id,
        caption: m.caption ?? null,
        permalink: m.permalink ?? null,
        thumbnailUrl: m.thumbnail_url ?? m.media_url ?? null,
        views,
        likes: m.like_count ?? 0,
        comments: m.comments_count ?? 0,
        shares: null,
        saves,
      };
    } catch {
      // Skip — left unmarked so backfill/tracking retries it next run.
      return null;
    }
  });
  return results.filter((p): p is PlatformPost => p !== null);
}
