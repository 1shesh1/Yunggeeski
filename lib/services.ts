/**
 * "Services & Deliverables" copy for /portfolio: what a client can hire
 * Yung Geeski to do, and the two ways to work together.
 */

import type { LucideIcon } from "lucide-react";
import { BarChart3, Clapperboard, Handshake, Repeat, Search } from "lucide-react";

export const SERVICES_HEADING = "Custom Financial Data Visualization & Content Production";

export const SERVICES_INTRO =
  "I create research-driven, animated data visualizations that turn complex financial information into engaging, easily understood social media content. From initial research and data preparation to chart design and final animation, I handle the production process from start to finish.";

export interface Service {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const SERVICES: Service[] = [
  {
    icon: Search,
    title: "Financial Research & Data Analysis",
    desc: "Researching financial topics, sourcing reliable datasets, cleaning data, and identifying interesting stories.",
  },
  {
    icon: BarChart3,
    title: "Custom Data Visualizations",
    desc: "Designing animated charts that communicate financial trends, comparisons, and historical performance.",
  },
  {
    icon: Clapperboard,
    title: "Short-Form Video Production",
    desc: "Producing content optimized for Instagram Reels, TikTok, YouTube Shorts, and other social platforms.",
  },
  {
    icon: Handshake,
    title: "Sponsored Content & Brand Collaborations",
    desc: "Incorporating brands, products, or services into financial content through custom integrations.",
  },
  {
    icon: Repeat,
    title: "Ongoing Content Partnerships",
    desc: "Producing recurring, branded visualizations for financial educators, investment companies, and media organizations.",
  },
];

export const DELIVERABLES_NOTE =
  "Deliverables can include finished high-resolution videos, custom branding, captions, source references, and platform-specific exports, depending on the agreement.";

/** The two engagement models — the point of the section is that both exist. */
export const ENGAGEMENT_MODELS: { title: string; desc: string; example?: string }[] = [
  {
    title: "Content for your accounts",
    desc: "I research, design, and animate branded charts that you publish on your own channels.",
    example: "Like the ongoing Investing & Retirement partnership.",
  },
  {
    title: "Reach my audience",
    desc: "Your brand is integrated into a chart published natively to the Yung Geeski audience, clearly disclosed.",
    example: "Like the Delta Options campaign.",
  },
];
