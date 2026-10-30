"use client";

import { useMemo, useState } from "react";
import { CopyButton, inputClass } from "@/components/tools/ui";
import { BIO_LIMIT, bioLength, generateBios, type BioInput } from "@/lib/bio";

const FIELDS: { k: keyof BioInput; label: string; placeholder: string }[] = [
  { k: "role", label: "What you do", placeholder: "Founder of Acme" },
  { k: "audience", label: "Who you help", placeholder: "indie hackers" },
  { k: "benefit", label: "What you help them do", placeholder: "ship faster" },
  { k: "topics", label: "Topics you post about (comma separated)", placeholder: "SaaS, marketing, design" },
  { k: "proof", label: "Proof (optional)", placeholder: "Built 3 products" },
  { k: "personal", label: "Something personal (optional)", placeholder: "Coffee, cats and long walks" },
  { k: "cta", label: "Call to action (optional)", placeholder: "Free guide below" },
];

export function BioGenerator() {
  const [v, setV] = useState<BioInput>({ role: "", audience: "", benefit: "", topics: "", proof: "", personal: "", cta: "" });
  const bios = useMemo(() => generateBios(v), [v]);
  return (
    <div className="grid gap-6 text-left lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-3 rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-lift)] sm:p-7">
        {FIELDS.map((f) => (
          <div key={f.k}>
            <label htmlFor={`bio-${f.k}`} className="text-sm font-bold">
              {f.label}
            </label>
            <input
              id={`bio-${f.k}`}
              value={v[f.k]}
              placeholder={f.placeholder}
              maxLength={120}
              onChange={(e) => setV((s) => ({ ...s, [f.k]: e.target.value }))}
              className={`mt-1 ${inputClass} h-11 font-medium`}
            />
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-border bg-surface-2 p-5 sm:p-7" aria-live="polite">
        <h2 className="text-sm font-bold">
          Bio ideas <span className="font-semibold text-muted">({bios.length})</span>
        </h2>
        {bios.length ? (
          <ol className="mt-4 space-y-3" data-testid="bio-list">
            {bios.map((b) => {
              const n = bioLength(b);
              return (
                <li key={b} className="rounded-2xl border border-border bg-white p-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{b}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className={`font-semibold ${n > BIO_LIMIT ? "text-danger" : "text-muted"}`}>
                      {n} / {BIO_LIMIT} characters{n > BIO_LIMIT ? ": too long, shorten a part" : ""}
                    </span>
                    <CopyButton value={b} />
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-10 text-center text-sm text-muted">Fill in what you do and who you help to see bio ideas.</p>
        )}
      </div>
    </div>
  );
}
