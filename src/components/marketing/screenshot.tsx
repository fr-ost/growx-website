import Image from "next/image";

const SIZES: Record<string, [number, number]> = {
  "/screens/overview.webp": [1280, 614],
  "/screens/marquee.webp": [1400, 560],
};

/** A product screenshot in a soft frame. Screenshots use demo data. */
export function Screenshot({ src, alt, priority = false, className = "", sizes = "(min-width: 1024px) 560px, 100vw" }: { src: string; alt: string; priority?: boolean; className?: string; sizes?: string }) {
  const [width, height] = SIZES[src] ?? [1280, 560];
  return (
    <figure className={`stage overflow-hidden ${className}`}>
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} className="h-auto w-full" />
    </figure>
  );
}
