import { IconChrome } from "@/components/icons";
import { Aurora } from "@/components/motion/aurora";
import { BorderBeam } from "@/components/motion/border-beam";
import { GrowthLine } from "@/components/motion/growth-line";
import { stagger } from "@/components/motion/stagger";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { site } from "@/config/site";

/**
 * The closing ink panel (shared site-wide). Layers: a drifting ink aurora (2 loops, paused
 * off-screen), grain, the GrowX growth line drawing with scroll and a scroll-driven white border beam.
 */
export function CtaBand({
  title = "Start growing on X today.",
  body = "Install GrowX for free and create your account in under a minute. Try every Premium feature for 30 days: no credit card, no commitment.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div
          data-spotlight="ink"
          className="on-ink relative isolate overflow-clip rounded-[2rem] bg-ink px-6 py-14 text-center text-white sm:px-12 sm:py-20"
        >
          <Aurora tone="ink" />
          <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" data-decor="" />
          <GrowthLine mode="scroll" className="pointer-events-none absolute -right-8 bottom-0 h-[115%] w-auto text-white/10" />
          <BorderBeam mode="scroll" tone="white" />
          <div className="relative">
            <h2 className="reveal-heading mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight [text-wrap:balance] sm:text-5xl" style={stagger(0)}>
              {title}
            </h2>
            <p className="reveal mx-auto mt-5 max-w-xl text-lg text-white/75 [text-wrap:pretty]" style={stagger(1)}>
              {body}
            </p>
            <div className="reveal mt-9 flex flex-col justify-center gap-3 sm:flex-row" style={stagger(2)}>
              {site.chromeStoreUrl ? (
                <ExternalButton href={site.chromeStoreUrl} size="lg" data-magnetic="6">
                  <IconChrome size={20} /> Add to Chrome, free
                </ExternalButton>
              ) : null}
              <LinkButton href="/signup" variant="white" size="lg">
                Create free account
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
