import { IconActivity, IconClock, IconShield, IconTarget } from "@/components/icons";

/**
 * Illustrative product preview built in HTML/CSS (no screenshots, no real
 * accounts or results). Sample handles are clearly fictional.
 */
const rows = [
  { h: "sample_creator", s: 92, c: "from-rose-400 to-red-600" },
  { h: "sample_founder", s: 84, c: "from-orange-300 to-rose-500" },
  { h: "sample_designer", s: 77, c: "from-pink-400 to-fuchsia-600" },
  { h: "sample_dev", s: 71, c: "from-red-300 to-red-500" },
];

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-label="Illustration of the GrowX autopilot panel" role="img">
      <div className="glow -right-10 -top-10 h-56 w-56 bg-accent/25 animate-drift" aria-hidden="true" />
      <div className="glow -bottom-16 -left-8 h-56 w-56 bg-rose-300/40 animate-drift [animation-delay:-6s]" aria-hidden="true" />

      <div className="relative">
      <div className="animate-fade-up relative overflow-hidden rounded-3xl border border-border bg-white shadow-[0_40px_80px_-40px_rgba(159,18,57,0.45)] [animation-delay:200ms]">
        <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-[11px] font-medium text-muted ring-1 ring-border">GrowX · Autopilot</span>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-bold">Autopilot running</span>
            </div>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent">Balanced pace</span>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-muted">
              <span>Daily cap progress</span>
              <span>Rolling 24h</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2 ring-1 ring-border">
              <div className="bg-brand animate-fill h-full w-[62%] rounded-full [animation-delay:500ms]" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Scored queue</p>
            <ul className="space-y-2">
              {rows.map((r, i) => (
                <li
                  key={r.h}
                  className="animate-row flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5"
                  style={{ animationDelay: `${600 + i * 140}ms` }}
                >
                  <span className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${r.c}`} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">@{r.h}</span>
                  <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface-2 sm:block">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${r.s}%` }} />
                  </span>
                  <span className="w-8 text-right text-sm font-extrabold text-accent">{r.s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { i: IconClock, t: "Human delays" },
              { i: IconShield, t: "Safe caps" },
              { i: IconActivity, t: "Auto slow-down" },
            ].map(({ i: I, t }) => (
              <div key={t} className="rounded-xl bg-surface-2 px-2 py-2.5 ring-1 ring-border">
                <I size={16} className="mx-auto text-accent" />
                <p className="mt-1 text-[11px] font-semibold text-text-2">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-float absolute -top-5 right-6 hidden rounded-2xl border border-border bg-white px-3.5 py-2.5 shadow-[var(--shadow-lift)] sm:block">
        <p className="flex items-center gap-2 text-xs font-bold">
          <IconTarget size={15} className="text-accent" /> Follow-back score 1-99
        </p>
      </div>
      <div className="animate-float absolute -bottom-6 left-8 hidden rounded-2xl border border-border bg-white px-3.5 py-2.5 shadow-[var(--shadow-lift)] [animation-delay:-3s] sm:block">
        <p className="flex items-center gap-2 text-xs font-bold">
          <IconClock size={15} className="text-accent" /> Break scheduled
        </p>
      </div>
      </div>
      <p className="mt-10 text-center text-xs text-muted">Illustration with sample accounts</p>
    </div>
  );
}
