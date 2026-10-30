"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";

export { parseCount } from "@/lib/x-math";

/** Inputs never transition: colour and ring changes are instant. */
export const inputClass =
  "h-12 w-full rounded-2xl border border-border-strong bg-white px-4 text-base font-semibold tabular-nums focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

/**
 * Card-entry classes for list items that appear in place (template cards, thread posts).
 * @starting-style: a short rise + fade on first render only, motion-ok guarded so reduced
 * motion shows them instantly. The text inside never animates on later updates.
 */
export const entryClass =
  "motion-ok:transition-[opacity,translate] motion-ok:duration-200 motion-ok:ease-glide motion-ok:delay-[calc(var(--i,0)*20ms)] motion-ok:starting:translate-y-1.5 motion-ok:starting:opacity-0";

/** Pill button base for copy actions: instant colours, press feedback only. */
export const copyButtonClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-white font-semibold hover:border-accent hover:text-accent-ink active:scale-[.97] disabled:opacity-50 disabled:active:scale-100 motion-ok:transition-[scale] motion-ok:duration-[120ms] motion-ok:ease-glide";

/** IconCopy and IconCheck stacked in one cell, cross-fading by opacity + scale over 160ms. */
export function CopyGlyph({ copied, size = 14 }: { copied: boolean; size?: number }) {
  const layer = "[grid-area:1/1] motion-ok:transition-[opacity,scale] motion-ok:duration-[160ms] motion-ok:ease-glide";
  return (
    <span aria-hidden="true" className="inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <IconCopy size={size} className={`${layer} ${copied ? "scale-50 opacity-0" : ""}`} />
      <IconCheck size={size} className={`${layer} text-ok ${copied ? "" : "scale-50 opacity-0"}`} />
    </span>
  );
}

/** A labelled number field that accepts "1,200" and "1.2k". */
export function NumberField({ id, label, value, onChange, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <input id={id} inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className={`mt-1.5 ${inputClass}`} />
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** A result tile. The accent tone is solid white on bg-brand-deep (AA on every stop). Values never tween. */
export function Stat({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "accent" }) {
  const accent = tone === "accent";
  return (
    <div
      className={`relative overflow-clip rounded-2xl px-5 py-4 ${
        accent ? "bg-brand-deep text-white shadow-[var(--shadow-red)]" : "bg-surface-2 ring-1 ring-hairline"
      }`}
    >
      {accent ? (
        <span
          aria-hidden="true"
          data-decor=""
          className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.16),transparent)]"
        />
      ) : null}
      <p className={`relative text-xs font-semibold uppercase tracking-wider ${accent ? "text-white" : "text-muted"}`}>{label}</p>
      <p className="relative mt-1 font-display text-3xl font-extrabold tabular-nums">{value}</p>
      {sub ? <p className={`relative mt-0.5 text-sm ${accent ? "text-white" : "text-text-2"}`}>{sub}</p> : null}
    </div>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={!value}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className={`${copyButtonClass} px-3.5 py-1.5 text-sm`}
    >
      <CopyGlyph copied={copied} /> {copied ? "Copied" : label}
    </button>
  );
}

export const fmtPct = (v: number | null) => (v === null ? "-" : `${v < 10 ? v.toFixed(2) : v.toFixed(1)}%`);
export const fmtNum = (v: number) => v.toLocaleString("en");
