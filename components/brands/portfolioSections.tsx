import { Quote } from "lucide-react";
import type { ClientCaseStudy, StatCard, Testimonial } from "@/lib/clientWork";
import type { AudienceData, AudienceShare } from "@/lib/audience";
import { hasDemographics } from "@/lib/audience";
import {
  DELIVERABLES_NOTE,
  ENGAGEMENT_MODELS,
  SERVICES,
  SERVICES_HEADING,
  SERVICES_INTRO,
} from "@/lib/services";
import { cn, formatCompact } from "@/lib/utils";
import { PortfolioCard } from "./PortfolioCard";
import { ContactButtons } from "./sections";
import { eyebrow } from "./styles";

/** /portfolio sections that render on the server. Client-side ones live in their own files. */

/**
 * A row of stat cards. `note` is the small scope line under the value (which
 * platform, whose channel), so every figure is labelled with what it covers.
 */
export function StatCards({
  stats,
  size = "lg",
  className,
}: {
  stats: (StatCard & { note?: string })[];
  size?: "lg" | "sm";
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-3",
        size === "lg" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3",
        className,
      )}
    >
      {stats.map(({ label, value, note }) => (
        <div
          key={label}
          className={cn(
            "flex flex-col rounded-xl border text-center",
            size === "lg"
              ? "border-border bg-card px-3 py-5"
              : "border-border/60 bg-background/40 px-3 py-4",
          )}
        >
          <dt className="mt-1 text-xs text-muted-foreground">
            {label}
            {note && <span className="mt-0.5 block text-[11px] text-muted-foreground/70">{note}</span>}
          </dt>
          <dd
            className={cn(
              "order-first font-bold tabular-nums",
              size === "lg" ? "text-2xl text-secondary sm:text-3xl" : "text-lg sm:text-xl",
            )}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A single-colour client logo, reversed to white for the dark page. */
function ReversedLogo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("w-auto object-contain brightness-0 invert", className)} />
  );
}

export function ClientCaseStudySection({ study }: { study: ClientCaseStudy }) {
  return (
    <section id="clients" className="scroll-mt-24 px-4 py-20">
      <div className="container mx-auto max-w-4xl">
        <p className={eyebrow}>Client Case Study</p>
        <h2 className="sr-only">{study.client}</h2>
        <div className="mb-6 flex justify-center">
          <ReversedLogo src={study.logo} alt={`${study.client} logo`} className="h-7 max-w-[85vw] sm:h-9" />
        </div>
        <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
          {study.summary}
        </p>

        <StatCards stats={study.headline} />
        <div className="mt-3 rounded-2xl border border-border bg-card/40 p-3">
          <StatCards stats={study.supporting} size="sm" />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{study.resultsScope}</p>

        {study.gallery.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-5 text-center text-lg font-semibold">Top-performing posts</h3>
            {/* Centred wrap, so 3 or 4 posts sit evenly with no empty column. */}
            <div className="flex flex-wrap justify-center gap-4">
              {study.gallery.map((post) => (
                <div key={post.id} className="w-[calc(50%-0.5rem)] sm:w-56">
                  <PortfolioCard post={post} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="mb-4 text-sm font-medium">Want content like this for your brand?</p>
          <ContactButtons />
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section aria-label="Client testimonials" className="px-4 pb-20">
      <div
        className={cn(
          "container mx-auto grid gap-5",
          testimonials.length > 1 ? "max-w-5xl md:grid-cols-2" : "max-w-2xl",
        )}
      >
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="relative overflow-hidden rounded-3xl border border-secondary/30 bg-gradient-to-b from-secondary/10 to-secondary/[0.02] px-6 py-10 text-center sm:px-10"
          >
            <Quote className="mx-auto mb-4 h-8 w-8 text-secondary" aria-hidden />
            <blockquote className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              “{t.quote}”
            </blockquote>
            <figcaption className="flex flex-col items-center gap-3">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.title}, {t.company}
                </p>
              </div>
              {t.logo && (
                <ReversedLogo src={t.logo} alt={`${t.company} logo`} className="h-4 opacity-60 sm:h-5" />
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/**
 * One distribution as labelled horizontal bars. Single series, so no legend:
 * each row carries its own label and value, and the bar length is scaled to
 * the largest share so small differences stay visible.
 */
function ShareBars({ title, shares }: { title: string; shares: AudienceShare[] }) {
  const max = Math.max(...shares.map((s) => s.pct), 1);
  return (
    <figure className="rounded-2xl border border-border bg-card p-5">
      <figcaption className="mb-4 text-sm font-semibold">{title}</figcaption>
      <ul className="flex flex-col gap-2.5">
        {shares.map((s) => (
          <li
            key={s.label}
            className="grid grid-cols-[7.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-xs"
            title={`${s.label}: ${s.pct}%`}
          >
            <span className="truncate text-muted-foreground">{s.label}</span>
            <span className="h-2.5 rounded-full bg-muted/50">
              <span
                className="block h-full rounded-full bg-secondary"
                style={{ width: `${(s.pct / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-semibold tabular-nums">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/**
 * Audience demographics. Renders only once a breakdown has been supplied in
 * lib/audience.ts — until then the page skips it rather than show a shell.
 * Combined followers appear only when two or more platforms have figures, and
 * are labelled as accounts (one person can follow on several platforms).
 */
export function AudienceSection({ audience }: { audience: AudienceData }) {
  if (!hasDemographics(audience)) return null;

  const withFollowers = audience.platforms.filter(
    (p): p is typeof p & { followers: number } => p.followers != null && p.followers > 0,
  );
  const combined = withFollowers.reduce((acc, p) => acc + p.followers, 0);
  const platformStats: (StatCard & { note?: string })[] = withFollowers.map((p) => ({
    label: `${p.label} followers`,
    value: formatCompact(p.followers),
  }));
  if (withFollowers.length >= 2) {
    platformStats.unshift({
      label: "Combined followers",
      value: formatCompact(combined),
      note: withFollowers.map((p) => p.label).join(" + "),
    });
  }
  for (const p of audience.platforms) {
    if (p.monthlyViews) {
      platformStats.push({
        label: "Views, last 30 days",
        value: formatCompact(p.monthlyViews),
        note: p.label,
      });
    }
  }

  const charts = [
    { title: "Age", shares: audience.age },
    { title: "Gender", shares: audience.gender },
    { title: "Top countries", shares: audience.countries },
    { title: "Top cities", shares: audience.cities },
  ].filter((c) => c.shares.length > 0);

  return (
    <section id="audience" className="scroll-mt-24 border-y border-border bg-card/30 px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <p className={eyebrow}>Audience</p>
        <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">Who your campaign reaches</h2>
        <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
          {audience.demographicsSource
            ? `Share of ${audience.demographicsSource} followers, from ${audience.demographicsSource} analytics`
            : "From platform analytics"}
          {audience.asOf ? ` · ${audience.asOf}` : ""}
        </p>

        {platformStats.length > 0 && <StatCards stats={platformStats} className="mb-5" />}

        <div className={cn("grid gap-5", charts.length > 1 && "md:grid-cols-2")}>
          {charts.map((c) => (
            <ShareBars key={c.title} title={c.title} shares={c.shares} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <p className={eyebrow}>Services & Deliverables</p>
        <h2 className="mx-auto mb-4 max-w-2xl text-center text-2xl font-bold sm:text-3xl">
          {SERVICES_HEADING}
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
          {SERVICES_INTRO}
        </p>

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {ENGAGEMENT_MODELS.map((m) => (
            <div key={m.title} className="rounded-2xl border border-secondary/30 bg-secondary/5 p-6">
              <h3 className="mb-2 text-lg font-bold">{m.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              {m.example && <p className="mt-3 text-xs font-medium text-secondary">{m.example}</p>}
            </div>
          ))}
        </div>

        {/* Five services: 3 + 2 on desktop, the second row widened so it doesn't leave a hole. */}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <li
              key={title}
              className={cn(
                "flex gap-3 rounded-xl border border-border bg-card p-4 lg:col-span-2",
                i >= 3 && "lg:col-span-3",
                i === SERVICES.length - 1 && SERVICES.length % 2 === 1 && "sm:col-span-2",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                <Icon className="h-4 w-4 text-secondary" aria-hidden />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold leading-snug">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          {DELIVERABLES_NOTE}
        </p>
      </div>
    </section>
  );
}
