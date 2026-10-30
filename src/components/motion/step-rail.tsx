import type { ReactNode } from "react";
import { cssVars, stagger } from "./stagger";

export type RailStep = { key: string; id?: string; marker: ReactNode; content: ReactNode; className?: string };

/**
 * Numbered steps on a 2px hairline track; a red fill draws as you read (scroll-driven),
 * and each marker cross-fades to a lit copy. responsive = vertical below md, horizontal from md.
 * Without support / with reduced motion: fully drawn and lit. Headings come only from `content`.
 * Each <li id> keeps its id + scroll margin (e.g. step-1..step-8 for HowTo JSON-LD).
 * `marker` is rendered twice (base node + lit copy), so it should be a bare glyph or short text
 * that inherits currentColor; an opaque, self-coloured marker (e.g. <IconBubble>) hides the cross-fade.
 */
export function StepRail({
  steps,
  orientation = "responsive",
  className = "",
  itemClassName = "",
}: {
  steps: RailStep[];
  orientation?: "horizontal" | "vertical" | "responsive";
  className?: string;
  itemClassName?: string;
}) {
  const v = orientation === "vertical";
  const h = orientation === "horizontal";
  const list = h ? "grid auto-cols-fr grid-flow-col gap-6" : v ? "grid gap-8" : "grid gap-8 md:auto-cols-fr md:grid-flow-col md:gap-6";
  return (
    <ol className={`relative ${list} ${className}`} style={cssVars({ "--n": steps.length })}>
      <li aria-hidden="true" data-decor="" className="pointer-events-none absolute inset-0 list-none">
        {!h ? (
          <span className={`absolute bottom-2 left-[1.375rem] top-2 w-0.5 -translate-x-1/2 overflow-clip rounded-full bg-hairline-strong ${v ? "" : "md:hidden"}`}>
            <span className="rail-fill-y absolute inset-0 rounded-full bg-[linear-gradient(180deg,#e11d2e,#ff4b5c)]" />
          </span>
        ) : null}
        {!v ? (
          <span
            className={`absolute left-[1.375rem] right-[calc((100%_-_(var(--n)_-_1)_*_1.5rem)_/_var(--n)_-_1.375rem)] top-[1.375rem] h-0.5 -translate-y-1/2 overflow-clip rounded-full bg-hairline-strong ${h ? "" : "hidden md:block"}`}
          >
            <span className="rail-fill-x absolute inset-0 rounded-full bg-[linear-gradient(90deg,#e11d2e,#ff4b5c)]" />
          </span>
        ) : null}
      </li>
      {steps.map((s, i) => (
        <li
          key={s.key}
          id={s.id}
          className={`relative ${s.id ? "scroll-mt-28" : ""} ${h ? "" : v ? "pl-16" : "pl-16 md:pl-0"} ${itemClassName} ${s.className ?? ""}`}
          style={stagger(Math.min(i, 4))}
        >
          <span className={`${h ? "relative" : v ? "absolute left-0 top-0" : "absolute left-0 top-0 md:relative"} grid size-11 place-items-center`}>
            <span className="grid size-11 place-items-center rounded-full border border-hairline-strong bg-white font-mono text-sm font-bold text-accent-ink shadow-[var(--shadow-hair)]">
              {s.marker}
            </span>
            <span aria-hidden="true" className="rail-node-lit absolute inset-0 grid place-items-center rounded-full bg-accent-deep font-mono text-sm font-bold text-white">
              {s.marker}
            </span>
          </span>
          <div className={h ? "mt-5" : v ? "" : "md:mt-5"}>{s.content}</div>
        </li>
      ))}
    </ol>
  );
}
