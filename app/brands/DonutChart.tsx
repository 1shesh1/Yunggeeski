import type { CaseStudyChart } from "@/lib/sponsorship";

/**
 * Part-to-whole donut for the case-study results, rendered as inline SVG so the
 * page stays a server component with zero client JS.
 *
 * Colors are chart-specific steps, NOT the brand accent: #59bbff sits at OKLCH
 * L=0.76, outside the 0.48–0.67 band a fill needs on our near-black card. This
 * set is validated for the dark surface — lightness band, chroma floor, adjacent
 * CVD separation (worst pair ΔE 19.1 deutan), and ≥3:1 contrast. Reordering
 * matters: green and amber sit non-adjacent because that pair collapses under
 * deuteranopia. Re-run the validator before changing any value or the order.
 */
const SEGMENT_COLORS = ["#3d9ae0", "#cc7a22", "#9a5cc8", "#39a869"];
const TRACK_COLOR = "#2b2b2b";

const RADIUS = 38;
const STROKE = 14;
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
  const segmentSum = chart.segments.reduce((a, s) => a + s.value, 0);
  const remainder = Math.max(chart.total - segmentSum, 0);
  const hasRemainder = remainder > 0;
  const isSinglePart = chart.segments.length === 1;

  // Arcs are drawn as dash segments on one circle: each gets a dash of its own
  // arc length, then an offset equal to everything drawn before it.
  let cursor = 0;
  const arcs = chart.segments.map((segment, i) => {
    const length = (segment.value / chart.total) * CIRCUMFERENCE;
    const offset = cursor;
    cursor += length;
    return {
      ...segment,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      // Shrink each arc by the gap so neighbours don't touch. Never below zero,
      // or a tiny slice would wrap around the whole ring.
      dash: Math.max(length - GAP, 0),
      offset,
    };
  });

  // The center reads as the headline: a share for one-part charts, the total
  // for a multi-part mix where no single share is the point.
  const centerValue = isSinglePart
    ? formatPct(chart.segments[0].value, chart.total)
    : fmt(chart.total);
  const centerLabel = isSinglePart ? `of ${chart.totalLabel.toLowerCase()}` : chart.totalLabel;

  const description = arcs
    .map((a) => `${a.label} ${fmt(a.value)} (${formatPct(a.value, chart.total)})`)
    .join(", ");

  return (
    <div className="flex flex-col items-center">
      <h4 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {chart.title}
      </h4>

      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="h-36 w-36"
          role="img"
          aria-label={`${chart.title}. ${chart.totalLabel} ${fmt(chart.total)}. ${description}.`}
        >
          {/* -90° so the first arc starts at 12 o'clock. */}
          <g transform="rotate(-90 50 50)">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={TRACK_COLOR}
              strokeWidth={STROKE}
            />
            {arcs.map((arc) => (
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
                className="transition-opacity hover:opacity-80"
              >
                <title>{`${arc.label}: ${fmt(arc.value)} (${formatPct(arc.value, chart.total)})`}</title>
              </circle>
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{centerValue}</span>
          <span className="max-w-[6rem] text-center text-[10px] leading-tight text-muted-foreground">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend doubles as the data table — every value is present as text, so
          identity never rests on color alone. */}
      <ul className="mt-4 flex w-full flex-col gap-1.5">
        {arcs.map((arc) => (
          <li key={arc.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: arc.color }}
              aria-hidden
            />
            <span className="flex-1 text-muted-foreground">{arc.label}</span>
            <span className="font-semibold text-foreground">{fmt(arc.value)}</span>
            <span className="w-11 text-right tabular-nums text-muted-foreground">
              {formatPct(arc.value, chart.total)}
            </span>
          </li>
        ))}
        {hasRemainder && chart.remainderLabel && (
          <li className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: TRACK_COLOR }}
              aria-hidden
            />
            <span className="flex-1 text-muted-foreground">{chart.remainderLabel}</span>
            <span className="font-semibold text-muted-foreground">{fmt(remainder)}</span>
            <span className="w-11 text-right tabular-nums text-muted-foreground">
              {formatPct(remainder, chart.total)}
            </span>
          </li>
        )}
      </ul>

      {chart.caption && (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground/80">
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
