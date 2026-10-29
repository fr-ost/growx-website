import Link from "next/link";
import { CtaBand } from "@/components/home/cta-band";
import { IconArrowRight, IconTool } from "@/components/icons";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { Container, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { featureNav, toolNav } from "@/config/nav";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free X (Twitter) Tools: Counter & Thread Maker",
  description: "Free X (Twitter) tools from GrowX: a tweet character counter that counts like X and a thread maker that splits long text into posts. No sign-up needed.",
  path: "/tools",
  keywords: ["free Twitter tools", "free X tools", "tweet character counter", "Twitter thread maker", "Twitter tools online"],
});

export default function ToolsPage() {
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Free tools", path: "/tools" }])]} />
      <PageHero eyebrow="Free tools" title={<>Free X (Twitter) tools, <span className="text-gradient">no sign-up</span>.</>}>
        <p>Small, fast tools that run in your browser. Nothing you type leaves your computer.</p>
      </PageHero>
      <Section>
        <Container className="max-w-4xl">
          <ul className="grid gap-5 sm:grid-cols-2">
            {toolNav.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="card-hover group flex h-full flex-col rounded-3xl border border-border bg-white p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-[var(--shadow-red)]">
                    <IconTool size={22} />
                  </span>
                  <h2 className="mt-5 text-xl font-bold">{t.label}</h2>
                  <p className="mt-2 flex-1 text-text-2">{t.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1 font-semibold text-accent">
                    Open tool <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
          <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2">
            {featureNav.map((f) => (
              <li key={f.slug}>
                <Link href={`/features/${f.slug}`} className="inline-flex rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-2 transition-colors hover:border-accent/40 hover:text-accent">
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
