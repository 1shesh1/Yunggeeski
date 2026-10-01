import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandFaq } from "@/components/brands/BrandFaq";
import { primaryCta } from "@/components/brands/styles";

export const metadata = {
  title: "FAQ — YungGeeski",
  description: "Frequently asked questions about sponsored chart campaigns with Yung Geeski.",
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold tracking-tight">FAQ</h1>
        <BrandFaq />
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 text-sm font-semibold">How will a moving chart help my business?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Moving charts display data more elegantly and eye-catchingly than traditional formats.
            They reach more people through attention-grabbing short-form content, and articulate an
            idea more efficiently than raw data or lectures ever can.
          </p>
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/#inquiry" className={primaryCta}>
            Request a Campaign
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
