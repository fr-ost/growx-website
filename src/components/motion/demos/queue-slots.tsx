import type { ReactNode } from "react";
import { cssVars } from "../stagger";
import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import s from "./queue-slots.module.css";

const LABEL = "posts dropping into GrowX's default queue slots at 09:00, 13:00 and 18:30.";

function Slot({ time, i, children, className = "" }: { time: string; i: number; children: ReactNode; className?: string }) {
  const style = cssVars({ "--dl": `${i * 550}ms` });
  return (
    <div className={`${s.slot} ${className}`}>
      <span className={`${f.mono} ${s.time}`}>{time}</span>
      <span className={s.box}>
        <span className={s.card} style={style}>
          {children}
        </span>
      </span>
      <span className={`${f.stack} ${s.status}`}>
        <span className={s.queued} style={style}>
          Queued
        </span>
        <span className={s.open} style={style} aria-hidden="true">
          Open
        </span>
      </span>
    </div>
  );
}

/** Drafts dropping into the default queue slots (09:00, 13:00, 18:30). */
export function DemoQueueSlots(props: DemoProps) {
  return (
    <DemoFrame title="GrowX · Create" label={LABEL} {...props}>
      <div className={f.head}>
        <span className={f.headTitle}>Queue</span>
        <span className={f.chip}>Free: up to 10 waiting</span>
      </div>
      <div className={s.day}>Today</div>
      <div className={s.slots}>
        <Slot time="09:00" i={0}>
          <span className={f.lines}>
            <span className={f.skel} style={{ width: "86%" }} />
            <span className={f.skel} style={{ width: "54%" }} />
          </span>
        </Slot>
        <Slot time="13:00" i={1}>
          <span className={s.thumb} />
          <span className={f.lines}>
            <span className={f.skel} style={{ width: "72%" }} />
            <span className={f.skel} style={{ width: "40%" }} />
          </span>
        </Slot>
        <Slot time="18:30" i={2} className={f.hideSm}>
          <span className={f.lines}>
            <span className={f.skel} style={{ width: "64%" }} />
          </span>
          <span className={`${f.chip} ${f.chipAccent}`}>Thread · 3 posts</span>
        </Slot>
      </div>
    </DemoFrame>
  );
}
