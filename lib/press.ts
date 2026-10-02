/**
 * News coverage for the "In the News" section on /portfolio.
 *
 * One entry per outlet; the logo links to its article. Coverage is split into
 * original reporting and syndicated reprints so a story republished on another
 * site is never counted as a second, independent piece of coverage. Logos are
 * self-hosted copies (public/images/press) of the outlets' Wikimedia files,
 * shown in their own colours on white tiles — several (Newsweek, Mediaite,
 * FactCheck.org) have white or navy detail that can't be reversed for a dark page.
 */

export type CoverageKind = "original" | "syndicated";

export interface PressArticle {
  url: string;
  /** Short, neutral description of the piece — shown when an outlet has several. */
  label: string;
  /** Display date. */
  published: string;
  kind: CoverageKind;
  /** For a syndicated reprint: the outlet whose story it is. */
  originalSource?: string;
}

export interface PressOutlet {
  id: string;
  name: string;
  logo: string;
  /** Intrinsic size of the logo, for layout without shift. */
  logoWidth: number;
  logoHeight: number;
  /** Square-ish marks (e.g. FactCheck.org) render taller so their wordmark stays legible. */
  square?: boolean;
  articles: PressArticle[];
}

export const PRESS_OUTLETS: PressOutlet[] = [
  {
    id: "newsweek",
    name: "Newsweek",
    logo: "/images/press/newsweek.svg",
    logoWidth: 3000,
    logoHeight: 769,
    articles: [
      {
        url: "https://www.newsweek.com/how-trump-approval-rating-inflation-stands-shares-positive-chart-12303132",
        label: "How Trump's Approval Rating on Inflation Stands As He Shares Positive Chart",
        published: "Aug 10, 2026",
        kind: "original",
      },
    ],
  },
  {
    id: "factcheck",
    name: "FactCheck.org",
    logo: "/images/press/factcheck.png",
    logoWidth: 330,
    logoHeight: 302,
    square: true,
    articles: [
      {
        url: "https://www.factcheck.org/2026/08/trump-uses-deceptive-chart-in-false-inflation-boast/",
        label: "Trump Uses Deceptive Chart in False Inflation Boast",
        published: "Aug 13, 2026",
        kind: "original",
      },
    ],
  },
  {
    id: "independent",
    name: "The Independent",
    logo: "/images/press/independent.svg",
    logoWidth: 4909,
    logoHeight: 351,
    articles: [
      {
        url: "https://www.independent.co.uk/news/world/americas/us-politics/trump-future-inflation-presidents-b3030441.html",
        label:
          "Trump predicts the future and claims he will have the lowest inflation of all presidents for the rest of his term",
        published: "Aug 10, 2026",
        kind: "original",
      },
    ],
  },
  {
    id: "mediaite",
    name: "Mediaite",
    logo: "/images/press/mediaite.svg",
    logoWidth: 1058,
    logoHeight: 156,
    articles: [
      {
        url: "https://www.mediaite.com/politics/trump-shares-wildly-deceptive-chart-making-his-inflation-numbers-seem-dramatically-better-than-they-are/",
        label:
          "Trump Shares Wildly Deceptive Chart Making His Inflation Numbers Seem Dramatically Better Than They Are",
        published: "Aug 9, 2026",
        kind: "original",
      },
    ],
  },
  {
    id: "aol",
    name: "AOL",
    logo: "/images/press/aol.svg",
    logoWidth: 1000,
    logoHeight: 353,
    articles: [
      {
        url: "https://www.aol.ca/articles/trump-predicts-future-claims-lowest-144214000.html",
        label: "Reprint of The Independent's report",
        published: "Aug 10, 2026",
        kind: "syndicated",
        originalSource: "The Independent",
      },
      {
        url: "https://www.aol.ca/articles/lara-trump-unwittingly-humiliates-donald-140317000.html",
        label: "Reprint of The Mirror's report",
        published: "Aug 10, 2026",
        kind: "syndicated",
        originalSource: "The Mirror",
      },
    ],
  },
];

/** True when every article for the outlet is a reprint of someone else's story. */
export function isSyndicatedOnly(outlet: PressOutlet): boolean {
  return outlet.articles.every((a) => a.kind === "syndicated");
}

/** "4 original reports · 2 syndicated reprints" — derived, so it can't drift from the list. */
export function coverageSummary(outlets: PressOutlet[] = PRESS_OUTLETS): string {
  const all = outlets.flatMap((o) => o.articles);
  const original = all.filter((a) => a.kind === "original").length;
  const syndicated = all.length - original;
  const parts = [`${original} original report${original === 1 ? "" : "s"}`];
  if (syndicated) parts.push(`${syndicated} syndicated reprint${syndicated === 1 ? "" : "s"}`);
  return parts.join(" · ");
}
