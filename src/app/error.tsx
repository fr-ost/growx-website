"use client";

import { Backdrop } from "@/components/motion/backdrop";
import { GrowthLine } from "@/components/motion/growth-line";
import { stagger } from "@/components/motion/stagger";
import { Button, LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="relative flex flex-1 items-center overflow-clip">
      <Backdrop variant="page" beams={1} />
      <Container className="relative py-24 text-center sm:py-28">
        <div className="relative mx-auto grid w-fit place-items-center">
          <GrowthLine
            variant="dip"
            mode="once"
            className="pointer-events-none absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 text-accent/20 sm:size-72"
            strokeWidth={7}
          />
          <div data-tilt="6" className="relative">
            <p className="hero-settle text-gradient font-display text-7xl font-extrabold leading-none sm:text-8xl" style={stagger(0)}>
              Oops
            </p>
          </div>
        </div>
        <h1 className="hero-settle mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl" style={stagger(1)}>
          Something went wrong
        </h1>
        <p className="hero-settle mx-auto mt-3 max-w-md text-text-2" style={stagger(2)}>
          An unexpected error occurred. Please try again.
        </p>
        <div className="hero-settle mt-8 flex flex-col justify-center gap-3 sm:flex-row" style={stagger(3)}>
          <Button onClick={reset}>Try again</Button>
          <LinkButton href="/" variant="secondary">
            Home
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
