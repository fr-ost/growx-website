import type { HTMLAttributes, ReactNode } from "react";
import { Aurora } from "./aurora";

/**
 * A dark "ink" chapter. With `curtain`, its background layer opens from a rounded 3% inset
 * (1.5% on mobile) to full bleed over entry 0-60%; the clip is on the background only, so
 * content is never clipped. Text on ink: body >= white/70, small >= white/60, red = text-accent-on-ink.
 */
export function InkStage({
  as: Tag = "section",
  curtain = false,
  aurora = true,
  grain = true,
  className = "",
  children,
  ...rest
}: {
  as?: "section" | "div" | "aside";
  curtain?: boolean;
  aurora?: boolean;
  grain?: boolean;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`ink-stage on-ink relative overflow-clip ${className}`} {...rest}>
      <div className="ink-stage__bg" data-curtain={curtain ? "" : undefined} aria-hidden="true" data-decor="" />
      {aurora ? <Aurora tone="ink" /> : null}
      {grain ? <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" data-decor="" /> : null}
      <div className="relative">{children}</div>
    </Tag>
  );
}
