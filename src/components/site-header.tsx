"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { FeatureIcon } from "@/components/feature-icon";
import { Logo } from "@/components/logo";
import { IconArrowRight, IconChevronDown, IconTool } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { featureNav, toolNav } from "@/config/nav";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/tools", label: "Free tools" },
  { href: "/blog", label: "Blog" },
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
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Re-read on every render (route changes re-render the header).
  const signedIn = useSyncExternalStore(noopSubscribe, hasSessionCookie, () => false);
  const panelId = useId();
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open && !menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setMenu(false);
    };
    const onClick = (e: MouseEvent) => {
      if (menu && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, menu]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeAll = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) {
      setOpen(false);
      setMenu(false);
    }
  };
  const navLink = (on: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${on ? "text-accent" : "text-text-2 hover:bg-surface-2 hover:text-text"}`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "border-b border-border bg-white/85 backdrop-blur-xl" : "border-b border-transparent bg-white/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex" onClick={closeAll}>
          <div ref={menuRef} className="relative" onMouseLeave={() => setMenu(false)}>
            <button
              type="button"
              aria-expanded={menu}
              aria-controls={menuId}
              onClick={() => setMenu((v) => !v)}
              onMouseEnter={() => setMenu(true)}
              className={`${navLink(isActive("/features"))} inline-flex items-center gap-1`}
            >
              Features <IconChevronDown size={15} className={`transition-transform duration-200 ${menu ? "rotate-180" : ""}`} />
            </button>
            <div id={menuId} hidden={!menu} className="absolute left-1/2 top-full w-[40rem] -translate-x-1/2 pt-3">
              <div className="animate-fade-in overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-lift)]">
                <ul className="grid grid-cols-2 gap-1 p-3">
                  {featureNav.map((f) => (
                    <li key={f.slug}>
                      <Link
                        href={`/features/${f.slug}`}
                        aria-current={pathname === `/features/${f.slug}` ? "page" : undefined}
                        className="group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-tint"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                          <FeatureIcon name={f.icon} size={19} />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-text">{f.label}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted">{f.blurb}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/features" className="group flex h-full items-center gap-3 rounded-2xl bg-surface-2 p-3 transition-colors hover:bg-tint">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
                        <IconArrowRight size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-text">All features</span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted">Everything in GrowX, Free vs Premium</span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={navLink(isActive(l.href))}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
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
          data-menu-toggle
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white lg:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className="relative block h-3.5 w-5">
            <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-text transition-all duration-300 ${open ? "top-1.5 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-text transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-text transition-all duration-300 ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      <div id={panelId} hidden={!open} className="animate-fade-in max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-white px-4 pb-6 pt-4 lg:hidden">
        <nav aria-label="Mobile" onClick={closeAll}>
          <p className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">Features</p>
          <ul className="mt-2 grid gap-1">
            {featureNav.map((f) => (
              <li key={f.slug}>
                <Link href={`/features/${f.slug}`} className="flex items-center gap-3 rounded-2xl px-1 py-2.5 font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <FeatureIcon name={f.icon} size={18} />
                  </span>
                  {f.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/features" className="flex items-center gap-3 rounded-2xl px-1 py-2.5 font-semibold text-accent">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
                  <IconArrowRight size={17} />
                </span>
                All features
              </Link>
            </li>
          </ul>
          <ul className="mt-4 border-t border-border pt-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="flex items-center justify-between border-b border-border py-3.5 text-lg font-semibold aria-[current=page]:text-accent"
                >
                  {l.label}
                  <IconChevronDown size={18} className="-rotate-90 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-3 grid gap-1">
            {toolNav.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="flex items-center gap-2 py-1.5 text-sm font-medium text-text-2">
                  <IconTool size={15} className="text-accent" /> {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-5 grid gap-3" onClick={closeAll}>
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
