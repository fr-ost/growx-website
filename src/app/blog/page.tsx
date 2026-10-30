import Link from "next/link";
import { PostCard, formatPostDate } from "@/components/blog";
import { PostCover } from "@/components/blog/post-cover";
import { CtaBand } from "@/components/home/cta-band";
import { IconArrowRight, IconClock } from "@/components/icons";
import { JsonLd, abs, authorLd, breadcrumbLd } from "@/components/json-ld";
import { ScrollSpy } from "@/components/motion/scroll-spy";
import { stagger } from "@/components/motion/stagger";
import { Badge, Container, PageHero, Section } from "@/components/ui/primitives";
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

/** The newest post as a wide card: cover left at lg, copy right. Whole card links via the title. */
function FeaturedPost({ post }: { post: Post }) {
  return (
    <article
      data-spotlight=""
      className="reveal lift group relative grid overflow-clip rounded-3xl border border-hairline bg-white shadow-hair lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
    >
      <PostCover slug={post.slug} category={post.category} className="aspect-[16/7] border-b border-hairline lg:aspect-auto lg:min-h-80 lg:border-b-0 lg:border-r" />
      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-3">
          <Badge tone="accent">{post.category}</Badge>
          <span className="flex items-center gap-1 text-xs tabular-nums text-muted">
            <IconClock size={13} /> {post.readMinutes} min read
          </span>
        </div>
        <h3 className="mt-5 text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent-ink">
            {post.title}
          </Link>
        </h3>
        <p className="mt-4 flex-1 text-pretty leading-relaxed text-text-2">{post.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5 text-sm">
          <time dateTime={post.datePublished} className="tabular-nums text-muted">{formatPostDate(post.datePublished)}</time>
          <span className="inline-flex items-center gap-1.5 font-semibold text-accent-ink">
            Read the guide <IconArrowRight size={16} className="nudge" />
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BlogIndexPage() {
  const posts = latestFirst();
  const groups = ORDER.map((o) => ({ cat: o.label, id: o.cat.toLowerCase().replace(/\s+/g, "-"), posts: posts.filter((p) => p.category === o.cat) })).filter((g) => g.posts.length);
  const latest = posts[0];
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
      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container>
          {/* Sticky chip bar. Glass without backdrop-filter; scrolls sideways inside itself on small screens. */}
          <nav
            id="blog-categories"
            aria-label="Blog categories"
            className="sticky top-16 z-30 -mx-1 overflow-x-auto rounded-2xl border border-hairline bg-white/[0.94] shadow-hair [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ul className="mx-auto flex w-max min-w-full justify-center gap-1.5 p-1.5">
              {groups.map((g) => (
                <li key={g.cat} className="shrink-0">
                  <a
                    href={`#${g.id}`}
                    className="group/chip flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold text-text-2 hover:bg-surface-2 hover:text-text aria-[current=true]:bg-ink aria-[current=true]:text-white"
                  >
                    {g.cat} <span className="tabular-nums text-muted group-aria-[current=true]/chip:text-white/70">({g.posts.length})</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ScrollSpy navId="blog-categories" />

          {latest ? (
            <section id="latest" aria-labelledby="latest-h" className="mt-14 scroll-mt-36">
              <h2 id="latest-h" className="reveal-heading h-rule text-2xl font-extrabold tracking-tight sm:text-3xl">Latest guide</h2>
              <div className="mt-6">
                <FeaturedPost post={latest} />
              </div>
            </section>
          ) : null}

          <div className="mt-20 space-y-20">
            {groups.map((g) => (
              <section key={g.cat} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-36">
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  <h2 id={`${g.id}-h`} className="reveal-heading h-rule text-2xl font-extrabold tracking-tight sm:text-3xl">{g.cat}</h2>
                  <p className="reveal text-sm tabular-nums text-muted" style={stagger(1)}>
                    {g.posts.length} {g.posts.length === 1 ? "article" : "articles"}
                  </p>
                </div>
                <ul data-spotlight-group="" className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {g.posts.map((p, i) => (
                    <li key={p.slug} className="relative" style={stagger(i % 3)}>
                      <PostCard post={p} headingLevel="h3" />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <p className="mt-16 text-center text-sm text-muted">
            Subscribe with the <a className="font-semibold text-accent-ink underline decoration-accent-ink/40 underline-offset-4 hover:decoration-accent-ink" href="/blog/feed.xml">RSS feed</a>.
          </p>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
