"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { applyStoredMotionPref, initMotion } from "./runtime";

/**
 * Mounts the global motion runtime once (rendered in the root layout after <SiteFooter/>).
 * Re-initialises on route change, on OS reduced-motion / pointer changes and when the
 * site "Reduce motion" toggle flips html[data-motion]. No React state.
 */
export function MotionRuntime(): null {
  const pathname = usePathname();
  useEffect(() => {
    applyStoredMotionPref();
    let stop = initMotion();
    const restart = () => {
      stop();
      stop = initMotion();
    };
    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    const fineMq = matchMedia("(hover: hover) and (pointer: fine)");
    reduceMq.addEventListener("change", restart);
    fineMq.addEventListener("change", restart);
    const mo = new MutationObserver(restart);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      mo.disconnect();
      reduceMq.removeEventListener("change", restart);
      fineMq.removeEventListener("change", restart);
      stop();
    };
  }, [pathname]);
  return null;
}
