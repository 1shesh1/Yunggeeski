/**
 * Provisional metrics fixtures for the /brands sponsor page.
 *
 * These are the numbers from the campaign brief. They are shown with a
 * "provisional" provenance note until issue #4 replaces this module with a
 * live, cached TikTok + Instagram feed. Verify every figure against current
 * platform insights before treating it as public-facing truth.
 */

import type { AccountMetrics, PortfolioPost } from "./types";

export const FALLBACK_ACCOUNT_METRICS: AccountMetrics = {
  totalFollowers: 60_000,
  bestVideoViews: 7_400_000,
  videosAboveThreshold: 7,
  notableViewsThreshold: 4_000_000,
  monthlyReach: 21_000_000,
  category: "Finance & business",
};

export const FALLBACK_PORTFOLIO: PortfolioPost[] = [
  {
    id: "pelosi-vs-buffett",
    platform: "cross",
    topic: "Pelosi vs Buffett",
    whyItWorked:
      "A familiar-name matchup turned a returns comparison into a story people wanted to settle.",
    views: 7_400_000,
    likes: 512_000,
    comments: 18_400,
    thumbnailUrl: null,
  },
  {
    id: "real-cost-of-takeout",
    platform: "cross",
    topic: "Real Cost of Takeout",
    whyItWorked:
      "Reframed an everyday habit as a decades-long compounding decision — instantly personal.",
    views: 5_100_000,
    likes: 388_000,
    comments: 12_900,
    thumbnailUrl: null,
  },
  {
    id: "doctor-wealth-illusion",
    platform: "cross",
    topic: "Doctor Wealth Illusion",
    whyItWorked:
      "Challenged a status assumption (high income ≠ wealth) that viewers felt compelled to debate.",
    views: 4_600_000,
    likes: 305_000,
    comments: 9_700,
    thumbnailUrl: null,
  },
  {
    id: "mortgage-illusion",
    platform: "cross",
    topic: "Mortgage Illusion",
    whyItWorked:
      "Exposed how little early payments touch principal — a counterintuitive reveal that drives saves.",
    views: 4_200_000,
    likes: 276_000,
    comments: 8_300,
    thumbnailUrl: null,
  },
  {
    id: "real-estate-vs-sp500",
    platform: "cross",
    topic: "Real Estate vs S&P 500",
    whyItWorked:
      "A perennial argument with no settled answer — the chart gave both camps ammunition to comment.",
    views: 6_300_000,
    likes: 441_000,
    comments: 15_600,
    thumbnailUrl: null,
  },
  {
    id: "gold-vs-inflation",
    platform: "cross",
    topic: "Gold vs Inflation",
    whyItWorked:
      "Tested gold's 'inflation hedge' reputation against the data — surprised the audience that trusts it.",
    views: 4_900_000,
    likes: 331_000,
    comments: 10_100,
    thumbnailUrl: null,
  },
];
