import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";
const variants: Record<Variant, string> = {
  primary: "btn-shine bg-accent text-accent-contrast shadow-[var(--shadow-red)] hover:bg-accent-hover hover:-translate-y-0.5",
  secondary: "border border-border-strong bg-white text-text shadow-sm hover:border-text/30 hover:-translate-y-0.5 hover:shadow-md",
  ghost: "text-text-2 hover:bg-surface-2 hover:text-text",
  white: "btn-shine bg-white text-accent shadow-lg hover:-translate-y-0.5",
};
const sizes: Record<Size, string> = { sm: "h-9 px-3.5 text-sm", md: "h-11 px-5 text-sm", lg: "h-13 px-7 text-base" };

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
