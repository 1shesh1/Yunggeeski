"use client";

import { useState } from "react";
import { BarChart3, Heart, MessageCircle, Eye, Info } from "lucide-react";
import type { PortfolioPost } from "@/lib/metrics/types";
import { formatCompact, cn } from "@/lib/utils";

/**
 * A single featured post in the performance grid: thumbnail, view/like/comment
 * stats, and a "why it worked" overlay revealed on hover (desktop) or tap
 * (mobile). Falls back to a branded placeholder when no thumbnail asset is
 * wired yet (mirrors VideoPlayer).
 */
export function PortfolioCard({ post }: { post: PortfolioPost }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const thumb = post.thumbnailUrl;
  const showImage = thumb && !imgFailed;
  const hasWhy = Boolean(post.whyItWorked?.trim());

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div
        className="group relative aspect-[4/5] overflow-hidden bg-muted/20"
        onMouseLeave={() => setShowWhy(false)}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={post.topic}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/10 to-transparent px-4 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15">
              <BarChart3 className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-sm font-semibold leading-snug">{post.topic}</p>
          </div>
        )}

        <div className="absolute left-3 top-3 z-30 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {formatCompact(post.views)} views
        </div>

        {hasWhy && (
          <>
            {/* Why-it-worked overlay: hover on desktop, tap on mobile. */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/85 p-5 text-center backdrop-blur-[2px] transition-opacity duration-200",
                showWhy ? "opacity-100" : "opacity-0 md:group-hover:opacity-100",
              )}
            >
              <p className="text-sm leading-relaxed text-white">{post.whyItWorked}</p>
            </div>

            {/* Affordance so it's discoverable; hides once the overlay is up. */}
            <span
              className={cn(
                "pointer-events-none absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition-opacity",
                showWhy ? "opacity-0" : "opacity-100 md:group-hover:opacity-0",
              )}
            >
              <Info className="h-3 w-3" aria-hidden />
              Why it worked
            </span>

            {/* Transparent hit area on top — keeps the whole thumbnail tappable
                and keyboard-operable without wrapping the image in a button. */}
            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              aria-expanded={showWhy}
              aria-label={
                showWhy ? `Hide why ${post.topic} worked` : `Show why ${post.topic} worked`
              }
              className="absolute inset-0 z-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
            />
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold leading-snug">{post.topic}</h3>
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
      </div>
    </article>
  );
}
