import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody, PostCard, TableOfContents, formatPostDate } from "@/components/blog";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconChrome, IconClock } from "@/components/icons";
import { JsonLd, abs, authorLd, breadcrumbLd, faqLd } from "@/components/json-ld";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Badge, Container, Eyebrow, Section } from "@/components/ui/primitives";
import { getPost, posts } from "@/content/posts";
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
        <header className="bg-hero relative overflow-hidden border-b border-border">
          <div className="bg-grid absolute inset-0" aria-hidden="true" />
          <Container className="relative grid max-w-6xl py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            <div className="mx-auto w-full max-w-3xl">
            <nav aria-label="Breadcrumb" className="animate-fade-up mb-6 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link href="/" className="hover:text-accent">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href="/blog" className="hover:text-accent">Blog</Link></li>
              </ol>
            </nav>
            <div className="animate-fade-up flex flex-wrap items-center gap-3">
              <Eyebrow>{post.category}</Eyebrow>
              <span className="flex items-center gap-1 text-sm text-muted"><IconClock size={14} /> {post.readMinutes} min read</span>
            </div>
            <h1 className="animate-fade-up mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight [animation-delay:80ms] sm:text-4xl lg:text-5xl">{post.title}</h1>
            <p className="animate-fade-up mt-5 text-lg leading-relaxed text-text-2 [animation-delay:160ms]">{post.excerpt}</p>
            <p className="animate-fade-up mt-6 text-sm text-muted [animation-delay:240ms]">
              By <Link href="/about" className="font-semibold text-text hover:text-accent">{site.author}</Link> ·{" "}
              <time dateTime={post.datePublished}>{formatPostDate(post.datePublished)}</time>
              {post.dateModified !== post.datePublished ? <> · Updated <time dateTime={post.dateModified}>{formatPostDate(post.dateModified)}</time></> : null}
            </p>
            </div>
          </Container>
        </header>

        <Section className="pt-10 sm:pt-14">
          <Container className="grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-12 lg:hidden"><TableOfContents post={post} /></div>
              <PostBody post={post} />
              {post.faq?.length ? (
                <section id="faq" className="mt-14 scroll-mt-28">
                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Frequently asked questions</h2>
                  <div className="mt-6"><Faq items={post.faq} /></div>
                </section>
              ) : null}
              <div className="mt-14 flex flex-wrap gap-2">
                {post.keywords.map((k) => <Badge key={k}>{k}</Badge>)}
              </div>
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-5">
                <TableOfContents post={post} />
                <div className="rounded-3xl bg-ink p-5 text-white">
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
              </div>
            </aside>
          </Container>
        </Section>
      </article>

      {related.length ? (
        <Section className="bg-surface-2">
          <Container>
            <h2 className="text-2xl font-extrabold tracking-tight">Keep reading</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => <li key={p.slug} className="relative"><PostCard post={p} headingLevel="h3" /></li>)}
            </ul>
          </Container>
        </Section>
      ) : null}
      <CtaBand />
    </>
  );
}
