import { PostCard } from "@/components/blog";
import { CtaBand } from "@/components/home/cta-band";
import { JsonLd, abs, authorLd, breadcrumbLd } from "@/components/json-ld";
import { Container, PageHero, Section } from "@/components/ui/primitives";
import { latestFirst } from "@/content/posts";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "X (Twitter) Growth & Auto Follow Guides",
  description: "Guides on how X auto follow works, follow-back scoring, targeting filters, cleanup tools and the GrowX roadmap, from the developer.",
  path: "/blog",
  keywords: ["X growth blog", "Twitter growth guides", "auto follow guide", "how to grow on X"],
});

export default function BlogIndexPage() {
  const posts = latestFirst();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": abs("/blog"),
            name: "GrowX Blog",
            description: "Guides on X (Twitter) growth, auto follow, targeting and cleanup.",
            url: abs("/blog"),
            inLanguage: "en",
            publisher: { "@id": `${site.url}/#organization` },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: abs(`/blog/${p.slug}`),
              datePublished: p.datePublished,
              dateModified: p.dateModified,
              author: authorLd,
            })),
          },
        ]}
      />
      <PageHero eyebrow="Blog" title={<>Guides for growing on X <span className="text-gradient">the careful way</span>.</>}>
        Detailed write-ups on how GrowX works, what each feature does and where the project is heading.
      </PageHero>
      <Section>
        <Container>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug} className="relative">
                <PostCard post={p} />
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center text-sm text-muted">
            Subscribe with the <a className="font-semibold text-accent hover:underline" href="/blog/feed.xml">RSS feed</a>.
          </p>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
