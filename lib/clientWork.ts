/**
 * Client work shown on /portfolio: the Investing & Retirement case study and
 * client testimonials.
 *
 * Unlike the Delta Options campaign (lib/sponsorship.ts), I&R content is
 * produced for and published on the client's own account — these views are
 * client-channel views and must never be added to Yung Geeski's own-channel
 * totals.
 */

import type { PortfolioPost } from "@/lib/metrics/types";
import { portfolioVideoPath, postShortcode } from "@/lib/portfolio";

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * Totals from the I&R analytics export (ir_client_performance_46_posts.csv),
 * summed across 46 Instagram posts. Declared once so every card and sentence
 * below reads from the same numbers.
 */
export const IR_METRICS = {
  posts: 46,
  views: 5_504_903,
  interactions: 294_683,
  shares: 142_991,
  saves: 32_340,
  avgViews: 119_672,
  medianViews: 30_672,
  /** View-weighted share of views from non-followers (92.98%). */
  nonFollowerViewsPct: 93,
  followersGenerated: 2_128,
  topPostViews: 842_705,
} as const;

/** Headline totals, rounded down for display ("5.5M+", "294K+"). */
export const IR_TOTAL_VIEWS = "5.5M+";
export const IR_TOTAL_INTERACTIONS = "294K+";

/** An I&R post: a collab published on both the I&R and Yung Geeski accounts. */
function irPost(
  permalink: string,
  topic: string,
  m: { views: number; likes: number; comments: number; saves: number; shares: number },
  caption: string | null = null,
): PortfolioPost {
  return {
    id: postShortcode(permalink) ?? permalink,
    platform: "instagram",
    topic,
    whyItWorked: "",
    caption,
    ...m,
    permalink,
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath(permalink),
  };
}

/** The three strongest I&R posts by views. Figures from the CSV export. */
const IR_GALLERY: PortfolioPost[] = [
  irPost(
    "https://www.instagram.com/yunggeeski_/reel/Dan_j4YuN1d/",
    "The Real Cost of Turning It Down",
    { views: 842_705, likes: 56_547, comments: 319, saves: 3_539, shares: 75_109 },
  ),
  irPost(
    "https://www.instagram.com/yunggeeski_/reel/DYp1bjiucin/",
    "Which Zodiac Sign Beats the Market?",
    { views: 837_168, likes: 10_155, comments: 457, saves: 5_147, shares: 10_238 },
    "Which zodiac sign beats the market? I split every S&P 500 trading day since 1928 into its zodiac season, then tracked the cumulative return earned only during each sign.",
  ),
  irPost(
    "https://www.instagram.com/yunggeeski_/reel/DYXzhMvO3qn/",
    "Does the Moon Affect Stocks?",
    { views: 435_246, likes: 9_767, comments: 345, saves: 4_374, shares: 12_057 },
    "Does the moon affect stocks? I split every S&P 500 trading day since 1928 into one of the eight moon phases, then tracked the cumulative return earned only during each phase.",
  ),
];

/**
 * Shortcodes of I&R collab posts that also sit on the Yung Geeski account.
 * Their views belong to the client total, so they are excluded from any
 * own-channel figure to avoid counting the same views twice. Includes the
 * pinned portfolio posts matched to the CSV by title and engagement.
 */
export const IR_COLLAB_SHORTCODES: ReadonlySet<string> = new Set([
  ...IR_GALLERY.map((p) => p.id),
  "DdXGAx1OPjr", // Does the Zodiac Affect Stocks?
  "DdFEWy_uZkb", // Should You Ever Move Out of Your Parents' House?
  "DXhukpDj_fj", // Which Day of the Week Generates the Most Returns?
]);

export interface StatCard {
  label: string;
  value: string;
}

export interface ClientCaseStudy {
  client: string;
  /** Logo path in /public. Single-colour art, rendered reversed (white) on the dark page. */
  logo: string;
  summary: string;
  /** Large headline cards. */
  headline: StatCard[];
  /** Smaller supporting cards. */
  supporting: StatCard[];
  /** Platform and volume the numbers cover. */
  resultsScope: string;
  /**
   * The strongest posts, rendered with PortfolioCard. Each post's video is
   * self-hosted at the path derived from its permalink (see lib/portfolio.ts).
   * The gallery is hidden while this is empty.
   */
  gallery: PortfolioPost[];
}

export const IR_CASE_STUDY: ClientCaseStudy = {
  client: "Investing & Retirement",
  logo: "/images/brands/investing-and-retirement.png",
  summary:
    "An ongoing content partnership with Investing & Retirement, producing animated financial visualizations that make complex investing concepts accessible to everyday audiences. Across 46 Instagram posts, the content has generated over 5.5 million views, 294,000 interactions, and 142,000 shares. Approximately 93% of views came from non-followers, demonstrating the content's ability to reach new audiences.",
  headline: [
    { label: "Total views", value: IR_TOTAL_VIEWS },
    { label: "Interactions", value: IR_TOTAL_INTERACTIONS },
    { label: "Shares", value: fmt(IR_METRICS.shares) },
    { label: "Views from non-followers", value: `~${IR_METRICS.nonFollowerViewsPct}%` },
  ],
  supporting: [
    { label: "Posts produced", value: String(IR_METRICS.posts) },
    { label: "Average views per post", value: fmt(IR_METRICS.avgViews) },
    { label: "Median views per post", value: fmt(IR_METRICS.medianViews) },
    { label: "Saves", value: fmt(IR_METRICS.saves) },
    { label: "Followers generated", value: fmt(IR_METRICS.followersGenerated) },
    { label: "Top post", value: `${fmt(IR_METRICS.topPostViews)} views` },
  ],
  resultsScope: "Instagram metrics on the Investing & Retirement account, across 46 posts.",
  gallery: IR_GALLERY,
};

export interface Testimonial {
  /** Verbatim — never paraphrase or tidy a client's words. */
  quote: string;
  name: string;
  title: string;
  company: string;
  logo?: string | null;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The best in the biz!",
    name: "Michael Hewitt",
    title: "Founder",
    company: "Investing & Retirement",
    logo: IR_CASE_STUDY.logo,
  },
];
