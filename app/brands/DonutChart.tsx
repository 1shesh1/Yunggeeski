"use client";

import { useState, type PointerEvent } from "react";
import type { CaseStudyChart } from "@/lib/sponsorship";

/**
 * Part-to-whole donut for the case-study results, rendered as inline SVG.
 *
 * There is no legend: hovering (mouse) or tapping (touch) a slice swaps the
 * center readout to that slice's label, value, and share. That keeps the figure
 * compact, but it means slice identity is revealed on demand rather than always
 * visible — the sr-only list below the figure carries the same numbers as text
 * so assistive tech and no-JS readers still get the full breakdown.
 *
 * Colors are chart-specific steps, NOT the brand accent: #59bbff sits at OKLCH
 * L=0.76, outside the 0.48–0.67 band a fill needs on our near-black card. This
 * set is validated for the dark surface — lightness band, chroma floor, adjacent
 * CVD separation (worst pair ΔE 19.1 deutan), and ≥3:1 contrast. Reordering
 * matters: green and amber sit non-adjacent because that pair collapses under
 * deuteranopia. Re-run the validator before changing any value or the order.
 */
const SEGMENT_COLORS = ["#3d9ae0", "#cc7a22", "#9a5cc8", "#39a869"];
/**
 * The remainder slice — recessive, but it must still close the ring. Too dark
 * and a chart with a large remainder reads as a partial arc rather than a full
 * circle, which makes it look SMALLER than a fully-colored chart beside it.
 * This sits at 2.9:1 on the card: clearly visible, still well under the 4.3–6.4:1
 * the data colors carry, so it stays subordinate and never reads as a category.
 */
const TRACK_COLOR = "#5c5c5c";

// A thinner ring on a bigger circle: the center readout has to hold a wrapped
// label like "Total engagements" without touching the stroke, so the inner
// diameter (2 * (RADIUS - STROKE / 2) = 68% of the viewBox) is what matters.
const RADIUS = 40;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Surface gap between adjacent arcs, in path units. */
const GAP = 2;

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0);

/** One decimal, but no trailing ".0" — "70.7%" and "65%", never "65.0%". */
function formatPct(value: number, total: number): string {
  const p = pct(value, total);
  return `${Number(p.toFixed(1))}%`;
}

export function DonutChart({ chart }: { chart: CaseStudyChart }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const segmentSum = chart.segments.reduce((a, s) => a + s.value, 0);
  const remainder = Math.max(chart.total - segmentSum, 0);
  const isSinglePart = chart.segments.length === 1;

  // The remainder is drawn as a real arc rather than letting a background track
  // show through, so every part of the ring is hoverable on equal terms.
  const slices = [
    ...chart.segments.map((segment, i) => ({
      ...segment,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    })),
    ...(remainder > 0 && chart.remainderLabel
      ? [{ label: chart.remainderLabel, value: remainder, color: TRACK_COLOR }]
      : []),
  ];

  // Arcs are drawn as dash segments on one circle: each gets a dash of its own
  // arc length, then an offset equal to everything drawn before it.
  let cursor = 0;
  const arcs = slices.map((slice) => {
    const length = (slice.value / chart.total) * CIRCUMFERENCE;
    const offset = cursor;
    cursor += length;
    return {
      ...slice,
      // Shrink each arc by the gap so neighbours don't touch. Never below zero,
      // or a tiny slice would wrap around the whole ring.
      dash: Math.max(length - GAP, 0),
      offset,
    };
  });

  const active = activeIndex !== null ? arcs[activeIndex] : null;

  // Resting state reads as the headline: a share for one-part charts, the total
  // for a multi-part mix where no single share is the point. Once a slice is
  // engaged, the center becomes that slice's readout.
  const centerValue = active
    ? fmt(active.value)
    : isSinglePart
      ? formatPct(chart.segments[0].value, chart.total)
      : fmt(chart.total);
  const centerLabel = active
    ? active.label
    : isSinglePart
      ? `of ${chart.totalLabel.toLowerCase()}`
      : chart.totalLabel;

  const description = arcs
    .map((a) => `${a.label} ${fmt(a.value)} (${formatPct(a.value, chart.total)})`)
    .join(", ");

  /** Mouse hovers; touch taps toggle. Pointer type keeps the two from fighting. */
  const hoverProps = (i: number) => ({
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "mouse") setActiveIndex(i);
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType === "mouse") setActiveIndex(null);
    },
    onClick: () => setActiveIndex((prev) => (prev === i ? null : i)),
    onFocus: () => setActiveIndex(i),
    onBlur: () => setActiveIndex(null),
  });

  return (
    <div className="flex flex-col items-center">
      <h4 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {chart.title}
      </h4>

      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="h-48 w-48"
          role="img"
          aria-label={`${chart.title}. ${chart.totalLabel} ${fmt(chart.total)}. ${description}.`}
        >
          {/* -90° so the first arc starts at 12 o'clock. */}
          <g transform="rotate(-90 50 50)">
            {arcs.map((arc, i) => (
              <circle
                key={arc.label}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
                strokeDashoffset={-arc.offset}
                strokeLinecap="butt"
                tabIndex={0}
                role="button"
                aria-label={`${arc.label}: ${fmt(arc.value)}, ${formatPct(arc.value, chart.total)} of ${chart.totalLabel.toLowerCase()}`}
                className={`cursor-pointer outline-none transition-opacity ${
                  activeIndex !== null && activeIndex !== i ? "opacity-40" : "opacity-100"
                }`}
                {...hoverProps(i)}
              />
            ))}
          </g>
        </svg>

        {/* Sits inside the ring: max-w keeps a wrapped label clear of the stroke. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2">
          <span className="text-2xl font-bold leading-none text-foreground">{centerValue}</span>
          <span className="mt-1 max-w-[6.5rem] text-center text-[11px] leading-tight text-muted-foreground">
            {centerLabel}
          </span>
          {active && (
            <span className="mt-0.5 text-[11px] font-semibold text-foreground/80">
              {formatPct(active.value, chart.total)}
            </span>
          )}
        </div>
      </div>

      {/* The breakdown as text — the figure reveals it on interaction, this
          keeps it available to screen readers and anyone without pointer input. */}
      <ul className="sr-only">
        {arcs.map((arc) => (
          <li key={arc.label}>
            {arc.label}: {fmt(arc.value)} ({formatPct(arc.value, chart.total)})
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center text-[11px] text-muted-foreground/60" aria-hidden>
        Tap or hover a segment for detail
      </p>

      {chart.caption && (
        <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground/80">
          {chart.caption}
        </p>
      )}

      {chart.footStat && (
        <div className="mt-3 w-full rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3 text-center">
          <p className="text-xl font-bold text-secondary">{chart.footStat.value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{chart.footStat.label}</p>
        </div>
      )}
    </div>
  );
}
