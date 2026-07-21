/**
 * Single source of truth for the /brands sponsor page's static content:
 * service packages, process steps, brand-fit list, disclosure, and case studies.
 *
 * Keeping this here (not inline in the page) means copy/pricing can change in one
 * place and lets a future media-kit generator reuse the same data.
 */

import type { LucideIcon } from "lucide-react";
import { FileText, LineChart, ClipboardCheck, Send } from "lucide-react";

export interface SponsorPackage {
  id: "sponsored_chart" | "multi_post" | "monthly_partner";
  name: string;
  /** Display price string, e.g. "Starting at $2,000". */
  startingPrice: string;
  /** Short positioning line under the name. */
  tagline: string;
  includes: string[];
  /** Marks the visually emphasized card. */
  featured?: boolean;
}

export const SPONSOR_PACKAGES: SponsorPackage[] = [
  {
    id: "sponsored_chart",
    name: "Sponsored Chart",
    startingPrice: "Starting at $2,000",
    tagline:
      "A custom data-driven video built around your brand, product, or investment narrative.",
    includes: [
      "Topic development",
      "Data research",
      "Visualization",
      "Animation",
      "Caption",
      "Pinned comment",
      "Organic publication",
    ],
  },
  {
    id: "multi_post",
    name: "Multi-Post Campaign",
    startingPrice: "Starting at $5,000",
    tagline:
      "A coordinated series of charts designed to explain your product, build recognition, and generate measurable audience actions.",
    includes: [
      "Three videos",
      "Campaign strategy",
      "Integrated CTA",
      "Performance reporting",
      "One revision round per video",
    ],
    featured: true,
  },
  {
    id: "monthly_partner",
    name: "Monthly Content Partner",
    startingPrice: "Starting at $6,000 / month",
    tagline:
      "Ongoing production for brands that need consistent, high-quality financial content.",
    includes: [
      "Four to eight videos monthly",
      "Research and topic development",
      "Priority production",
      "Monthly performance review",
      "Optional paid usage rights",
    ],
  },
];

export interface ProcessStep {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    icon: FileText,
    title: "Campaign Brief",
    desc: "We identify the product, target audience, key message, and required disclosures.",
  },
  {
    icon: LineChart,
    title: "Topic & Data Development",
    desc: "Yung Geeski researches a chart concept designed to communicate the message naturally.",
  },
  {
    icon: ClipboardCheck,
    title: "Production & Approval",
    desc: "The video, caption, CTA, and disclosures are prepared for your review.",
  },
  {
    icon: Send,
    title: "Publication & Reporting",
    desc: "The campaign is published and performance results are delivered.",
  },
];

export const BRAND_FIT: string[] = [
  "Investing platforms",
  "Brokerages",
  "Financial newsletters",
  "Market-data companies",
  "Fintech applications",
  "Real-estate platforms",
  "Financial education brands",
  "Tax and accounting software",
  "Publicly traded companies",
];

export const DISCLOSURE_STATEMENT =
  "Every sponsored campaign is clearly disclosed. Yung Geeski does not guarantee investment performance, customer acquisition, or specific view totals.";

export interface CaseStudyResult {
  label: string;
  /** Display value; null renders as "—" until a verified number is available. */
  value: string | null;
  /** Featured as a primary proof metric (bigger, accented). */
  highlight?: boolean;
}

export interface CaseStudyChartSegment {
  label: string;
  value: number;
}

/**
 * A part-to-whole donut in the case-study results. `total` is the full ring;
 * `segments` fill it in order. When the segments sum to less than `total` the
 * shortfall renders as a muted remainder track (labelled by `remainderLabel`).
 */
export interface CaseStudyChart {
  id: string;
  title: string;
  /** Name of the metric forming the whole ring. */
  totalLabel: string;
  total: number;
  segments: CaseStudyChartSegment[];
  remainderLabel?: string;
  /** Plain-language reading of the chart, shown beneath it. */
  caption?: string;
  /** Standalone stat rendered under the donut (e.g. tracked link clicks). */
  footStat?: { label: string; value: string };
}

export interface CaseStudy {
  slug: string;
  client: string;
  /** Client logo path in /public. Falls back to the client name if missing. */
  logo?: string | null;
  objective: string;
  approach: string;
  deliverables: string[];
  /** Data of record for the campaign. Also gates the results section. */
  results: CaseStudyResult[];
  /** Visual breakdown of `results`. Both read from the same raw numbers. */
  charts?: CaseStudyChart[];
  /** Scoping note for the results — platform and volume the numbers cover. */
  resultsScope?: string;
  /** One-line takeaway shown as a callout under the results. */
  keyResult?: string;
  /** Sponsorship disclosure line. */
  disclosure?: string;
  /** Comment-section proof screenshots (public/ paths). Empty until assets land. */
  screenshots: string[];
}

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * Raw verified figures for the Delta Options campaign, declared once so the
 * results list and the donut charts can never drift apart. Instagram-only,
 * aggregated across the 6 sponsored Reels.
 */
const DELTA_METRICS = {
  optionComments: 292,
  linkClicks: 193,
  views: 103_581,
  accountsReached: 73_182,
  saves: 863,
  likes: 687,
  comments: 451,
  shares: 308,
} as const;

const DELTA_TOTAL_ENGAGEMENT =
  DELTA_METRICS.saves + DELTA_METRICS.likes + DELTA_METRICS.comments + DELTA_METRICS.shares;

export const DELTA_OPTIONS_CASE_STUDY: CaseStudy = {
  slug: "delta-options",
  client: "Delta Options",
  logo: "/images/brands/delta-options.png",
  objective:
    "Increase awareness and generate measurable interest in Delta Options through native short-form finance content.",
  approach:
    "Yung Geeski created data-driven comparison charts that incorporated a campaign-specific “OPTION” call to action in the captions and pinned comments.",
  deliverables: [
    "6 sponsored Instagram Reels",
    "Custom chart research and production",
    "Caption and pinned-comment copy",
    "Integrated “OPTION” comment CTA",
  ],
  results: [
    {
      label: "“OPTION” comments",
      value: fmt(DELTA_METRICS.optionComments),
      highlight: true,
    },
    {
      label: "Link clicks",
      value: fmt(DELTA_METRICS.linkClicks),
      highlight: true,
    },
    { label: "Views", value: fmt(DELTA_METRICS.views) },
    { label: "Accounts reached", value: fmt(DELTA_METRICS.accountsReached) },
    { label: "Saves", value: fmt(DELTA_METRICS.saves) },
    { label: "Likes", value: fmt(DELTA_METRICS.likes) },
    { label: "Comments", value: fmt(DELTA_METRICS.comments) },
    { label: "Shares", value: fmt(DELTA_METRICS.shares) },
  ],
  charts: [
    {
      id: "reach",
      title: "Views vs. accounts reached",
      totalLabel: "Views",
      total: DELTA_METRICS.views,
      segments: [{ label: "Accounts reached", value: DELTA_METRICS.accountsReached }],
      remainderLabel: "Repeat views",
      caption: `${fmt(DELTA_METRICS.accountsReached)} unique accounts generated ${fmt(
        DELTA_METRICS.views,
      )} views.`,
    },
    {
      id: "engagement",
      title: "Engagement mix",
      totalLabel: "Total engagements",
      total: DELTA_TOTAL_ENGAGEMENT,
      segments: [
        { label: "Saves", value: DELTA_METRICS.saves },
        { label: "Likes", value: DELTA_METRICS.likes },
        { label: "Comments", value: DELTA_METRICS.comments },
        { label: "Shares", value: DELTA_METRICS.shares },
      ],
      caption: "Saves led the mix — the strongest signal of intent to return to a post.",
    },
    {
      id: "cta-response",
      title: "“OPTION” share of comments",
      totalLabel: "Comments",
      total: DELTA_METRICS.comments,
      segments: [{ label: "“OPTION” comments", value: DELTA_METRICS.optionComments }],
      remainderLabel: "Other comments",
      caption: "Most comments were the campaign CTA keyword, not passive reactions.",
      footStat: {
        label: "Link clicks tracked",
        value: fmt(DELTA_METRICS.linkClicks),
      },
    },
  ],
  resultsScope: "Instagram-only metrics, aggregated across 6 sponsored Reels.",
  keyResult: `The campaign generated approximately ${fmt(
    DELTA_METRICS.optionComments,
  )} direct “OPTION” responses — measurable audience intent, not passive viewership.`,
  disclosure: "Sponsored content was clearly disclosed.",
  screenshots: [],
};

export const CASE_STUDIES: CaseStudy[] = [DELTA_OPTIONS_CASE_STUDY];
