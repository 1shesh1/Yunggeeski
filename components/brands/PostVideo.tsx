"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PostVideoProps {
  src: string;
  label: string;
  /**
   * Omit to autoplay only while the video is mostly on screen (grids). Pass a
   * boolean to control playback directly (the carousel's active slide).
   */
  playing?: boolean;
  muted?: boolean;
  className?: string;
  /** Called when the file can't be loaded (e.g. not added yet) so the caller can fall back. */
  onError?: () => void;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A muted, looping portfolio video that never plays off screen. Respects
 * prefers-reduced-motion by not autoplaying and exposing native controls.
 */
export function PostVideo({
  src,
  label,
  playing,
  muted = true,
  className,
  onError,
}: PostVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => setReducedMotion(prefersReducedMotion()), []);

  // Controlled mode.
  useEffect(() => {
    const v = ref.current;
    if (!v || playing === undefined || reducedMotion) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing, reducedMotion]);

  // In-view mode: play while ≥60% visible, pause otherwise.
  useEffect(() => {
    const v = ref.current;
    if (!v || playing !== undefined || reducedMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.6 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [playing, reducedMotion]);

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  return (
    <video
      ref={ref}
      // #t= makes browsers paint the first frame as a poster before playback.
      src={`${src}#t=0.1`}
      muted={muted}
      loop
      playsInline
      preload="metadata"
      controls={reducedMotion}
      aria-label={label}
      className={cn("h-full w-full object-cover", className)}
      onError={onError}
    />
  );
}
