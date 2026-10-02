/**
 * Audience demographics for the /portfolio "Audience" section — the
 * breakdown a sponsor uses to judge who a campaign would reach.
 *
 * Instagram figures are live: follower count, follower demographics (age,
 * gender, country, city) and 30-day views come from the Instagram API via the
 * metrics refresh job, and are merged in with `withInstagram`. Other platforms
 * are entered by hand below from their own analytics (TikTok Analytics,
 * YouTube Studio). `null` means "not supplied yet", and that part of the
 * section simply doesn't render — nothing is ever estimated.
 */

import type { DemographicCount, InstagramAudienceRaw } from "@/lib/metrics/types";

export type AudiencePlatformId = "instagram" | "tiktok" | "youtube" | "facebook" | "x";

export interface AudiencePlatform {
  id: AudiencePlatformId;
  label: string;
  /** Followers / subscribers. Null until supplied. */
  followers: number | null;
  /** Views on this platform over the last 30 days, where the platform reports it. */
  monthlyViews?: number | null;
}

/** One slice of a distribution, as a percentage of the audience (0–100). */
export interface AudienceShare {
  label: string;
  pct: number;
}

export interface AudienceData {
  /** "Sep 2026" — when the analytics were pulled. Shown with the figures. */
  asOf: string | null;
  /**
   * Which platform the age / gender / country breakdowns describe (they come
   * from one platform's insights, not a blend), e.g. "Instagram".
   */
  demographicsSource: string | null;
  platforms: AudiencePlatform[];
  age: AudienceShare[];
  gender: AudienceShare[];
  /** Top countries, largest first. */
  countries: AudienceShare[];
  /** Top cities, largest first. Optional. */
  cities: AudienceShare[];
}

export const AUDIENCE: AudienceData = {
  asOf: null,
  demographicsSource: null,
  platforms: [
    // Instagram followers and monthly views are filled from the live sync.
    { id: "instagram", label: "Instagram", followers: null, monthlyViews: null },
    { id: "tiktok", label: "TikTok", followers: null, monthlyViews: null },
    { id: "youtube", label: "YouTube", followers: null, monthlyViews: null },
  ],
  age: [],
  gender: [],
  countries: [],
  cities: [],
};

/** True once any demographic breakdown has been supplied. */
export function hasDemographics(a: AudienceData = AUDIENCE): boolean {
  return a.age.length > 0 || a.gender.length > 0 || a.countries.length > 0;
}

const TOP_N = 5;

/** Percent of `total`, to one decimal. */
function pct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
}

const sumCounts = (counts: DemographicCount[]) => counts.reduce((a, c) => a + c.count, 0);

function toShares(
  counts: DemographicCount[],
  label: (key: string) => string,
  {
    top,
    sort,
    base = 0,
  }: {
    top?: number;
    sort?: (a: DemographicCount, b: DemographicCount) => number;
    /** Denominator floor — the whole classified audience, not just the buckets returned. */
    base?: number;
  } = {},
): AudienceShare[] {
  const total = Math.max(sumCounts(counts), base);
  const ordered = [...counts].sort(sort ?? ((a, b) => b.count - a.count));
  return (top ? ordered.slice(0, top) : ordered).map((c) => ({
    label: label(c.key),
    pct: pct(c.count, total),
  }));
}

const GENDER_LABELS: Record<string, string> = { F: "Women", M: "Men", U: "Unspecified" };

let regionNames: Intl.DisplayNames | null = null;
function countryName(code: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Merge the live Instagram figures into the hand-entered audience data.
 * Breakdowns are shares of the followers Instagram could classify; countries
 * and cities show the top five.
 */
export function withInstagram(
  base: AudienceData,
  live: {
    followers: number | null;
    audience: InstagramAudienceRaw | null;
    asOf: string | null;
  },
): AudienceData {
  const a = live.audience;
  const platforms = base.platforms.map((p) =>
    p.id === "instagram"
      ? {
          ...p,
          followers: p.followers ?? live.followers,
          monthlyViews: p.monthlyViews ?? a?.views30d ?? null,
        }
      : p,
  );
  if (!a || (a.age.length === 0 && a.gender.length === 0 && a.country.length === 0)) {
    return { ...base, platforms };
  }
  const ageStart = (k: string) => parseInt(k, 10) || 0;
  // Instagram returns only the top countries/cities, so their shares are taken
  // of all classified followers (age/gender cover everyone), not of the subset.
  const classified = Math.max(sumCounts(a.gender), sumCounts(a.age));
  return {
    ...base,
    platforms,
    demographicsSource: "Instagram",
    asOf: live.asOf
      ? new Date(live.asOf).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : base.asOf,
    age: toShares(a.age, (k) => k.replace("-", "–"), {
      sort: (x, y) => ageStart(x.key) - ageStart(y.key),
    }),
    gender: toShares(a.gender, (k) => GENDER_LABELS[k] ?? k),
    countries: toShares(a.country, countryName, { top: TOP_N, base: classified }),
    cities: toShares(a.city, (k) => k.split(",")[0].trim(), { top: TOP_N, base: classified }),
  };
}
