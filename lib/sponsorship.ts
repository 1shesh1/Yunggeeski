/**
 * Single source of truth for the brand-facing static content (landing page,
 * /portfolio, /faq): what a campaign includes, process steps, brand-fit list,
 * FAQ, disclosure, and case studies.
 *
 * Keeping this here (not inline in the page) means copy can change in one place
 * and lets a future media-kit generator reuse the same data.
 */

import type { LucideIcon } from "lucide-react";
import { FileText, LineChart, ClipboardCheck, Send } from "lucide-react";

/**
 * What every campaign includes. Deliberately one offer with no tiers or prices:
 * campaigns are scoped and quoted after the brief comes in.
 */
export const CAMPAIGN_INCLUDES: { title: string; desc: string }[] = [
  {
    title: "Topic development",
    desc: "A chart concept built so your product is part of the story, not an interruption.",
  },
  {
    title: "Data research",
    desc: "Sourced, checked, and cited — the numbers hold up in the comments.",
  },
  {
    title: "Visualization & animation",
    desc: "The moving-chart format that keeps viewers watching to the finish.",
  },
  {
    title: "Caption & pinned comment",
    desc: "Copy written around your call to action, with required disclosures.",
  },
  {
    title: "Organic publication",
    desc: "Posted natively to the Yung Geeski audience — no ad-feed look.",
  },
  {
    title: "Performance reporting",
    desc: "Views, reach, engagement, and CTA response delivered after launch.",
  },
];

/** One line on scope, shown under the includes list. */
export const CAMPAIGN_SCOPE_NOTE =
  "Single videos, multi-post series, and ongoing partnerships — every campaign is scoped and quoted to your goals after a short brief.";

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

/** Headline Delta Options figures for the compact proof card on /portfolio. */
export const DELTA_OPTIONS_HIGHLIGHTS: { label: string; value: string }[] = [
  { label: "“OPTION” comments", value: fmt(DELTA_METRICS.optionComments) },
  { label: "Link clicks", value: fmt(DELTA_METRICS.linkClicks) },
  { label: "Accounts reached", value: fmt(DELTA_METRICS.accountsReached) },
];

/**
 * Brand-side FAQ, shown above the request form and on /faq. Answers stay
 * consistent with the process and disclosure copy above — no prices quoted.
 */
export const BRAND_FAQ: { q: string; a: string }[] = [
  {
    q: "How much does a campaign cost?",
    a: "Every campaign is scoped to its goals, deliverables, and timeline, so pricing is quoted after we review your brief. Share an estimated budget in the request form and you'll get a tailored proposal.",
  },
  {
    q: "Do we approve the video before it goes live?",
    a: "Yes. The video, caption, call to action, and disclosures are all prepared for your review before anything is published.",
  },
  {
    q: "How long does a campaign take?",
    a: "It depends on scope. Include your desired launch date in the request and we'll confirm what's feasible in our reply.",
  },
  {
    q: "What results can we expect?",
    a: "Every campaign ends with a performance report — views, reach, engagement, and response to your call to action. See the Delta Options case study for a real example. We don't guarantee view totals, customer acquisition, or investment performance.",
  },
  {
    q: "Is sponsored content disclosed?",
    a: "Always. Every sponsored campaign is clearly disclosed to the audience.",
  },
  {
    q: "Can we use the video in our own ads?",
    a: "Paid advertising usage rights are available. Note it in your request so it's included in the proposal.",
  },
];
