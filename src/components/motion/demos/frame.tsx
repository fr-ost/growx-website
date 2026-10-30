import type { ReactNode } from "react";
import f from "./frame.module.css";

export type DemoProps = { size?: "sm" | "md" | "lg"; framed?: boolean; decorative?: boolean; tone?: "light" | "ink"; className?: string };

/**
 * Window chrome + "Illustration" tag (+ "Premium") around a mini-demo. The body carries
 * data-demo; MotionRuntime adds data-demo-play while it is >= 35% visible.
 * decorative -> aria-hidden (use inside card links); otherwise role="img" with
 * aria-label "Illustration: {label}". Demos are HTML + CSS only: spans, no headings/links/inputs,
 * people as initials + skeleton bars, no follower counts, growth or percentages.
 */
export function DemoFrame({
  title,
  label,
  premium = false,
  tags = [],
  fit = false,
  children,
  size = "md",
  framed = true,
  decorative = false,
  tone = "light",
  className = "",
}: {
  title?: string;
  label: string;
  premium?: boolean;
  /** Extra factual tags shown next to "Illustration" (e.g. "On this computer"). */
  tags?: readonly string[];
  /** Let the body size to its content instead of the fixed sm/md/lg height. */
  fit?: boolean;
  children: ReactNode;
} & DemoProps) {
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img", "aria-label": `Illustration: ${label}` };
  const tagList = (
    <span className={`${f.tags} ${framed ? "" : f.loose}`}>
      {tags.map((t) => (
        <span key={t} className={`${f.tag} ${f.tagExtra}`}>
          {t}
        </span>
      ))}
      {premium ? <span className={`${f.tag} ${f.tagPremium}`}>Premium</span> : null}
      <span className={f.tag}>Illustration</span>
    </span>
  );
  return (
    <div className={`${f.frame} ${framed ? f.framed : ""} ${className}`} data-tone={tone} data-size={size} {...a11y}>
      {framed ? (
        <div className={f.chrome}>
          <span className={f.dots}>
            <i />
            <i />
            <i />
          </span>
          {title ? <span className={f.title}>{title}</span> : null}
          {tagList}
        </div>
      ) : (
        tagList
      )}
      <div className={`${f.body} ${fit ? f.fit : ""}`} data-demo="">
        {children}
      </div>
    </div>
  );
}

/** Shared demo atoms (avatar, skeleton, chips...). */
export { f as demoAtoms };
