import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "white" | "dark";
type Size = "sm" | "md" | "lg";

/**
 * Only translate/scale transition, so colour and shadow changes are instant (no transition-all).
 * Hover lifts 2px, press scales to .98, and the focus ring keeps the pill radius.
 * Magnetic pull (fine pointers only): add data-magnetic="6" (hero primary + CTA band primary only);
 * MotionRuntime writes a translate3d transform that composes with the translate/scale utilities.
 * Trailing arrow icons can take className="nudge" to slide 3px on hover.
 */
const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[translate,scale] duration-150 ease-glide active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";
const variants: Record<Variant, string> = {
  primary:
    "btn-shine bg-accent text-accent-contrast shadow-[inset_0_1px_0_rgba(255,255,255,0.22),var(--shadow-red)] hover:bg-accent-hover hover:-translate-y-0.5",
  secondary:
    "border border-hairline-strong bg-white bg-[linear-gradient(180deg,#fff,rgba(248,245,245,0.7))] text-text shadow-[var(--shadow-hair)] hover:border-text/30 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]",
  ghost: "text-text-2 hover:bg-surface-2 hover:text-text",
  white: "btn-shine bg-white text-accent-ink shadow-lg hover:-translate-y-0.5",
  dark: "bg-ink text-white shadow-[0_10px_24px_-12px_rgba(20,16,21,0.6)] hover:bg-ink-2 hover:-translate-y-0.5",
};
const sizes: Record<Size, string> = { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-sm", lg: "h-13 px-7 text-base" };

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

/** External link styled as a button (opens in a new tab safely). */
export function ExternalButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </a>
  );
}
