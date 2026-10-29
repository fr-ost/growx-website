"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/ui";
import { MARKS, STYLES, markText, styleText } from "@/lib/unicode-text";
import { weightedLength } from "@/lib/tweet-text";

export function BoldTextGenerator() {
  const [text, setText] = useState("");
  const sample = text || "Your text here";
  const rows = useMemo(
    () => [...STYLES.map((s) => ({ id: s.id, name: s.name, out: styleText(sample, s) })), ...MARKS.map((m) => ({ id: m.id, name: m.name, out: markText(sample, m.mark) }))],
    [sample],
  );

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <label htmlFor="bt-text" className="text-sm font-bold">
        Your text
      </label>
      <textarea
        id="bt-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Type something to turn it bold, italic and more"
        className="mt-2 w-full resize-y rounded-2xl border border-border-strong bg-white p-4 text-[1.05rem] leading-relaxed focus:border-accent focus:outline-none"
      />
      <ul className="mt-5 divide-y divide-border rounded-2xl border border-border" aria-live="polite">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {r.name} <span className="normal-case tracking-normal">· {weightedLength(r.out)} X characters</span>
              </p>
              <p className="mt-0.5 break-words text-lg" data-style={r.id}>
                {r.out}
              </p>
            </div>
            <CopyButton value={text ? r.out : ""} />
          </li>
        ))}
      </ul>
    </div>
  );
}
