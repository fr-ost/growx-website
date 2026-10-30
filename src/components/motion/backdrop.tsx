import { Aurora } from "./aurora";
import { LightBeams } from "./light-beams";

/**
 * The designed background stack for heroes and ink chapters. Replaces .bg-hero,
 * .bg-grid and filter-blur .glow on marketing pages.
 * - hero: moving Aurora + 72px hairline grid + LightBeams (default 2) + grain
 * - page: still Aurora + hairline grid + 1 beam + grain
 * - ink:  ink Aurora + 6% white dot grid + grain
 * The parent must be `relative overflow-clip` and its content `relative`.
 */
export function Backdrop({
  variant = "page",
  beams,
  grain = true,
  travel,
  className = "",
}: {
  variant?: "hero" | "page" | "ink";
  beams?: 0 | 1 | 2 | 3;
  grain?: boolean;
  /** How far the light beams fall, in px (defaults to 760). */
  travel?: number;
  className?: string;
}) {
  const beamCount = beams ?? (variant === "hero" ? 2 : variant === "page" ? 1 : 0);
  return (
    <div
      aria-hidden="true"
      data-decor=""
      data-ambient=""
      className={`pointer-events-none absolute inset-0 overflow-clip [mask-image:linear-gradient(to_bottom,#000_80%,transparent)] ${className}`}
    >
      <Aurora tone={variant === "ink" ? "ink" : "light"} still={variant === "page"} />
      {variant === "ink" ? (
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
      ) : (
        <div className="hairline-grid absolute inset-0" />
      )}
      {beamCount > 0 ? <LightBeams count={beamCount as 1 | 2 | 3} travel={travel} /> : null}
      {grain ? <div className="grain absolute inset-0" /> : null}
    </div>
  );
}
