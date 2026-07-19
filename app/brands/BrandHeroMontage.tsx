import { VideoPlayer } from "@/components/VideoPlayer";

/**
 * Looping montage of top charts shown below the hero. Reuses the existing
 * VideoPlayer, which gracefully falls back to a placeholder when a source is
 * missing (the sample MP4s are Git LFS pointers in dev). Swap `sources` for the
 * real top-performing clips once available.
 */
const MONTAGE_SOURCES: { src: string; label: string }[] = [
  { src: "/videos/learn-after.mp4", label: "Pelosi vs Buffett" },
  { src: "/videos/standard-sample.mp4", label: "Real Estate vs S&P 500" },
  { src: "/videos/premium-sample.mp4", label: "Real Cost of Takeout" },
  { src: "/videos/basic-sample.mp4", label: "Gold vs Inflation" },
];

export function BrandHeroMontage() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {MONTAGE_SOURCES.map(({ src, label }) => (
        <div
          key={label}
          className="aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-card"
        >
          <VideoPlayer src={src} label={label} />
        </div>
      ))}
    </div>
  );
}
