"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { FeatureIcon } from "@/components/feature-icon";
import { Logo } from "@/components/logo";
import { IconArrowRight, IconChevronDown, IconTool } from "@/components/icons";
import { GrowthLine } from "@/components/motion/growth-line";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { stagger } from "@/components/motion/stagger";
import { LinkButton } from "@/components/ui/button";
import { featureNav, toolNav } from "@/config/nav";
import { TRIAL_DAYS } from "@/config/pricing";

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

/** Desktop nav link: instant colour, a fine-pointer-only hover pill (opacity + scale), a static dot when active. */
const navLink = (on: boolean) =>
  `relative isolate rounded-full px-3.5 py-2 text-sm font-semibold before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-surface-2 before:opacity-0 before:scale-[.94] hover:before:scale-100 hover:before:opacity-100 fx:before:transition-[opacity,scale] fx:before:duration-150 fx:before:ease-glide ${
    on
      ? "text-accent-ink after:absolute after:bottom-0.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-accent"
      : "text-text-2 hover:text-text"
  }`;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const featuresBtnRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const focusFirst = useRef(false);
  const leaveTimer = useRef<number | undefined>(undefined);
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
      if (menu) {
        setMenu(false);
        featuresBtnRef.current?.focus();
      }
      if (open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
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

  // After a keyboard open, move focus into the menu once it is rendered (DOM only, no state).
  useEffect(() => {
    if (!menu || !focusFirst.current) return;
    focusFirst.current = false;
    menuPanelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [menu]);

  // Lock page scroll behind the mobile sheet (DOM only).
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const timer = leaveTimer;
    return () => window.clearTimeout(timer.current);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeAll = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) {
      setOpen(false);
      setMenu(false);
    }
  };
  const openWithFocus = () => {
    focusFirst.current = true;
    if (menu) menuPanelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    else setMenu(true);
  };
  const onButtonKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openWithFocus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (menu) setMenu(false);
      else openWithFocus();
    }
  };
  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuPanelRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    let next = -1;
    if (e.key === "ArrowDown") next = i < 0 ? 0 : (i + 1) % items.length;
    else if (e.key === "ArrowUp") next = i <= 0 ? items.length - 1 : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setMenu(false);
      featuresBtnRef.current?.focus();
      return;
    }
    if (next >= 0) {
      e.preventDefault();
      items[next].focus();
    }
  };
  const onWrapperBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (menu && !e.currentTarget.contains(e.relatedTarget as Node | null)) setMenu(false);
  };
  const onWrapperEnter = () => window.clearTimeout(leaveTimer.current);
  const onWrapperLeave = () => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      if (!menuRef.current?.contains(document.activeElement)) setMenu(false);
    }, 120);
  };

  const solid = scrolled || open || menu;

  return (
    <header className="sticky top-0 z-50 isolate">
      {/* Glass lives on child layers: a backdrop-filter on <header> would trap the fixed mobile sheet. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white/70 backdrop-blur-[14px] backdrop-saturate-150" />
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 border-b border-hairline bg-white/85 shadow-[var(--shadow-hair)] motion-ok:transition-opacity motion-ok:duration-200 ${solid ? "opacity-100" : "opacity-0"}`}
      />
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="relative hidden items-center gap-0.5 lg:flex" onClick={closeAll}>
          <div ref={menuRef} onMouseEnter={onWrapperEnter} onMouseLeave={onWrapperLeave} onBlur={onWrapperBlur}>
            <button
              ref={featuresBtnRef}
              type="button"
              aria-expanded={menu}
              aria-controls={menuId}
              onClick={() => setMenu((v) => !v)}
              onMouseEnter={() => setMenu(true)}
              onKeyDown={onButtonKey}
              className={`${navLink(isActive("/features"))} inline-flex items-center gap-1`}
            >
              Features{" "}
              <IconChevronDown size={15} className={`motion-ok:transition-[rotate] motion-ok:duration-200 motion-ok:ease-glide ${menu ? "rotate-180" : ""}`} />
            </button>
            <div id={menuId} hidden={!menu} className="absolute left-1/2 top-full w-[46rem] -translate-x-1/2 pt-3" onKeyDown={onMenuKey}>
              <div
                ref={menuPanelRef}
                className="grid grid-cols-[minmax(0,1fr)_13rem] gap-2 rounded-3xl border border-hairline bg-white/95 p-2.5 shadow-[var(--shadow-float)] backdrop-blur-xl motion-ok:transition-[opacity,translate,scale] motion-ok:duration-200 motion-ok:ease-glide motion-ok:starting:-translate-y-1.5 motion-ok:starting:scale-[.985] motion-ok:starting:opacity-0"
              >
                <ul className="grid grid-cols-2 gap-1">
                  {featureNav.map((f, i) => (
                    <li
                      key={f.slug}
                      style={stagger(i)}
                      className="motion-ok:transition-[opacity,translate] motion-ok:delay-[calc(var(--i)*18ms)] motion-ok:duration-200 motion-ok:ease-glide motion-ok:starting:translate-y-1 motion-ok:starting:opacity-0"
                    >
                      <Link
                        href={`/features/${f.slug}`}
                        aria-current={pathname === `/features/${f.slug}` ? "page" : undefined}
                        className="group flex gap-3 rounded-2xl p-3 hover:bg-tint focus-visible:bg-tint"
                      >
                        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink group-hover:text-white group-focus-visible:text-white">
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-xl bg-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-ok:transition-opacity motion-ok:duration-200"
                          />
                          <FeatureIcon name={f.icon} size={19} className="relative" />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-text">{f.label}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted">{f.blurb}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li
                    style={stagger(featureNav.length)}
                    className="motion-ok:transition-[opacity,translate] motion-ok:delay-[calc(var(--i)*18ms)] motion-ok:duration-200 motion-ok:ease-glide motion-ok:starting:translate-y-1 motion-ok:starting:opacity-0"
                  >
                    <Link href="/features" className="group flex h-full items-center gap-3 rounded-2xl bg-surface-2 p-3 hover:bg-tint focus-visible:bg-tint">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
                        <IconArrowRight size={18} className="nudge" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-text">All features</span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted">Everything in GrowX, Free vs Premium</span>
                      </span>
                    </Link>
                  </li>
                </ul>
                <div className="on-ink relative flex flex-col justify-between overflow-clip rounded-2xl bg-ink p-5 text-white">
                  <GrowthLine className="pointer-events-none absolute -bottom-6 -right-6 size-36 text-white/10" strokeWidth={5} />
                  <p className="relative text-xs font-bold uppercase tracking-[0.12em] text-white/60">GrowX Premium</p>
                  <div className="relative mt-6 grid gap-3">
                    <Link href="/signup" className="group inline-flex items-start gap-2 text-sm font-bold leading-snug text-white hover:text-white">
                      <span>Try Premium free for {TRIAL_DAYS} days</span>
                      <IconArrowRight size={16} className="nudge mt-0.5 shrink-0 text-accent-on-ink" />
                    </Link>
                    <Link href="/tools" className="group inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">
                      <span>7 free tools</span>
                      <IconArrowRight size={16} className="nudge shrink-0 text-accent-on-ink" />
                    </Link>
                  </div>
                </div>
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
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          data-menu-toggle
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline-strong bg-white lg:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-text motion-ok:transition-[translate,rotate] motion-ok:duration-200 motion-ok:ease-glide ${open ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-text motion-ok:transition-[scale,opacity] motion-ok:duration-200 motion-ok:ease-glide ${open ? "scale-x-0 opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-text motion-ok:transition-[translate,rotate] motion-ok:duration-200 motion-ok:ease-glide ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>
      <ScrollProgress />
      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain border-t border-hairline bg-white px-4 pb-8 pt-4 lg:hidden motion-ok:transition-[opacity,translate] motion-ok:duration-200 motion-ok:ease-glide motion-ok:starting:-translate-y-2 motion-ok:starting:opacity-0"
      >
        <nav aria-label="Mobile" onClick={closeAll}>
          <p className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">Features</p>
          <ul className="mt-2 grid gap-1">
            {featureNav.map((f, i) => (
              <li key={f.slug} style={stagger(Math.min(i, 10))} className={mobileItem}>
                <Link href={`/features/${f.slug}`} className="flex items-center gap-3 rounded-2xl px-1 py-2.5 font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                    <FeatureIcon name={f.icon} size={18} />
                  </span>
                  {f.label}
                </Link>
              </li>
            ))}
            <li style={stagger(Math.min(featureNav.length, 10))} className={mobileItem}>
              <Link href="/features" className="flex items-center gap-3 rounded-2xl px-1 py-2.5 font-semibold text-accent-ink">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
                  <IconArrowRight size={17} />
                </span>
                All features
              </Link>
            </li>
          </ul>
          <ul className="mt-4 border-t border-hairline pt-2">
            {links.map((l, i) => (
              <li key={l.href} style={stagger(Math.min(featureNav.length + 1 + i, 10))} className={mobileItem}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="flex items-center justify-between border-b border-hairline py-3.5 text-lg font-semibold aria-[current=page]:text-accent-ink"
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

const mobileItem =
  "motion-ok:transition-[opacity,translate] motion-ok:delay-[calc(var(--i)*25ms)] motion-ok:duration-200 motion-ok:ease-glide motion-ok:starting:-translate-y-1 motion-ok:starting:opacity-0";
