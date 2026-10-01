"use client";

import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type TouchEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Heart,
  Maximize2,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { PortfolioPost } from "@/lib/metrics/types";
import { formatCompact, cn } from "@/lib/utils";
import { clip, hasViews, platformName, postTitle } from "@/lib/portfolio";
import { PostMedia } from "./PostMedia";
import { PostLightbox } from "./PostLightbox";

const SWIPE_PX = 50;

/** Interactions per view, e.g. "2.2%". Null when views aren't known. */
function engagementRate(p: PortfolioPost): string | null {
  if (!hasViews(p)) return null;
  const interactions = p.likes + p.comments + (p.shares ?? 0) + (p.saves ?? 0);
  const pct = (interactions / p.views) * 100;
  return `${pct >= 10 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

/** Signed distance from the active slide, wrapping around (e.g. last slide is -1 from the first). */
function relativeOffset(i: number, index: number, count: number): number {
  let rel = (((i - index) % count) + count) % count;
  if (rel > count / 2) rel -= count;
  return rel;
}

/** Side slides sit behind the active one, scaled down and dimmed. */
const SLOT_STYLE: Record<number, CSSProperties> = {
  [-1]: { transform: "translateX(-56%) scale(0.82)", zIndex: 10 },
  [0]: { transform: "translateX(0) scale(1)", zIndex: 20 },
  [1]: { transform: "translateX(56%) scale(0.82)", zIndex: 10 },
};

/**
 * One-at-a-time showcase of portfolio posts. The neighbours peek out behind the
 * active slide (paused, dimmed, clickable); only the active video plays.
 * Navigable by clicking a neighbour, the arrows, swipe, and ←/→ keys. Clicking
 * the active video opens it near-full-screen (PostLightbox).
 */
export function PortfolioCarousel({
  posts,
  inquiryHref,
}: {
  posts: PortfolioPost[];
  inquiryHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchX = useRef<number | null>(null);

  const count = posts.length;
  const go = useCallback(
    (next: number) => {
      setIndex((next + count) % count);
      setExpanded(false);
    },
    [count],
  );

  if (count === 0) return null;
  const post = posts[index];
  const title = postTitle(post);
  const curated = post.whyItWorked?.trim();
  const why = curated || (post.caption?.trim() ? clip(post.caption, 320) : "");
  const longWhy = post.whyItWorkedLong?.trim();
  const rate = engagementRate(post);

  const stats: { icon: typeof Eye; label: string; value: string }[] = [];
  if (hasViews(post)) stats.push({ icon: Eye, label: "Views", value: formatCompact(post.views) });
  stats.push(
    { icon: Heart, label: "Likes", value: formatCompact(post.likes) },
    { icon: MessageCircle, label: "Comments", value: formatCompact(post.comments) },
  );
  if (post.shares != null) stats.push({ icon: Send, label: "Shares", value: formatCompact(post.shares) });
  if (post.saves != null) stats.push({ icon: Bookmark, label: "Saves", value: formatCompact(post.saves) });

  const onKeyDown = (e: KeyboardEvent) => {
    if (lightboxOpen) return; // the lightbox handles its own arrows
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    }
  };
  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? index + 1 : index - 1);
  };

  const arrow =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-secondary/50 hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio"
      onKeyDown={onKeyDown}
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)] lg:gap-12"
    >
      {/* ── Stage ── */}
      <div className="flex flex-col items-center gap-5">
        <div
          className="flex w-full justify-center overflow-x-clip py-1"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Positioning box = the active slide's footprint; neighbours overhang it. */}
          <div className="relative aspect-[9/16] w-[220px] sm:w-[280px]">
            {posts.map((p, i) => {
              const rel = relativeOffset(i, index, count);
              if (Math.abs(rel) > 1) return null;
              const active = rel === 0;
              return (
                <div
                  key={p.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!active}
                  style={SLOT_STYLE[rel]}
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-3xl border bg-muted/20 transition-[transform,filter,opacity] duration-500 ease-out animate-in fade-in",
                    active
                      ? "border-border shadow-2xl shadow-secondary/10"
                      : "border-border/50 opacity-60 brightness-50 grayscale-[.4]",
                  )}
                >
                  <PostMedia
                    post={p}
                    playing={active && !lightboxOpen}
                    muted={active ? muted : true}
                  />

                  {active ? (
                    <>
                      {p.videoUrl && (
                        <>
                          {/* Whole-video hit area → full-screen player. */}
                          <button
                            type="button"
                            onClick={() => setLightboxOpen(true)}
                            aria-label={`Play ${postTitle(p)} full screen`}
                            className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                          />
                          <span className="pointer-events-none absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm">
                            <Maximize2 className="h-4 w-4" aria-hidden />
                          </span>
                        </>
                      )}
                      {hasViews(p) && (
                        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                          {formatCompact(p.views)} views
                        </span>
                      )}
                      {p.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setMuted((m) => !m)}
                          aria-label={muted ? "Unmute video" : "Mute video"}
                          className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
                        >
                          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => go(index + rel)}
                      aria-label={`${rel < 0 ? "Previous" : "Next"} post: ${postTitle(p)}`}
                      className="absolute inset-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous post" className={arrow}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[4.5rem] text-center text-sm tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next post" className={arrow}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Details ── */}
      <div aria-live="polite" className="flex flex-col">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-secondary">
          {platformName(post.platform)} · Post {index + 1} of {count}
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>

        <dl className="mb-6 grid grid-cols-3 gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))]">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-3 py-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </dt>
              <dd className="mt-1 text-lg font-bold tabular-nums">{value}</dd>
            </div>
          ))}
          {rate && (
            <div className="rounded-xl border border-secondary/30 bg-secondary/5 px-3 py-3.5">
              <dt className="text-[11px] text-muted-foreground">Engagement</dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-secondary">{rate}</dd>
            </div>
          )}
        </dl>

        {why && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {curated ? "Why it worked" : "Caption"}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">{why}</p>
            {longWhy && (
              <>
                {expanded && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {longWhy}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className="mt-2 text-xs font-semibold text-secondary hover:underline"
                >
                  {expanded ? "Show less" : "Read the full breakdown"}
                </button>
              </>
            )}
          </div>
        )}

        <Link
          href={inquiryHref}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-lg shadow-secondary/20 transition-colors hover:bg-secondary/90 max-sm:self-stretch"
        >
          Request a campaign like this
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* Deliberately quiet: it takes the visitor off the page. */}
        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 self-start text-xs text-muted-foreground/70 transition-colors hover:text-muted-foreground max-sm:self-center"
          >
            Original post on {platformName(post.platform)}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>

      <PostLightbox
        posts={posts}
        index={index}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onNavigate={(delta) => go(index + delta)}
      />
    </div>
  );
}
