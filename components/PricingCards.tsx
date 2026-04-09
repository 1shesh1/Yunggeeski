"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { TIERS, formatPrice, CHART_PACKAGE_FEATURES } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const X_MARK = "✗";

function getTierValue(
  row: (typeof CHART_PACKAGE_FEATURES)[number],
  tierId: "basic" | "standard" | "premium"
): string {
  return tierId === "basic" ? row.basic : tierId === "standard" ? row.standard : row.premium;
}

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIERS.map((t) => (
        <Card key={t.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{t.name}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
            <p className="text-2xl font-bold">{formatPrice(t.price)}</p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {CHART_PACKAGE_FEATURES.map((row, i) => {
                const value = getTierValue(row, t.id);
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{row.label}:</span>{" "}
                    {value === X_MARK ? (
                      <X className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
                    ) : value === "Yes" ? (
                      <Check className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    ) : (
                      value
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="text-xs font-medium text-secondary mt-4">Who this is for: {t.whoIsThisFor}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href={`/checkout/${t.id}`}>Buy</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
