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

export interface CaseStudy {
  slug: string;
  client: string;
  /** Client logo path in /public. Falls back to the client name if missing. */
  logo?: string | null;
  objective: string;
  approach: string;
  deliverables: string[];
  results: CaseStudyResult[];
  /** One-line takeaway shown as a callout under the results. */
  keyResult?: string;
  /** Sponsorship disclosure line. */
  disclosure?: string;
  /** Comment-section proof screenshots (public/ paths). Empty until assets land. */
  screenshots: string[];
}

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
    { label: "“OPTION” comments", value: "292", highlight: true },
    { label: "Link clicks", value: "193", highlight: true },
    { label: "Views", value: "103,581" },
    { label: "Accounts reached", value: "73,182" },
    { label: "Saves", value: "863" },
    { label: "Likes", value: "687" },
    { label: "Comments", value: "451" },
    { label: "Shares", value: "308" },
  ],
  keyResult:
    "The campaign generated approximately 292 direct “OPTION” responses — measurable audience intent, not passive viewership.",
  disclosure: "Sponsored content was clearly disclosed.",
  screenshots: [],
};

export const CASE_STUDIES: CaseStudy[] = [DELTA_OPTIONS_CASE_STUDY];
