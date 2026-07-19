import { existsSync } from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Download, Quote, Sparkles } from "lucide-react";
import { StickyCtaBanner } from "@/components/StickyCtaBanner";
import { PortfolioCard } from "./PortfolioCard";
import { BrandHeroMontage } from "./BrandHeroMontage";
import { BrandInquiryForm } from "./BrandInquiryForm";
import { getAccountMetrics, getFeaturedPortfolio } from "@/lib/metrics/service";
import {
  SPONSOR_PACKAGES,
  PROCESS_STEPS,
  BRAND_FIT,
  DISCLOSURE_STATEMENT,
  DELTA_OPTIONS_CASE_STUDY,
} from "@/lib/sponsorship";
import { formatCompact } from "@/lib/utils";

// Re-render on the server every 5 minutes so refreshed snapshots and admin
// overrides reach the live page without a redeploy (the page reads the metrics
// cache; without this it would be frozen at build time).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Work With Yung Geeski — Sponsored Financial Content",
  description:
    "Yung Geeski is a financial visual-content studio producing high-performing short-form campaigns for fintech, investing platforms, and finance brands.",
};

const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground font-bold px-7 py-3.5 text-base hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20";
const secondaryCta =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border text-foreground font-semibold px-7 py-3.5 text-base hover:bg-muted/50 transition-colors";
const eyebrow =
  "text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3";

const MEDIA_KIT_HREF = "/downloads/yung-geeski-media-kit.pdf";

export default async function BrandsPage() {
  const [metricsResult, portfolioResult] = await Promise.all([
    getAccountMetrics(),
    getFeaturedPortfolio(6),
  ]);
  const m = metricsResult.data;
  const portfolio = portfolioResult.data;
  const provisional = metricsResult.source === "fallback";

  // Gate assets/content that a human still has to supply so the page never ships
  // a 404 link or a grid of empty placeholders. Each auto-enables once the real
  // asset/data lands — no code change needed.
  const mediaKitAvailable = existsSync(path.join(process.cwd(), "public", MEDIA_KIT_HREF));
  const caseStudy = DELTA_OPTIONS_CASE_STUDY;
  const caseStudyHasResults = caseStudy.results.some((r) => r.value !== null);
  const asOfNote = metricsResult.asOf
    ? `As of ${new Date(metricsResult.asOf).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : provisional
      ? "Provisional figures — live platform sync in progress"
      : null;

  const performanceMetrics: { label: string; value: string }[] = [
    { label: "Total followers", value: `${formatCompact(m.totalFollowers)}+` },
    { label: "Best-performing video", value: `${formatCompact(m.bestVideoViews)} views` },
    {
      label: `Videos above ${formatCompact(m.notableViewsThreshold)} views`,
      value: `${m.videosAboveThreshold}+`,
    },
    { label: "Monthly reach", value: formatCompact(m.monthlyReach) },
    { label: "Content category", value: m.category },
  ];

  return (
    <>
      <div className="flex flex-col">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden px-4 pb-16 pt-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
          <div className="container relative z-10 mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Financial Visual-Content Studio
            </div>
            <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Turn Financial Data Into{" "}
              <span className="text-secondary">Content People Actually Watch</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Yung Geeski creates data-driven finance videos for fintech companies, investing
              platforms, financial publishers, and consumer brands.
            </p>
            <div className="mb-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="#inquiry" className={primaryCta}>
                Request a Campaign
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#portfolio" className={secondaryCta}>
                View Past Work
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCompact(m.totalFollowers)}+ followers
              &nbsp;&nbsp;·&nbsp;&nbsp;Multiple videos above{" "}
              {formatCompact(m.notableViewsThreshold)} views
              &nbsp;&nbsp;·&nbsp;&nbsp;{formatCompact(m.monthlyReach)}+ views in 30 days
            </p>
          </div>

          <div className="container relative z-10 mx-auto mt-12 max-w-3xl">
            <BrandHeroMontage />
          </div>
        </section>

        {/* ── PERFORMANCE / PORTFOLIO ── */}
        <section id="portfolio" className="scroll-mt-4 bg-card/30 px-4 py-20">
          <div className="container mx-auto max-w-5xl">
            <p className={eyebrow}>Performance</p>
            <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">
              The numbers brands are buying
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
              Reach and engagement built on finance and business content — not vanity views.
            </p>

            {/* Metric row */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {performanceMetrics.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-card px-4 py-5 text-center"
                >
                  <p className="text-xl font-bold text-secondary sm:text-2xl">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            {asOfNote && (
              <p className="mb-12 text-center text-[11px] text-muted-foreground/70">{asOfNote}</p>
            )}

            {/* Portfolio grid */}
            <h3 className="mb-6 text-center text-lg font-semibold">Recent standout posts</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((post) => (
                <PortfolioCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="scroll-mt-4 px-4 py-20">
          <div className="container mx-auto max-w-5xl">
            <p className={eyebrow}>Services</p>
            <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">
              Ways to work together
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
              Starting prices are listed up front so we can move straight to the campaign that fits.
            </p>
            <div className="grid gap-5 lg:grid-cols-3">
              {SPONSOR_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={
                    pkg.featured
                      ? "flex flex-col rounded-2xl border-2 border-secondary bg-secondary/5 p-6"
                      : "flex flex-col rounded-2xl border border-border bg-card p-6"
                  }
                >
                  {pkg.featured && (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary-foreground">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pkg.tagline}</p>
                  <p className="mt-4 text-xl font-bold text-secondary">{pkg.startingPrice}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#inquiry"
                    className={
                      pkg.featured
                        ? "mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90"
                        : "mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted/50"
                    }
                  >
                    Request a Campaign
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CASE STUDY ── */}
        <section className="bg-card/30 px-4 py-20">
          <div className="container mx-auto max-w-4xl">
            <p className={eyebrow}>Case Study</p>
            <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">
              {caseStudy.client}
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
              A native chart campaign built around a single, trackable comment CTA.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">
                  Objective
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {caseStudy.objective}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">
                  Approach
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {caseStudy.approach}
                </p>
              </div>
            </div>

            {/* Results — gated: only render the metric grid once verified numbers exist,
                otherwise a clean placeholder instead of a row of em-dashes. */}
            <div className="mt-5 rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary">
                Results
              </h3>
              {caseStudyHasResults ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {caseStudy.results.map((r) => (
                    <div
                      key={r.label}
                      className="rounded-xl border border-border/60 bg-background/40 px-4 py-4 text-center"
                    >
                      <p className="text-lg font-bold text-foreground">{r.value ?? "—"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Verified campaign results are being finalized and will be published here.
                </p>
              )}
            </div>

            {/* Comment proof */}
            {caseStudy.screenshots.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {caseStudy.screenshots.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`${caseStudy.client} campaign comment section ${i + 1}`}
                    className="w-full rounded-2xl border border-border"
                  />
                ))}
              </div>
            )}
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <Quote className="h-3.5 w-3.5 shrink-0 text-secondary" />
              Comment intent proves campaign impact better than a vanity metric.
            </p>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-4xl">
            <p className={eyebrow}>Process</p>
            <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
              From brief to published campaign
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10">
                      <Icon className="h-4 w-4 text-secondary" />
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-sm font-semibold">{title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRAND FIT + DISCLOSURE ── */}
        <section className="bg-card/30 px-4 py-20">
          <div className="container mx-auto max-w-3xl">
            <p className={eyebrow}>Brand Fit</p>
            <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Best suited for</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BRAND_FIT.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <Check className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
              {DISCLOSURE_STATEMENT}
            </p>
          </div>
        </section>

        {/* ── INQUIRY ── */}
        <section id="inquiry" className="scroll-mt-4 px-4 py-20">
          <div className="container mx-auto max-w-2xl">
            <p className={eyebrow}>Request a Campaign</p>
            <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">
              Tell us about your campaign
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-center text-sm text-muted-foreground">
              The more specific you are, the faster we can tell you whether it&apos;s a fit.
            </p>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <BrandInquiryForm />
            </div>
          </div>
        </section>

        {/* ── MEDIA KIT ── */}
        <section className="border-t border-border bg-gradient-to-b from-card/30 to-background px-4 py-16">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Download the media kit</h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              Audience summary, performance metrics, top content, services, starting prices, and
              disclosure policy — one page, no email required.
            </p>
            {/* Auto-enables once public/downloads/yung-geeski-media-kit.pdf is added. */}
            {mediaKitAvailable ? (
              <a href={MEDIA_KIT_HREF} download className={primaryCta}>
                <Download className="h-4 w-4" />
                Download Media Kit (PDF)
              </a>
            ) : (
              <span
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-semibold text-muted-foreground"
                aria-disabled="true"
              >
                <Download className="h-4 w-4" />
                Media Kit — coming soon
              </span>
            )}
          </div>
        </section>
      </div>

      <StickyCtaBanner
        href="#inquiry"
        label="Request a Campaign"
        subtext="Sponsored finance content that performs"
      />
    </>
  );
}
