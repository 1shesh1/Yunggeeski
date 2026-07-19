/**
 * TikTok Display API (Open API v2) client for the creator's own account.
 *
 * ⚠ UNVERIFIED AGAINST LIVE API. Endpoints/fields follow the documented v2 shape
 * but cannot be exercised until TikTok app review approves the required scopes
 * (`user.info.stats`, `video.list`) and real OAuth tokens exist. The refresh job
 * wraps every call in try/catch, and the read service falls back to the last
 * snapshot then fixtures, so a wrong field here never blanks the page.
 *
 * TikTok exposes per-video stats but NOT account "reach"; reach30d/90d are left
 * null and can be supplied via the admin override.
 *
 * Docs: https://developers.tiktok.com/doc/display-api-overview
 */

import type { TikTokApiConfig } from "@/lib/env";
import type { SocialTokenRow } from "@/lib/supabase";
import {
  NOTABLE_VIEWS_THRESHOLD,
  type PlatformFetchResult,
  type PlatformPost,
  type RefreshedToken,
} from "./types";

const API_BASE = "https://open.tiktokapis.com/v2";
const TOKEN_URL = `${API_BASE}/oauth/token/`;
const VIDEO_LIMIT = 20;
const REFRESH_SKEW_MS = 5 * 60_000;

interface TikTokVideo {
  id: string;
  title?: string;
  cover_image_url?: string;
  share_url?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
}

function needsRefresh(token: SocialTokenRow | null): boolean {
  if (!token?.access_token) return true;
  if (!token.expires_at) return false;
  return Date.parse(token.expires_at) - Date.now() < REFRESH_SKEW_MS;
}

async function refreshAccessToken(
  config: TikTokApiConfig,
  refreshToken: string,
): Promise<{ accessToken: string; refreshed: RefreshedToken }> {
  if (!config.clientKey || !config.clientSecret) {
    throw new Error("TikTok refresh needs TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET");
  }
  const body = new URLSearchParams({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    error?: string;
  };
  if (!res.ok || !json.access_token) {
    throw new Error(`TikTok token refresh failed ${res.status}: ${json.error ?? "no access_token"}`);
  }
  const expiresAt = json.expires_in
    ? new Date(Date.now() + json.expires_in * 1000).toISOString()
    : null;
  return {
    accessToken: json.access_token,
    refreshed: {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt,
      scope: json.scope,
    },
  };
}

async function apiGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TikTok GET ${path} ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export function isTikTokConfigured(config: TikTokApiConfig, token: SocialTokenRow | null): boolean {
  return Boolean(token?.access_token || config.accessToken);
}

export async function fetchTikTokMetrics(
  config: TikTokApiConfig,
  storedToken: SocialTokenRow | null,
): Promise<PlatformFetchResult> {
  let accessToken = storedToken?.access_token ?? config.accessToken ?? null;
  let refreshedToken: RefreshedToken | undefined;

  const refreshToken = storedToken?.refresh_token ?? config.refreshToken ?? null;
  if (needsRefresh(storedToken) && refreshToken) {
    const { accessToken: newToken, refreshed } = await refreshAccessToken(config, refreshToken);
    accessToken = newToken;
    refreshedToken = refreshed;
  }

  if (!accessToken) {
    throw new Error("TikTok not configured (need an access token or a refresh token)");
  }

  const userResp = await apiGet<{
    data?: { user?: { follower_count?: number; likes_count?: number; video_count?: number } };
  }>("user/info/?fields=follower_count,likes_count,video_count,display_name", accessToken);
  const user = userResp.data?.user ?? {};

  const videoResp = await fetch(
    `${API_BASE}/video/list/?fields=id,title,cover_image_url,share_url,view_count,like_count,comment_count,share_count`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: VIDEO_LIMIT }),
      cache: "no-store",
    },
  );
  if (!videoResp.ok) {
    const body = await videoResp.text().catch(() => "");
    throw new Error(`TikTok video/list ${videoResp.status}: ${body.slice(0, 200)}`);
  }
  const videoJson = (await videoResp.json()) as { data?: { videos?: TikTokVideo[] } };
  const videos = videoJson.data?.videos ?? [];

  const posts: PlatformPost[] = videos.map((v) => ({
    externalId: v.id,
    permalink: v.share_url ?? null,
    thumbnailUrl: v.cover_image_url ?? null,
    views: v.view_count ?? 0,
    likes: v.like_count ?? 0,
    comments: v.comment_count ?? 0,
    shares: v.share_count ?? null,
    saves: null,
  }));

  const views = posts.map((p) => p.views);
  const bestVideoViews = views.length ? Math.max(...views) : null;
  const videosAboveThreshold = views.filter((v) => v >= NOTABLE_VIEWS_THRESHOLD).length;

  return {
    snapshot: {
      followers: user.follower_count ?? 0,
      reach30d: null,
      reach90d: null,
      bestVideoViews,
      videosAboveThreshold,
      notableViewsThreshold: NOTABLE_VIEWS_THRESHOLD,
      raw: { user },
    },
    posts,
    token: refreshedToken,
  };
}
