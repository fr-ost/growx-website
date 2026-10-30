import { IconChevronDown } from "@/components/icons";

/**
 * Native <details>/<summary> accordion (works without JS). Colour changes are instant; the only
 * motion is the chevron turn, a short body fade-in and the left accent rule (scale only), all
 * behind the motion guard.
 */
export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-hairline overflow-clip rounded-3xl border border-hairline bg-white shadow-[var(--shadow-hair)]">
      {items.map((f) => (
        <details
          key={f.q}
          className="group relative before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-[linear-gradient(180deg,#e11d2e,#9f1239)] before:content-[''] open:before:scale-y-100 motion-ok:before:transition-[scale] motion-ok:before:duration-200 motion-ok:before:ease-glide"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left font-semibold hover:bg-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-6">
            <span>{f.q}</span>
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
              <IconChevronDown size={18} className="faq-chevron" />
            </span>
          </summary>
          <div className="faq-body px-5 pb-5 text-text-2 sm:px-6">
            <p className="max-w-[66ch] leading-relaxed [text-wrap:pretty]">{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
