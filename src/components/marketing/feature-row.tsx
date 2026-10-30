import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowRight, IconCheck } from "@/components/icons";
import { Screenshot } from "@/components/marketing/screenshot";
import { stagger } from "@/components/motion/stagger";
import { Eyebrow } from "@/components/ui/primitives";

/** Text + screenshot, alternating sides. */
export function FeatureRow({
  eyebrow,
  title,
  body,
  bullets,
  image,
  alt,
  links,
  reverse = false,
}: {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  bullets: string[];
  image: string;
  alt: string;
  links: { href: string; label: string }[];
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : ""}>
        <div className="reveal" style={stagger(0)}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h3 className="reveal-heading mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight [text-wrap:balance] sm:text-[2.4rem]" style={stagger(1)}>
          {title}
        </h3>
        <p className="reveal mt-4 max-w-[62ch] text-lg leading-relaxed text-text-2 [text-wrap:pretty]" style={stagger(2)}>
          {body}
        </p>
        <ul className="reveal mt-6 space-y-3" style={stagger(3)}>
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[0.95rem] text-text-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink ring-1 ring-accent/15">
                <IconCheck size={13} />
              </span>
              {b}
            </li>
          ))}
        </ul>
        <div className="reveal mt-7 flex flex-wrap gap-x-6 gap-y-2" style={stagger(4)}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="group inline-flex items-center gap-1.5 font-semibold text-accent-ink">
              {l.label} <IconArrowRight size={16} className="nudge" />
            </Link>
          ))}
        </div>
      </div>
      <div className={`reveal-scale ${reverse ? "lg:order-1" : ""}`}>
        <Screenshot src={image} alt={alt} sizes="(min-width: 1024px) 560px, 100vw" />
      </div>
    </div>
  );
}
