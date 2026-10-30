import { DemoPaceStrip } from "@/components/motion/demos/pace-strip";
import { PACE_PRESETS } from "@/components/motion/demos/pace-presets";
import { stagger } from "@/components/motion/stagger";

/**
 * The four follow paces as cards: a rhythm strip on a shared time scale (Safe sparse, X Premium
 * dense) plus the preset's real numbers. The pace table below stays the accessible source of
 * truth; these cards are a visual companion. Names are not headings, so the page outline is unchanged.
 */
export function PaceCards() {
  return (
    <ul data-spotlight-group="" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {PACE_PRESETS.map((p, i) => {
        const tag = p.id === "balanced" ? "Default" : p.premium ? "Premium" : null;
        return (
          <li
            key={p.id}
            data-spotlight=""
            className="reveal lift flex flex-col rounded-3xl border border-hairline bg-white p-5 shadow-hair"
            style={stagger(i % 4)}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-extrabold tracking-tight">{p.name}</p>
              {tag ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    tag === "Default" ? "bg-accent-soft text-accent-ink ring-1 ring-accent/15" : "bg-surface-2 text-text-2 ring-1 ring-hairline-strong"
                  }`}
                >
                  {tag}
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex-1">
              <DemoPaceStrip preset={p.id} framed={false} />
            </div>
            <p className="mt-4 border-t border-hairline pt-3.5 font-mono text-xs leading-relaxed text-text-2 tabular-nums">
              {p.delay[0]}-{p.delay[1]} s · rest every {p.restEvery} · up to {p.perHour}/hour · ~{p.perDay}/day
            </p>
          </li>
        );
      })}
    </ul>
  );
}
