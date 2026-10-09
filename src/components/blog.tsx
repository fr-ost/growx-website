import Link from "next/link";
import { IconArrowRight, IconClock, IconInfo } from "@/components/icons";
import { RichText } from "@/components/rich-text";
import { Badge } from "@/components/ui/primitives";
import type { Block, Post } from "@/content/posts";

export const formatPostDate = (iso: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="reveal card-hover group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <Badge tone="accent">{post.category}</Badge>
        <span className="flex items-center gap-1 text-xs text-muted">
          <IconClock size={13} /> {post.readMinutes} min read
        </span>
      </div>
      <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 hover:text-accent">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-2">{post.excerpt}</p>
      <div className="mt-5 flex items-center justify-between text-sm">
        <time dateTime={post.datePublished} className="text-muted">{formatPostDate(post.datePublished)}</time>
        <span className="inline-flex items-center gap-1 font-semibold text-accent">
          Read <IconArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
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
        <aside className="flex gap-3 rounded-xl border border-warn/25 bg-warn-soft px-4 py-3 text-sm text-warn">
          <IconInfo size={18} className="mt-0.5 shrink-0" />
          <p><RichText text={block.text} /></p>
        </aside>
      );
  }
}

export function PostBody({ post }: { post: Post }) {
  return (
    <div className="space-y-12">
      {post.sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-28">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{s.heading}</h2>
          <div className="mt-4 space-y-4 text-[1.05rem] leading-8 text-text-2">
            {s.blocks.map((b, i) => <BlockView key={i} block={b} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

export function TableOfContents({ post }: { post: Post }) {
  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-border bg-surface-2 p-5">
      <p className="text-sm font-bold">In this article</p>
      <ol className="mt-3 space-y-2 text-sm">
        {post.sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="text-text-2 transition-colors hover:text-accent">{s.heading}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
