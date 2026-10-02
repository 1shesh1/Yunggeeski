import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { PortfolioCarousel } from "@/components/brands/PortfolioCarousel";
import { CaseStudyLogo } from "@/components/brands/CaseStudyLogo";
import { ContactButtons, InquirySection } from "@/components/brands/sections";
import {
  AudienceSection,
  ClientCaseStudySection,
  ServicesSection,
  StatCards,
  TestimonialsSection,
} from "@/components/brands/portfolioSections";
import { NotableReposts } from "@/components/brands/NotableReposts";
import { PressSection } from "@/components/brands/PressSection";
import { INQUIRY_HREF, eyebrow } from "@/components/brands/styles";
import {
  getAccountMetrics,
  getInstagramAudience,
  getPortfolioShowcase,
} from "@/lib/metrics/service";
import { DELTA_OPTIONS_CASE_STUDY, DELTA_OPTIONS_HIGHLIGHTS } from "@/lib/sponsorship";
import { IR_CASE_STUDY, IR_COLLAB_SHORTCODES, IR_TOTAL_VIEWS, TESTIMONIALS } from "@/lib/clientWork";
import { postShortcode } from "@/lib/portfolio";
import { AUDIENCE, withInstagram } from "@/lib/audience";
import { formatCompact } from "@/lib/utils";

// Same cadence as the landing page so both show the same live numbers.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio — Yung Geeski",
  description:
    "Custom financial data visualizations and short-form content by Yung Geeski — results, client work, audience, and press.",
};

/** Upper bound on posts shown: admin-featured first, then lib/portfolio.ts PINNED_PORTFOLIO. */
const PORTFOLIO_LIMIT = 12;

const PLATFORM_LABELS: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok" };

/**
 * Portfolio — the page sent to prospects in cold outreach, so it is ordered
 * for a one-minute scan: who / headline numbers / contact up top, then the
 * work, client results, audience, services, third-party recognition, and the
 * contact section. Contact is also one tap away in the header throughout.
 *
 * Metrics are always labelled with what they cover: Instagram followers are
 * never presented as the whole audience, and views on client accounts are
 * kept separate from views on Yung Geeski's own channel.
 */
export default async function PortfolioPage() {
  const [portfolioResult, metricsResult, igAudience] = await Promise.all([
    getPortfolioShowcase(PORTFOLIO_LIMIT),
    getAccountMetrics(),
    getInstagramAudience(),
  ]);
  const m = metricsResult.data;
  const isCollab = (p: { permalink?: string | null }) =>
    IR_COLLAB_SHORTCODES.has(postShortcode(p.permalink) ?? "");
  // Posts in the I&R gallery aren't repeated in the carousel.
  const galleryIds = new Set(IR_CASE_STUDY.gallery.map((p) => p.id));
  const posts = portfolioResult.data.filter((p) => !galleryIds.has(postShortcode(p.permalink) ?? ""));

  // Own-channel views leave out I&R collabs: those views are in the client total.
  const ownFeaturedViews = portfolioResult.data
    .filter((p) => !isCollab(p))
    .reduce((acc, p) => acc + p.views, 0);
  const igFollowers = m.followersByPlatform.instagram ?? null;
  const reachPlatforms = (metricsResult.platforms ?? [])
    .map((p) => PLATFORM_LABELS[p] ?? p)
    .join(" + ");

  const headlineStats = [
    ...(igFollowers
      ? [{ label: "Instagram followers", value: `${formatCompact(igFollowers)}+`, note: "@yunggeeski_" }]
      : []),
    {
      label: "Views on featured posts",
      value: `${formatCompact(ownFeaturedViews)}+`,
      note: "Own channel, excl. client collabs",
    },
    {
      label: "Views generated for clients",
      value: IR_TOTAL_VIEWS,
      note: "Investing & Retirement, 46 posts",
    },
    {
      label: "Monthly reach",
      value: `${formatCompact(m.monthlyReach)}+`,
      note: reachPlatforms ? `${reachPlatforms}, last 30 days` : "Last 30 days",
    },
  ];

  // Audience: Instagram is live (sync), other platforms are hand-entered in lib/audience.ts.
  const audience = withInstagram(AUDIENCE, { followers: igFollowers, ...igAudience });

  const delta = DELTA_OPTIONS_CASE_STUDY;

  return (
    <div className="flex flex-col">
      {/* ── 1. INTRO + HEADLINE NUMBERS ── */}
      <section className="relative overflow-hidden px-4 pb-14 pt-14 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <p className={eyebrow}>Portfolio</p>
          <h1 className="mx-auto mb-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Financial data, turned into{" "}
            <span className="text-secondary">content people watch</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Yung Geeski researches, designs, and animates data-driven finance videos — for brands&apos;
            own accounts, and for sponsors who want to reach this audience.
          </p>
          <ContactButtons className="mb-10" />
          <StatCards stats={headlineStats} />
        </div>
      </section>

      {/* ── 2. FEATURED POSTS + NOTABLE PROJECT ── */}
      <section id="showcase" className="scroll-mt-24 px-4 pb-16">
        <div className="container mx-auto max-w-5xl">
          <p className={eyebrow}>Featured Posts</p>
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
            Standouts from the Yung Geeski channel
          </h2>
          <PortfolioCarousel posts={posts} inquiryHref={INQUIRY_HREF} />
        </div>

        <div className="container mx-auto mt-14 max-w-4xl">
          <p className={eyebrow}>Sponsored Campaign</p>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 flex justify-center sm:justify-start">
              <CaseStudyLogo src={delta.logo} client={delta.client} />
            </div>
            {delta.keyResult && (
              <div className="mb-6 flex items-start gap-3">
                <Quote className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                <p className="text-base leading-relaxed">{delta.keyResult}</p>
              </div>
            )}
            <StatCards stats={DELTA_OPTIONS_HIGHLIGHTS} size="sm" className="mb-6" />
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-xs text-muted-foreground">{delta.resultsScope}</p>
              <Link
                href="/#case-study"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
              >
                Read the full case study
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3–4. CLIENT CASE STUDY + TESTIMONIAL ── */}
      <div className="border-t border-border bg-gradient-to-b from-card/30 to-background">
        <ClientCaseStudySection study={IR_CASE_STUDY} />
        <TestimonialsSection testimonials={TESTIMONIALS} />
      </div>

      {/* ── 5. AUDIENCE (renders once demographics are supplied) ── */}
      <AudienceSection audience={audience} />

      {/* ── 6. SERVICES ── */}
      <ServicesSection />

      {/* ── 7. NOTABLE REPOSTS ── */}
      <NotableReposts />

      {/* ── 8. PRESS ── */}
      <PressSection />

      {/* ── 9. CONTACT ── */}
      <div className="border-t border-border bg-gradient-to-b from-card/30 to-background">
        <InquirySection heading="Let's work together" />
      </div>
    </div>
  );
}
