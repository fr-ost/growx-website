import { Fragment } from "react";
import { cssVars } from "../stagger";
import { DemoFrame, demoAtoms as f, type DemoProps } from "./frame";
import s from "./ai-draft.module.css";

const LABEL = "GrowX AI drafting a post on your computer, leaving {placeholders} for the facts only you know.";

const LINES = [
  "3 things I wish I knew about {topic} before {milestone}:",
  "1. {first lesson}",
  "2. {second lesson}",
  "3. {third lesson}",
];

type Token = { text: string; ph: boolean; suffix: string; k: number };

/** Words stay words, {placeholders} stay whole; every token gets a global typing index. */
const PARSED: Token[][] = (() => {
  let k = 0;
  return LINES.map((line) =>
    (line.match(/\{[^}]+\}:?|\S+/g) ?? []).map((raw) => {
      const ph = raw.startsWith("{");
      const suffix = ph && raw.endsWith(":") ? ":" : "";
      return { text: suffix ? raw.slice(0, -1) : raw, ph, suffix, k: k++ };
    }),
  );
})();

/** On-device AI typing a draft word by word, with {placeholder} chips for the facts only you know. */
export function DemoAiDraft(props: DemoProps) {
  return (
    <DemoFrame title="GrowX AI" label={LABEL} premium tags={["On this computer"]} {...props}>
      <div className={s.pills}>
        <span className={`${f.chip} ${s.active}`}>Write</span>
        <span className={f.chip}>Improve</span>
        <span className={f.chip}>Hooks</span>
        <span className={`${f.chip} ${f.hideSm}`}>Thread it</span>
      </div>
      <div className={s.draft}>
        {PARSED.map((line, li) => (
          <span key={li} className={s.line}>
            {line.map((t, ti) => {
              const style = cssVars({ "--k": t.k });
              return (
                <Fragment key={ti}>
                  {ti > 0 ? " " : null}
                  <span className={t.ph ? `${s.w} ${s.ph} ${f.mono}` : s.w} style={style}>
                    {t.text}
                  </span>
                  {t.suffix ? (
                    <span className={s.w} style={style}>
                      {t.suffix}
                    </span>
                  ) : null}
                </Fragment>
              );
            })}
            {li === PARSED.length - 1 ? (
              <span className={s.caretWrap} aria-hidden="true">
                <span className={s.caret} />
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </DemoFrame>
  );
}
