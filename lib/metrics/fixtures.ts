/**
 * Provisional metrics fixtures for the landing page and /portfolio.
 *
 * These are the numbers from the campaign brief. They are shown with a
 * "provisional" provenance note until issue #4 replaces this module with a
 * live, cached TikTok + Instagram feed. Verify every figure against current
 * platform insights before treating it as public-facing truth.
 */

import type { AccountMetrics, Platform, PortfolioPost } from "./types";
import { portfolioVideoPath } from "@/lib/portfolio";

/**
 * Platforms the fallback figures represent. Only Instagram is synced today, so
 * the page attributes the numbers to Instagram alone. Once TikTok snapshots
 * start landing, the live path derives this from the snapshots themselves and
 * the attribution updates without a copy change.
 */
export const FALLBACK_PLATFORMS: Platform[] = ["instagram"];

export const FALLBACK_ACCOUNT_METRICS: AccountMetrics = {
  totalFollowers: 60_000,
  followersByPlatform: { instagram: 60_000 },
  bestVideoViews: 7_400_000,
  videosAboveThreshold: 7,
  notableViewsThreshold: 4_000_000,
  monthlyReach: 21_000_000,
  category: "Finance & business",
};

/**
 * The six featured Instagram posts as of the Jul 19, 2026 sync. Shown when the
 * DB is unreachable or empty (including local dev), so the fallback is the real
 * portfolio — titles left blank here are blank in the DB too (see postTitle).
 */
export const FALLBACK_PORTFOLIO: PortfolioPost[] = [
  {
    id: "DSU-Lp6jUqa",
    platform: "instagram",
    topic: "Pelosi vs Buffett",
    whyItWorked: "Congressional trading controversy measured against the most recognizable benchmark in investing. The moving-line format made viewers watch to the finish — and the fairness debate drove the comments.",
    whyItWorkedLong:
      "The post combined several high-interest subjects in one simple comparison: politics, wealth, alleged congressional trading advantages, Warren Buffett, and stock-market returns. Pelosi’s trading activity already generates strong public curiosity and controversy, while Buffett provides an instantly recognizable benchmark. The moving-line format created suspense because viewers had to continue watching to see who finished ahead. The result was also easy to understand without specialized financial knowledge, making it accessible to both finance and general-interest audiences. The subject encouraged debate over congressional stock trading, data methodology, fairness, disclosure timing, and whether Pelosi’s performance is accurately characterized. That controversy likely increased comments, shares, replays, and non-follower distribution.",
    views: 7_645_695,
    likes: 162_052,
    comments: 3_138,
    permalink: "https://www.instagram.com/reel/DSU-Lp6jUqa/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DSU-Lp6jUqa/"),
  },
  {
    id: "DV6P8a2jY43",
    platform: "instagram",
    topic: "Real Cost of Takeout",
    whyItWorked: "Everyone buys takeout; nobody prices it in decades. Watching the compound cost separate over time turned a familiar purchase into an uncomfortable — and very shareable — realization.",
    whyItWorkedLong:
      "The subject is immediately relatable because takeout is a common expense across income levels and age groups. The chart created a strong curiosity gap by asking viewers to consider the hidden future cost of a familiar purchase rather than only its menu price. The moving-line format made compound growth visible over time, producing an increasingly large separation that encouraged viewers to watch through the ending. The topic also generated natural debate because viewers could compare the assumptions against their own spending habits, takeout frequency, food costs, investment returns, time value, and quality-of-life preferences. It combined personal finance education with a mildly uncomfortable behavioral insight, which made it highly shareable without requiring advanced financial knowledge.",
    views: 6_752_229,
    likes: 89_248,
    comments: 1_086,
    permalink: "https://www.instagram.com/reel/DV6P8a2jY43/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DV6P8a2jY43/"),
  },
  {
    id: "DUPL9DdDezI",
    platform: "instagram",
    topic: "Inflation vs. everyday costs",
    whyItWorked: "Official inflation says one thing, the grocery bill says another. Charting the gap category by category validated what people already felt, and reopened the argument over how inflation is measured.",
    whyItWorkedLong:
      "The topic addressed a widespread frustration: people regularly hear that inflation is slowing while still seeing major increases in housing, food, transportation, insurance, and other everyday costs. The title immediately created tension between official economic statistics and personal experience. The moving-line format made those differences easy to compare over time and revealed which areas experienced the largest cumulative price increases. The subject was understandable without technical economic knowledge and invited viewers to compare the chart with their own location and spending patterns. It also encouraged debate about how inflation is measured, whether national averages are useful, and why different households can experience materially different cost increases. That combination of economic relevance, personal impact, and disagreement likely increased comments, shares, saves, and repeat viewing.",
    views: 6_173_367,
    likes: 113_108,
    comments: 1_671,
    permalink: "https://www.instagram.com/reel/DUPL9DdDezI/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DUPL9DdDezI/"),
  },
  {
    id: "DZXvjU4RQzy",
    platform: "instagram",
    topic: "",
    whyItWorked: "",
    views: 1_602_195,
    likes: 25_407,
    comments: 438,
    permalink: "https://www.instagram.com/reel/DZXvjU4RQzy/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DZXvjU4RQzy/"),
  },
  {
    id: "DYXzhMvO3qn",
    platform: "instagram",
    topic: "",
    whyItWorked: "",
    views: 415_462,
    likes: 9_392,
    comments: 334,
    permalink: "https://www.instagram.com/reel/DYXzhMvO3qn/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/DYXzhMvO3qn/"),
  },
  {
    id: "Davz1BquTR2",
    platform: "instagram",
    topic: "",
    whyItWorked: "",
    views: 163_457,
    likes: 1_752,
    comments: 220,
    saves: 1_113,
    permalink: "https://www.instagram.com/reel/Davz1BquTR2/",
    thumbnailUrl: null,
    videoUrl: portfolioVideoPath("https://www.instagram.com/reel/Davz1BquTR2/"),
  },
];
