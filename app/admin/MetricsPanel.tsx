"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OverrideRow {
  total_followers: number | null;
  best_video_views: number | null;
  videos_above_threshold: number | null;
  notable_views_threshold: number | null;
  monthly_reach: number | null;
  category: string | null;
}

interface PostRow {
  id: string;
  platform: "instagram" | "tiktok" | "cross";
  topic: string;
  why_it_worked: string;
  why_it_worked_long: string | null;
  caption: string | null;
  views: number;
  likes: number;
  comments: number;
  permalink: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  sort_order: number;
}

const OVERRIDE_FIELDS: { key: keyof OverrideRow; label: string }[] = [
  { key: "total_followers", label: "Total followers" },
  { key: "best_video_views", label: "Best video views" },
  { key: "videos_above_threshold", label: "Videos above threshold" },
  { key: "notable_views_threshold", label: "Notable views threshold" },
  { key: "monthly_reach", label: "Monthly reach" },
];

const EMPTY_POST = {
  platform: "cross" as PostRow["platform"],
  topic: "",
  why_it_worked: "",
  why_it_worked_long: "",
  views: "",
  likes: "",
  comments: "",
  permalink: "",
  thumbnail_url: "",
  is_featured: false,
  sort_order: "0",
};

type PostForm = typeof EMPTY_POST;

/** Small thumbnail with a graceful fallback (IG CDN URLs can expire / 404). */
function PostThumb({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted/40 text-[10px] text-muted-foreground">
        —
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-12 w-12 shrink-0 rounded-md bg-muted object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function MetricsPanel() {
  const [loading, setLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const [override, setOverride] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [savingOverride, setSavingOverride] = useState(false);
  const [postForm, setPostForm] = useState<PostForm>(EMPTY_POST);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [savingPost, setSavingPost] = useState(false);
  const [sortBy, setSortBy] = useState<"curated" | "views">("curated");
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/metrics", { credentials: "include" });
    if (!res.ok) {
      setSupabaseConfigured(false);
      return;
    }
    const data = await res.json();
    setSupabaseConfigured(data.supabaseConfigured ?? false);
    setPosts(data.posts ?? []);
    const o: OverrideRow | null = data.override;
    setOverride({
      total_followers: o?.total_followers?.toString() ?? "",
      best_video_views: o?.best_video_views?.toString() ?? "",
      videos_above_threshold: o?.videos_above_threshold?.toString() ?? "",
      notable_views_threshold: o?.notable_views_threshold?.toString() ?? "",
      monthly_reach: o?.monthly_reach?.toString() ?? "",
      category: o?.category ?? "",
    });
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function saveOverride() {
    setSavingOverride(true);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(override),
      });
      if (res.ok) await load();
    } finally {
      setSavingOverride(false);
    }
  }

  function editPost(p: PostRow) {
    setEditingId(p.id);
    setPostError(null);
    setPostForm({
      platform: p.platform,
      topic: p.topic,
      why_it_worked: p.why_it_worked,
      why_it_worked_long: p.why_it_worked_long ?? "",
      views: String(p.views),
      likes: String(p.likes),
      comments: String(p.comments),
      permalink: p.permalink ?? "",
      thumbnail_url: p.thumbnail_url ?? "",
      is_featured: p.is_featured,
      sort_order: String(p.sort_order),
    });
  }

  function resetPostForm() {
    setEditingId(null);
    setPostForm(EMPTY_POST);
    setPostError(null);
  }

  async function savePost() {
    setPostError(null);
    if (!postForm.topic.trim()) {
      setPostError("Topic is required");
      return;
    }
    setSavingPost(true);
    try {
      const payload = {
        platform: postForm.platform,
        topic: postForm.topic,
        why_it_worked: postForm.why_it_worked,
        why_it_worked_long: postForm.why_it_worked_long,
        views: Number(postForm.views) || 0,
        likes: Number(postForm.likes) || 0,
        comments: Number(postForm.comments) || 0,
        permalink: postForm.permalink,
        thumbnail_url: postForm.thumbnail_url,
        is_featured: postForm.is_featured,
        sort_order: Number(postForm.sort_order) || 0,
      };
      const url = editingId ? `/api/admin/metrics/posts/${editingId}` : "/api/admin/metrics/posts";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPostError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      resetPostForm();
      await load();
    } finally {
      setSavingPost(false);
    }
  }

  async function toggleFeatured(p: PostRow) {
    await fetch(`/api/admin/metrics/posts/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ is_featured: !p.is_featured }),
    });
    await load();
  }

  async function deletePost(id: string) {
    await fetch(`/api/admin/metrics/posts/${id}`, { method: "DELETE", credentials: "include" });
    if (editingId === id) resetPostForm();
    await load();
  }

  async function backfill(phase: string): Promise<{ remaining: number; done: boolean; processed?: number; listed?: number } | null> {
    const res = await fetch(`/api/admin/metrics/backfill?phase=${phase}`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(typeof data.error === "string" ? data.error : "Backfill failed");
    }
    return res.json();
  }

  async function runBackfill() {
    setBackfilling(true);
    setBackfillMsg("Crawling your full post list…");
    try {
      const list = await backfill("list");
      setBackfillMsg(`Listed ${list?.listed ?? 0} posts. Fetching view counts for top posts…`);
      // Loop insights chunks until done or no progress (rate limit / nothing left).
      for (let i = 0; i < 40; i++) {
        const r = await backfill("insights");
        if (!r || r.done) {
          setBackfillMsg("Backfill complete. Sort by views to pick your top posts.");
          break;
        }
        if ((r.processed ?? 0) === 0) {
          setBackfillMsg(`Paused at ${r.remaining} remaining (likely rate-limited). Run again later to continue.`);
          break;
        }
        setBackfillMsg(`Fetching view counts… ${r.remaining} remaining`);
        await new Promise((res) => setTimeout(res, 1500));
      }
      setSortBy("views");
      await load();
    } catch (e) {
      setBackfillMsg(e instanceof Error ? e.message : "Backfill failed");
    } finally {
      setBackfilling(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  const featuredCount = posts.filter((p) => p.is_featured).length;
  const sortedPosts =
    sortBy === "views" ? [...posts].sort((a, b) => b.views - a.views) : posts;

  return (
    <div className="space-y-8">
      {!supabaseConfigured && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Supabase is not configured, so live metrics can&apos;t be managed here. The sponsor page
          is showing fixture data. Set the Supabase env vars to enable snapshots, overrides, and
          featured-post curation.
        </div>
      )}

      {/* Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Headline overrides</CardTitle>
          <p className="text-sm text-muted-foreground">
            Any value set here wins over live/snapshot data on /brands. Leave blank to use the
            computed value. Use when a platform is down or a figure can&apos;t be pulled via API.
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Best video views</span> and{" "}
            <span className="font-medium text-foreground">videos above threshold</span> are treated
            as a floor: set your verified all-time numbers and the daily sync raises them
            automatically as new posts beat them.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OVERRIDE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={`ov-${key}`}>{label}</Label>
                <Input
                  id={`ov-${key}`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="computed"
                  value={override[key] ?? ""}
                  onChange={(e) => setOverride((o) => ({ ...o, [key]: e.target.value }))}
                  className="mt-1"
                  disabled={!supabaseConfigured}
                />
              </div>
            ))}
            <div>
              <Label htmlFor="ov-category">Category</Label>
              <Input
                id="ov-category"
                placeholder="computed"
                value={override.category ?? ""}
                onChange={(e) => setOverride((o) => ({ ...o, category: e.target.value }))}
                className="mt-1"
                disabled={!supabaseConfigured}
              />
            </div>
          </div>
          <Button onClick={saveOverride} disabled={savingOverride || !supabaseConfigured}>
            {savingOverride ? "Saving…" : "Save overrides"}
          </Button>
        </CardContent>
      </Card>

      {/* Post editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{editingId ? "Edit post" : "Add post"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Featured posts appear on /brands, ordered by sort order. {featuredCount} featured.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-topic">Topic *</Label>
              <Input
                id="p-topic"
                value={postForm.topic}
                onChange={(e) => setPostForm((f) => ({ ...f, topic: e.target.value }))}
                className="mt-1"
                disabled={!supabaseConfigured}
              />
            </div>
            <div>
              <Label htmlFor="p-platform">Platform</Label>
              <Select
                value={postForm.platform}
                onValueChange={(v) => setPostForm((f) => ({ ...f, platform: v as PostRow["platform"] }))}
              >
                <SelectTrigger id="p-platform" className="mt-1" disabled={!supabaseConfigured}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cross">Cross-platform</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="p-why">Why it worked — short hook</Label>
            <Input
              id="p-why"
              value={postForm.why_it_worked}
              onChange={(e) => setPostForm((f) => ({ ...f, why_it_worked: e.target.value }))}
              className="mt-1"
              placeholder="1–2 sentences, shown on the card"
              disabled={!supabaseConfigured}
            />
          </div>
          <div>
            <Label htmlFor="p-why-long">Why it worked — full analysis (optional)</Label>
            <textarea
              id="p-why-long"
              value={postForm.why_it_worked_long}
              onChange={(e) => setPostForm((f) => ({ ...f, why_it_worked_long: e.target.value }))}
              rows={6}
              placeholder="Long-form write-up. When set, the card becomes clickable and opens this in a modal."
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!supabaseConfigured}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["views", "likes", "comments"] as const).map((k) => (
              <div key={k}>
                <Label htmlFor={`p-${k}`} className="capitalize">
                  {k}
                </Label>
                <Input
                  id={`p-${k}`}
                  type="number"
                  min={0}
                  value={postForm[k]}
                  onChange={(e) => setPostForm((f) => ({ ...f, [k]: e.target.value }))}
                  className="mt-1"
                  disabled={!supabaseConfigured}
                />
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-permalink">Permalink</Label>
              <Input
                id="p-permalink"
                value={postForm.permalink}
                onChange={(e) => setPostForm((f) => ({ ...f, permalink: e.target.value }))}
                className="mt-1"
                disabled={!supabaseConfigured}
              />
            </div>
            <div>
              <Label htmlFor="p-thumb">Thumbnail URL</Label>
              <Input
                id="p-thumb"
                value={postForm.thumbnail_url}
                onChange={(e) => setPostForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
                className="mt-1"
                disabled={!supabaseConfigured}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={postForm.is_featured}
                onCheckedChange={(c) => setPostForm((f) => ({ ...f, is_featured: c === true }))}
                disabled={!supabaseConfigured}
              />
              Featured on /brands
            </label>
            <div className="flex items-center gap-2">
              <Label htmlFor="p-sort" className="text-sm">
                Sort order
              </Label>
              <Input
                id="p-sort"
                type="number"
                value={postForm.sort_order}
                onChange={(e) => setPostForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="w-20"
                disabled={!supabaseConfigured}
              />
            </div>
          </div>
          {postError && <p className="text-sm text-destructive">{postError}</p>}
          <div className="flex gap-2">
            <Button onClick={savePost} disabled={savingPost || !supabaseConfigured}>
              {savingPost ? "Saving…" : editingId ? "Save changes" : "Add post"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetPostForm} disabled={savingPost}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post list */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">All posts ({posts.length})</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "curated" | "views")}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curated">Featured first</SelectItem>
                <SelectItem value="views">Most views</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={runBackfill}
              disabled={backfilling || !supabaseConfigured}
            >
              {backfilling ? "Syncing…" : "Sync full history"}
            </Button>
          </div>
        </div>
        {backfillMsg && <p className="text-xs text-muted-foreground">{backfillMsg}</p>}
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          sortedPosts.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
            >
              <PostThumb src={p.thumbnail_url} />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox checked={p.is_featured} onCheckedChange={() => toggleFeatured(p)} />
                Featured
              </label>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {p.topic || p.caption || "(untitled)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.platform} · {p.views.toLocaleString()} views · {p.likes.toLocaleString()} likes ·
                  sort {p.sort_order}
                </p>
              </div>
              {p.permalink && (
                <a
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-secondary hover:underline"
                >
                  View ↗
                </a>
              )}
              <Button variant="ghost" size="sm" onClick={() => editPost(p)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => deletePost(p.id)}
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
