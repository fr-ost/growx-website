import { DemoPaceStrip } from "@/components/motion/demos/pace-strip";
import { PACE_PRESETS } from "@/components/motion/demos/pace-presets";

const MAX_PER_DAY = 800;

/**
 * "Pace presets (v2.4.4)": the real preset table from docs/PRODUCT_FACTS.md as a <dl>, each with an
 * aria-hidden daily-cap bar (static width = perDay / 800; the fill draws with scroll), then the
 * Balanced rhythm strip. Lives on ink.
 */
export function PaceConsole() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg font-bold text-white">Pace presets</p>
        <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-white/70 tabular-nums">v2.4.4</span>
      </div>
      <dl className="mt-5 divide-y divide-white/10">
        {PACE_PRESETS.map((p) => (
          <div key={p.id} className="py-3.5 first:pt-0">
            <dt className="flex flex-wrap items-center gap-2 font-semibold text-white">
              {p.name}
              {p.id === "balanced" ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white ring-1 ring-white/20">Default</span>
              ) : null}
              {p.premium ? (
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-accent-on-ink ring-1 ring-[#ff5a68]/30">
                  Premium
                </span>
              ) : null}
            </dt>
            <dd className="mt-1 text-sm text-white/75 tabular-nums">
              {p.delay[0]}-{p.delay[1]} s between follows · up to {p.perHour}/hour · ~{p.perDay}/day
              <span aria-hidden="true" className="mt-2.5 block h-1.5 overflow-clip rounded-full bg-white/10">
                <span
                  className="fill-x block h-full origin-left rounded-full bg-[linear-gradient(90deg,#9f1239,#e11d2e_60%,#ff5a68)]"
                  style={{ width: `${(p.perDay / MAX_PER_DAY) * 100}%` }}
                />
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 border-t border-white/10 pt-5">
        <DemoPaceStrip preset="balanced" tone="ink" framed={false} />
      </div>
    </div>
  );
}
