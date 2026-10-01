/**
 * Display helpers for portfolio posts (landing-page grid + /portfolio carousel).
 *
 * Videos are self-hosted, not hotlinked: Instagram's CDN URLs are signed and
 * expire after a few weeks, which is what blanked the standout posts. Each
 * post's MP4 lives at a path derived from its permalink, so dropping a file in
 * place is all it takes to wire one up:
 *
 *   https://www.instagram.com/reel/DSU-Lp6jUqa/  ->  public/videos/portfolio/DSU-Lp6jUqa.mp4
 *   https://www.tiktok.com/@x/video/7311...      ->  public/videos/portfolio/7311....mp4
 *
 * A missing file 404s and the card falls back to the thumbnail / placeholder.
 */

import type { PortfolioPost } from "@/lib/metrics/types";

export const PORTFOLIO_VIDEO_DIR = "/videos/portfolio";

/** The platform's short ID for a post, parsed from its permalink. */
export function postShortcode(permalink: string | null | undefined): string | null {
  if (!permalink) return null;
  const ig = permalink.match(/instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (ig) return ig[1];
  const tt = permalink.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tt) return tt[1];
  return null;
}

/** Public path of a post's self-hosted video, or null when it has no permalink. */
export function portfolioVideoPath(permalink: string | null | undefined): string | null {
  const code = postShortcode(permalink);
  return code ? `${PORTFOLIO_VIDEO_DIR}/${code}.mp4` : null;
}

/** Captions run long — clip to a readable length on a word boundary. */
export function clip(text: string, max = 220): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Card heading. The curated topic wins; untitled API-synced posts fall back to
 * the first line of their caption so a card never renders a blank title.
 */
export function postTitle(post: Pick<PortfolioPost, "topic" | "caption">): string {
  const topic = post.topic?.trim();
  if (topic) return topic;
  const firstLine = post.caption
    ?.split("\n")
    .map((l) => l.trim())
    .find(Boolean);
  return firstLine ? clip(firstLine, 70) : "Featured chart";
}

export function platformName(platform: PortfolioPost["platform"]): string {
  return platform === "tiktok" ? "TikTok" : "Instagram";
}
