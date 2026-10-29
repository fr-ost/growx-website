"use client";

import { useMemo, useState } from "react";
import { IconCopy } from "@/components/icons";
import { LONG_POST_LIMIT, POST_LIMIT, countLinks, weightedLength } from "@/lib/tweet-text";

function Ring({ used, limit }: { used: number; limit: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, used / limit);
  const over = used > limit;
  const color = over ? "#b4141f" : limit - used <= 20 ? "#d97706" : "#e11d2e";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#ebe8ea" strokeWidth="5" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 28 28)" />
    </svg>
  );
}

export function CharacterCounter() {
  const [text, setText] = useState("");
  const [long, setLong] = useState(false);
  const [copied, setCopied] = useState(false);
  const limit = long ? LONG_POST_LIMIT : POST_LIMIT;
  const stats = useMemo(() => {
    const used = weightedLength(text);
    return {
      used,
      left: limit - used,
      chars: [...text].length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      links: countLinks(text),
      lines: text ? text.split("\n").length : 0,
    };
  }, [text, limit]);
  const over = stats.left < 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <label htmlFor="cc-text" className="text-sm font-bold">
        Your post
      </label>
      <textarea
        id="cc-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder="Type or paste your tweet here. Links count as 23 characters, most emoji as 2."
        className="mt-2 w-full resize-y rounded-2xl border border-border-strong bg-white p-4 text-[1.05rem] leading-relaxed focus:border-accent focus:outline-none"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3" aria-live="polite">
          <Ring used={stats.used} limit={limit} />
          <div>
            <p className={`font-display text-2xl font-extrabold ${over ? "text-danger" : ""}`}>
              {stats.used.toLocaleString("en")} <span className="text-base font-semibold text-muted">/ {limit.toLocaleString("en")}</span>
            </p>
            <p className={`text-sm font-semibold ${over ? "text-danger" : "text-text-2"}`}>
              {over ? `${Math.abs(stats.left).toLocaleString("en")} over the limit` : `${stats.left.toLocaleString("en")} characters left`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-text-2">
            <input type="checkbox" checked={long} onChange={(e) => setLong(e.target.checked)} className="h-4 w-4 accent-[#e11d2e]" />
            X Premium long post (25,000)
          </label>
          <button type="button" onClick={copy} disabled={!text} className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
            <IconCopy size={15} /> {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["X characters", stats.used],
          ["Plain characters", stats.chars],
          ["Words", stats.words],
          ["Links", stats.links],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl bg-surface-2 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
            <dd className="mt-1 font-display text-xl font-extrabold">{(v as number).toLocaleString("en")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
