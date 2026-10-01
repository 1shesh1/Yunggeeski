"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { PortfolioPost } from "@/lib/metrics/types";
import { formatCompact, cn } from "@/lib/utils";
import { clip, platformName, postTitle } from "@/lib/portfolio";
import { PostMedia } from "./PostMedia";

const SWIPE_PX = 50;

/** Interactions per view, e.g. "2.2%". Null when there are no views to divide by. */
function engagementRate(p: PortfolioPost): string | null {
  if (!p.views) return null;
  const interactions = p.likes + p.comments + (p.shares ?? 0) + (p.saves ?? 0);
  const pct = (interactions / p.views) * 100;
  return `${pct >= 10 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

/**
 * One-at-a-time showcase of featured posts. Only the active slide's video is
 * mounted, so exactly one plays. Navigable by arrows, the index rail, swipe,
 * and ←/→ keys.
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
  const touchX = useRef<number | null>(null);
  const railRef = useRef<HTMLOListElement>(null);

  const count = posts.length;
  const go = useCallback(
    (next: number) => {
      const i = (next + count) % count;
      setIndex(i);
      setExpanded(false);
      // Keep the active rail item in view without scrolling the page.
      const rail = railRef.current;
      const item = rail?.children[i] as HTMLElement | undefined;
      if (rail && item) {
        rail.scrollTo({ left: item.offsetLeft - rail.clientWidth / 2 + item.clientWidth / 2, behavior: "smooth" });
      }
    },
    [count],
  );

  if (count === 0) return null;
  const post = posts[index];
  const title = postTitle(post);
  const why = post.whyItWorked?.trim() || (post.caption?.trim() ? clip(post.caption, 320) : "");
  const longWhy = post.whyItWorkedLong?.trim();
  const rate = engagementRate(post);

  const stats: { icon: typeof Eye; label: string; value: string }[] = [
    { icon: Eye, label: "Views", value: formatCompact(post.views) },
    { icon: Heart, label: "Likes", value: formatCompact(post.likes) },
    { icon: MessageCircle, label: "Comments", value: formatCompact(post.comments) },
  ];
  if (post.shares != null) stats.push({ icon: Send, label: "Shares", value: formatCompact(post.shares) });
  if (post.saves != null) stats.push({ icon: Bookmark, label: "Saves", value: formatCompact(post.saves) });

  const onKeyDown = (e: KeyboardEvent) => {
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
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/90 text-foreground backdrop-blur transition-colors hover:border-secondary/50 hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio"
      onKeyDown={onKeyDown}
      className="flex flex-col gap-8"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-14">
        {/* ── Stage ── */}
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous post" className={cn(arrow, "hidden sm:flex")}>
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className="relative aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-3xl border border-border bg-muted/20 shadow-2xl shadow-secondary/10"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Keyed so each slide mounts fresh and only one video exists at a time. */}
            <PostMedia key={post.id} post={post} playing muted={muted} />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {formatCompact(post.views)} views
              </span>
            </div>

            {post.videoUrl && (
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
          </div>

          <button type="button" onClick={() => go(index + 1)} aria-label="Next post" className={cn(arrow, "hidden sm:flex")}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile arrows sit under the stage so they never cover the video. */}
        <div className="-mt-4 flex items-center justify-center gap-4 sm:hidden">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous post" className={arrow}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs tabular-nums text-muted-foreground">Swipe or tap to browse</span>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next post" className={arrow}>
            <ChevronRight className="h-5 w-5" />
          </button>
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
                Why it worked
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={inquiryHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-lg shadow-secondary/20 transition-colors hover:bg-secondary/90"
            >
              Request a campaign like this
              <ArrowRight className="h-4 w-4" />
            </Link>
            {post.permalink && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted/50"
              >
                View on {platformName(post.platform)}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Index rail ── */}
      <ol
        ref={railRef}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0"
        aria-label="Choose a post"
      >
        {posts.map((p, i) => (
          <li key={p.id} className="snap-start">
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? "true" : undefined}
              aria-label={`Show post ${i + 1}: ${postTitle(p)}`}
              className={cn(
                "flex w-44 flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors",
                i === index
                  ? "border-secondary bg-secondary/10"
                  : "border-border bg-card hover:border-secondary/40",
              )}
            >
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="line-clamp-1 text-sm font-semibold">{postTitle(p)}</span>
              <span className="text-xs text-secondary">{formatCompact(p.views)} views</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
