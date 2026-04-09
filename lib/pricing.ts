/**
 * Single source of truth for tiers and add-ons.
 * Powers UI, checkout, and order handling.
 */

export type TierId = "basic" | "standard" | "premium";
export type AddOnId =
  | "rush_24h"
  | "revision"
  | "csv_export"
  | "research_concept"
  | "caption_pinned"
  | "collab_instagram";

export interface Tier {
  id: TierId;
  name: string;
  price: number; // cents
  description: string;
  /** Brief "who is this for?" line for the tier */
  whoIsThisFor: string;
  features: string[];
  revisions: number;
  deliveryDays: string;
  /** Stripe Price ID — set via env in production */
  stripePriceIdKey: keyof typeof STRIPE_PRICE_KEYS;
}

export interface AddOn {
  id: AddOnId;
  name: string;
  price: number; // cents
  description: string;
  /** Stripe Price ID key for env lookup */
  stripePriceIdKey: keyof typeof STRIPE_PRICE_KEYS;
}

// Keys used to read Stripe Price IDs from env (see .env.example)
export const STRIPE_PRICE_KEYS = {
  STRIPE_PRICE_ID_BASIC: "STRIPE_PRICE_BASIC",
  STRIPE_PRICE_ID_STANDARD: "STRIPE_PRICE_STANDARD",
  STRIPE_PRICE_ID_PREMIUM: "STRIPE_PRICE_PREMIUM",
  STRIPE_PRICE_ID_ADDON_24H_RUSH: "STRIPE_ADDON_RUSH",
  STRIPE_PRICE_ID_ADDON_REVISION: "STRIPE_ADDON_REVISION",
  STRIPE_PRICE_ID_ADDON_CSV: "STRIPE_ADDON_CSV",
  STRIPE_PRICE_ID_ADDON_RESEARCH: "STRIPE_ADDON_RESEARCH",
  STRIPE_PRICE_ID_ADDON_CAPTION: "STRIPE_ADDON_CAPTION",
  STRIPE_PRICE_ID_ADDON_COLLAB_INSTAGRAM: "STRIPE_ADDON_COLLAB",
} as const;

/** Package comparison: same features, per-tier value. Rendered as "Feature: value" in each card. */
export const CHART_PACKAGE_FEATURES: {
  label: string;
  basic: string;
  standard: string;
  premium: string;
}[] = [
  { label: "Charts Included", basic: "1", standard: "1", premium: "1" },
  { label: "Data Sourcing", basic: "Client provides", standard: "We source", premium: "We source + cited" },
  { label: "Narrative Concept", basic: "✗", standard: "✗", premium: "Yes" },
  { label: "Revisions", basic: "1", standard: "2", premium: "3" },
  { label: "Delivery", basic: "3–5 days", standard: "3 days", premium: "Priority turnaround (24h)" },
  { label: "Branding", basic: "✗", standard: "Yes", premium: "Yes" },
  { label: "Caption + pinned comment", basic: "Add-on", standard: "Add-on", premium: "Included" },
];

export const TIERS: Tier[] = [
  {
    id: "basic",
    name: "Basic",
    price: 5000, // $50
    description: "1 chart, client provides data and specs",
    whoIsThisFor: "Creators who already have a full idea, just looking for simplicity and execution.",
    features: [
      "1 chart",
      "Client provides exact comparison, title, color hexes/background",
      "1 revision",
      "3–5 business day delivery",
    ],
    revisions: 1,
    deliveryDays: "3–5 business days",
    stripePriceIdKey: "STRIPE_PRICE_ID_BASIC",
  },
  {
    id: "standard",
    name: "Standard",
    price: 15000, // $150
    description: "Custom branded chart, we source data",
    whoIsThisFor: "Teams that want fully customizable charts with data sourcing and branding.",
    features: [
      "1 custom chart",
      "We source data",
      "Title optimization",
      "Branding (logo placement, color matching)",
      "2 revisions",
      "3 business day delivery",
    ],
    revisions: 2,
    deliveryDays: "3 business days",
    stripePriceIdKey: "STRIPE_PRICE_ID_STANDARD",
  },
  {
    id: "premium",
    name: "Premium",
    price: 30000, // $300
    description: "Narrative concept, priority turnaround",
    whoIsThisFor: "Those who want a full professional narrative and concept catered to a brand, and the fastest turnaround.",
    features: [
      "1 chart",
      "Narrative concept (we define chart idea)",
      "Data sourcing with sources",
      "Priority turnaround (24h)",
      "3 revisions",
      "Optional caption + pinned comment (add-on unless configured)",
    ],
    revisions: 3,
    deliveryDays: "24h priority",
    stripePriceIdKey: "STRIPE_PRICE_ID_PREMIUM",
  },
];

export const ADDONS: AddOn[] = [
  {
    id: "caption_pinned",
    name: "Caption + pinned comment",
    price: 2500,
    description: "+$25 — Caption and pinned comment",
    stripePriceIdKey: "STRIPE_PRICE_ID_ADDON_CAPTION",
  },
  {
    id: "rush_24h",
    name: "24h rush",
    price: 5000,
    description: "+$50 — 24-hour rush delivery",
    stripePriceIdKey: "STRIPE_PRICE_ID_ADDON_24H_RUSH",
  },
  {
    id: "revision",
    name: "Additional revision",
    price: 2500,
    description: "+$25 — One extra revision",
    stripePriceIdKey: "STRIPE_PRICE_ID_ADDON_REVISION",
  },
  {
    id: "csv_export",
    name: "Raw CSV export",
    price: 4000,
    description: "+$40 — Raw CSV export of chart data",
    stripePriceIdKey: "STRIPE_PRICE_ID_ADDON_CSV",
  },
  {
    id: "research_concept",
    name: "Full research concept",
    price: 10000,
    description: "+$100 — Full research concept",
    stripePriceIdKey: "STRIPE_PRICE_ID_ADDON_RESEARCH",
  },
  {
    id: "collab_instagram",
    name: "Collaboration post with @YungGeeski on Instagram",
    price: 30000,
    description: "+$300 — Collaboration post with @YungGeeski on Instagram",
    stripePriceIdKey: "STRIPE_PRICE_ID_ADDON_COLLAB_INSTAGRAM",
  },
];

export function getTierById(id: TierId): Tier | undefined {
  return TIERS.find((t) => t.id === id);
}

export function getAddOnsByIds(ids: AddOnId[]): AddOn[] {
  return ADDONS.filter((a) => ids.includes(a.id));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
