import { ChevronDown } from "lucide-react";
import { BRAND_FAQ } from "@/lib/sponsorship";

export function BrandFaq() {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {BRAND_FAQ.map(({ q, a }) => (
        <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
            {q}
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  );
}
