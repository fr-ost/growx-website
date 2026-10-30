import { cssVars } from "../stagger";
import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import s from "./cleanup.module.css";

const LABEL =
  "GrowX's cleanup: accounts that don't follow back are reviewed, re-checked right before each unfollow and unfollowed at a safe pace.";

const ROWS = [
  { who: "HV", a: "58%", b: "34%" },
  { who: "OK", a: "46%", b: "40%" },
  { who: "ZR", a: "62%", b: "28%" },
] as const;

/** Cleanup: rows ticked one by one, re-checked right before each unfollow, at a safe pace. */
export function DemoCleanup(props: DemoProps) {
  return (
    <DemoFrame title="GrowX · Cleanup" label={LABEL} {...props}>
      <div className={s.root}>
        <div className={f.head}>
          <span className={`${f.chip} ${f.chipAccent}`}>Not following back</span>
          <span className={f.chip}>Inactive 90+ days</span>
        </div>
        <div className={s.list}>
          {ROWS.map((r, i) => {
            const style = cssVars({ "--dl": `${i * 400}ms` });
            return (
              <div key={r.who} className={`${f.row} ${i === 2 ? f.hideSm : ""}`}>
                <span className={s.box}>
                  <svg viewBox="0 0 12 12" className={s.check} style={style} aria-hidden="true">
                    <path d="M2 6.4 4.8 9 10 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={f.avatar}>{r.who}</span>
                <span className={f.lines}>
                  <span className={f.skel} style={{ width: r.a }} />
                  <span className={f.skel} style={{ width: r.b }} />
                </span>
                <span className={`${f.stack} ${s.status}`}>
                  <span className={s.done} style={style}>
                    Unfollowed
                  </span>
                  <span className={s.recheck} style={style} aria-hidden="true">
                    <i className={s.dot} style={style} /> re-checking
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <span className={`${f.chip} ${s.footer}`}>Safe pace · up to 30/hour, 200/day</span>
      </div>
    </DemoFrame>
  );
}
