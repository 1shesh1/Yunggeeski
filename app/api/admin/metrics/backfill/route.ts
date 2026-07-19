import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getInstagramConfig } from "@/lib/env";
import {
  getSupabase,
  getSocialToken,
  upsertListPost,
  markBackfilledWhereViewsKnown,
  getBackfillCandidates,
  markPostsBackfilled,
  countBackfillRemaining,
  updateSocialPost,
} from "@/lib/supabase";
import {
  fetchInstagramMediaList,
  fetchInstagramPostsByIds,
  isInstagramConfigured,
} from "@/lib/metrics/instagram";

export const dynamic = "force-dynamic";
// Extend the serverless budget a bit — a list crawl / insights chunk fans out
// to several IG calls.
export const maxDuration = 60;

const DEFAULT_LIKE_FLOOR = 5_000;
const DEFAULT_CHUNK = 20;

export async function POST(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  if (getSupabase() === null) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const config = getInstagramConfig();
  const stored = await getSocialToken("instagram");
  if (!isInstagramConfigured(config, stored)) {
    return NextResponse.json({ error: "Instagram not configured" }, { status: 503 });
  }
  const token = stored?.access_token ?? config.longLivedToken;
  if (!token) {
    return NextResponse.json({ error: "No Instagram token" }, { status: 503 });
  }

  const url = new URL(request.url);
  const phase = url.searchParams.get("phase") ?? "insights";
  const likeFloor = Number(url.searchParams.get("likeFloor")) || DEFAULT_LIKE_FLOOR;
  const chunk = Math.min(Number(url.searchParams.get("chunk")) || DEFAULT_CHUNK, 40);

  try {
    if (phase === "list") {
      // Cheap full crawl: likes/comments come free in the list, no insights.
      const items = await fetchInstagramMediaList(token);
      const fetchedAt = new Date().toISOString();
      for (const it of items) {
        await upsertListPost({
          platform: "instagram",
          external_id: it.externalId,
          permalink: it.permalink,
          thumbnail_url: it.thumbnailUrl,
          likes: it.likes,
          comments: it.comments,
          fetched_at: fetchedAt,
        });
      }
      await markBackfilledWhereViewsKnown("instagram");
      const remaining = await countBackfillRemaining("instagram", likeFloor);
      return NextResponse.json({ phase: "list", listed: items.length, remaining, done: remaining === 0 });
    }

    // insights phase — one chunk of the highest-like posts still lacking views.
    const candidates = await getBackfillCandidates("instagram", { likeFloor, limit: chunk });
    if (candidates.length === 0) {
      return NextResponse.json({ phase: "insights", processed: 0, remaining: 0, done: true });
    }
    const idByExternal = new Map(candidates.map((c) => [c.external_id, c.id]));
    const posts = await fetchInstagramPostsByIds(
      token,
      candidates.map((c) => c.external_id),
    );

    const doneDbIds: string[] = [];
    for (const p of posts) {
      const dbId = idByExternal.get(p.externalId);
      if (!dbId) continue;
      await updateSocialPost(dbId, {
        views: p.views,
        likes: p.likes,
        comments: p.comments,
        thumbnail_url: p.thumbnailUrl,
        permalink: p.permalink,
      });
      doneDbIds.push(dbId);
    }
    // Only mark the ones we actually fetched (errors/rate-limits retry next call).
    await markPostsBackfilled(doneDbIds);

    const remaining = await countBackfillRemaining("instagram", likeFloor);
    return NextResponse.json({
      phase: "insights",
      processed: doneDbIds.length,
      remaining,
      done: remaining === 0,
    });
  } catch (e) {
    console.error("[backfill]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Backfill failed" }, { status: 502 });
  }
}
