import Link from "next/link";
import { PostCover } from "@/components/blog/post-cover";
import { IconArrowRight, IconClock, IconInfo } from "@/components/icons";
import { ScrollSpy } from "@/components/motion/scroll-spy";
import { RichText } from "@/components/rich-text";
import { Badge } from "@/components/ui/primitives";
import type { Block, Post } from "@/content/posts";

export const formatPostDate = (iso: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/**
 * Post teaser used on home, feature pages and the blog. Scroll reveal + 2px hover lift,
 * a cursor spotlight (fine pointers) and a seeded category cover whose two layers part on hover.
 * The whole card is clickable through the title's stretched link.
 */
export function PostCard({ post, headingLevel = "h2" }: { post: Post; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article
      data-spotlight=""
      className="reveal lift group relative flex h-full flex-col overflow-clip rounded-3xl border border-hairline bg-white p-6 shadow-hair"
    >
      <PostCover slug={post.slug} category={post.category} className="-mx-6 -mt-6 mb-5 aspect-[16/7] border-b border-hairline" />
      <div className="flex items-center gap-3">
        <Badge tone="accent">{post.category}</Badge>
        <span className="flex items-center gap-1 text-xs tabular-nums text-muted">
          <IconClock size={13} /> {post.readMinutes} min read
        </span>
      </div>
      <H className="mt-4 text-balance text-xl font-bold leading-snug tracking-tight">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent-ink">
          {post.title}
        </Link>
      </H>
      <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-text-2">{post.excerpt}</p>
      <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 text-sm">
        <time dateTime={post.datePublished} className="tabular-nums text-muted">{formatPostDate(post.datePublished)}</time>
        <span className="inline-flex items-center gap-1 font-semibold text-accent-ink">
          Read <IconArrowRight size={15} className="nudge" />
        </span>
      </div>
    </article>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p><RichText text={block.text} /></p>;
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-6 marker:text-accent">
          {block.items.map((t) => <li key={t}><RichText text={t} /></li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-accent">
          {block.items.map((t) => <li key={t}><RichText text={t} /></li>)}
        </ol>
      );
    case "note":
      return (
        <aside className="flex gap-3 rounded-r-xl border-l-[3px] border-warn/50 bg-warn-soft px-4 py-3 text-sm text-warn">
          <IconInfo size={18} className="mt-0.5 shrink-0" />
          <p><RichText text={block.text} /></p>
        </aside>
      );
  }
}

/**
 * The article body. Static by design: long-form copy never animates. The wrapper opts the
 * header progress bar into reading progress; only the h2 accent bar draws with scroll.
 */
export function PostBody({ post }: { post: Post }) {
  return (
    <div data-progress-article="" className="space-y-12">
      {post.sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-28">
          <h2 className="h-rule text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">{s.heading}</h2>
          <div className="mt-4 space-y-4 text-pretty text-[1.05rem] leading-8 text-text-2">
            {s.blocks.map((b, i) => <BlockView key={i} block={b} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * In-article navigation. ScrollSpy marks the section being read with aria-current="location":
 * the link turns accent-ink and semibold, and a 2px indicator scales in on the rail.
 */
export function TableOfContents({ post, id }: { post: Post; id: string }) {
  return (
    <>
      <nav id={id} aria-label="Table of contents" className="rounded-3xl border border-hairline bg-white p-5 shadow-hair">
        <p className="text-sm font-bold">In this article</p>
        <ol className="mt-3 space-y-0.5 border-l border-hairline text-sm">
          {post.sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="relative -ml-px flex gap-2.5 rounded-r-lg py-1.5 pl-4 pr-1 text-text-2 before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:rounded-full before:bg-accent hover:text-text aria-[current=location]:font-semibold aria-[current=location]:text-accent-ink aria-[current=location]:before:scale-y-100 motion-ok:before:transition-[scale] motion-ok:before:duration-[var(--dur-2)] motion-ok:before:ease-glide"
              >
                <span aria-hidden="true" className="mt-px shrink-0 font-mono text-[11px] tabular-nums text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s.heading}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <ScrollSpy navId={id} current="location" />
    </>
  );
}
