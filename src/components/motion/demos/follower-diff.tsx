import { cssVars } from "../stagger";
import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import s from "./follower-diff.module.css";

const LABEL = "once a day GrowX lists who followed and who unfollowed you.";
const dl = (i: number) => cssVars({ "--dl": `${i * 160}ms` });

/** Follower changes: who followed and who unfollowed you, checked once a day. No counts. */
export function DemoFollowerDiff(props: DemoProps) {
  return (
    <DemoFrame title="GrowX · Followers" label={LABEL} {...props}>
      <div className={f.head}>
        <span className={f.headTitle}>Follower changes</span>
        <span className={f.chip}>Checked once a day</span>
        <span className={`${f.chip} ${f.hideSm}`}>Free: 7 days of history</span>
      </div>
      <div className={s.day}>Today</div>
      <div className={s.list}>
        <div className={`${f.row} ${s.row}`} style={dl(0)}>
          <span className={f.avatar}>PL</span>
          <span className={f.lines}>
            <span className={f.skel} style={{ width: "60%" }} />
            <span className={f.skel} style={{ width: "36%" }} />
          </span>
          <span className={`${f.chip} ${f.chipOk}`}>+ Followed you</span>
        </div>
        <div className={`${f.row} ${s.row} ${f.hideSm}`} style={dl(1)}>
          <span className={f.avatar}>GW</span>
          <span className={f.lines}>
            <span className={f.skel} style={{ width: "48%" }} />
            <span className={f.skel} style={{ width: "30%" }} />
          </span>
          <span className={`${f.chip} ${f.chipOk}`}>+ Followed you</span>
        </div>
        <div className={`${f.row} ${s.row}`} style={dl(2)}>
          <span className={f.avatar}>CB</span>
          <span className={f.lines}>
            <span className={f.skel} style={{ width: "54%" }} />
            <span className={f.skel} style={{ width: "26%" }} />
          </span>
          <span className={`${f.chip} ${f.chipDanger}`}>− Unfollowed you</span>
        </div>
        <div className={`${f.row}`}>
          <span className={f.lines} />
          <span className={s.back} style={dl(2)}>
            Unfollow back <span className={s.mini}>Premium</span>
          </span>
        </div>
      </div>
    </DemoFrame>
  );
}
