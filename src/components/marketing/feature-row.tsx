import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowRight, IconCheck } from "@/components/icons";
import { Screenshot } from "@/components/marketing/screenshot";
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
      <div className={`reveal ${reverse ? "lg:order-2" : ""}`}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[2.4rem]">{title}</h3>
        <p className="mt-4 text-lg leading-relaxed text-text-2">{body}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[0.95rem] text-text-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <IconCheck size={13} />
              </span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="group inline-flex items-center gap-1.5 font-semibold text-accent">
              {l.label} <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
      <div className={`reveal ${reverse ? "lg:order-1" : ""}`}>
        <Screenshot src={image} alt={alt} />
      </div>
    </div>
  );
}
