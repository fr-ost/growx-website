import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import { pacePreset, type PaceId } from "./pace-presets";
import s from "./pace-strip.module.css";
import { hash, rand } from "./seed";

/** Seconds one dot-slot represents: the strip covers `dots` x 36 s for every preset (shared time scale). */
const SLOT_S = 36;
/** Visual length of a rest gap, in seconds of the strip (a marker, not a claimed break length). */
const REST_S = 90;

type Layout = { dots: number[]; rests: number[]; restWidth: number };

function layout(id: PaceId, slots: number): Layout {
  const p = pacePreset(id);
  const r = rand(hash(`pace-${id}`));
  const span = slots * SLOT_S;
  const dots: number[] = [];
  const rests: number[] = [];
  let t = 0;
  for (let n = 1; n < 400; n++) {
    t += p.delay[0] + r() * (p.delay[1] - p.delay[0]);
    if (t > span) break;
    dots.push((t / span) * 100);
    if (n % p.restEvery === 0) {
      if (t + REST_S > span) break;
      rests.push((t / span) * 100);
      t += REST_S;
    }
  }
  return { dots, rests, restWidth: (REST_S / span) * 100 };
}

/**
 * A rhythm strip of follows spaced by seeded jitter inside the preset's REAL delay range, on a
 * time scale shared by all presets (so Safe looks sparse and X Premium dense), with a labelled
 * rest after every `restEvery` follows. `dots` sets the window length (dots x 36 s).
 * Motion: a lit copy is revealed left to right over 6 s, holds 2.5 s, plays twice. Base: fully lit.
 */
export function DemoPaceStrip({ preset = "balanced", dots = 36, framed = false, ...props }: { preset?: PaceId; dots?: number } & DemoProps) {
  const p = pacePreset(preset);
  const { dots: xs, rests, restWidth } = layout(preset, dots);
  const label = `the ${p.name} pace: ${p.delay[0]} to ${p.delay[1]} seconds between follows, a rest every ${p.restEvery} follows, up to ${p.perHour} an hour.`;
  const marks = (
    <>
      {xs.map((x, i) => (
        <i key={i} className={s.dot} style={{ left: `${x.toFixed(2)}%` }} />
      ))}
    </>
  );
  return (
    <DemoFrame title="GrowX · Grow" label={label} premium={p.premium} framed={framed} fit {...props}>
      <div className={s.root}>
        <div className={s.top}>
          <span className={s.name}>{p.name}</span>
          <span className={`${s.meta} ${f.mono}`}>
            {p.delay[0]}-{p.delay[1]} s between follows · rest every {p.restEvery} · up to {p.perHour}/hour
          </span>
        </div>
        <div className={s.strip}>
          <span className={s.track}>{marks}</span>
          <span className={`${s.track} ${s.lit}`} aria-hidden="true">
            {marks}
          </span>
          {rests.map((x) => (
            <span key={x} className={s.rest} style={{ left: `${x.toFixed(2)}%`, width: `${restWidth.toFixed(2)}%` }}>
              rest
            </span>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}
