"use client";

import { useState } from "react";

/**
 * Client logo for a case study, rendered directly on the page background with no
 * container. Note: a logo whose own artwork is dark needs a reversed (light)
 * variant to read against the dark page — the file itself supplies whatever
 * background it has. Falls back to the client name if the asset is missing or
 * fails to load, so the section never breaks.
 */
export function CaseStudyLogo({ src, client }: { src?: string | null; client: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="text-2xl font-bold sm:text-3xl">{client}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${client} logo`}
      className="h-14 w-auto max-w-[280px] object-contain sm:h-16"
      onError={() => setFailed(true)}
    />
  );
}
