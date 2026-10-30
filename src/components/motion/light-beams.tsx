import { cssVars } from "./stagger";

const BEAMS = [
  { x: "-216px", d: "7s", delay: "-2.1s" },
  { x: "144px", d: "8.5s", delay: "-5.4s" },
  { x: "360px", d: "9s", delay: "-0.8s" },
] as const;

/**
 * 1px red light lines falling along the 72px hairline grid. Large screens only,
 * transform-only (compositor), paused off-screen, hidden under reduced motion and in print.
 * `travel` is how far a beam falls (pass the parent's height).
 */
export function LightBeams({ count = 2, travel = 760 }: { count?: 1 | 2 | 3; travel?: number }) {
  return (
    <div
      aria-hidden="true"
      data-decor=""
      data-ambient=""
      className="absolute inset-0 hidden overflow-clip lg:block"
      style={cssVars({ "--beam-travel": `${travel}px` })}
    >
      {BEAMS.slice(0, count).map((b) => (
        <span key={b.x} className="beam" style={cssVars({ "--x": b.x, "--d": b.d, "--delay": b.delay })} />
      ))}
    </div>
  );
}
