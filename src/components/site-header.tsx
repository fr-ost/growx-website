"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/logo";
import { IconChevronDown } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Support" },
];

/**
 * UI hint only: Supabase SSR session cookies are readable by JS. This decides
 * whether to show "Dashboard" or "Log in"; it is never used for authorisation.
 */
const noopSubscribe = () => () => {};

function hasSessionCookie() {
  return /(?:^|;\s*)sb-[^=]+-auth-token(?:\.0)?=/.test(document.cookie);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Re-read on every render (route changes re-render the header).
  const signedIn = useSyncExternalStore(noopSubscribe, hasSessionCookie, () => false);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "border-b border-border bg-white/85 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl" : "border-b border-transparent bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full border border-border bg-white/70 p-1 shadow-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                isActive(l.href) ? "bg-accent text-white shadow-[var(--shadow-red)]" : "text-text-2 hover:bg-accent-soft hover:text-accent"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <LinkButton href="/dashboard" size="sm">
              Dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Log in
              </LinkButton>
              <LinkButton href="/signup" size="sm">
                Start free
              </LinkButton>
            </>
          )}
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white shadow-sm md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className="relative block h-3.5 w-5">
            <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-text transition-all duration-300 ${open ? "top-1.5 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-text transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-text transition-all duration-300 ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      <div
        id={panelId}
        hidden={!open}
        className="animate-fade-in border-t border-border bg-white px-4 pb-6 pt-2 md:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col" onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="flex items-center justify-between border-b border-border py-4 text-lg font-semibold aria-[current=page]:text-accent"
            >
              {l.label}
              <IconChevronDown size={18} className="-rotate-90 text-muted" />
            </Link>
          ))}
        </nav>
        <div className="mt-5 grid gap-3" onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
          {signedIn ? (
            <LinkButton href="/dashboard" size="lg">
              Go to dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/signup" size="lg">
                Start free
              </LinkButton>
              <LinkButton href="/login" variant="secondary" size="lg">
                Log in
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
