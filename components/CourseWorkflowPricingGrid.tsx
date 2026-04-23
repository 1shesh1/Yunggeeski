"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { CourseCheckoutButton } from "@/components/CourseCheckoutButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CourseTierId } from "@/lib/course";

export interface CourseWorkflowTierDisplay {
  id: CourseTierId;
  name: string;
  shortName: string;
  price: number;
  originalPrice: number | null;
  badge?: string;
  highlight?: boolean;
  whoIsThisFor: string;
  benefit: string;
}

export interface CourseWorkflowComparisonRow {
  label: string;
  tier1: boolean;
  tier2: boolean;
  tier3: boolean;
}

export function CourseWorkflowPricingGrid({
  tiers,
  comparison,
}: {
  tiers: CourseWorkflowTierDisplay[];
  comparison: CourseWorkflowComparisonRow[];
}) {
  const [checkoutEmail, setCheckoutEmail] = useState("");

  return (
    <>
      <div className="max-w-md mx-auto mb-10 text-left">
        <Label htmlFor="course-checkout-email" className="text-xs font-medium text-foreground">
          Email for course access (optional)
        </Label>
        <Input
          id="course-checkout-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={checkoutEmail}
          onChange={(e) => setCheckoutEmail(e.target.value)}
          className="mt-1.5"
        />
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Prefills Stripe checkout when possible. After purchase, use the same email on the{" "}
          <Link href="/workflow/access" className="text-secondary hover:underline">
            access page
          </Link>{" "}
          to request a sign-in link.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 items-start">
        {tiers.map((tier) => (
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
            {tier.badge ? (
              <div className="bg-secondary text-secondary-foreground text-center text-xs font-bold py-1.5 tracking-wider uppercase">
                {tier.badge}
              </div>
            ) : (
              <div className="py-1.5" />
            )}

            <div className="p-5 flex flex-col flex-1">
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  {tier.shortName}
                </p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  {tier.originalPrice != null && (
                    <span className="text-base text-muted-foreground line-through">${tier.originalPrice}</span>
                  )}
                  <span className="text-3xl font-bold">${tier.price}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-5 flex-1">
                {comparison.map((row, i) => {
                  const included =
                    tier.id === "tier1" ? row.tier1 : tier.id === "tier2" ? row.tier2 : row.tier3;
                  return (
                    <li key={i} className="flex items-center gap-2">
                      {included ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" aria-hidden />
                      )}
                      <span
                        className={cn("text-xs", !included && "text-muted-foreground/40")}
                      >
                        {row.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">{tier.whoIsThisFor}</p>
                <p className="text-xs font-semibold text-secondary">{tier.benefit}</p>
                <CourseCheckoutButton
                  tierId={tier.id}
                  customerEmail={checkoutEmail.trim() || undefined}
                  className={cn(
                    "w-full font-bold mt-1 h-11 rounded-xl",
                    tier.highlight ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""
                  )}
                >
                  Get Instant Access
                </CourseCheckoutButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
