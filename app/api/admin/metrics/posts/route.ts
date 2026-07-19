import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabase, createSocialPost, type SocialPostWrite } from "@/lib/supabase";

const PLATFORMS = ["instagram", "tiktok", "cross"] as const;

function toInt(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

function nonEmpty(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  if (getSupabase() === null) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const topic = nonEmpty(body.topic);
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }
  const platform = PLATFORMS.includes(body.platform as (typeof PLATFORMS)[number])
    ? (body.platform as (typeof PLATFORMS)[number])
    : "cross";

  const row: SocialPostWrite = {
    platform,
    topic,
    why_it_worked: nonEmpty(body.why_it_worked) ?? "",
    permalink: nonEmpty(body.permalink),
    thumbnail_url: nonEmpty(body.thumbnail_url),
    views: toInt(body.views),
    likes: toInt(body.likes),
    comments: toInt(body.comments),
    is_featured: body.is_featured === true,
    sort_order: toInt(body.sort_order),
  };

  const created = await createSocialPost(row);
  if (!created) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
  return NextResponse.json({ post: created });
}
