import { IconLayers, IconMoon, IconPalette } from "@/components/icons";
import { Kbd } from "../kbd";
import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import s from "./palette.module.css";

const LABEL = "the GrowX command palette (Ctrl+K) with colour themes, dark mode and workspaces.";

/** Command palette (Ctrl+K): themes, dark mode and a workspace per X account. Supports tone="ink". */
export function DemoPalette(props: DemoProps) {
  const kbdTone = props.tone === "ink" ? "ink" : "light";
  return (
    <DemoFrame title="GrowX · Settings" label={LABEL} {...props}>
      <div className={s.win}>
        <div className={s.input}>
          <svg viewBox="0 0 24 24" className={s.mag} aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className={f.lines}>
            <span className={f.skel} style={{ width: "42%" }} />
          </span>
          <span className={s.keys}>
            <Kbd tone={kbdTone}>Ctrl</Kbd>+<Kbd tone={kbdTone}>K</Kbd>
          </span>
        </div>
        <div className={s.list}>
          <span className={s.hl} aria-hidden="true" />
          <span className={s.item}>
            <IconPalette size={14} className={s.ico} /> 8 colour themes
          </span>
          <span className={s.item}>
            <IconMoon size={14} className={s.ico} /> Dark mode
          </span>
          <span className={s.item}>
            <IconLayers size={14} className={s.ico} /> Workspace per X account
            <span className={`${f.chip} ${f.chipAccent} ${s.premium}`}>Premium</span>
          </span>
        </div>
      </div>
    </DemoFrame>
  );
}
