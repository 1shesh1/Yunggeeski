import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCheckoutButton } from "@/components/CourseCheckoutButton";
import { cn } from "@/lib/utils";
import type { CourseTierId } from "@/lib/course";

/** Before/after video paths: add files to public/videos/ or set full URLs. Empty = placeholder. */
const BEFORE_AFTER_VIDEOS = {
  before: "/videos/learn-before.mp4",
  after: "/videos/learn-after.mp4",
};

/** Comparison matrix: same features across course tiers, ✓/✗ per tier */
const COURSE_COMPARISON: { label: string; tier1: boolean; tier2: boolean; tier3: boolean }[] = [
  { label: "50 viral chart ideas", tier1: true, tier2: true, tier3: true },
  { label: "Narrative angle for each", tier1: true, tier2: true, tier3: true },
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

const COURSE_TIERS: { id: CourseTierId; name: string; price: number; originalPrice: number | null; whoIsThisFor: string; benefit: string }[] = [
  {
    id: "tier1",
    name: "Ideas — 50 Viral Chart Frameworks",
    price: 39,
    originalPrice: null as number | null,
    whoIsThisFor: "Creators who need chart ideas and angles, not the full workflow yet.",
    benefit: "Removes idea paralysis.",
  },
  {
    id: "tier2",
    name: "Ideas + System — Workflow & Tools",
    price: 149,
    originalPrice: 199,
    whoIsThisFor: "Creators ready to build charts themselves with a proven system.",
    benefit: "Removes technical confusion.",
  },
  {
    id: "tier3",
    name: "The Full Package — Ideas, System & Ready-to-Post Assets",
    price: 299,
    originalPrice: 399,
    whoIsThisFor: "Those who want ideas, workflow, and ready-to-post assets in one place.",
    benefit: "Removes guesswork.",
  },
];

function formatPrice(dollars: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dollars);
}

export default function WorkflowPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Turn Raw Market Data
          <br />
          Into <span className="text-secondary">Viral Finance Content</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          The exact system behind 48M+ monthly views in finance charts
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">Pick your learning path</h2>
        <p className="text-center text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
          After purchase you'll get a link to your <Link href="/workflow/access" className="underline hover:text-foreground">workflow access page</Link> to download what you bought. Tier 1 unlocks the first section; Tier 2 unlocks the first two; Tier 3 unlocks everything.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {COURSE_TIERS.map((tier) => (
            <Card key={tier.id} id={tier.id} className="flex flex-col scroll-mt-6">
              <CardHeader>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="flex items-baseline gap-2 flex-wrap">
                  {tier.originalPrice != null && (
                    <span className="text-lg font-medium text-muted-foreground line-through">
                      {formatPrice(tier.originalPrice)}
                    </span>
                  )}
                  <p className="text-2xl font-bold">{formatPrice(tier.price)}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {COURSE_COMPARISON.map((row, i) => {
                    const included = tier.id === "tier1" ? row.tier1 : tier.id === "tier2" ? row.tier2 : row.tier3;
                    return (
                      <li key={i} className="flex items-center gap-2">
                        {included ? (
                          <Check className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
                        )}
                        <span className={cn(!included && "opacity-70")}>{row.label}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-sm font-medium mt-4 text-foreground">{tier.benefit}</p>
                <p className="text-xs font-medium text-secondary mt-4">Who this is for: {tier.whoIsThisFor}</p>
              </CardContent>
              <CardFooter>
                <CourseCheckoutButton tierId={tier.id} className="w-full">
                  Get this tier
                </CourseCheckoutButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">Before & after</h2>
        <p className="text-center text-muted-foreground text-sm mb-8 max-w-xl mx-auto">
          See the difference: generic data viz vs. the kind of chart that drives engagement.
        </p>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Before</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Default export, no narrative, easy to scroll past.
              </p>
              <div className="rounded-lg border border-border bg-muted/20 aspect-[4/5] overflow-hidden flex items-center justify-center">
                {BEFORE_AFTER_VIDEOS.before ? (
                  <video
                    src={BEFORE_AFTER_VIDEOS.before}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">Chart placeholder — before</span>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-secondary">After</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Clear angle, clean data, built for virality.
              </p>
              <div className="rounded-lg border border-secondary/50 bg-secondary/5 aspect-[4/5] overflow-hidden flex items-center justify-center">
                {BEFORE_AFTER_VIDEOS.after ? (
                  <video
                    src={BEFORE_AFTER_VIDEOS.after}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-secondary text-sm">Chart placeholder — after</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
