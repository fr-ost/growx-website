import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody, PostCard, TableOfContents, formatPostDate } from "@/components/blog";
import { PostCover } from "@/components/blog/post-cover";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight, IconChrome, IconClock } from "@/components/icons";
import { JsonLd, abs, authorLd, breadcrumbLd, faqLd } from "@/components/json-ld";
import { Backdrop } from "@/components/motion/backdrop";
import { BorderBeam } from "@/components/motion/border-beam";
import { stagger } from "@/components/motion/stagger";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Badge, Container, Eyebrow, Section } from "@/components/ui/primitives";
import { getPost, posts } from "@/content/posts";
import { toolNav } from "@/config/nav";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return pageMetadata({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    type: "article",
    defaultImage: false,
    publishedTime: post.datePublished,
    modifiedTime: post.dateModified,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const related = post.related.map((s) => getPost(s)).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${abs(`/blog/${post.slug}`)}#article`,
            mainEntityOfPage: abs(`/blog/${post.slug}`),
            headline: post.title,
            description: post.description,
            keywords: post.keywords.join(", "),
            image: abs(`/blog/${post.slug}/opengraph-image`),
            datePublished: post.datePublished,
            dateModified: post.dateModified,
            inLanguage: "en",
            articleSection: post.category,
            author: authorLd,
            publisher: { "@id": `${site.url}/#organization` },
          },
          ...(post.faq?.length ? [faqLd(post.faq)] : []),
        ]}
      />
      <article>
        <header className="relative overflow-clip border-b border-hairline">
          <Backdrop variant="page" beams={0} />
          <Container className="relative grid max-w-6xl items-end py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            <div className="mx-auto w-full max-w-3xl">
              <nav aria-label="Breadcrumb" className="hero-settle mb-6 text-sm text-muted" style={stagger(0)}>
                <ol className="flex flex-wrap items-center gap-2">
                  <li><Link href="/" className="hover:text-accent-ink">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link href="/blog" className="hover:text-accent-ink">Blog</Link></li>
                </ol>
              </nav>
              <div className="hero-settle flex flex-wrap items-center gap-3" style={stagger(1)}>
                <Eyebrow>{post.category}</Eyebrow>
                <span className="flex items-center gap-1 text-sm tabular-nums text-muted"><IconClock size={14} /> {post.readMinutes} min read</span>
              </div>
              <h1 className="hero-settle mt-5 text-balance text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl" style={stagger(2)}>{post.title}</h1>
              <p className="hero-settle mt-5 text-pretty text-lg leading-relaxed text-text-2" style={stagger(3)}>{post.excerpt}</p>
              <p className="hero-settle mt-6 text-sm text-muted" style={stagger(4)}>
                By <Link href="/about" className="font-semibold text-text hover:text-accent-ink">{site.author}</Link> ·{" "}
                <time dateTime={post.datePublished}>{formatPostDate(post.datePublished)}</time>
                {post.dateModified !== post.datePublished ? <> · Updated <time dateTime={post.dateModified}>{formatPostDate(post.dateModified)}</time></> : null}
              </p>
            </div>
            <div className="hidden lg:block">
              <PostCover slug={post.slug} category={post.category} className="aspect-square rounded-3xl shadow-float ring-1 ring-hairline" />
            </div>
          </Container>
        </header>

        <Section className="pt-10 sm:pt-14">
          <Container className="grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-12 lg:hidden"><TableOfContents post={post} id="toc-mobile" /></div>
              <PostBody post={post} />
              {post.faq?.length ? (
                <section id="faq" className="mt-14 scroll-mt-28">
                  <h2 className="h-rule text-2xl font-extrabold tracking-tight sm:text-3xl">Frequently asked questions</h2>
                  <div className="mt-6"><Faq items={post.faq} /></div>
                </section>
              ) : null}
              <div className="mt-14 flex flex-wrap gap-2">
                {post.keywords.map((k) => <Badge key={k}>{k}</Badge>)}
              </div>
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-5">
                <TableOfContents post={post} id="toc" />
                <div data-spotlight="ink" className="on-ink relative rounded-3xl bg-ink p-5 text-white">
                  <BorderBeam mode="scroll" tone="white" />
                  <p className="font-display text-lg font-extrabold leading-snug">Grow on X with GrowX</p>
                  <p className="mt-2 text-sm text-white/70">Auto follow, scheduler, AI writer and analytics in one free Chrome extension.</p>
                  <div className="mt-4 grid gap-2">
                    {site.chromeStoreUrl ? (
                      <ExternalButton href={site.chromeStoreUrl} size="sm">
                        <IconChrome size={16} /> Add to Chrome
                      </ExternalButton>
                    ) : null}
                    <LinkButton href="/signup" variant="white" size="sm">Start free</LinkButton>
                  </div>
                </div>
                <nav aria-label="Free tools" className="rounded-3xl border border-hairline bg-white p-5 shadow-hair">
                  <p className="text-sm font-bold">Free X tools</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {toolNav.map((t) => (
                      <li key={t.href}>
                        <Link href={t.href} className="link-draw text-text-2 hover:text-accent-ink">{t.label}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          </Container>
        </Section>
      </article>

      {related.length ? (
        <Section className="bg-surface-2">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="reveal-heading h-rule text-2xl font-extrabold tracking-tight sm:text-3xl">Keep reading</h2>
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-accent-ink">
                All articles <IconArrowRight size={15} className="nudge" />
              </Link>
            </div>
            <ul data-spotlight-group="" className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p, i) => (
                <li key={p.slug} className="relative" style={stagger(i % 3)}>
                  <PostCard post={p} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
      <CtaBand />
    </>
  );
}
