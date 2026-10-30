"use client";

import { useEffect } from "react";

/**
 * Marks the link to the top-most visible section in a server-rendered in-page nav with
 * aria-current ("true" for chip bars, "location" for tables of contents). Keeps the last
 * active link between sections, and scrolls a horizontal chip bar (x-axis only) so the active
 * chip is visible. DOM writes only; without JS the anchors still work.
 */
export function ScrollSpy({
  navId,
  current = "true",
  rootMargin = "-20% 0px -70% 0px",
}: {
  navId: string;
  current?: "true" | "location";
  rootMargin?: string;
}): null {
  useEffect(() => {
    const nav = document.getElementById(navId);
    if (!nav) return;
    const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')]
      .map((a) => {
        const id = decodeURIComponent(a.hash.slice(1));
        const target = id ? document.getElementById(id) : null;
        return target ? { a, target } : null;
      })
      .filter((x): x is { a: HTMLAnchorElement; target: HTMLElement } => x !== null);
    if (!links.length) return;
    const visible = new Set<Element>();
    let active: HTMLAnchorElement | null = null;
    const setActive = (a: HTMLAnchorElement) => {
      if (a === active) return;
      active?.removeAttribute("aria-current");
      a.setAttribute("aria-current", current);
      active = a;
      if (nav.scrollWidth > nav.clientWidth + 1) {
        const n = nav.getBoundingClientRect();
        const r = a.getBoundingClientRect();
        const left = nav.scrollLeft + (r.left - n.left) - (n.width - r.width) / 2;
        const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches && document.documentElement.dataset.motion !== "reduce";
        nav.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
      }
    };
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        const first = links.find((l) => visible.has(l.target));
        if (first) setActive(first.a);
      },
      { rootMargin },
    );
    links.forEach((l) => io.observe(l.target));
    return () => {
      io.disconnect();
      active?.removeAttribute("aria-current");
    };
  }, [navId, current, rootMargin]);
  return null;
}
