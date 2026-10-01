"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import type { PortfolioPost } from "@/lib/metrics/types";
import { postTitle } from "@/lib/portfolio";
import { PostVideo } from "./PostVideo";

/**
 * The visual for a portfolio post, degrading in order: self-hosted video →
 * thumbnail image → branded placeholder. Each step falls through on a load
 * error, so a missing video file or an expired CDN thumbnail never shows a
 * broken frame.
 */
export function PostMedia({
  post,
  playing,
  muted,
}: {
  post: PortfolioPost;
  playing?: boolean;
  muted?: boolean;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const title = postTitle(post);

  if (post.videoUrl && !videoFailed) {
    return (
      <PostVideo
        src={post.videoUrl}
        label={title}
        playing={playing}
        muted={muted}
        onError={() => setVideoFailed(true)}
      />
    );
  }

  if (post.thumbnailUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.thumbnailUrl}
        alt={title}
        className="h-full w-full object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/10 to-transparent px-4 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15">
        <BarChart3 className="h-5 w-5 text-secondary" />
      </div>
      <p className="text-sm font-semibold leading-snug">{title}</p>
    </div>
  );
}
