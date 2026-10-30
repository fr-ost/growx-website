/** Product facts that may be animated. Anything else renders statically (and warns in dev). */
const FACTS = new Set([7, 52, 4, 25, 30, 160, 280]);

/**
 * A count-up for REAL product facts only (7, 52, 4, 25, 30, 160, 280).
 * The server HTML always holds the true value; MotionRuntime resets below-the-fold
 * counters to `from` and counts once (<= 900ms) when 60% visible. Never for prices,
 * early-bird numbers, user counts, results, or numbers from screenshots.
 */
export function CountUp({ value, from = 0, className = "" }: { value: number; from?: number; className?: string }) {
  const allowed = FACTS.has(value);
  if (!allowed && process.env.NODE_ENV !== "production") {
    console.warn(`CountUp: ${value} is not an allowed product fact; rendering it statically.`);
  }
  return (
    <span
      data-count={allowed ? value : undefined}
      data-count-from={allowed ? from : undefined}
      className={`inline-block text-right tabular-nums ${className}`}
      style={{ minWidth: `${String(value).length}ch` }}
    >
      {value}
    </span>
  );
}
