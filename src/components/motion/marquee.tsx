import type { ReactNode } from "react";
import { cssVars } from "./stagger";

/**
 * Capability ticker: two identical lists translate by -50% in a linear loop (edges masked).
 * Pauses on hover, focus-within and off-screen. With motion off: one wrapped, centred list.
 * Product facts only: never logos, never "trusted by".
 */
export function Marquee({ items, label, speed = 48, className = "" }: { items: readonly ReactNode[]; label: string; speed?: number; className?: string }) {
  return (
    <div className={`marquee ${className}`} data-ambient="" style={cssVars({ "--marquee-d": `${speed}s` })}>
      <div className="marquee-track">
        <ul aria-label={label} className="flex shrink-0 flex-wrap justify-center gap-3 motion-ok:flex-nowrap motion-ok:justify-start">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
        <ul className="marquee-dup shrink-0 gap-3" aria-hidden="true" data-decor="">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
