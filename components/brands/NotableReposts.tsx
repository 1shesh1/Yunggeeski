"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, ExternalLink, Maximize2 } from "lucide-react";
import {
  NOTABLE_REPOSTS_DISCLOSURE,
  SOCIAL_PROOF_REPOSTS,
  type SocialProofRepost,
} from "@/lib/socialProof";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { eyebrow } from "./styles";

function initials(name: string): string {
  return name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * A compact repost card for /portfolio. The screenshot is cropped to its top
 * (where the account and chart sit) to keep four across from getting tall;
 * clicking opens the full capture. Entries without a capture show the
 * person's initials instead.
 */
function RepostTile({ item }: { item: SocialProofRepost }) {
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const shot = !imgFailed ? item.screenshot : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-black">
        {shot ? (
          <>
            <Image
              src={shot}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 1024px) 240px, 50vw"
              className="h-full w-full object-cover object-top"
              onError={() => setImgFailed(true)}
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Enlarge the ${item.platformLabel} post from ${item.name}`}
              className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
            />
            <span className="pointer-events-none absolute bottom-2 right-2 z-20 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              <Maximize2 className="h-3 w-3" aria-hidden />
              Enlarge
            </span>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/15 to-transparent px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-xl font-bold text-secondary">
              {initials(item.name)}
            </div>
            <p className="text-xs font-medium leading-snug text-muted-foreground">“{item.chartTitle}”</p>
          </div>
        )}
        <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {item.platformLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="inline-flex items-center gap-1 text-sm font-semibold leading-snug">
          {item.name}
          {item.verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-secondary" aria-label="Verified account" />
          )}
        </h3>
        {item.descriptor && <p className="text-xs leading-snug text-muted-foreground">{item.descriptor}</p>}
        <a
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-secondary hover:underline"
        >
          View the original post
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>

      {shot && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-left text-lg">
                {item.name} on {item.platformLabel}
              </DialogTitle>
            </DialogHeader>
            <Image
              src={shot}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 640px) 448px, 90vw"
              className="h-auto w-full rounded-lg"
            />
            <p className="text-xs text-muted-foreground">
              {item.action} — <span className="text-foreground">{item.chartTitle}</span>
            </p>
            <a
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
            >
              View the original post
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </DialogContent>
        </Dialog>
      )}
    </article>
  );
}

/** "Shared by Notable Figures" — public reposts, framed as shares, not endorsements. */
export function NotableReposts() {
  return (
    <section id="reposts" className="scroll-mt-24 border-y border-border bg-card/30 px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <p className={eyebrow}>Reposts</p>
        <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">Shared by Notable Figures</h2>
        <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
          Charts picked up and shared organically by public figures with national and international reach.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {SOCIAL_PROOF_REPOSTS.map((item) => (
            <RepostTile key={item.id} item={item} />
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-[11px] leading-relaxed text-muted-foreground/70">
          {NOTABLE_REPOSTS_DISCLOSURE}
        </p>
      </div>
    </section>
  );
}
