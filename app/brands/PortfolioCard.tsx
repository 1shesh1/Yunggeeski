"use client";

import { useState } from "react";
import { BarChart3, Heart, MessageCircle, Eye } from "lucide-react";
import type { PortfolioPost } from "@/lib/metrics/types";
import { formatCompact } from "@/lib/utils";

/**
 * A single featured post in the performance grid: thumbnail, view/like/comment
 * stats, topic, and a one-line "why it worked." Falls back to a branded
 * placeholder when no thumbnail asset is wired yet (mirrors VideoPlayer).
 */
export function PortfolioCard({ post }: { post: PortfolioPost }) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = post.thumbnailUrl;
  const showImage = thumb && !imgFailed;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
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
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {formatCompact(post.views)} views
        </div>
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
        <p className="mt-auto text-xs leading-relaxed text-muted-foreground">
          {post.whyItWorked}
        </p>
      </div>
    </article>
  );
}
