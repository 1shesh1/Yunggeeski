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

/** False when a post's view count isn't known (e.g. pinned posts with no synced insights). */
export function hasViews(post: Pick<PortfolioPost, "views">): boolean {
  return post.views > 0;
}

/**
 * Posts shown on /portfolio after the admin-featured ones, without needing a
 * DB row. Newer reels may not be synced yet (and untitled synced rows are hard
 * to find in /admin), so these are pinned here. If a matching row exists in the
 * DB its live metrics win; these figures are the fallback. Instagram doesn't
 * expose view counts publicly — `views: 0` means "not known" and hides the
 * views badge and engagement rate. Likes/comments as of Oct 1, 2026.
 */
export const PINNED_PORTFOLIO: PortfolioPost[] = [
  {
    id: "DdXGAx1OPjr",
    platform: "instagram",
    topic: "Does the Zodiac Affect Stocks?",
    whyItWorked:
      "A playful premise backed by 97 years of S&P 500 data. Every viewer has a sign, so every viewer had a stake in the ranking — and an 8x gap between Capricorn and Virgo gave them something to argue about.",
    caption: "Apparently the stock market has a favorite zodiac sign.",
    views: 0,
    likes: 8_320,
    comments: 365,
    permalink: "https://www.instagram.com/reel/DdXGAx1OPjr/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DdXGAx1OPjr/"),
  },
  {
    id: "DdFEWy_uZkb",
    platform: "instagram",
    topic: "Should You Ever Move Out of Your Parents' House?",
    whyItWorked:
      "Priced the most relatable money decision of early adulthood over 30 years. One starting balance, four paths, and a $2.69M-to-negative spread that challenged the idea that buying is always the smart move.",
    caption: "What if moving out of your parents’ house cost you millions?",
    views: 0,
    likes: 2_242,
    comments: 102,
    permalink: "https://www.instagram.com/reel/DdFEWy_uZkb/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DdFEWy_uZkb/"),
  },
  {
    id: "DXhukpDj_fj",
    platform: "instagram",
    topic: "Which Day of the Week Drives Stock Returns?",
    whyItWorked:
      "Split the S&P 500 into five weekday-only strategies and let them race. The lopsided result — Tuesday far ahead, Thursday barely contributing — upended the assumption that returns are spread evenly across the week.",
    caption: "Which day of the week actually drives stock market returns?",
    views: 0,
    likes: 5_983,
    comments: 117,
    permalink: "https://www.instagram.com/reel/DXhukpDj_fj/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DXhukpDj_fj/"),
  },
];
