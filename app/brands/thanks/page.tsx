import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Request Received — Work With Yung Geeski",
  description: "Your campaign request has been received.",
};

export default function BrandInquiryThanksPage() {
  return (
    <section className="px-4 py-24">
      <div className="container mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircle2 className="h-7 w-7 text-secondary" />
        </div>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Request received</h1>
        <p className="mx-auto mb-8 max-w-md leading-relaxed text-muted-foreground">
          Thanks for reaching out. Campaign requests are reviewed based on brand fit, audience
          relevance, budget, and production availability. If it&apos;s a match, you&apos;ll hear back
          at the work email you provided.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/brands#portfolio"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3.5 text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary/90 shadow-lg shadow-secondary/20"
          >
            View Past Work
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/brands"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </section>
  );
}
