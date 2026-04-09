/**
 * Course tiers and access. Used by /course (sales) and /course/access (unlocks).
 * Stripe: set STRIPE_COURSE_TIER1, STRIPE_COURSE_TIER2, STRIPE_COURSE_TIER3 in env (Price IDs, not Product IDs).
 */

export type CourseTierId = "tier1" | "tier2" | "tier3";

/** Env var names for Stripe Price IDs for course tiers. */
export const COURSE_STRIPE_PRICE_ENV_KEYS: Record<CourseTierId, string> = {
  tier1: "STRIPE_COURSE_TIER1",
  tier2: "STRIPE_COURSE_TIER2",
  tier3: "STRIPE_COURSE_TIER3",
};

/** Display name and price (dollars) for checkout. */
export const COURSE_TIER_SALES: Record<CourseTierId, { name: string; priceCents: number }> = {
  tier1: { name: "Ideas — 50 Viral Chart Frameworks", priceCents: 3900 },
  tier2: { name: "Ideas + System — Workflow & Tools", priceCents: 14900 },
  tier3: { name: "The Full Package — Ideas, System & Ready-to-Post Assets", priceCents: 29900 },
};

export interface CourseTierAccess {
  id: CourseTierId;
  name: string;
  /** Short description for the access page */
  description: string;
  /** Download or access URL. Replace with Gumroad delivery link or your hosted file. */
  downloadUrl: string;
  /** Optional label for the download (e.g. "Download PDF" or "Access folder") */
  downloadLabel?: string;
}

/** Order of tiers for unlock logic: tier1 < tier2 < tier3 */
const TIER_ORDER: CourseTierId[] = ["tier1", "tier2", "tier3"];

export function tierUnlocksSection(purchasedTier: CourseTierId, sectionTier: CourseTierId): boolean {
  const purchasedIndex = TIER_ORDER.indexOf(purchasedTier);
  const sectionIndex = TIER_ORDER.indexOf(sectionTier);
  if (purchasedIndex === -1 || sectionIndex === -1) return false;
  return purchasedIndex >= sectionIndex;
}

/** Course sections shown on the access page. Place files in public/downloads/ or replace with Gumroad/hosted URLs. */
export const COURSE_ACCESS_SECTIONS: CourseTierAccess[] = [
  {
    id: "tier1",
    name: "Ideas — 50 Viral Chart Frameworks",
    description: "50 high-engagement chart ideas with narrative angles and data source references.",
    downloadUrl: "/downloads/ideas.pdf",
    downloadLabel: "Download",
  },
  {
    id: "tier2",
    name: "Ideas + System — Workflow & Tools",
    description: "My exact workflow, FRED + Yahoo Finance data pulling, software stack, and more.",
    downloadUrl: "/downloads/ideas_system.pdf",
    downloadLabel: "Download",
  },
  {
    id: "tier3",
    name: "The Full Package — Ideas, System & Ready-to-Post Assets",
    description: "20 finished viral chart videos, all CSV files, captions + pinned comments.",
    downloadUrl: "/downloads/the_full_package.zip",
    downloadLabel: "Download",
  },
];
