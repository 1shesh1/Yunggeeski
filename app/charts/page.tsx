import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Shield, Zap, Clock } from "lucide-react";
import { PricingCards } from "@/components/PricingCards";
import { StickyCtaBanner } from "@/components/StickyCtaBanner";
import { VideoPlayer } from "@/components/VideoPlayer";

export const metadata: Metadata = {
  title: "Custom Financial Charts — YungGeeski",
  description: "Done-for-you financial charts built for engagement. Fixed pricing, source-backed data, fast turnaround.",
};

const SAMPLE_VIDEOS: { tier: string; label: string; src: string }[] = [
  { tier: "basic", label: "Basic", src: "/videos/basic-sample.mp4" },
  { tier: "standard", label: "Standard", src: "/videos/standard-sample.mp4" },
  { tier: "premium", label: "Premium", src: "/videos/premium-sample.mp4" },
];

const TRUST_STATS = [
  { value: "48M+", label: "Monthly Views" },
  { value: "4K 60fps", label: "Delivery Quality" },
  { value: "24h", label: "Priority Option" },
  { value: "100%", label: "Source-Backed" },
];

const PAIN_POINTS = [
  "Raw data exports look like spreadsheet screenshots — nothing stops the scroll",
  "Generic colors and no narrative means viewers move on in under 2 seconds",
  "You spend hours designing charts that still underperform",
  "No consistent brand identity across your financial content",
  "You know you need better visuals but don't know where to start",
];

const SOLUTION_PILLARS = [
  {
    icon: Shield,
    title: "Source-Backed Data",
    desc: "Every chart uses verified financial data from FRED, Yahoo Finance, and trusted sources — cited on delivery.",
  },
  {
    icon: Zap,
    title: "Narrative-First Design",
    desc: "Each chart is built around a clear angle that tells a story. Hooks, not just data.",
  },
  {
    icon: Clock,
    title: "Fast, Fixed-Price Delivery",
    desc: "Standard in 3 days. Premium with 24h priority. No hourly billing, no surprise fees.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose Your Package",
    desc: "Pick the tier that fits your needs. Basic if you have your specs ready. Standard or Premium if you want us to research, source data, and brand everything.",
  },
  {
    step: "02",
    title: "Submit Your Brief",
    desc: "Tell us your chart idea, brand colors, and platform. For Standard and Premium, we handle all the data sourcing and narrative concept for you.",
  },
  {
    step: "03",
    title: "Receive Your Chart",
    desc: "We deliver a polished, engagement-ready 4K 60fps video — with revisions included until you're satisfied.",
  },
];

const OBJECTIONS = [
  {
    q: "Do I own the chart when it's delivered?",
    a: "Yes. Full ownership on delivery. Use it across any platform, however you want.",
  },
  {
    q: "What if I don't like the first version?",
    a: "Every package includes revisions. Basic: 1 revision. Standard: 2. Premium: 3. We iterate until the chart is exactly right.",
  },
  {
    q: "Can you match my brand colors and style?",
    a: "Yes — branding (logo placement and color matching) is included in Standard and Premium. Supply your hex codes and logo and we'll match your aesthetic.",
  },
  {
    q: "What if I don't have data ready?",
    a: "Standard and Premium tiers include full data sourcing from verified financial sources like FRED and Yahoo Finance. You don't need to bring anything except your idea.",
  },
  {
    q: "What file format do I receive?",
    a: "4K 60fps MP4, optimized for social. CSV export is available as an add-on. Custom formats on request.",
  },
  {
    q: "What is the collaboration post add-on?",
    a: "A co-authored Instagram post featuring your chart alongside the @YungGeeski account — direct exposure to an engaged finance audience.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I submit my order after checkout?",
    a: "After purchase, you'll complete a short order form with your chart specs. We review and begin production within 24 hours of receiving your completed brief.",
  },
  {
    q: "Can I order multiple charts at once?",
    a: "Yes. Reach out via email for bulk pricing and ongoing collaboration packages.",
  },
  {
    q: "What data sources do you use?",
    a: "FRED (Federal Reserve Economic Data), Yahoo Finance, and other verified financial datasets depending on the chart topic.",
  },
  {
    q: "Is a rush option available?",
    a: "Premium tier includes 24h priority turnaround by default. A 24h rush add-on (+$50) is also available for Basic and Standard orders.",
  },
  {
    q: "How does the workflow/course differ from this service?",
    a: "The custom chart service is done-for-you — we build the chart. The workflow/course teaches you the system so you can build charts yourself. Not sure which one? Check out the home page.",
  },
];

export default function ChartsPage() {
  return (
    <>
      <div className="flex flex-col">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-16 pb-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto max-w-3xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-6">
              Done-For-You Service
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
              Financial Charts That{" "}
              <span className="text-secondary">Stop the Scroll</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              We source the data, craft the narrative, and deliver content-ready financial charts — at a fixed price, on your timeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                href="/checkout/standard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground font-bold px-7 py-3.5 text-base hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
              >
                Order Your Chart
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border text-foreground font-semibold px-7 py-3.5 text-base hover:bg-muted/50 transition-colors"
              >
                See What&apos;s Included
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              48M+ monthly views generated&nbsp;&nbsp;·&nbsp;&nbsp;Source-backed data&nbsp;&nbsp;·&nbsp;&nbsp;4K 60fps delivery
            </p>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <section className="border-y border-border bg-card/40 py-6 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {TRUST_STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-secondary">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM ── */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              The Problem
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
              Most financial charts get scrolled past in under 2 seconds.
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
              Default data exports look like spreadsheets. No narrative. No visual hook. Nothing to make a viewer stop — or share.
            </p>
            <ul className="space-y-3">
              {PAIN_POINTS.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
                >
                  <span className="mt-0.5 h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-destructive text-xs font-bold">✕</span>
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── SOLUTION ── */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3">
              The Solution
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Your data. Our execution. Built to perform.
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              We combine verified financial data, narrative structure, and premium design to create charts that earn engagement — not just impressions.
            </p>
            <div className="grid sm:grid-cols-3 gap-5 text-left">
              {SOLUTION_PILLARS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-border bg-card p-5">
                  <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Process
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              3 simple steps to your chart
            </h2>
            <div className="space-y-8">
              {HOW_IT_WORKS.map(({ step, title, desc }) => (
                <div key={step} className="flex gap-5 items-start">
                  <div className="shrink-0 h-11 w-11 rounded-full border-2 border-secondary/50 flex items-center justify-center bg-secondary/5">
                    <span className="text-xs font-bold text-secondary">{step}</span>
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold mb-1.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-20 px-4 bg-card/30 scroll-mt-4">
          <div className="container mx-auto max-w-5xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Pricing
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              Fixed pricing. No surprises.
            </h2>
            <p className="text-muted-foreground text-center text-sm mb-10">
              Choose your package and order in minutes. Collaboration posts now available.
            </p>
            <PricingCards />
          </div>
        </section>

        {/* ── SAMPLES ── */}
        <section id="examples" className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Work Samples
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              See the work
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10 max-w-md mx-auto">
              Each video shows the type of engagement-ready chart delivered per package tier.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SAMPLE_VIDEOS.map(({ tier, label, src }) => (
                <div key={tier} className="rounded-2xl border border-border overflow-hidden bg-card flex flex-col">
                  <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                      {label}
                    </span>
                    <Link
                      href={`/checkout/${tier}`}
                      className="text-xs text-muted-foreground hover:text-secondary transition-colors underline underline-offset-2"
                    >
                      Order this tier
                    </Link>
                  </div>
                  <div className="aspect-[4/5] overflow-hidden">
                    <VideoPlayer src={src} label={label} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OBJECTION HANDLING ── */}
        <section className="py-20 px-4 bg-card/30">
          <div className="container mx-auto max-w-2xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Common Questions
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Everything you need to know before ordering
            </h2>
            <div className="space-y-4">
              {OBJECTIONS.map(({ q, a }, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold mb-2 text-sm">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-xl font-bold text-center mb-8">More questions</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map(({ q, a }, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-5">
                  <h3 className="font-medium mb-1.5 text-sm">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DUAL-OFFER BRIDGE ── */}
        <section className="py-12 px-4 border-t border-border">
          <div className="container mx-auto max-w-3xl">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-6">
              Two ways to work with YungGeeski
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-2xl border-2 border-secondary bg-secondary/5 p-6">
                <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Done-For-You</div>
                <h3 className="font-bold text-lg mb-2">Custom Chart Service</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  We build your charts. Fixed price, fast turnaround, source-backed data.
                </p>
                <Link
                  href="/checkout/standard"
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary text-secondary-foreground font-bold px-5 py-2.5 text-sm hover:bg-secondary/90 transition-colors"
                >
                  Order Your Chart
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Learn the System</div>
                <h3 className="font-bold text-lg mb-2">Workflow &amp; Course</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Learn to build viral finance charts yourself. 50 ideas + the full workflow.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-border text-foreground font-bold px-5 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                >
                  See the Workflow
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 px-4 bg-gradient-to-b from-card/30 to-background">
          <div className="container mx-auto max-w-xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to create your first chart?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Fixed pricing. No surprise fees. Revisions until you&apos;re happy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/checkout/standard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground font-bold px-8 py-4 text-base hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
              >
                Order Your Chart
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border text-foreground font-semibold px-8 py-4 text-base hover:bg-muted/50 transition-colors"
              >
                Compare Packages
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-8">
              {[
                { icon: Check, text: "Full ownership" },
                { icon: Check, text: "Revisions included" },
                { icon: Check, text: "Source-backed data" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-secondary" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      <StickyCtaBanner
        href="/checkout/standard"
        label="Order Your Chart"
        subtext="Custom financial charts — fixed price"
      />
    </>
  );
}
