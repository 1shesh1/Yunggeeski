"use client";

import { useState } from "react";

/**
 * Client logo for a case study. Rendered on a light chip so dark-text logos stay
 * legible against the dark page. Falls back to the client name if the asset is
 * missing or fails to load, so the section never breaks.
 */
export function CaseStudyLogo({ src, client }: { src?: string | null; client: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="text-2xl font-bold sm:text-3xl">{client}</span>;
  }

  return (
    <span className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${client} logo`}
        className="h-12 w-auto max-w-[240px] object-contain sm:h-14"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
