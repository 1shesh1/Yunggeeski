import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { INQUIRY_ANCHOR, PARTNERSHIPS_EMAIL } from "@/lib/site";
import { BrandInquiryForm } from "./BrandInquiryForm";
import { INQUIRY_HREF, eyebrow, primaryCta, secondaryCta } from "./styles";

/** Shared sections for the brand funnel (landing page + /portfolio). */

/** A full-width conversion band placed after a proof section. */
export function CtaBand({
  title,
  body,
  secondary,
}: {
  title: string;
  body?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="px-4 py-14">
      <div className="container mx-auto max-w-3xl rounded-3xl border border-secondary/30 bg-gradient-to-b from-secondary/10 to-secondary/[0.02] px-6 py-10 text-center sm:px-10">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">{title}</h2>
        {body && (
          <p className="mx-auto mb-7 max-w-lg text-sm leading-relaxed text-muted-foreground">{body}</p>
        )}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={INQUIRY_HREF} className={primaryCta}>
            Request a Campaign
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondary && (
            <Link href={secondary.href} className={secondaryCta}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/** The campaign request form section. Anchored at #inquiry wherever it renders. */
export function InquirySection({
  heading = "Tell us about your campaign",
  mediaKitHref,
}: {
  heading?: string;
  /** Only passed once the PDF exists, so the page never links a 404. */
  mediaKitHref?: string | null;
}) {
  return (
    <section id={INQUIRY_ANCHOR} className="scroll-mt-24 px-4 py-20">
      <div className="container mx-auto max-w-2xl">
        <p className={eyebrow}>Request a Campaign</p>
        <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">{heading}</h2>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm text-muted-foreground">
          Takes about two minutes. You&apos;ll get a confirmation right away, and a reply from{" "}
          <span className="font-medium text-foreground">{PARTNERSHIPS_EMAIL}</span> once we&apos;ve
          reviewed it.
        </p>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <BrandInquiryForm />
        </div>
        {mediaKitHref && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need something for an internal review first?{" "}
            <a
              href={mediaKitHref}
              download
              className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Download the media kit
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
