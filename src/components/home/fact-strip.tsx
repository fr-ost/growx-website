import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/count-up";
import { PACE_PRESETS } from "@/components/motion/demos/pace-presets";
import { stagger } from "@/components/motion/stagger";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { featureNav } from "@/config/nav";
import { TWEET_TEMPLATES } from "@/content/tweet-templates";

/** Real product facts only (docs/PRODUCT_FACTS.md); every value is derived from the source data. */
const facts: { value: ReactNode; label: string }[] = [
  { value: <CountUp value={featureNav.length} />, label: "growth tools" },
  { value: <CountUp value={TWEET_TEMPLATES.length} />, label: "templates" },
  { value: <CountUp value={PACE_PRESETS.length} />, label: "pace presets" },
  { value: "1-99", label: "follow-back score" },
  { value: <CountUp value={25} />, label: "posts per thread" },
];

/** "What's inside": a hairline grid of counted product facts under the hero. */
export function FactStrip() {
  return (
    <section aria-label="What's inside GrowX" className="relative pb-6 pt-4 sm:pb-10">
      <Container>
        <div className="reveal flex justify-center" style={stagger(0)}>
          <Eyebrow>What&apos;s inside</Eyebrow>
        </div>
        <dl className="mt-6 grid grid-cols-2 overflow-clip rounded-3xl border border-hairline bg-white shadow-[var(--shadow-hair)] lg:grid-cols-5">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={`border-hairline p-5 sm:p-7 ${i < 4 ? "border-b lg:border-b-0 lg:border-r" : "col-span-2 lg:col-span-1"} ${i % 2 === 0 && i < 4 ? "border-r" : ""}`}
            >
              <div className="reveal flex flex-col-reverse gap-1.5" style={stagger(i)}>
                <dt className="text-sm font-medium text-text-2">{f.label}</dt>
                <dd className="text-gradient w-fit font-display text-[clamp(2.25rem,1.7rem+1.8vw,3.25rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
                  {f.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
