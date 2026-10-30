import type { ComponentProps, ReactNode } from "react";
import { IconAlert, IconCheck, IconInfo, IconX } from "@/components/icons";
import { Backdrop } from "@/components/motion/backdrop";
import { stagger } from "@/components/motion/stagger";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  // A caller-supplied max-w-* replaces the default width (both classes would otherwise fight on CSS order).
  const width = /(^|\s)max-w-/.test(className) ? "" : "max-w-6xl";
  return <div className={`mx-auto w-full ${width} px-4 sm:px-6 lg:px-8 ${className}`} {...props} />;
}

export function Section({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`relative py-16 sm:py-24 lg:py-28 ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-2xl border border-hairline bg-surface p-5 shadow-[var(--shadow-hair)] sm:p-6 ${className}`} {...props} />;
}

type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "solid";
const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-text-2 ring-1 ring-border",
  accent: "bg-accent-soft text-accent-ink ring-1 ring-accent/15",
  ok: "bg-ok-soft text-ok ring-1 ring-ok/15",
  warn: "bg-warn-soft text-warn ring-1 ring-warn/15",
  solid: "bg-brand-deep text-white",
};
export function Badge({ tone = "neutral", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Hairline pill with a dot, or an optional mono index (e.g. "01") in place of the dot. */
export function Eyebrow({ children, tone = "accent", index }: { children: ReactNode; tone?: "accent" | "light"; index?: string }) {
  const light = tone === "light";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        light ? "bg-white/10 text-white ring-1 ring-white/20" : "bg-white/70 text-accent-ink shadow-[var(--shadow-hair)] ring-1 ring-accent/15"
      }`}
    >
      {index ? (
        <span className={`font-mono text-[11px] font-semibold tracking-normal tabular-nums ${light ? "text-white/70" : "text-muted"}`}>{index}</span>
      ) : (
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${light ? "bg-white" : "bg-accent"}`} />
      )}
      {children}
    </span>
  );
}

/**
 * Section intro. No reveal on the root: the eyebrow reveals (--i 0), the heading reveals with a
 * short de-blur at >= 640px (--i 1), the paragraph reveals (--i 2).
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  children,
  center = false,
  as: Tag = "h2",
  className = "",
}: {
  eyebrow?: string;
  /** Optional mono index shown inside the eyebrow pill (e.g. "01"). */
  index?: string;
  title: ReactNode;
  children?: ReactNode;
  center?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow ? (
        <div className="reveal" style={stagger(0)}>
          <Eyebrow index={index}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <Tag className="reveal-heading mt-4 text-section font-extrabold" style={stagger(1)}>
        {title}
      </Tag>
      {children ? (
        <p className="reveal mt-4 text-lg leading-relaxed text-text-2" style={stagger(2)}>
          {children}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Top-of-page hero used by inner pages. Eyebrow, h1, copy and actions "settle" (translate +
 * a short de-blur) and never fade, so the h1 is visible at first paint (LCP).
 * With `aside`: two columns at lg (text left, aside right); the aside is hidden below lg.
 */
export function PageHero({
  eyebrow,
  title,
  children,
  actions,
  aside,
  align = "center",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  align?: "center" | "left";
}) {
  const left = align === "left" || !!aside;
  const text = (
    <div className={left ? "max-w-2xl" : "mx-auto max-w-3xl text-center"}>
      {eyebrow ? (
        <div className="hero-settle" style={stagger(0)}>
          {typeof eyebrow === "string" ? <Eyebrow>{eyebrow}</Eyebrow> : eyebrow}
        </div>
      ) : null}
      <h1 className={`hero-settle mt-5 text-page font-extrabold ${left ? "" : "mx-auto"}`} style={stagger(1)}>
        {title}
      </h1>
      {children ? (
        <div className={`hero-settle mt-6 max-w-2xl text-lg leading-relaxed text-text-2 ${left ? "" : "mx-auto"}`} style={stagger(2)}>
          {children}
        </div>
      ) : null}
      {actions ? (
        <div className={`hero-settle mt-8 flex flex-col gap-3 sm:flex-row ${left ? "" : "justify-center"}`} style={stagger(3)}>
          {actions}
        </div>
      ) : null}
    </div>
  );
  return (
    <section className="relative overflow-clip border-b border-hairline">
      <Backdrop variant="page" />
      <Container className="relative py-16 sm:py-24">
        {aside ? (
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            {text}
            <div className="hidden lg:block">{aside}</div>
          </div>
        ) : (
          text
        )}
      </Container>
    </section>
  );
}

/** Kept for app pages. */
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent-ink">{eyebrow}</p> : null}
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

/** Glass icon tile (white-to-tint, hairline ring, top highlight); the icon lifts 1px on group hover. */
export function IconBubble({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#fff,var(--tint))] text-accent-ink shadow-[inset_0_1px_0_#fff,var(--shadow-hair)] ring-1 ring-hairline-strong ${className}`}
    >
      <span className="inline-flex group-hover:-translate-y-px motion-ok:transition-[translate] motion-ok:duration-300 motion-ok:ease-glide">{children}</span>
    </span>
  );
}
