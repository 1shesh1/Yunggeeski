import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { PARTNERSHIPS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request Received — Yung Geeski",
  description: "Your inquiry has been received.",
  robots: { index: false },
};

export default function BrandInquiryThanksPage() {
  return (
    <section className="px-4 py-24">
      <div className="container mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircle2 className="h-7 w-7 text-secondary" />
        </div>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Request received</h1>
        <p className="mx-auto mb-6 max-w-md leading-relaxed text-muted-foreground">
          Thanks for reaching out. A confirmation is on its way to your work email, and
          you&apos;ll hear back soon.
        </p>
        <div className="mx-auto mb-10 flex max-w-md items-start gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 p-4 text-left">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
          <p className="text-sm leading-relaxed">
            Our reply will come from{" "}
            <span className="font-semibold text-secondary">{PARTNERSHIPS_EMAIL}</span>. Add it to
            your contacts so it doesn&apos;t land in spam.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3.5 text-base font-bold text-secondary-foreground shadow-lg shadow-secondary/20 transition-colors hover:bg-secondary/90"
          >
            Browse the Portfolio
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
