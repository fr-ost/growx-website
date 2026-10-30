import { Fragment } from "react";
import { cssVars } from "./stagger";

/**
 * Above-the-fold headline entrance that never touches opacity: each word settles
 * (translate + a short de-blur at >= 640px) 40ms after the previous one.
 * Real " " text nodes are kept, so the heading's textContent equals `text`.
 * Never wrap SettleWords in an element that also has `hero-settle`.
 * Keep a gradient clause as ONE block (put it in its own <span className="settle-word">).
 */
export function SettleWords({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(" ").filter((w) => w.length > 0);
  return (
    <>
      {words.map((w, n) => (
        <Fragment key={`${n}-${w}`}>
          {n > 0 ? " " : null}
          <span className="settle-word" style={cssVars({ "--w": from + n })}>
            {w}
          </span>
        </Fragment>
      ))}
    </>
  );
}
