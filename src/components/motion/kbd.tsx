import type { ReactNode } from "react";
import { stagger } from "./stagger";

/**
 * A real <kbd> keycap in the system mono stack. With `press`, it dips 1.5px once as it
 * scrolls into view (staggered by `i`).
 */
export function Kbd({ children, tone = "light", press = false, i = 0 }: { children: ReactNode; tone?: "light" | "ink"; press?: boolean; i?: number }) {
  const toneCls =
    tone === "ink"
      ? "border-white/15 bg-white/10 text-white shadow-[inset_0_-1.5px_0_rgba(255,255,255,0.14)]"
      : "border-hairline-strong bg-white text-text shadow-[inset_0_-1.5px_0_var(--hairline-strong)]";
  return (
    <kbd
      className={`inline-flex min-w-[1.6em] items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-[12px] font-semibold leading-none tabular-nums ${toneCls} ${press ? "key-press" : ""}`}
      style={press ? stagger(i) : undefined}
    >
      {children}
    </kbd>
  );
}
