import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabase, updateSocialPost, deleteSocialPost, type SocialPostWrite } from "@/lib/supabase";

const PLATFORMS = ["instagram", "tiktok", "cross"] as const;

function buildPatch(body: Record<string, unknown>): SocialPostWrite {
  const patch: SocialPostWrite = {};
  if (typeof body.topic === "string") patch.topic = body.topic.trim();
  if (typeof body.why_it_worked === "string") patch.why_it_worked = body.why_it_worked.trim();
  if ("permalink" in body)
    patch.permalink = typeof body.permalink === "string" && body.permalink.trim() ? body.permalink.trim() : null;
  if ("thumbnail_url" in body)
    patch.thumbnail_url =
      typeof body.thumbnail_url === "string" && body.thumbnail_url.trim() ? body.thumbnail_url.trim() : null;
  for (const key of ["views", "likes", "comments", "sort_order"] as const) {
    if (key in body) {
      const n = Number(body[key]);
      if (Number.isFinite(n) && n >= 0) patch[key] = Math.round(n);
    }
  }
  if (typeof body.is_featured === "boolean") patch.is_featured = body.is_featured;
  if (PLATFORMS.includes(body.platform as (typeof PLATFORMS)[number]))
    patch.platform = body.platform as (typeof PLATFORMS)[number];
  return patch;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  if (getSupabase() === null) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patch = buildPatch(body);
  const updated = await updateSocialPost(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Post not found or update failed" }, { status: 404 });
  }
  return NextResponse.json({ post: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  if (getSupabase() === null) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const ok = await deleteSocialPost(id);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
