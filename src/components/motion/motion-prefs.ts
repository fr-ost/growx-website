/** Site-wide "Reduce motion" preference (WCAG 2.2.2). DOM + localStorage only; no React. */
export const MOTION_KEY = "gx-motion";
const REDUCE_Q = "(prefers-reduced-motion: reduce)";

export type MotionSnapshot = "os" | "site" | "on";

export function readStoredReduce(): boolean {
  try {
    return localStorage.getItem(MOTION_KEY) === "reduce";
  } catch {
    return false;
  }
}

/** Sets or clears html[data-motion="reduce"] and remembers the choice. */
export function setMotionPref(reduce: boolean): void {
  const root = document.documentElement;
  if (reduce) root.dataset.motion = "reduce";
  else delete root.dataset.motion;
  try {
    if (reduce) localStorage.setItem(MOTION_KEY, "reduce");
    else localStorage.removeItem(MOTION_KEY);
  } catch {
    /* storage blocked: the attribute still applies for this page view */
  }
}

/** useSyncExternalStore subscription: OS setting changes + html[data-motion] changes. */
export function subscribeMotion(cb: () => void): () => void {
  const mq = matchMedia(REDUCE_Q);
  mq.addEventListener("change", cb);
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  return () => {
    mq.removeEventListener("change", cb);
    mo.disconnect();
  };
}

export function getMotionSnapshot(): MotionSnapshot {
  if (matchMedia(REDUCE_Q).matches) return "os";
  return document.documentElement.dataset.motion === "reduce" ? "site" : "on";
}
