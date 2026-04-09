"use client";

import { ADDONS, formatPrice } from "@/lib/pricing";
import type { AddOnId, TierId } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const PREMIUM_INCLUDED_ADDONS: AddOnId[] = ["caption_pinned", "rush_24h", "csv_export"];

interface AddOnSelectorProps {
  selected: AddOnId[];
  onChange: (ids: AddOnId[]) => void;
  tierId?: TierId | null;
  className?: string;
}

const VALID_ADDON_IDS = new Set(ADDONS.map((a) => a.id));

export function AddOnSelector({ selected, onChange, tierId, className }: AddOnSelectorProps) {
  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleRowClick = (id: AddOnId) => {
    try {
      if (!id || !VALID_ADDON_IDS.has(id)) return;
      if (tierId === "premium" && PREMIUM_INCLUDED_ADDONS.includes(id)) return;
      const next = safeSelected.includes(id)
        ? safeSelected.filter((x) => x !== id)
        : [...safeSelected, id].filter((x) => VALID_ADDON_IDS.has(x));
      onChange(next);
    } catch (err) {
      console.error("[AddOnSelector] toggle error:", err);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-muted-foreground">Add-ons (optional)</p>
      <ul className="space-y-2">
        {ADDONS.map((addon) => {
          if (!addon?.id) return null;
          const isIncludedInPremium = tierId === "premium" && PREMIUM_INCLUDED_ADDONS.includes(addon.id);
          const isChecked = isIncludedInPremium || safeSelected.includes(addon.id);
          const isDisabled = isIncludedInPremium;
          return (
            <li key={addon.id}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleRowClick(addon.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isDisabled && "cursor-default opacity-90",
                  !isDisabled && "cursor-pointer hover:bg-muted/50",
                  !isDisabled && isChecked && "border-primary bg-primary/5"
                )}
                aria-pressed={isChecked}
                aria-disabled={isDisabled}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary ring-offset-background",
                    isChecked && "bg-primary text-primary-foreground",
                    !isDisabled && "cursor-pointer"
                  )}
                  aria-hidden
                >
                  {isChecked ? <Check className="h-3 w-3" /> : null}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "font-medium",
                      isDisabled ? "cursor-default" : "cursor-pointer"
                    )}
                  >
                    {isIncludedInPremium ? (
                      <>
                        <span className="line-through">{addon.name} — {formatPrice(addon.price ?? 0)}</span>
                        <span className="ml-2 text-secondary font-normal">Included</span>
                      </>
                    ) : (
                      <>{addon.name} — {formatPrice(addon.price ?? 0)}</>
                    )}
                  </span>
                  <p
                    className={cn(
                      "text-sm text-muted-foreground mt-0.5",
                      isIncludedInPremium && "line-through"
                    )}
                  >
                    {addon.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
