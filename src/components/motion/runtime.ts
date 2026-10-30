/**
 * The only global motion JS. Pure DOM, delegated over data attributes; no React, no rAF loop.
 * (a) reveal fallback where view() timelines are unsupported (only below the fold)
 * (b) [data-ambient] gets data-paused while off-screen
 * (c) [data-demo] gets data-demo-play while >= 35% visible (removed when fully out)
 * (d) [data-count] count-ups (real facts only; the true value is already in the HTML)
 * (e) fine-pointer spotlight / tilt / magnetic, one passive listener, <= 1 rAF per frame
 */
import { readStoredReduce } from "./motion-prefs";

const REVEALS = ".reveal,.reveal-heading,.reveal-scale,.reveal-clip";
const POINTER_VARS = ["--mx", "--my", "--tilt-x", "--tilt-y", "--mag-x", "--mag-y"] as const;

/** Apply the stored "Reduce motion" choice. Only writes when the value differs (avoids observer loops). */
export function applyStoredMotionPref(): void {
  const root = document.documentElement;
  const want = readStoredReduce();
  const has = root.dataset.motion === "reduce";
  if (want && !has) root.dataset.motion = "reduce";
  else if (!want && has) delete root.dataset.motion;
}

export function motionAllowed(): boolean {
  return !matchMedia("(prefers-reduced-motion: reduce)").matches && document.documentElement.dataset.motion !== "reduce";
}

export function initMotion(opts: { forceFallback?: boolean } = {}): () => void {
  const root = document.documentElement;
  const motionOK = motionAllowed();
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cleanups: Array<() => void> = [];
  const on = <T extends EventTarget>(t: T, type: string, f: EventListener, o?: AddEventListenerOptions) => {
    t.addEventListener(type, f, o);
    cleanups.push(() => t.removeEventListener(type, f, o));
  };
  const below = (el: Element) => el.getBoundingClientRect().top > innerHeight;
  const settled: Array<() => void> = [];
  let settleTimer = 0;
  const onScrollSettle = () => {
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => settled.forEach((f) => f()), 160);
  };

  // (a) reveal fallback
  const supportsView = !opts.forceFallback && typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
  if (motionOK && !supportsView) {
    const pending = [...document.querySelectorAll<HTMLElement>(REVEALS)].filter(below);
    const show = (el: Element) => el.classList.add("reveal-in");
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    for (const el of pending) {
      el.classList.add("reveal-pending");
      io.observe(el);
    }
    settled.push(() => {
      for (const el of pending) if (el.getBoundingClientRect().top < innerHeight) show(el);
    });
    on(window, "beforeprint", () => pending.forEach(show));
    cleanups.push(() => {
      io.disconnect();
      for (const el of pending) el.classList.remove("reveal-pending", "reveal-in");
    });
  }

  // (b) ambient loops pause off-screen
  const amb = new IntersectionObserver(
    (es) => {
      for (const e of es) e.target.toggleAttribute("data-paused", !e.isIntersecting);
    },
    { rootMargin: "120px" },
  );
  document.querySelectorAll("[data-ambient]").forEach((el) => amb.observe(el));
  cleanups.push(() => {
    amb.disconnect();
    document.querySelectorAll("[data-paused]").forEach((el) => el.removeAttribute("data-paused"));
  });

  // (c) demos: play while >= 35% visible; reset to the poster frame when fully out
  if (motionOK) {
    const demo = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.intersectionRatio >= 0.35) e.target.setAttribute("data-demo-play", "");
          else if (!e.isIntersecting) e.target.removeAttribute("data-demo-play");
        }
      },
      { threshold: [0, 0.35] },
    );
    document.querySelectorAll("[data-demo]").forEach((el) => demo.observe(el));
    cleanups.push(() => {
      demo.disconnect();
      document.querySelectorAll("[data-demo-play]").forEach((el) => el.removeAttribute("data-demo-play"));
    });
  }

  // (d) count-ups
  if (motionOK) {
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-count]")].filter(below);
    const final = (el: Element) => el.getAttribute("data-count") ?? "";
    const frames = new Set<number>();
    const started = new WeakSet<Element>();
    const run = (el: HTMLElement) => {
      if (started.has(el)) return;
      started.add(el);
      io.unobserve(el);
      const to = Number(final(el));
      const from = Number(el.getAttribute("data-count-from") || 0);
      const t0 = performance.now();
      const d = 900;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / d);
        el.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
        if (k < 1) frames.add(requestAnimationFrame(step));
      };
      frames.add(requestAnimationFrame(step));
    };
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) run(e.target as HTMLElement);
      },
      { threshold: 0.6 },
    );
    for (const el of nodes) {
      el.textContent = el.getAttribute("data-count-from") || "0";
      io.observe(el);
    }
    // A counter scrolled past too quickly for the observer still runs once scrolling settles.
    settled.push(() => {
      for (const el of nodes) if (el.getBoundingClientRect().top < innerHeight) run(el);
    });
    const restore = () => nodes.forEach((el) => (el.textContent = final(el)));
    on(window, "beforeprint", restore);
    cleanups.push(() => {
      io.disconnect();
      frames.forEach(cancelAnimationFrame);
      restore();
    });
  }

  if (settled.length) {
    on(window, "scroll", onScrollSettle, { passive: true });
    cleanups.push(() => clearTimeout(settleTimer));
  }

  // (e) pointer effects: fine pointer + motion only
  if (motionOK && fine) {
    let ev: PointerEvent | null = null;
    let frame = 0;
    let touched = new Set<HTMLElement>();
    let rects = new WeakMap<Element, DOMRect>();
    const rect = (el: Element) => {
      let r = rects.get(el);
      if (!r) {
        r = el.getBoundingClientRect();
        rects.set(el, r);
      }
      return r;
    };
    const reset = (el: HTMLElement) => POINTER_VARS.forEach((p) => el.style.removeProperty(p));
    const clear = () => {
      touched.forEach(reset);
      touched = new Set();
    };
    const apply = () => {
      frame = 0;
      if (!ev) return;
      const t = ev.target instanceof Element ? ev.target : null;
      const x = ev.clientX;
      const y = ev.clientY;
      const next = new Set<HTMLElement>();
      const group = t?.closest("[data-spotlight-group]");
      const single = t?.closest<HTMLElement>("[data-spotlight]");
      const cards: HTMLElement[] = group ? [...group.querySelectorAll<HTMLElement>("[data-spotlight]")] : single ? [single] : [];
      for (const c of cards) {
        const r = rect(c);
        c.style.setProperty("--mx", `${(x - r.left).toFixed(0)}px`);
        c.style.setProperty("--my", `${(y - r.top).toFixed(0)}px`);
        next.add(c);
      }
      const tilt = t?.closest<HTMLElement>("[data-tilt]");
      if (tilt) {
        const r = rect(tilt);
        const max = Number(tilt.getAttribute("data-tilt")) || 2.5;
        const nx = (x - r.left) / r.width - 0.5;
        const ny = (y - r.top) / r.height - 0.5;
        tilt.style.setProperty("--tilt-y", `${(nx * 2 * max).toFixed(2)}deg`);
        tilt.style.setProperty("--tilt-x", `${(-ny * 2 * max).toFixed(2)}deg`);
        next.add(tilt);
      }
      const mag = t?.closest<HTMLElement>("[data-magnetic]");
      if (mag) {
        const r = rect(mag);
        const max = Number(mag.getAttribute("data-magnetic")) || 6;
        const clamp = (v: number) => Math.max(-max, Math.min(max, v));
        mag.style.setProperty("--mag-x", `${clamp((x - (r.left + r.width / 2)) * 0.25).toFixed(1)}px`);
        mag.style.setProperty("--mag-y", `${clamp((y - (r.top + r.height / 2)) * 0.25).toFixed(1)}px`);
        next.add(mag);
      }
      touched.forEach((el) => {
        if (!next.has(el)) reset(el);
      });
      touched = next;
    };
    on(
      document,
      "pointermove",
      ((e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        ev = e;
        if (!frame) frame = requestAnimationFrame(apply);
      }) as EventListener,
      { passive: true },
    );
    const forget = () => {
      rects = new WeakMap();
    };
    on(window, "scroll", forget, { passive: true });
    on(window, "resize", forget, { passive: true });
    on(root, "pointerleave", clear);
    on(window, "blur", clear);
    cleanups.push(() => {
      cancelAnimationFrame(frame);
      clear();
    });
  }

  return () => {
    cleanups.splice(0).forEach((f) => f());
  };
}
