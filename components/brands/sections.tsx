import Link from "next/link";
import { ArrowRight, Download, Mail } from "lucide-react";
import { INQUIRY_ANCHOR, PARTNERSHIPS_EMAIL, PARTNERSHIPS_MAILTO } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BrandInquiryForm } from "./BrandInquiryForm";
import { INQUIRY_HREF, eyebrow, primaryCta, secondaryCta } from "./styles";

/** Shared sections for the brand funnel (landing page + /portfolio). */

/**
 * The two ways to reach out, side by side: jump to the contact section, or
 * open an email straight away. Placed wherever a reader might be convinced.
 */
export function ContactButtons({
  className,
  primaryLabel = "Let's Work Together",
}: {
  className?: string;
  primaryLabel?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-center gap-3 sm:flex-row", className)}>
      <Link href={INQUIRY_HREF} className={primaryCta}>
        {primaryLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <a href={PARTNERSHIPS_MAILTO} className={secondaryCta}>
        <Mail className="h-4 w-4" aria-hidden />
        Email Me
      </a>
    </div>
  );
}

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
            Let&apos;s Work Together
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

/**
 * The contact section, anchored at #inquiry wherever it renders: "Email Me"
 * for people who'd rather write directly, and the short inquiry form for
 * everyone else. Side by side on desktop, email first on mobile.
 */
export function InquirySection({
  heading = "Let's work together",
  mediaKitHref,
}: {
  heading?: string;
  /** Only passed once the PDF exists, so the page never links a 404. */
  mediaKitHref?: string | null;
}) {
  return (
    <section id={INQUIRY_ANCHOR} className="scroll-mt-24 px-4 py-20">
      <div className="container mx-auto max-w-4xl">
        <p className={eyebrow}>Get in Touch</p>
        <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">{heading}</h2>
        <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
          Have an idea, a product, or just a question? Email me directly or send a short note
          below — no campaign brief needed.
        </p>

        <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="flex flex-col self-start rounded-2xl border border-secondary/30 bg-gradient-to-b from-secondary/10 to-secondary/[0.02] p-6 sm:p-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15">
              <Mail className="h-5 w-5 text-secondary" aria-hidden />
            </div>
            <h3 className="mb-2 text-lg font-bold">Email Me</h3>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Prefer your own inbox? Write to me directly and I&apos;ll reply from there.
            </p>
            <a href={PARTNERSHIPS_MAILTO} className={cn(primaryCta, "w-full px-5")}>
              <Mail className="h-4 w-4" aria-hidden />
              Email Me
            </a>
            <p className="mt-3 break-all text-center text-sm font-medium text-foreground">
              {PARTNERSHIPS_EMAIL}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h3 className="mb-1 text-lg font-bold">Submit an Inquiry</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Four quick fields. You&apos;ll get a confirmation right away.
            </p>
            <BrandInquiryForm />
          </div>
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
