import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

/** Tiny inline formatter for authored content: **bold**, `code`, [label](href). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {parts.map((part, i): ReactNode => {
        if (part.startsWith("**")) return <strong key={i} className="font-semibold text-text">{part.slice(2, -2)}</strong>;
        if (part.startsWith("`")) return <code key={i} className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.9em] ring-1 ring-border">{part.slice(1, -1)}</code>;
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) {
          const [, label, href] = m;
          const cls = "font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent";
          return href.startsWith("/") ? (
            <Link key={i} href={href} className={cls}>{label}</Link>
          ) : (
            <a key={i} href={href} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
