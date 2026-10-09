import type { ComponentProps, ReactNode } from "react";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`} {...props} />;
}

export function Section({
  className = "",
  ...props
}: ComponentProps<"section">) {
  return <section className={`py-14 sm:py-20 ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-2xl border border-border bg-surface p-5 sm:p-6 ${className}`} {...props} />;
}

type BadgeTone = "neutral" | "accent" | "ok" | "warn";
const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-text-2",
  accent: "bg-accent-soft text-accent",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
};
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p> : null}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {children ? <p className="mt-4 text-lg text-text-2">{children}</p> : null}
    </div>
  );
}

type NoticeTone = "info" | "success" | "error" | "warn";
const noticeTones: Record<NoticeTone, string> = {
  info: "border-border bg-surface-2 text-text-2",
  success: "border-ok/40 bg-ok-soft text-ok",
  error: "border-danger/40 bg-danger-soft text-danger",
  warn: "border-warn/40 bg-warn-soft text-warn",
};
export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${noticeTones[tone]}`}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}

export function DraftBanner({ children }: { children: ReactNode }) {
  return (
    <Notice tone="warn" title="Draft - not legal advice">
      {children}
    </Notice>
  );
}

export function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
