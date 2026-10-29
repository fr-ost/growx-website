"use client";

import { useState } from "react";
import { IconCopy } from "@/components/icons";

export { parseCount } from "@/lib/x-math";

export const inputClass =
  "h-12 w-full rounded-2xl border border-border-strong bg-white px-4 text-base font-semibold tabular-nums focus:border-accent focus:outline-none";

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

export function Stat({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "accent" }) {
  return (
    <div className={`rounded-2xl px-5 py-4 ${tone === "accent" ? "bg-brand text-white" : "bg-surface-2"}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${tone === "accent" ? "text-white/80" : "text-muted"}`}>{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{value}</p>
      {sub ? <p className={`mt-0.5 text-sm ${tone === "accent" ? "text-white/85" : "text-text-2"}`}>{sub}</p> : null}
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
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-white px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
    >
      <IconCopy size={14} /> {copied ? "Copied" : label}
    </button>
  );
}

export const fmtPct = (v: number | null) => (v === null ? "-" : `${v < 10 ? v.toFixed(2) : v.toFixed(1)}%`);
export const fmtNum = (v: number) => v.toLocaleString("en");
