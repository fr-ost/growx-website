"use client";

import { useMemo, useState } from "react";
import { BorderBeam } from "@/components/motion/border-beam";
import { stagger } from "@/components/motion/stagger";
import { CopyGlyph, copyButtonClass, entryClass } from "@/components/tools/ui";
import { MAX_THREAD_PARTS, POST_LIMIT, splitThread, weightedLength } from "@/lib/tweet-text";

const SAMPLE = `How I plan a week of posts on X in 30 minutes.

First, I write down three things I learned this week. Each one becomes a post or a short thread.

---

Second, I check which of last week's posts got the most replies, and write a follow-up to the best one.

---

Third, I put everything in a queue at the times my followers are most active, so I can spend the rest of the week replying instead of writing.`;

export function ThreadMaker() {
  const [text, setText] = useState("");
  const [numbering, setNumbering] = useState(true);
  const [copied, setCopied] = useState<number | "all" | null>(null);
  const parts = useMemo(() => splitThread(text, { numbering }), [text, numbering]);

  const copy = async (value: string, key: number | "all") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="group relative rounded-3xl bg-white p-5 shadow-float ring-1 ring-hairline sm:p-7">
        <BorderBeam mode="focus" />
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="tm-text" className="text-sm font-bold">
            Your long text
          </label>
          <button type="button" onClick={() => setText(SAMPLE)} className="link-draw text-sm font-semibold text-accent-ink">
            Try an example
          </button>
        </div>
        <textarea
          id="tm-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder={'Paste a draft, an article or notes. Put a line with just "---" where you want a new post to start.'}
          className="mt-2 w-full resize-y rounded-2xl border border-border-strong bg-white p-4 leading-relaxed focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 font-semibold text-text-2">
            <input type="checkbox" checked={numbering} onChange={(e) => setNumbering(e.target.checked)} className="h-4 w-4 accent-[#e11d2e]" />
            Number the posts (1/n)
          </label>
          <span className="tabular-nums text-muted">
            {weightedLength(text).toLocaleString("en")} characters · up to {MAX_THREAD_PARTS} posts
          </span>
        </div>
      </div>
      <div className="rounded-3xl border border-hairline bg-surface-2 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold">
            Your thread <span className="font-semibold tabular-nums text-muted">({parts.length} {parts.length === 1 ? "post" : "posts"})</span>
          </h2>
          <button
            type="button"
            disabled={!parts.length}
            onClick={() => copy(parts.join("\n\n---\n\n"), "all")}
            className={`${copyButtonClass} gap-2 px-4 py-1.5 text-sm`}
          >
            <CopyGlyph copied={copied === "all"} /> {copied === "all" ? "Copied" : "Copy all"}
          </button>
        </div>
        {parts.length ? (
          <ol className="mt-4 space-y-3" aria-live="polite">
            {parts.map((p, i) => (
              <li key={i} className={`rounded-2xl border border-hairline bg-white p-4 shadow-[var(--shadow-hair)] ${entryClass}`} style={stagger(Math.min(i, 6))}>
                <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{p}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-semibold tabular-nums text-muted">
                    Post {i + 1} · {weightedLength(p)} / {POST_LIMIT}
                  </span>
                  <button type="button" onClick={() => copy(p, i)} className="inline-flex items-center gap-1 rounded-full font-semibold text-accent-ink hover:underline active:scale-[.97] motion-ok:transition-[scale] motion-ok:duration-[120ms]">
                    <CopyGlyph copied={copied === i} size={13} /> {copied === i ? "Copied" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-10 text-center text-sm text-muted">Your numbered posts appear here as you type.</p>
        )}
      </div>
    </div>
  );
}
