import { IconChevronDown } from "@/components/icons";

export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left font-semibold transition-colors hover:bg-surface-2 sm:px-6">
            <span>{f.q}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <IconChevronDown size={18} className="faq-chevron transition-transform duration-300" />
            </span>
          </summary>
          <div className="faq-body px-5 pb-5 text-text-2 sm:px-6">
            <p className="leading-relaxed">{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
