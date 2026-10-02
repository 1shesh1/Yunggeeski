"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { PRESS_OUTLETS, coverageSummary, isSyndicatedOnly, type PressOutlet } from "@/lib/press";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { eyebrow } from "./styles";

const tileClass =
  "group flex h-full w-full flex-col items-center justify-start gap-3 rounded-2xl border border-border bg-card p-3 pb-4 transition-colors hover:border-secondary/50 hover:bg-card/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

function OutletLogo({ outlet }: { outlet: PressOutlet }) {
  return (
    <span className="flex h-16 w-full items-center justify-center rounded-xl bg-white px-4 transition-transform group-hover:scale-[1.03]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={outlet.logo}
        alt={outlet.name}
        width={outlet.logoWidth}
        height={outlet.logoHeight}
        className={cn("w-auto max-w-full object-contain", outlet.square ? "h-12" : "h-6 sm:h-7")}
      />
    </span>
  );
}

function TileCaption({ outlet }: { outlet: PressOutlet }) {
  const syndicated = isSyndicatedOnly(outlet);
  const n = outlet.articles.length;
  return (
    <span className="flex flex-col items-center gap-0.5 text-[11px] leading-tight text-muted-foreground">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider",
          syndicated ? "bg-muted/60 text-muted-foreground" : "bg-secondary/10 text-secondary",
        )}
      >
        {syndicated ? "Syndicated" : "Original report"}
      </span>
      <span>{n > 1 ? `${n} articles` : outlet.articles[0].published}</span>
    </span>
  );
}

/**
 * One outlet. A single article links straight out; several open a short list
 * so each one can be reached (and its original source shown) in one tap.
 */
function OutletTile({ outlet }: { outlet: PressOutlet }) {
  const [open, setOpen] = useState(false);

  if (outlet.articles.length === 1) {
    const a = outlet.articles[0];
    return (
      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${outlet.name}: ${a.label} (opens in a new tab)`}
        title={a.label}
        className={tileClass}
      >
        <OutletLogo outlet={outlet} />
        <TileCaption outlet={outlet} />
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${outlet.name}: ${outlet.articles.length} articles`}
        className={tileClass}
      >
        <OutletLogo outlet={outlet} />
        <TileCaption outlet={outlet} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-left text-lg">{outlet.name}</DialogTitle>
          </DialogHeader>
          <ul className="flex flex-col gap-2">
            {outlet.articles.map((a) => (
              <li key={a.url}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:border-secondary/50"
                >
                  <span>
                    <span className="block text-sm font-medium">{a.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.published}
                      {a.kind === "syndicated" && a.originalSource
                        ? ` · Syndicated from ${a.originalSource}`
                        : ""}
                    </span>
                  </span>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** "In the News" — publication logos, each linking to its coverage. */
export function PressSection() {
  return (
    <section id="press" className="scroll-mt-24 px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <p className={eyebrow}>Press</p>
        <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">In the News</h2>
        <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
          Publications that have covered Yung Geeski charts.
          <span className="mt-1 block text-xs">{coverageSummary()}</span>
        </p>
        {/* Wrapping flex, not a grid, so a partial last row centres instead of leaving a hole. */}
        <ul className="flex flex-wrap justify-center gap-3">
          {PRESS_OUTLETS.map((outlet) => (
            <li
              key={outlet.id}
              className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(20%-0.6rem)]"
            >
              <OutletTile outlet={outlet} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
