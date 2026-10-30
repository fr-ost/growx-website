const PATHS = {
  rise: { line: "M15.36 89.6 L46.08 60.16 L64 74.24 L102.4 34.56", arrow: "M84.48 30.72 L107.52 28.16 L104.96 51.2 Z" },
  dip: { line: "M8 44 L40 54 L60 96 L84 70 L112 34", arrow: "M94.08 30.16 L117.12 27.6 L114.56 50.64 Z" },
} as const;

/**
 * The GrowX brand line (the rising polyline + arrowhead from the logo), drawn with clip-path.
 * scroll: draws on its own view() timeline (entry 10% -> cover 50%); once: 900ms after a 300ms delay.
 * A brand mark, not a chart: no axes, ticks or numbers. Colour comes from `currentColor`.
 */
export function GrowthLine({
  variant = "rise",
  mode = "scroll",
  className = "",
  strokeWidth = 6,
}: {
  variant?: "rise" | "dip";
  mode?: "scroll" | "once";
  className?: string;
  strokeWidth?: number;
}) {
  const p = PATHS[variant];
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      aria-hidden="true"
      data-decor=""
      focusable="false"
      className={`${mode === "once" ? "draw-once" : "draw-x"} ${className}`}
    >
      <path d={p.line} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={p.arrow} fill="currentColor" stroke="currentColor" strokeWidth={strokeWidth / 2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
