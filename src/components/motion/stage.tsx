import type { ReactNode } from "react";

/**
 * Perspective / scroll-straightening screenshot stage.
 * - hero:   rotateX(16deg) scale(.95) from a bottom origin, straightens over the first 70vh (>= 768px)
 * - side:   rotateY(-10deg) rotateX(4deg) scale(.94), straightens over the first 60vh (>= 1024px)
 * - inline: the same turn-in on its own view() timeline (>= 1024px)
 * - flat:   no scroll effect
 * An inner [data-tilt] layer tilts <= `tilt` deg toward a fine pointer, one light sweep crosses
 * the frame 500ms after load, a radial floor glow sits underneath, `chips` render at md+ only.
 * The image's opacity is never animated.
 */
export function Stage3D({
  variant = "hero",
  tilt = 2.5,
  sweep = true,
  glow = true,
  chips,
  caption,
  className = "",
  children,
}: {
  variant?: "hero" | "side" | "inline" | "flat";
  tilt?: number;
  sweep?: boolean;
  glow?: boolean;
  chips?: ReactNode;
  caption?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const origin = variant === "hero" ? "origin-bottom" : "origin-center";
  return (
    <div className={`relative ${className}`}>
      {glow ? (
        <div
          aria-hidden="true"
          data-decor=""
          className="glow-soft -bottom-10 left-[8%] right-[8%] h-28 [--glow:rgba(225,29,46,0.28)]"
        />
      ) : null}
      <div className={`relative stage-3d ${variant === "flat" ? "" : `stage-3d--${variant}`} ${origin}`}>
        <div data-tilt={tilt > 0 ? String(tilt) : undefined} className="relative">
          {children}
          {sweep ? (
            <div aria-hidden="true" data-decor="" className="pointer-events-none absolute inset-0 overflow-clip rounded-[1.5rem]">
              <span className="stage-sweep" />
            </div>
          ) : null}
          {chips ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
              {chips}
            </div>
          ) : null}
        </div>
      </div>
      {caption ? <p className="mt-3 text-xs text-muted">{caption}</p> : null}
    </div>
  );
}
