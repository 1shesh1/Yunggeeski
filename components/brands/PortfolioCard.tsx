"use client";

import { useState } from "react";
import { Heart, MessageCircle, Eye, Info, ExternalLink, ArrowRight } from "lucide-react";
import type { PortfolioPost } from "@/lib/metrics/types";
import { formatCompact, cn } from "@/lib/utils";
import { clip, platformName, postTitle } from "@/lib/portfolio";
import { PostMedia } from "./PostMedia";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * A single featured post in the performance grid: the post's video (playing
 * only while on screen), view/like/comment stats, and an overlay revealed on
 * hover (desktop) or tap (mobile). The overlay shows the curated "why it
 * worked" copy, falling back to the post's own caption when none has been
 * written. Media degrades video → thumbnail → placeholder (see PostMedia).
 */
export function PortfolioCard({ post }: { post: PortfolioPost }) {
  const [showWhy, setShowWhy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const title = postTitle(post);

  // Curated copy wins; otherwise fall back to the post's own caption.
  const curated = post.whyItWorked?.trim();
  const overlayText = curated || (post.caption?.trim() ? clip(post.caption) : "");
  const hasWhy = Boolean(overlayText);
  const label = title;

  // Long-form analysis opens in a modal; the card only ever shows the hook.
  const longText = post.whyItWorkedLong?.trim();
  const hasLong = Boolean(longText);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div
        className="group relative aspect-[9/16] overflow-hidden bg-muted/20"
        onMouseLeave={() => setShowWhy(false)}
      >
        <PostMedia post={post} />

        <div className="absolute left-3 top-3 z-30 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {formatCompact(post.views)} views
        </div>

        {hasWhy && (
          <>
            {/* Why-it-worked overlay: hover on desktop, tap on mobile. */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/85 p-5 text-center backdrop-blur-[2px] transition-opacity duration-200",
                showWhy ? "opacity-100" : "opacity-0 md:group-hover:opacity-100",
              )}
            >
              <p className="line-clamp-[8] text-sm leading-relaxed text-white">{overlayText}</p>
              {hasLong && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                  Read the full breakdown
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
            </div>

            {/* Affordance so it's discoverable; hides once the overlay is up. */}
            <span
              className={cn(
                "pointer-events-none absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition-opacity",
                showWhy ? "opacity-0" : "opacity-100 md:group-hover:opacity-0",
              )}
            >
              <Info className="h-3 w-3" aria-hidden />
              {curated ? "Why it worked" : "Caption"}
            </span>

            {/* Transparent hit area on top — keeps the whole thumbnail tappable
                and keyboard-operable without wrapping the image in a button. */}
            <button
              type="button"
              onClick={() => (hasLong ? setModalOpen(true) : setShowWhy((v) => !v))}
              aria-expanded={showWhy}
              aria-label={
                hasLong
                  ? `Read the full analysis for ${label}`
                  : showWhy
                    ? `Hide details for ${label}`
                    : `Show details for ${label}`
              }
              className="absolute inset-0 z-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
            />
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold leading-snug">{title}</h3>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              {formatCompact(post.views)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden />
              {formatCompact(post.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {formatCompact(post.comments)}
            </span>
          </div>
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${label} on ${platformName(post.platform)}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
            >
              View post
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
        </div>
      </div>

      {hasLong && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-left text-lg">{title}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {formatCompact(post.views)} views
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" aria-hidden />
                {formatCompact(post.likes)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                {formatCompact(post.comments)}
              </span>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {longText}
            </p>

            {post.permalink && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
              >
                View the post
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </DialogContent>
        </Dialog>
      )}
    </article>
  );
}
