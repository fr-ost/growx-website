import { cssVars } from "../stagger";
import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import s from "./heatmap.module.css";
import { hash, rand } from "./seed";

const LABEL = "a week-by-hour heat map lighting up the best times to post, based on your own posts.";

/** Three highlighted cells [day, hour]; even hours so they stay visible in the 12-column layout. */
const RINGS: readonly (readonly [number, number])[] = [
  [1, 8],
  [3, 18],
  [5, 20],
];
const LEVELS = [s.l0, s.l1, s.l2, s.l3, s.l4];
const bump = (h: number, mu: number, sd: number) => Math.exp(-((h - mu) ** 2) / (2 * sd * sd));

/** 7 x 24 levels (0-4), seeded so mornings and evenings are brighter. Deterministic. */
const CELLS: number[] = (() => {
  const r = rand(hash("growx-heatmap"));
  const out: number[] = [];
  for (let d = 0; d < 7; d++)
    for (let h = 0; h < 24; h++) {
      const ring = RINGS.some(([rd, rh]) => rd === d && rh === h);
      const v = 0.75 * bump(h, 8.5, 1.8) + 0.95 * bump(h, 19.5, 2.2) + 0.12 * bump(h, 13, 1.2) + r() * 0.3 - (d >= 5 ? 0.08 : 0);
      out.push(ring ? 4 : Math.max(0, Math.min(3, Math.floor(v * 4.2))));
    }
  return out;
})();

/** Best-time-to-post heat map: a diagonal wipe, one light pass, then rings around three cells. */
export function DemoHeatmap(props: DemoProps) {
  return (
    <DemoFrame title="GrowX · Insights" label={LABEL} {...props}>
      <div className={f.head}>
        <span className={f.headTitle}>
          Best time to post <span className={s.sub}>· from your own posts</span>
        </span>
        <span className={`${f.chip} ${f.mono}`}>Mon-Sun × 24 h</span>
      </div>
      <div className={s.wrap}>
        <div className={s.grid}>
          {CELLS.map((lvl, i) => {
            const d = Math.floor(i / 24);
            const h = i % 24;
            const ringIdx = RINGS.findIndex(([rd, rh]) => rd === d && rh === h);
            return (
              <span key={i} className={`${s.cell} ${LEVELS[lvl]}`}>
                {ringIdx >= 0 ? <i className={s.ring} style={cssVars({ "--dl": `${ringIdx * 150}ms` })} /> : null}
              </span>
            );
          })}
        </div>
        <span className={s.sheen} />
      </div>
    </DemoFrame>
  );
}
