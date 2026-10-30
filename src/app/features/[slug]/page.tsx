import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog";
import { FeatureIcon } from "@/components/feature-icon";
import { FeatureLinkCard } from "@/components/features/feature-card";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight, IconCheck, IconChrome, IconStar } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd, softwareLd } from "@/components/json-ld";
import { Screenshot } from "@/components/marketing/screenshot";
import { Backdrop } from "@/components/motion/backdrop";
import { BorderBeam } from "@/components/motion/border-beam";
import { demoForFeature } from "@/components/motion/demos/demo-map";
import { Stage3D } from "@/components/motion/stage";
import { StepRail } from "@/components/motion/step-rail";
import { stagger } from "@/components/motion/stagger";
import { RichText } from "@/components/rich-text";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Badge, Container, Eyebrow, Section, SectionHeading } from "@/components/ui/primitives";
import { TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";
import { featurePages, getFeaturePage } from "@/content/feature-pages";
import { getPost } from "@/content/posts";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return featurePages.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getFeaturePage((await params).slug);
  if (!page) return {};
  return pageMetadata({ title: page.seoTitle, description: page.description, path: `/features/${page.slug}`, keywords: page.keywords });
}

export default async function FeatureLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const page = getFeaturePage((await params).slug);
  if (!page) notFound();
  const posts = page.relatedPosts.map((s) => getPost(s)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 6);
  const related = page.related.map((s) => getFeaturePage(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const path = `/features/${page.slug}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: page.nav, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${abs(path)}#webpage`,
            name: page.h1,
            description: page.description,
            url: abs(path),
            about: { "@id": `${site.url}/#software` },
            primaryImageOfPage: abs(page.image.src),
          },
          { ...softwareLd, "@id": `${abs(path)}#software` },
          faqLd(page.faq),
        ]}
      />

      {/* HERO */}
      <section className="relative overflow-clip border-b border-hairline">
        <Backdrop variant="page" beams={1} />
        <Container className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="hero-settle text-sm text-muted" style={stagger(0)}>
              <Link href="/features" className="link-draw hover:text-text">Features</Link> <span aria-hidden="true">/</span> {page.nav}
            </nav>
            <div className="hero-settle mt-5 flex items-center gap-3" style={stagger(1)}>
              <span className="bg-brand-deep flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-red)]">
                <FeatureIcon name={page.icon} size={22} />
              </span>
              <Eyebrow>{page.eyebrow}</Eyebrow>
            </div>
            <h1 className="hero-settle mt-5 text-page font-extrabold [text-wrap:balance] lg:text-[3.4rem]" style={stagger(2)}>
              {page.h1}
            </h1>
            <p className="hero-settle mt-5 max-w-xl text-lg leading-relaxed text-text-2 [text-wrap:pretty]" style={stagger(3)}>
              <RichText text={page.lead} />
            </p>
            <div className="hero-settle mt-8 flex flex-col gap-3 sm:flex-row" style={stagger(4)}>
              {site.chromeStoreUrl ? (
                <ExternalButton href={site.chromeStoreUrl} size="lg" data-magnetic="6">
                  <IconChrome size={20} /> Add to Chrome, free
                </ExternalButton>
              ) : null}
              <LinkButton href="/signup" variant="secondary" size="lg">
                Try Premium free for {TRIAL_DAYS} days
              </LinkButton>
            </div>
          </div>
          <div className="min-w-0">
            <Stage3D
              variant="side"
              className="lg:pb-10"
              caption={<span className="block lg:text-right">Screenshot shows demo data.</span>}
            >
              <Screenshot src={page.image.src} alt={page.image.alt} priority sizes="(min-width: 1024px) 600px, 100vw" />
              <div className="absolute -bottom-8 -left-6 z-10 hidden w-[19rem] lg:block">{demoForFeature(page.slug, { size: "sm" })}</div>
            </Stage3D>
            <div className="mx-auto mt-8 max-w-sm lg:hidden">{demoForFeature(page.slug, { size: "sm" })}</div>
          </div>
        </Container>
      </section>

      {/* HIGHLIGHTS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="What you get" title={`${page.nav}, done right.`} center />
          <ul data-spotlight-group="" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.highlights.map((h, i) => (
              <li key={h.title} className="reveal" style={stagger(i % 3)}>
                <div data-spotlight="" className="lift h-full rounded-3xl border border-hairline bg-white p-6 shadow-[var(--shadow-hair)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink ring-1 ring-accent/10">
                      <IconCheck size={18} />
                    </span>
                    {h.premium ? (
                      <Badge tone="accent">
                        <IconStar size={12} /> Premium
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-2">
                    <RichText text={h.text} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* STEPS */}
      <Section className="border-y border-hairline bg-surface-2">
        <Container>
          <SectionHeading eyebrow="How it works" title="Three steps." center />
          <StepRail
            orientation="responsive"
            className="mx-auto mt-14 max-w-5xl"
            steps={page.steps.map((s, i) => ({
              key: s.title,
              marker: i + 1,
              content: (
                <div className="reveal md:pr-6">
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-text-2 [text-wrap:pretty]">
                    <RichText text={s.text} />
                  </p>
                </div>
              ),
            }))}
          />
        </Container>
      </Section>

      {/* DEEP DIVE (long-form copy: static) */}
      <Section>
        <Container className="max-w-[68ch]">
          <div className="space-y-14">
            {page.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="h-rule text-2xl font-extrabold tracking-tight [text-wrap:balance] sm:text-3xl">{s.heading}</h2>
                <div className="mt-4 space-y-4 text-[1.05rem] leading-8 text-text-2 [text-wrap:pretty]">
                  {s.paragraphs.map((p) => (
                    <p key={p}>
                      <RichText text={p} />
                    </p>
                  ))}
                  {s.bullets?.length ? (
                    <ul className="list-disc space-y-2 pl-6 marker:text-accent">
                      {s.bullets.map((b) => (
                        <li key={b}>
                          <RichText text={b} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>

      {/* PLANS (prices never move: only the bullet lists reveal) */}
      <Section className="border-y border-hairline bg-surface-2">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="Plans" title="What's free, what's Premium" center>
            Every Premium feature is included in the free {TRIAL_DAYS}-day trial. No credit card.
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="lift h-full rounded-3xl border border-hairline bg-white p-7 shadow-[var(--shadow-hair)]">
              <h3 className="flex items-center justify-between text-lg font-bold">
                Free <Badge tone="ok">$0 forever</Badge>
              </h3>
              <ul className="reveal mt-5 space-y-3 text-sm text-text-2" style={stagger(0)}>
                {page.plans.free.map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconCheck size={18} className="shrink-0 text-ok" /> <span><RichText text={t} /></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div aria-hidden="true" data-decor="" className="glow-soft -bottom-8 left-[12%] right-[12%] h-20 [--glow:rgba(225,29,46,0.22)]" />
              <div className="relative h-full rounded-3xl border border-accent/25 bg-white p-7 shadow-[var(--shadow-float)]">
                <BorderBeam mode="scroll" />
                <h3 className="flex items-center justify-between text-lg font-bold">
                  Premium <Badge tone="solid">from $1.99</Badge>
                </h3>
                <ul className="reveal mt-5 space-y-3 text-sm text-text-2" style={stagger(1)}>
                  {page.plans.premium.map((t) => (
                    <li key={t} className="flex gap-2">
                      <IconStar size={18} className="shrink-0 text-accent" /> <span><RichText text={t} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 text-center">
            <LinkButton href="/pricing" variant="secondary">
              See all plans <IconArrowRight size={16} className="nudge" />
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="FAQ" title={`${page.nav}: your questions`} />
          </div>
          <div className="reveal">
            <Faq items={page.faq} />
          </div>
        </Container>
      </Section>

      {/* MORE */}
      <Section className="border-t border-hairline bg-surface-2">
        <Container>
          {related.length ? (
            <>
              <h2 className="reveal-heading text-2xl font-extrabold tracking-tight">More from GrowX</h2>
              <ul data-spotlight-group="" className="mt-6 grid gap-4 md:grid-cols-3">
                {related.map((r, i) => (
                  <li key={r.slug} className="reveal" style={stagger(i % 3)}>
                    <FeatureLinkCard href={`/features/${r.slug}`} icon={r.icon} label={r.nav} blurb={r.blurb} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {posts.length ? (
            <>
              <h2 className="reveal-heading mt-14 text-2xl font-extrabold tracking-tight">Related guides</h2>
              <ul data-spotlight-group="" className="mt-6 grid gap-6 md:grid-cols-3">
                {posts.map((p, i) => (
                  <li key={p.slug} className="relative" style={stagger(i % 3)}>
                    <PostCard post={p} headingLevel="h3" />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
