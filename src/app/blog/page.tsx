import { PostCard } from "@/components/blog";
import { CtaBand } from "@/components/home/cta-band";
import { JsonLd, abs, authorLd, breadcrumbLd } from "@/components/json-ld";
import { Container, PageHero, Section } from "@/components/ui/primitives";
import { latestFirst, type Post } from "@/content/posts";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Twitter (X) Growth Blog: Guides & Tips",
  description: "Practical guides to grow on X (Twitter): auto follow, scheduling tweets, best time to post, threads, analytics, replies and unfollowers, from the GrowX team.",
  path: "/blog",
  keywords: ["Twitter growth blog", "X growth guides", "how to grow on Twitter", "Twitter tips", "schedule tweets", "Twitter analytics guide"],
});

const ORDER: { cat: Post["category"]; label: string }[] = [
  { cat: "Guides", label: "Growth guides" },
  { cat: "Create", label: "Posting and threads" },
  { cat: "Engage", label: "Engagement and replies" },
  { cat: "Insights", label: "Analytics and followers" },
  { cat: "How it works", label: "How GrowX works" },
  { cat: "Features", label: "GrowX features" },
  { cat: "Roadmap", label: "What's new" },
];

export default function BlogIndexPage() {
  const posts = latestFirst();
  const groups = ORDER.map((o) => ({ cat: o.label, id: o.cat.toLowerCase().replace(/\s+/g, "-"), posts: posts.filter((p) => p.category === o.cat) })).filter((g) => g.posts.length);
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
            description: "Guides on growing on X (Twitter): auto follow, scheduling, threads, analytics, replies and cleanup.",
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
      <PageHero eyebrow="Blog" title={<>Learn to grow on X, <span className="text-gradient">one guide at a time</span>.</>}>
        <p>Practical, honest guides on growing an X (Twitter) account: who to follow, what and when to post, how to reply and how to read your numbers.</p>
      </PageHero>
      <Section>
        <Container>
          <nav aria-label="Blog categories" className="flex flex-wrap justify-center gap-2">
            {groups.map((g) => (
              <a key={g.cat} href={`#${g.id}`} className="rounded-full border border-border bg-surface-2 px-4 py-1.5 text-sm font-semibold text-text-2 transition-colors hover:border-accent/40 hover:text-accent">
                {g.cat} <span className="text-muted">({g.posts.length})</span>
              </a>
            ))}
          </nav>
          <div className="mt-14 space-y-16">
            {groups.map((g) => (
              <section key={g.cat} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-24">
                <h2 id={`${g.id}-h`} className="text-2xl font-extrabold tracking-tight sm:text-3xl">{g.cat}</h2>
                <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {g.posts.map((p) => (
                    <li key={p.slug} className="relative">
                      <PostCard post={p} headingLevel="h3" />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <p className="mt-14 text-center text-sm text-muted">
            Subscribe with the <a className="font-semibold text-accent hover:underline" href="/blog/feed.xml">RSS feed</a>.
          </p>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
