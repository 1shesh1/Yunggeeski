import Link from "next/link";
import { Check, X, ArrowRight, BookOpen, BarChart2, Zap } from "lucide-react";
import { CourseCheckoutButton } from "@/components/CourseCheckoutButton";
import { StickyCtaBanner } from "@/components/StickyCtaBanner";
import { VideoPlayer } from "@/components/VideoPlayer";
import { cn } from "@/lib/utils";
import type { CourseTierId } from "@/lib/course";

const BEFORE_AFTER_VIDEOS = {
  before: "/videos/learn-before.mp4",
  after: "/videos/learn-after.mp4",
};

const COURSE_COMPARISON: { label: string; tier1: boolean; tier2: boolean; tier3: boolean }[] = [
  { label: "50 viral chart ideas", tier1: true, tier2: true, tier3: true },
  { label: "Narrative angle for each idea", tier1: true, tier2: true, tier3: true },
  { label: "Data source references", tier1: true, tier2: true, tier3: true },
  { label: "Hook logic behind why they work", tier1: true, tier2: true, tier3: true },
  { label: "My exact workflow", tier1: false, tier2: true, tier3: true },
  { label: "FRED + Yahoo Finance data pulling", tier1: false, tier2: true, tier3: true },
  { label: "Cumulative % formatting logic", tier1: false, tier2: true, tier3: true },
  { label: "CSV export method", tier1: false, tier2: true, tier3: true },
  { label: "Full software stack", tier1: false, tier2: true, tier3: true },
  { label: "20 finished viral chart videos", tier1: false, tier2: false, tier3: true },
  { label: "All CSV files", tier1: false, tier2: false, tier3: true },
  { label: "Captions + pinned comments", tier1: false, tier2: false, tier3: true },
];

const COURSE_TIERS: {
  id: CourseTierId;
  name: string;
  shortName: string;
  price: number;
  originalPrice: number | null;
  badge?: string;
  highlight?: boolean;
  whoIsThisFor: string;
  benefit: string;
}[] = [
  {
    id: "tier1",
    name: "Ideas — 50 Viral Chart Frameworks",
    shortName: "Ideas",
    price: 39,
    originalPrice: null,
    whoIsThisFor: "Creators who need chart ideas and angles, not the full workflow yet.",
    benefit: "Removes idea paralysis.",
  },
  {
    id: "tier2",
    name: "Ideas + System — Workflow & Tools",
    shortName: "Ideas + System",
    price: 149,
    originalPrice: 199,
    badge: "Most Popular",
    highlight: true,
    whoIsThisFor: "Creators ready to build charts themselves with a proven system.",
    benefit: "Removes technical confusion.",
  },
  {
    id: "tier3",
    name: "The Full Package",
    shortName: "Full Package",
    price: 299,
    originalPrice: 399,
    whoIsThisFor: "Those who want ideas, workflow, and ready-to-post assets all in one place.",
    benefit: "Removes all guesswork.",
  },
];

const TRUST_STATS = [
  { value: "48M+", label: "Monthly Views" },
  { value: "50", label: "Viral Chart Ideas" },
  { value: "3", label: "Tiers" },
  { value: "⚡", label: "Instant Access" },
];

const PAIN_POINTS = [
  "You don't know which data angles actually go viral vs. which fall flat",
  "Hours spent building charts that barely get any engagement",
  "No consistent process — every chart starts from scratch",
  "Technical confusion around data sourcing, formatting, and export",
  "Generic chart aesthetics that blend in instead of stopping the scroll",
];

const OUTCOMES = [
  "Generate 50+ viral chart ideas in minutes, not hours",
  "Know exactly which narrative angles drive engagement before you start",
  "Pull and format data from FRED and Yahoo Finance with confidence",
  "Build charts with a repeatable system — no more guesswork",
  "Post with captions and pinned comments optimized for reach",
];

const SOLUTION_PILLARS = [
  {
    icon: BookOpen,
    title: "50 Viral Chart Frameworks",
    desc: "Proven ideas with narrative angles, data sources, and the hook logic behind each one.",
  },
  {
    icon: BarChart2,
    title: "The Exact Workflow",
    desc: "FRED + Yahoo Finance data pulling, CSV formatting, cumulative % logic, and the full software stack.",
  },
  {
    icon: Zap,
    title: "Ready-to-Post Assets",
    desc: "20 finished viral chart videos, all CSV files, captions and pinned comments — in Tier 3.",
  },
];

export default function WorkflowPage() {
  return (
    <>
      <div className="flex flex-col">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-16 pb-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto max-w-3xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-6">
              Digital Course &amp; Workflow
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
              Turn Raw Market Data Into{" "}
              <span className="text-secondary">Viral Finance Content</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              The exact system behind 48M+ monthly views — learn to build high-performing finance charts from scratch, with zero guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground font-bold px-7 py-3.5 text-base hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
              >
                Get Instant Access
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#whats-included"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border text-foreground font-semibold px-7 py-3.5 text-base hover:bg-muted/50 transition-colors"
              >
                See What&apos;s Included
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Instant access after purchase&nbsp;&nbsp;·&nbsp;&nbsp;48M+ monthly views&nbsp;&nbsp;·&nbsp;&nbsp;One-time payment, no subscription
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
              Most finance creators hit the same wall.
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
              Idea paralysis. Technical confusion. Spending hours on content that underperforms. The problem isn&apos;t effort — it&apos;s the system.
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
              A repeatable system for charts that drive real engagement.
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              This isn&apos;t a generic course. It&apos;s the exact workflow behind 48M+ monthly views — broken down so you can replicate it yourself.
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

        {/* ── OUTCOMES: WHAT YOU'LL BE ABLE TO DO ── */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Outcomes
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              What you&apos;ll be able to do
            </h2>
            <ul className="space-y-3">
              {OUTCOMES.map((outcome, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3.5"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  <span className="text-sm font-medium leading-relaxed">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── WHAT'S INCLUDED (comparison table) ── */}
        <section id="whats-included" className="py-20 px-4 bg-card/30 scroll-mt-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              What&apos;s Included
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              Full breakdown by tier
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10">
              Every tier unlocks all sections at and below it. Tier 3 includes everything.
            </p>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-xs w-1/2">
                      Feature
                    </th>
                    <th className="text-center py-3.5 px-3 font-semibold text-foreground text-xs">
                      Ideas<br />
                      <span className="text-secondary font-bold">$39</span>
                    </th>
                    <th className="text-center py-3.5 px-3 font-semibold text-xs bg-secondary/5 border-x border-secondary/20">
                      <span className="text-secondary">Ideas + System</span><br />
                      <span className="text-secondary font-bold">$149</span>
                    </th>
                    <th className="text-center py-3.5 px-3 font-semibold text-foreground text-xs">
                      Full Package<br />
                      <span className="text-secondary font-bold">$299</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COURSE_COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4 text-muted-foreground text-xs">{row.label}</td>
                      <td className="py-2.5 px-3 text-center">
                        {row.tier1 ? (
                          <Check className="h-4 w-4 text-secondary mx-auto" aria-hidden />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30 mx-auto" aria-hidden />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-secondary/5 border-x border-secondary/10">
                        {row.tier2 ? (
                          <Check className="h-4 w-4 text-secondary mx-auto" aria-hidden />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30 mx-auto" aria-hidden />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {row.tier3 ? (
                          <Check className="h-4 w-4 text-secondary mx-auto" aria-hidden />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30 mx-auto" aria-hidden />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── BEFORE & AFTER ── */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Transformation
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              Before &amp; after the system
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10">
              The difference between a raw data export and a chart built with the workflow.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Before */}
              <div className="rounded-2xl border border-border overflow-hidden bg-card flex flex-col">
                <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Before
                  </span>
                </div>
                <p className="text-xs text-muted-foreground px-4 pb-3">
                  Default export — no narrative, easy to scroll past.
                </p>
                <div className="aspect-[4/5] overflow-hidden">
                  <VideoPlayer src={BEFORE_AFTER_VIDEOS.before} label="Before" />
                </div>
              </div>
              {/* After */}
              <div className="rounded-2xl border border-secondary/40 overflow-hidden bg-card flex flex-col">
                <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                    After
                  </span>
                </div>
                <p className="text-xs text-muted-foreground px-4 pb-3">
                  Clear angle, clean data — built for virality.
                </p>
                <div className="aspect-[4/5] overflow-hidden">
                  <VideoPlayer src={BEFORE_AFTER_VIDEOS.after} label="After" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-20 px-4 bg-card/30 scroll-mt-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Pricing
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              Choose your learning path
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-2 max-w-lg mx-auto">
              Instant access after purchase. Each tier unlocks everything at and below it.
            </p>
            <p className="text-xs text-muted-foreground text-center mb-10">
              After purchase you&apos;ll receive a link to your{" "}
              <Link href="/workflow/access" className="text-secondary hover:underline">
                workflow access page
              </Link>{" "}
              to download your materials.
            </p>
            <div className="grid gap-5 md:grid-cols-3 items-start">
              {COURSE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  id={tier.id}
                  className={cn(
                    "rounded-2xl border flex flex-col overflow-hidden scroll-mt-4 transition-transform",
                    tier.highlight
                      ? "border-secondary bg-card ring-1 ring-secondary/30 md:scale-[1.03]"
                      : "border-border bg-card"
                  )}
                >
                  {/* Badge */}
                  {tier.badge ? (
                    <div className="bg-secondary text-secondary-foreground text-center text-xs font-bold py-1.5 tracking-wider uppercase">
                      {tier.badge}
                    </div>
                  ) : (
                    <div className="py-1.5" />
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Price */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        {tier.shortName}
                      </p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {tier.originalPrice != null && (
                          <span className="text-base text-muted-foreground line-through">
                            ${tier.originalPrice}
                          </span>
                        )}
                        <span className="text-3xl font-bold">${tier.price}</span>
                      </div>
                    </div>

                    {/* Feature checklist */}
                    <ul className="space-y-2 mb-5 flex-1">
                      {COURSE_COMPARISON.map((row, i) => {
                        const included =
                          tier.id === "tier1"
                            ? row.tier1
                            : tier.id === "tier2"
                            ? row.tier2
                            : row.tier3;
                        return (
                          <li key={i} className="flex items-center gap-2">
                            {included ? (
                              <Check className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden />
                            ) : (
                              <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" aria-hidden />
                            )}
                            <span
                              className={cn(
                                "text-xs",
                                !included && "text-muted-foreground/40"
                              )}
                            >
                              {row.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Bottom */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tier.whoIsThisFor}
                      </p>
                      <p className="text-xs font-semibold text-secondary">{tier.benefit}</p>
                      <CourseCheckoutButton
                        tierId={tier.id}
                        className={cn(
                          "w-full font-bold mt-1 h-11 rounded-xl",
                          tier.highlight
                            ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            : ""
                        )}
                      >
                        Get Instant Access
                      </CourseCheckoutButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OBJECTION HANDLING ── */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest text-center mb-3">
              Objections
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Still on the fence?
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is this for beginners?",
                  a: "Yes. The workflow is designed to be clear even if you've never pulled financial data before. Tier 2 walks you through every step of the process from zero.",
                },
                {
                  q: "What software do I need?",
                  a: "The full software stack is revealed in Tier 2. No expensive subscriptions required — the workflow uses accessible tools most creators can get immediately.",
                },
                {
                  q: "What format are the materials?",
                  a: "PDF guides and video files. Tier 3 includes finished MP4 chart videos, CSV files, and caption templates ready to use as-is.",
                },
                {
                  q: "Is this a subscription?",
                  a: "No. One-time payment, instant access. You keep everything you download.",
                },
                {
                  q: "What if the ideas don't fit my niche?",
                  a: "The 50 frameworks cover macro, stocks, real estate, debt, and more. The narrative structure adapts to any data-driven finance topic.",
                },
                {
                  q: "How is this different from the custom chart service?",
                  a: "The custom chart service is done-for-you — we build the charts. This course teaches you the system so you can build charts yourself at scale. Different buyer, different outcome.",
                },
              ].map(({ q, a }, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold mb-2 text-sm">{q}</h3>
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
                <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Learn the System
                </div>
                <h3 className="font-bold text-lg mb-2">Workflow &amp; Course</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  50 viral chart ideas + the exact workflow. Build your own charts at scale.
                </p>
                <Link
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary text-secondary-foreground font-bold px-5 py-2.5 text-sm hover:bg-secondary/90 transition-colors"
                >
                  Get Instant Access
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Done-For-You
                </div>
                <h3 className="font-bold text-lg mb-2">Custom Chart Service</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  We build your charts. Fixed price, fast turnaround, source-backed data.
                </p>
                <Link
                  href="/charts"
                  className="inline-flex items-center gap-2 rounded-xl border border-border text-foreground font-bold px-5 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                >
                  See Chart Service
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
              Stop guessing. Start posting charts that perform.
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              48M+ monthly views. One system. Instant access after purchase.
            </p>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground font-bold px-8 py-4 text-base hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
            >
              Get Instant Access
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center justify-center gap-4 mt-8">
              {[
                { icon: Check, text: "One-time payment" },
                { icon: Check, text: "Instant download" },
                { icon: Check, text: "No subscription" },
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
        href="#pricing"
        label="Get Instant Access"
        subtext="50 viral ideas + full workflow system"
      />
    </>
  );
}
