import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { PortfolioCarousel } from "@/components/brands/PortfolioCarousel";
import { CaseStudyLogo } from "@/components/brands/CaseStudyLogo";
import { InquirySection } from "@/components/brands/sections";
import { INQUIRY_HREF, eyebrow, primaryCta } from "@/components/brands/styles";
import { getAccountMetrics, getPortfolioShowcase } from "@/lib/metrics/service";
import { DELTA_OPTIONS_CASE_STUDY, DELTA_OPTIONS_HIGHLIGHTS } from "@/lib/sponsorship";
import { formatCompact } from "@/lib/utils";

// Same cadence as the landing page so both show the same live numbers.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio — Yung Geeski",
  description:
    "The best-performing finance charts from Yung Geeski, with live engagement metrics and the reasoning behind why each one worked.",
};

/** Upper bound on posts shown: admin-featured first, then lib/portfolio.ts PINNED_PORTFOLIO. */
const PORTFOLIO_LIMIT = 12;

/**
 * Portfolio — reached from the landing-page hero, so it's a funnel page in its
 * own right: short hero → carousel (the focal point) → aggregate proof →
 * sponsored-result proof → request form.
 */
export default async function PortfolioPage() {
  const [portfolioResult, metricsResult] = await Promise.all([
    getPortfolioShowcase(PORTFOLIO_LIMIT),
    getAccountMetrics(),
  ]);
  const posts = portfolioResult.data;
  const m = metricsResult.data;

  const totals = posts.reduce(
    (acc, p) => ({
      views: acc.views + p.views,
      likes: acc.likes + p.likes,
      comments: acc.comments + p.comments,
    }),
    { views: 0, likes: 0, comments: 0 },
  );
  const aggregate: { label: string; value: string }[] = [
    { label: "Combined views", value: `${formatCompact(totals.views)}+` },
    { label: "Likes", value: formatCompact(totals.likes) },
    { label: "Comments", value: formatCompact(totals.comments) },
    { label: "Followers", value: `${formatCompact(m.totalFollowers)}+` },
  ];

  const caseStudy = DELTA_OPTIONS_CASE_STUDY;

  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pb-10 pt-14 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto max-w-3xl text-center">
          <p className={eyebrow}>Portfolio</p>
          <h1 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            The charts behind{" "}
            <span className="text-secondary">{formatCompact(totals.views)}+ views</span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every video here was researched, built, and published by Yung Geeski. Click through
            the standouts — then let&apos;s build one around your brand.
          </p>
        </div>
      </section>

      {/* ── CAROUSEL (focal point) ── */}
      <section id="showcase" className="px-4 pb-16">
        <div className="container mx-auto max-w-5xl">
          <PortfolioCarousel posts={posts} inquiryHref={INQUIRY_HREF} />
        </div>
      </section>

      {/* ── AGGREGATE PROOF ── */}
      <section className="border-y border-border bg-card/30 px-4 py-14">
        <div className="container mx-auto max-w-4xl">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {aggregate.map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card px-4 py-5 text-center">
                <dd className="text-2xl font-bold text-secondary sm:text-3xl">{value}</dd>
                <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── SPONSORED PROOF ── */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <p className={eyebrow}>Sponsored Results</p>
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
            Views are the start. Here&apos;s what a brand got.
          </h2>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 flex justify-center sm:justify-start">
              <CaseStudyLogo src={caseStudy.logo} client={caseStudy.client} />
            </div>
            {caseStudy.keyResult && (
              <div className="mb-6 flex items-start gap-3">
                <Quote className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                <p className="text-base leading-relaxed">{caseStudy.keyResult}</p>
              </div>
            )}
            <dl className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DELTA_OPTIONS_HIGHLIGHTS.map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-border/60 bg-background/40 px-4 py-4 text-center">
                  <dd className="text-xl font-bold">{value}</dd>
                  <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-xs text-muted-foreground">{caseStudy.resultsScope}</p>
              <Link
                href="/#case-study"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
              >
                Read the full case study
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Link href={INQUIRY_HREF} className={primaryCta}>
              Get results like this
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REQUEST FORM ── */}
      <div className="border-t border-border bg-gradient-to-b from-card/30 to-background">
        <InquirySection heading="Let's build your chart" />
      </div>
    </div>
  );
}
