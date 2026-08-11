"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, BarChart3, ExternalLink, Maximize2 } from "lucide-react";
import {
  SOCIAL_PROOF_DISCLOSURE,
  SOCIAL_PROOF_REPOSTS,
  type SocialProofRepost,
} from "@/lib/socialProof";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The card box is the tallest source ratio (the phone captures, 960×2079) and
 * images are `object-contain`, so every screenshot is shown whole — nothing is
 * cropped. The shorter desktop capture letterboxes against the black backdrop,
 * which is near-invisible given the screenshots are themselves dark.
 */
const CARD_ASPECT = "aspect-[960/2079]";

/**
 * One repost: the complete screenshot, which opens larger on click, plus the
 * account, what they did, and a link out to the original post. Falls back to a
 * branded placeholder when the screenshot asset is missing, so an entry can be
 * added before its image lands (mirrors PortfolioCard).
 */
function RepostCard({ item }: { item: SocialProofRepost }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const showImage = Boolean(item.screenshot) && !imgFailed;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className={`group relative ${CARD_ASPECT} overflow-hidden bg-black`}>
        {showImage ? (
          <>
            <Image
              src={item.screenshot}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-contain"
              onError={() => setImgFailed(true)}
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Enlarge the ${item.platformLabel} screenshot from ${item.name}`}
              className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
            />
            <span className="pointer-events-none absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <Maximize2 className="h-3 w-3" aria-hidden />
              Enlarge
            </span>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/10 to-transparent px-4 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15">
              <BarChart3 className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-sm font-semibold leading-snug">{item.chartTitle}</p>
          </div>
        )}

        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {item.platformLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold leading-snug">
            {item.name}
            {item.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-secondary" aria-label="Verified account" />
            )}
          </h3>
          <p className="text-xs text-muted-foreground">@{item.handle}</p>
          {item.descriptor && (
            <p className="mt-0.5 text-xs font-medium text-secondary">{item.descriptor}</p>
          )}
        </div>

        {item.quote && (
          <blockquote className="rounded-lg border-l-2 border-secondary bg-secondary/5 px-3 py-2 text-sm italic leading-relaxed">
            “{item.quote}”
          </blockquote>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          {item.action} — <span className="text-foreground">{item.chartTitle}</span>
        </p>

        <a
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
        >
          View the original post
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>

      {showImage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-left text-lg">
                {item.name} on {item.platformLabel}
              </DialogTitle>
            </DialogHeader>
            <Image
              src={item.screenshot}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 640px) 448px, 90vw"
              className="h-auto w-full rounded-lg"
            />
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

export function SocialProofSection() {
  return (
    <section className="border-y border-border bg-card/40 px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-secondary">
          Social Proof
        </p>
        <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">
          Charts from this system get reposted at the highest level
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
          Built with the exact workflow taught in the course, then picked up organically by accounts
          with national reach — on both sides of the aisle.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SOCIAL_PROOF_REPOSTS.map((item) => (
            <RepostCard key={item.id} item={item} />
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-[11px] leading-relaxed text-muted-foreground/70">
          {SOCIAL_PROOF_DISCLOSURE}
        </p>
      </div>
    </section>
  );
}
