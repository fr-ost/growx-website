import Link from "next/link";
import { CtaBand } from "@/components/home/cta-band";
import { IconArrowRight } from "@/components/icons";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { CountUp } from "@/components/motion/count-up";
import { stagger } from "@/components/motion/stagger";
import { ToolGlyph, toolKey } from "@/components/motion/tool-glyph";
import { Container, Eyebrow, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { featureNav, toolNav } from "@/config/nav";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free X (Twitter) Tools: Templates, Counters & More",
  description: "7 free X (Twitter) tools from GrowX: tweet templates, bio generator, character counter, thread maker, engagement and ratio calculators, bold text. No sign-up.",
  path: "/tools",
  keywords: ["free Twitter tools", "free X tools", "tweet character counter", "Twitter thread maker", "Twitter engagement rate calculator", "Twitter bold text generator", "tweet templates", "Twitter bio generator", "Twitter tools online"],
});

/** Static, aria-hidden 2x4 instrument panel: the seven tool glyphs plus a "no sign-up" tile. */
function ToolCluster() {
  return (
    <div aria-hidden="true" className="relative mx-auto max-w-md">
      <span className="glow-soft -inset-10 [--glow:rgba(225,29,46,0.16)]" data-decor="" />
      <div
        data-spotlight-group=""
        className="relative grid grid-cols-4 gap-3 rounded-[2rem] bg-white/80 p-4 shadow-[var(--shadow-float)] ring-1 ring-hairline"
      >
        {toolNav.map((t, i) => (
          <span
            key={t.href}
            data-spotlight=""
            className={`grid aspect-square place-items-center rounded-2xl bg-surface-2 ring-1 ring-hairline ${i >= 4 ? "translate-y-3" : ""}`}
          >
            <ToolGlyph tool={toolKey(t.href)} size="sm" />
          </span>
        ))}
        <span
          data-spotlight=""
          className="grid aspect-square translate-y-3 place-items-center rounded-2xl border border-dashed border-accent/30 bg-tint px-1 text-center text-[11px] font-bold uppercase leading-tight tracking-wider text-accent-ink"
        >
          No sign-up
        </span>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Free tools", path: "/tools" }])]} />
      <PageHero
        eyebrow={
          <Eyebrow>
            <CountUp value={toolNav.length} /> free tools
          </Eyebrow>
        }
        title={<>Free X (Twitter) tools, <span className="text-gradient">no sign-up</span>.</>}
        aside={<ToolCluster />}
      >
        <p>Small, fast tools that run in your browser. Nothing you type leaves your computer.</p>
      </PageHero>
      <Section>
        <Container>
          <ul data-spotlight-group="" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {toolNav.map((t, i) => (
              <li key={t.href} className="reveal" style={stagger(i % 4)}>
                <Link
                  href={t.href}
                  data-spotlight=""
                  className="lift group flex h-full flex-col rounded-3xl border border-hairline bg-white p-7 shadow-[var(--shadow-hair)]"
                >
                  <ToolGlyph tool={toolKey(t.href)} size="lg" />
                  <h2 className="mt-6 text-balance font-display text-xl font-extrabold tracking-tight">{t.label}</h2>
                  <p className="mt-2 flex-1 text-pretty text-text-2">{t.blurb}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-accent-ink">
                    Open tool <IconArrowRight size={16} className="nudge" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Want more?" title="The full GrowX toolkit lives in Chrome." center>
            Auto follow, scheduling, AI writing, analytics and cleanup, in one free extension.
          </SectionHeading>
          <ul className="reveal mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2" style={stagger(3)}>
            {featureNav.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/features/${f.slug}`}
                  className="inline-flex rounded-full border border-hairline-strong bg-white px-4 py-2 text-sm font-semibold text-text-2 shadow-[var(--shadow-hair)] hover:border-accent/40 hover:text-accent-ink motion-ok:transition-[scale] motion-ok:duration-200 motion-ok:ease-glide fx:hover:scale-[1.03]"
                >
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
