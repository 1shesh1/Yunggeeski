"use client";

import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { TIERS, formatPrice, CHART_PACKAGE_FEATURES } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const X_MARK = "✗";

function getTierValue(
  row: (typeof CHART_PACKAGE_FEATURES)[number],
  tierId: "basic" | "standard" | "premium"
): string {
  return tierId === "basic" ? row.basic : tierId === "standard" ? row.standard : row.premium;
}

const TIER_META: Record<string, { badge?: string; highlight?: boolean; ctaLabel: string; deliveryHighlight?: string }> = {
  basic: {
    ctaLabel: "Order Basic",
    deliveryHighlight: "3–5 day delivery",
  },
  standard: {
    badge: "Most Popular",
    highlight: true,
    ctaLabel: "Order Standard Chart",
    deliveryHighlight: "3 day delivery",
  },
  premium: {
    ctaLabel: "Order Premium — Priority",
    deliveryHighlight: "24h priority",
  },
};

export function PricingCards() {
  return (
    <div className="grid gap-5 md:grid-cols-3 items-start">
      {TIERS.map((t) => {
        const meta = TIER_META[t.id] ?? { ctaLabel: "Order Your Chart" };
        return (
          <div
            key={t.id}
            className={cn(
              "rounded-2xl border flex flex-col overflow-hidden transition-transform",
              meta.highlight
                ? "border-secondary bg-card ring-1 ring-secondary/30 md:scale-[1.03]"
                : "border-border bg-card"
            )}
          >
            {/* Badge row */}
            {meta.badge ? (
              <div className="bg-secondary text-secondary-foreground text-center text-xs font-bold py-1.5 tracking-wider uppercase">
                {meta.badge}
              </div>
            ) : (
              <div className="py-1.5" />
            )}

            <div className="p-5 flex flex-col flex-1">
              {/* Price block */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  {t.name}
                </p>
                <p className="text-3xl font-bold">{formatPrice(t.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                {meta.deliveryHighlight && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-0.5">
                    ⚡ {meta.deliveryHighlight}
                  </span>
                )}
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5 mb-5 flex-1">
                {CHART_PACKAGE_FEATURES.map((row, i) => {
                  const value = getTierValue(row, t.id);
                  const isX = value === X_MARK;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      {isX ? (
                        <X className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/30" aria-hidden />
                      ) : (
                        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-secondary" aria-hidden />
                      )}
                      <span className={cn("text-xs leading-relaxed", isX && "text-muted-foreground/40")}>
                        <span className={cn("font-medium", isX ? "text-muted-foreground/40" : "text-foreground/80")}>
                          {row.label}
                        </span>
                        {!isX && value !== "Yes" && (
                          <span className="text-muted-foreground">: {value}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Who it's for */}
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{t.whoIsThisFor}</p>

              {/* CTA */}
              <Link
                href={`/checkout/${t.id}`}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl font-bold py-3 text-sm transition-colors",
                  meta.highlight
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    : "border border-border text-foreground hover:bg-muted/50"
                )}
              >
                {meta.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
