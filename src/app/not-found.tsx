import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { Backdrop } from "@/components/motion/backdrop";
import { GrowthLine } from "@/components/motion/growth-line";
import { stagger } from "@/components/motion/stagger";
import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

const popular = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/tools", label: "Free tools" },
  { href: "/blog", label: "Blog" },
];

export default function NotFound() {
  return (
    <section className="relative flex flex-1 items-center overflow-clip">
      <Backdrop variant="page" beams={1} />
      <Container className="relative py-24 text-center sm:py-28">
        <div className="relative mx-auto grid w-fit place-items-center">
          {/* The brand line takes a dip behind the numerals, drawn once. */}
          <GrowthLine variant="dip" mode="once" className="pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 text-accent/20 sm:size-80" strokeWidth={7} />
          <div data-tilt="6" className="relative">
            <p className="hero-settle text-gradient font-display text-8xl font-extrabold leading-none tabular-nums sm:text-9xl" style={stagger(0)}>
              404
            </p>
          </div>
        </div>
        <h1 className="hero-settle mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl" style={stagger(1)}>
          This page doesn&apos;t exist
        </h1>
        <p className="hero-settle mx-auto mt-3 max-w-md text-text-2" style={stagger(2)}>
          It may have moved, or the link is mistyped.
        </p>
        <div className="hero-settle mt-8 flex flex-col justify-center gap-3 sm:flex-row" style={stagger(3)}>
          <LinkButton href="/">
            Back to home <IconArrowRight size={16} className="nudge" />
          </LinkButton>
          <LinkButton href="/contact" variant="secondary">
            Get support
          </LinkButton>
        </div>
        <nav aria-label="Popular pages" className="mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-text-2">
            {popular.map((l, i) => (
              <li key={l.href} className="flex items-center gap-2">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-muted">
                    ·
                  </span>
                ) : null}
                <Link href={l.href} className="link-draw rounded-sm py-1 hover:text-text">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
