"use client";

import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  "aria-label"?: string;
}

const DEFAULT_COLORS = ["#59bbff", "#ff6b6b", "#51cf66", "#fcc419", "#cc5de8"];

export function ColorSwatch({ value, onChange, className, "aria-label": ariaLabel }: ColorSwatchProps) {
  const hex = value.startsWith("#") ? value : `#${value}`;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 cursor-pointer rounded border border-input bg-transparent p-1"
        aria-label={ariaLabel ?? "Choose color"}
      />
      <span className="text-xs text-muted-foreground">{hex}</span>
    </div>
  );
}

export function getDefaultSeriesColor(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}
