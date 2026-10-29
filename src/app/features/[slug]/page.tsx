import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog";
import { FeatureIcon } from "@/components/feature-icon";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight, IconCheck, IconChrome, IconStar } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd, softwareLd } from "@/components/json-ld";
import { Screenshot } from "@/components/marketing/screenshot";
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
  const posts = page.relatedPosts.map((s) => getPost(s)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 3);
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
      <section className="bg-hero relative overflow-hidden border-b border-border">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />
        <Container className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <nav aria-label="Breadcrumb" className="animate-fade-up text-sm text-muted">
              <Link href="/features" className="hover:text-accent">Features</Link> <span aria-hidden="true">/</span> {page.nav}
            </nav>
            <div className="animate-fade-up mt-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white shadow-[var(--shadow-red)]">
                <FeatureIcon name={page.icon} size={22} />
              </span>
              <Eyebrow>{page.eyebrow}</Eyebrow>
            </div>
            <h1 className="animate-fade-up mt-5 text-[2.4rem] font-extrabold leading-[1.05] tracking-tight [animation-delay:80ms] sm:text-5xl lg:text-[3.4rem]">{page.h1}</h1>
            <p className="animate-fade-up mt-5 max-w-xl text-lg leading-relaxed text-text-2 [animation-delay:160ms]">
              <RichText text={page.lead} />
            </p>
            <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
              {site.chromeStoreUrl ? (
                <ExternalButton href={site.chromeStoreUrl} size="lg">
                  <IconChrome size={20} /> Add to Chrome, free
                </ExternalButton>
              ) : null}
              <LinkButton href="/signup" variant="secondary" size="lg">
                Try Premium free for {TRIAL_DAYS} days
              </LinkButton>
            </div>
          </div>
          <div className="animate-fade-up [animation-delay:200ms]">
            <Screenshot src={page.image.src} alt={page.image.alt} priority />
            <p className="mt-3 text-center text-xs text-muted">Screenshot shows demo data.</p>
          </div>
        </Container>
      </section>

      {/* HIGHLIGHTS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="What you get" title={`${page.nav}, done right.`} center />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.highlights.map((h) => (
              <li key={h.title} className="reveal rounded-3xl border border-border bg-white p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
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
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* STEPS */}
      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="How it works" title="Three steps." center />
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {page.steps.map((s, i) => (
              <li key={s.title} className="reveal rounded-3xl border border-border bg-white p-7">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm font-extrabold text-white">{i + 1}</span>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-text-2">
                  <RichText text={s.text} />
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* DEEP DIVE */}
      <Section>
        <Container className="max-w-3xl">
          <div className="space-y-14">
            {page.sections.map((s) => (
              <section key={s.heading} className="reveal">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{s.heading}</h2>
                <div className="mt-4 space-y-4 text-[1.05rem] leading-8 text-text-2">
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

      {/* PLANS */}
      <Section className="bg-surface-2">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="Plans" title="What's free, what's Premium" center>
            Every Premium feature is included in the free {TRIAL_DAYS}-day trial. No credit card.
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="reveal rounded-3xl border border-border bg-white p-7">
              <h3 className="flex items-center justify-between text-lg font-bold">
                Free <Badge tone="ok">$0 forever</Badge>
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-text-2">
                {page.plans.free.map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconCheck size={18} className="shrink-0 text-ok" /> <span><RichText text={t} /></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal rounded-3xl border-2 border-accent bg-white p-7">
              <h3 className="flex items-center justify-between text-lg font-bold">
                Premium <Badge tone="solid">from $1.99</Badge>
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-text-2">
                {page.plans.premium.map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconStar size={18} className="shrink-0 text-accent" /> <span><RichText text={t} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <LinkButton href="/pricing" variant="secondary">
              See all plans <IconArrowRight size={16} />
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <SectionHeading eyebrow="FAQ" title={`${page.nav}: your questions`} />
          <div className="reveal">
            <Faq items={page.faq} />
          </div>
        </Container>
      </Section>

      {/* MORE */}
      <Section className="bg-surface-2">
        <Container>
          {related.length ? (
            <>
              <h2 className="text-2xl font-extrabold tracking-tight">More from GrowX</h2>
              <ul className="mt-6 grid gap-4 md:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/features/${r.slug}`} className="card-hover group flex h-full items-start gap-3 rounded-3xl border border-border bg-white p-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                        <FeatureIcon name={r.icon} size={19} />
                      </span>
                      <span>
                        <span className="block font-bold group-hover:text-accent">{r.nav}</span>
                        <span className="mt-0.5 block text-sm leading-snug text-muted">{r.blurb}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {posts.length ? (
            <>
              <h2 className="mt-14 text-2xl font-extrabold tracking-tight">Related guides</h2>
              <ul className="mt-6 grid gap-6 md:grid-cols-3">
                {posts.map((p) => (
                  <li key={p.slug} className="relative">
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
