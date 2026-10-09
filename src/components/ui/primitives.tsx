import type { ComponentProps, ReactNode } from "react";
import { IconAlert, IconCheck, IconInfo, IconX } from "@/components/icons";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`} {...props} />;
}

export function Section({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`relative py-16 sm:py-24 ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6 ${className}`} {...props} />;
}

type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "solid";
const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-text-2 ring-1 ring-border",
  accent: "bg-accent-soft text-accent ring-1 ring-accent/15",
  ok: "bg-ok-soft text-ok ring-1 ring-ok/15",
  warn: "bg-warn-soft text-warn ring-1 ring-warn/15",
  solid: "bg-accent text-white",
};
export function Badge({ tone = "neutral", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`reveal max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{title}</h2>
      {children ? <p className="mt-4 text-lg leading-relaxed text-text-2">{children}</p> : null}
    </div>
  );
}

/** Top-of-page hero used by inner pages. */
export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div className="glow -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 bg-accent/15" aria-hidden="true" />
      <Container className="relative py-16 text-center sm:py-20">
        <div className="animate-fade-up">{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}</div>
        <h1 className="animate-fade-up mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight [animation-delay:80ms] sm:text-5xl">{title}</h1>
        {children ? (
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-2 [animation-delay:160ms]">{children}</p>
        ) : null}
      </Container>
    </section>
  );
}

/** Kept for app pages. */
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</p> : null}
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      {children ? <p className="mt-3 text-lg text-text-2">{children}</p> : null}
    </div>
  );
}

type NoticeTone = "info" | "success" | "error" | "warn";
const noticeTones: Record<NoticeTone, string> = {
  info: "border-border bg-surface-2 text-text-2",
  success: "border-ok/25 bg-ok-soft text-ok",
  error: "border-danger/25 bg-danger-soft text-danger",
  warn: "border-warn/25 bg-warn-soft text-warn",
};
const noticeIcons = { info: IconInfo, success: IconCheck, error: IconX, warn: IconAlert };

export function Notice({ tone = "info", title, children }: { tone?: NoticeTone; title?: string; children: ReactNode }) {
  const Icon = noticeIcons[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`animate-fade-in flex gap-3 rounded-xl border px-4 py-3 text-sm ${noticeTones[tone]}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function DraftBanner({ children }: { children: ReactNode }) {
  return (
    <Notice tone="warn" title="Draft - requires legal review before public launch">
      {children}
    </Notice>
  );
}

export function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <IconCheck className={className} />;
}

export function IconBubble({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/10 ${className}`}>
      {children}
    </span>
  );
}
