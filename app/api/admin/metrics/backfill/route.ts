import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getInstagramConfig } from "@/lib/env";
import {
  getSupabase,
  getSocialToken,
  upsertListPosts,
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
  resolveToken,
} from "@/lib/metrics/instagram";

export const dynamic = "force-dynamic";
// Honoured on Vercel; Netlify ignores it and cuts synchronous functions off at
// ~10s. So the work is sliced instead: the list crawl pages through a cursor
// (a few pages per request) and insights run in small parallel chunks, with
// the admin UI looping until done.
export const maxDuration = 60;

const DEFAULT_LIKE_FLOOR = 5_000;
const DEFAULT_CHUNK = 12;
/** IG list pages (100 posts each) crawled per request. */
const LIST_PAGES_PER_REQUEST = 3;

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
  let token: string;
  try {
    token = (await resolveToken(config, stored)).token;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No working Instagram token" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const phase = url.searchParams.get("phase") ?? "insights";
  const likeFloor = Number(url.searchParams.get("likeFloor")) || DEFAULT_LIKE_FLOOR;
  const chunk = Math.min(Number(url.searchParams.get("chunk")) || DEFAULT_CHUNK, 24);

  try {
    if (phase === "list") {
      // Cheap full crawl, one slice per request: likes/comments come free in
      // the list, no insights. The client passes `next` back as `after`.
      const { items, next } = await fetchInstagramMediaList(token, {
        after: url.searchParams.get("after"),
        maxPages: LIST_PAGES_PER_REQUEST,
      });
      const fetchedAt = new Date().toISOString();
      await upsertListPosts(
        items.map((it) => ({
          platform: "instagram" as const,
          external_id: it.externalId,
          caption: it.caption,
          permalink: it.permalink,
          thumbnail_url: it.thumbnailUrl,
          likes: it.likes,
          comments: it.comments,
          fetched_at: fetchedAt,
        })),
      );
      if (next) {
        return NextResponse.json({ phase: "list", listed: items.length, next, done: false });
      }
      await markBackfilledWhereViewsKnown("instagram");
      const remaining = await countBackfillRemaining("instagram", likeFloor);
      return NextResponse.json({ phase: "list", listed: items.length, next: null, remaining, done: remaining === 0 });
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

    const fetched = posts.filter((p) => idByExternal.has(p.externalId));
    await Promise.all(
      fetched.map((p) =>
        updateSocialPost(idByExternal.get(p.externalId)!, {
          caption: p.caption,
          views: p.views,
          likes: p.likes,
          comments: p.comments,
          thumbnail_url: p.thumbnailUrl,
          permalink: p.permalink,
        }),
      ),
    );
    const doneDbIds = fetched.map((p) => idByExternal.get(p.externalId)!);
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
