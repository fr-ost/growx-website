import { cssVars } from "../stagger";
import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import s from "./follow-queue.module.css";

const LABEL =
  "GrowX's follow queue. The newest followers of your sources come first; everyone else gets a follow-back score from 1 to 99 and is skipped below your minimum of 55. Follows run at the Balanced pace, 30 to 75 seconds apart.";

const dl = (i: number) => cssVars({ "--dl": `${i * 120}ms` });

function Lines({ a, b }: { a: string; b: string }) {
  return (
    <span className={f.lines}>
      <span className={f.skel} style={{ width: a }} />
      <span className={f.skel} style={{ width: b }} />
    </span>
  );
}

/** Follow queue: newest followers first, then follow-back scores against the minimum of 55. */
export function DemoFollowQueue(props: DemoProps) {
  return (
    <DemoFrame title="GrowX · Grow" label={LABEL} {...props}>
      <div className={f.head}>
        <span className={f.headTitle}>Follow queue</span>
        <span className={`${f.chip} ${f.chipAccent}`}>Balanced · 30-75 s</span>
        <span className={`${f.chip} ${f.hideSm}`}>Break every 18</span>
      </div>
      <div className={s.list}>
        <div className={`${f.row} ${s.row}`} style={dl(0)}>
          <span className={f.avatar}>AK</span>
          <Lines a="64%" b="40%" />
          <span className={`${f.chip} ${f.hideSm}`}>Newest follower</span>
          <span className={`${f.stack} ${s.pill}`} style={dl(0)}>
            <span className={s.following}>Following</span>
            <span className={s.follow} aria-hidden="true">
              Follow
            </span>
          </span>
        </div>
        <div className={`${f.row} ${s.row} ${f.hideSm}`} style={dl(1)}>
          <span className={f.avatar}>MJ</span>
          <Lines a="52%" b="34%" />
          <span className={f.chip}>Newest follower</span>
          <span className={`${s.following} ${s.pill}`}>Queued</span>
        </div>
        <div className={`${f.row} ${s.row}`} style={dl(2)}>
          <span className={f.avatar}>RS</span>
          <Lines a="58%" b="30%" />
          <span className={`${f.chip} ${f.chipAccent} ${f.mono} ${s.score}`} style={dl(2)}>
            82
          </span>
        </div>
        <div className={`${f.row} ${s.row} ${f.hideSm}`} style={dl(3)}>
          <span className={f.avatar}>TL</span>
          <Lines a="46%" b="36%" />
          <span className={`${f.chip} ${f.chipAccent} ${f.mono} ${s.score}`} style={dl(3)}>
            67
          </span>
        </div>
        <div className={`${f.row} ${s.row}`} style={dl(4)}>
          <span className={f.avatar}>DN</span>
          <span className={`${f.lines} ${s.dim}`} style={dl(4)}>
            <span className={f.skel} style={{ width: "50%" }} />
            <span className={f.skel} style={{ width: "28%" }} />
          </span>
          <span className={s.skipped} style={dl(4)}>
            Below 55 · skipped
          </span>
          <span className={`${f.chip} ${f.mono} ${s.score} ${s.skipBadge}`} style={dl(4)}>
            41
            <span className={s.strike} style={dl(4)} aria-hidden="true" />
          </span>
        </div>
      </div>
      <p className={f.foot}>Newest followers first, then score 1-99 (minimum 55)</p>
    </DemoFrame>
  );
}
