import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody, PostCard, TableOfContents, formatPostDate } from "@/components/blog";
import { CtaBand } from "@/components/home/cta-band";
import { IconClock } from "@/components/icons";
import { JsonLd, abs, authorLd, breadcrumbLd } from "@/components/json-ld";
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
        ]}
      />
      <article>
        <header className="relative overflow-hidden border-b border-border">
          <div className="bg-grid absolute inset-0" aria-hidden="true" />
          <div className="glow -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 bg-accent/15" aria-hidden="true" />
          <Container className="relative max-w-3xl py-14 sm:py-20">
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
          </Container>
        </header>

        <Section className="pt-10 sm:pt-14">
          <Container className="max-w-3xl">
            <div className="mb-12"><TableOfContents post={post} /></div>
            <PostBody post={post} />
            <div className="mt-14 flex flex-wrap gap-2">
              {post.keywords.map((k) => <Badge key={k}>{k}</Badge>)}
            </div>
          </Container>
        </Section>
      </article>

      {related.length ? (
        <Section className="bg-surface-2">
          <Container>
            <h2 className="text-2xl font-extrabold tracking-tight">Keep reading</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {related.map((p) => <li key={p.slug} className="relative"><PostCard post={p} /></li>)}
            </ul>
          </Container>
        </Section>
      ) : null}
      <CtaBand />
    </>
  );
}
