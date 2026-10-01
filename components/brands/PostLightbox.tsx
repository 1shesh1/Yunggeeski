"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bookmark, ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, Send, X } from "lucide-react";
import type { PortfolioPost } from "@/lib/metrics/types";
import { formatCompact } from "@/lib/utils";
import { hasViews, postTitle } from "@/lib/portfolio";

const SWIPE_PX = 50;

/** Plays with sound when the browser allows it (the open was a click), else falls back to muted. */
function LightboxVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
        Video unavailable
      </div>
    );
  }
  return (
    <video
      ref={ref}
      src={src}
      aria-label={label}
      controls
      loop
      playsInline
      className="h-full w-full bg-black object-contain"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Near-full-screen player for the active carousel post: the video with native
 * controls and sound, prev/next (buttons, swipe, ←/→), and a compact
 * icon-and-number metrics strip along the bottom.
 */
export function PostLightbox({
  posts,
  index,
  open,
  onOpenChange,
  onNavigate,
}: {
  posts: PortfolioPost[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (delta: -1 | 1) => void;
}) {
  const touchX = useRef<number | null>(null);
  const post = posts[index];
  if (!post) return null;
  const title = postTitle(post);
  const count = posts.length;

  const metrics: { icon: typeof Eye; label: string; value: number }[] = [];
  if (hasViews(post)) metrics.push({ icon: Eye, label: "views", value: post.views });
  metrics.push(
    { icon: Heart, label: "likes", value: post.likes },
    { icon: MessageCircle, label: "comments", value: post.comments },
  );
  if (post.shares != null) metrics.push({ icon: Send, label: "shares", value: post.shares });
  if (post.saves != null) metrics.push({ icon: Bookmark, label: "saves", value: post.saves });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onNavigate(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNavigate(1);
    }
  };
  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > SWIPE_PX) onNavigate(dx < 0 ? 1 : -1);
  };

  const navButton =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/95 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[100] flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 px-4 pb-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate text-sm font-semibold text-white">
                {title}
              </DialogPrimitive.Title>
              <p className="text-xs tabular-nums text-white/50">
                {index + 1} / {count}
              </p>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Stage */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {count > 1 && (
              <button type="button" onClick={() => onNavigate(-1)} aria-label="Previous post" className={`${navButton} left-3 sm:left-6`}>
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="aspect-[9/16] h-full max-h-full max-w-full overflow-hidden rounded-2xl">
              {post.videoUrl ? (
                <LightboxVideo key={post.id} src={post.videoUrl} label={title} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
                  Video unavailable
                </div>
              )}
            </div>
            {count > 1 && (
              <button type="button" onClick={() => onNavigate(1)} aria-label="Next post" className={`${navButton} right-3 sm:right-6`}>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Compact metrics */}
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 pt-4 text-sm text-white/80">
            {metrics.map(({ icon: Icon, label, value }) => (
              <li key={label} className="inline-flex items-center gap-1.5 tabular-nums">
                <Icon className="h-4 w-4 text-white/60" aria-hidden />
                {formatCompact(value)}
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ul>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
