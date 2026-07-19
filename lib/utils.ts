import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compact number formatting for social metrics, e.g. 7_400_000 -> "7.4M",
 * 60_000 -> "60K", 512_000 -> "512K". Keeps one decimal only when it adds signal.
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const format = (n: number, suffix: string) => {
    const rounded = Math.round(n * 10) / 10;
    const str = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `${str}${suffix}`;
  };
  if (abs >= 1_000_000) return format(value / 1_000_000, "M");
  if (abs >= 1_000) return format(value / 1_000, "K");
  return String(value);
}
