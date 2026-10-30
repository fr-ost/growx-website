"use client";

import { useMemo, useState } from "react";
import { BorderBeam } from "@/components/motion/border-beam";
import { stagger } from "@/components/motion/stagger";
import { CopyButton, entryClass, inputClass } from "@/components/tools/ui";
import { POST_LIMIT, weightedLength } from "@/lib/tweet-text";
import { TEMPLATE_CATEGORIES, TWEET_TEMPLATES, fieldLabel, fillTemplate, templateFields, type TemplateCategory, type TweetTemplate } from "@/content/tweet-templates";

const parts = (text: string) => text.split(/\n[ \t]*---[ \t]*\n/).map((p) => p.trim());

function Preview({ text }: { text: string }) {
  const ps = parts(text);
  return (
    <div className="space-y-2">
      {ps.map((p, i) => (
        <div key={i} className={ps.length > 1 ? "rounded-xl border border-hairline bg-surface-2 px-3 py-2" : ""}>
          {ps.length > 1 ? <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Post {i + 1}</p> : null}
          <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{p}</p>
        </div>
      ))}
    </div>
  );
}

function Editor({ t }: { t: TweetTemplate }) {
  const fields = useMemo(() => templateFields(t.text), [t.text]);
  const [vars, setVars] = useState<Record<string, string>>({});
  const out = fillTemplate(t.text, vars);
  const counts = parts(out).map((p) => weightedLength(p));
  const done = fields.every((f) => vars[f]?.trim());
  return (
    <div className="mt-4 space-y-4 border-t border-hairline pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f}>
            <label htmlFor={`${t.id}-${f}`} className="text-xs font-bold">
              {fieldLabel(f)}
            </label>
            <input
              id={`${t.id}-${f}`}
              value={vars[f] ?? ""}
              onChange={(e) => setVars((v) => ({ ...v, [f]: e.target.value }))}
              className={`mt-1 ${inputClass} h-10 text-sm font-medium`}
            />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-accent/20 bg-tint p-4">
        <Preview text={out} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`font-semibold tabular-nums ${counts.some((c) => c > POST_LIMIT) ? "text-danger" : "text-muted"}`}>
            {counts.map((c, i) => `${counts.length > 1 ? `Post ${i + 1}: ` : ""}${c} / ${POST_LIMIT}`).join(" · ")}
          </span>
          <CopyButton value={done ? out.replace(/\n[ \t]*---[ \t]*\n/g, "\n\n---\n\n") : ""} label={done ? "Copy post" : "Fill every field"} />
        </div>
      </div>
    </div>
  );
}

export function TemplateLibrary() {
  const [cat, setCat] = useState<TemplateCategory | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  // Cards enter only after the visitor changes the filter (never on first paint: the list is above the fold).
  const [filtered, setFiltered] = useState(false);
  const list = cat === "all" ? TWEET_TEMPLATES : TWEET_TEMPLATES.filter((t) => t.cat === cat);
  const pick = (c: TemplateCategory | "all") => {
    setCat(c);
    setFiltered(true);
  };
  // Colours switch instantly; press feedback (scale) is the only motion.
  const chip = (on: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold active:scale-[.97] motion-ok:transition-[scale] motion-ok:duration-[120ms] motion-ok:ease-glide ${
      on ? "border-transparent bg-brand-deep text-white shadow-[var(--shadow-red)]" : "border-hairline-strong bg-white text-text-2 hover:border-accent/40 hover:text-accent-ink"
    }`;
  const count = (on: boolean) => `tabular-nums ${on ? "text-white" : "text-muted"}`;

  return (
    <div className="text-left">
      <div className="group relative rounded-3xl bg-white p-3 shadow-float ring-1 ring-hairline sm:p-4">
        <BorderBeam mode="focus" />
        <div role="group" aria-label="Template categories" className="flex flex-wrap justify-center gap-2">
          <button type="button" aria-pressed={cat === "all"} onClick={() => pick("all")} className={chip(cat === "all")}>
            All <span className={count(cat === "all")}>{TWEET_TEMPLATES.length}</span>
          </button>
          {TEMPLATE_CATEGORIES.map((c) => (
            <button key={c.id} type="button" aria-pressed={cat === c.id} title={c.hint} onClick={() => pick(c.id)} className={chip(cat === c.id)}>
              {c.name} <span className={count(cat === c.id)}>{TWEET_TEMPLATES.filter((t) => t.cat === c.id).length}</span>
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2" data-testid="template-list">
        {list.map((t, i) => {
          const category = TEMPLATE_CATEGORIES.find((c) => c.id === t.cat);
          return (
            <li
              // Keyed by filter so every card in a new selection is a fresh element and gets @starting-style.
              key={filtered ? `${cat}:${t.id}` : t.id}
              className={`rounded-3xl border border-hairline bg-white p-5 shadow-[var(--shadow-hair)] ${filtered ? entryClass : ""}`}
              style={filtered ? stagger(Math.min(i, 6)) : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent-ink">{category?.name}</p>
                  <h3 className="mt-1 text-balance text-lg font-bold">{t.title}</h3>
                </div>
                <button
                  type="button"
                  aria-expanded={open === t.id}
                  onClick={() => setOpen((o) => (o === t.id ? null : t.id))}
                  className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white hover:bg-ink-2 active:scale-[.97] motion-ok:transition-[scale] motion-ok:duration-[120ms] motion-ok:ease-glide"
                >
                  {open === t.id ? "Close" : "Fill in"}
                </button>
              </div>
              <div className="mt-3">
                <Preview text={t.text} />
              </div>
              {open === t.id ? <Editor t={t} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
