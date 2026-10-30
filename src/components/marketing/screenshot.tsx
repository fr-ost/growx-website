import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

const SIZES: Record<string, [number, number]> = {
  "/screens/overview.webp": [1280, 614],
  "/screens/marquee.webp": [1400, 560],
};

/** Shots whose right-hand callout column (incl. "Always safe") is cropped away. */
const RIGHT_CROPPED = new Set(["/screens/grow.webp", "/screens/create.webp", "/screens/insights.webp", "/screens/followers.webp"]);

type CropMode = "top" | "right" | "none";

const BOTTOM_FADE: CSSProperties = {
  maskImage: "linear-gradient(#000 86%, transparent)",
  WebkitMaskImage: "linear-gradient(#000 86%, transparent)",
};
const RIGHT_FADE: CSSProperties = {
  maskImage: "linear-gradient(90deg, #000 84%, transparent)",
  WebkitMaskImage: "linear-gradient(90deg, #000 84%, transparent)",
};

function cropMode(src: string, crop: "auto" | "none"): CropMode {
  if (crop === "none") return "none";
  if (src === "/screens/overview.webp") return "top";
  return RIGHT_CROPPED.has(src) ? "right" : "none";
}

/**
 * A product screenshot in a soft stage frame. Screenshots use demo data.
 * crop "auto" keeps the baked-in marketing callouts (result badges, "Always safe") out of view:
 * - overview: a 1280/520 frame, top-aligned, with a bottom mask fade;
 * - grow / create / insights / followers: a 960/560 frame, left-aligned, with a right mask fade.
 * `children` render in an absolute overlay with container-type: inline-size, so annotations can be
 * placed in percentages of the visible (cropped) frame. The image's opacity is never animated.
 */
export function Screenshot({
  src,
  alt,
  priority = false,
  sizes,
  className = "",
  crop = "auto",
  children,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  crop?: "auto" | "none";
  children?: ReactNode;
}) {
  const [width, height] = SIZES[src] ?? [1280, 560];
  const mode = cropMode(src, crop);
  const frame = mode === "top" ? "aspect-[1280/520]" : mode === "right" ? "aspect-[960/560]" : "";
  const fit = mode === "top" ? "size-full object-cover object-top" : mode === "right" ? "size-full object-cover object-left" : "h-auto w-full";
  const resolvedSizes = sizes ?? (mode === "right" ? "(min-width: 1024px) 760px, 133vw" : "(min-width: 1024px) 560px, 100vw");
  return (
    <figure className={`stage relative overflow-clip rounded-3xl ${className}`}>
      <div className={`relative ${frame}`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={resolvedSizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? undefined : "lazy"}
          className={`block ${fit}`}
          style={mode === "top" ? BOTTOM_FADE : mode === "right" ? RIGHT_FADE : undefined}
        />
      </div>
      {children ? <div className="pointer-events-none absolute inset-0 [container-type:inline-size]">{children}</div> : null}
    </figure>
  );
}
