"use client";

import { useSyncExternalStore } from "react";
import { getMotionSnapshot, setMotionPref, subscribeMotion } from "./motion-prefs";

const serverSnapshot = () => "on" as const;

/**
 * A visible "Reduce motion" switch for every visitor (WCAG 2.2.2). Pressing it sets
 * html[data-motion="reduce"], which removes every guarded animation exactly like the OS
 * setting, and remembers it. When the OS already reduces motion it shows pressed + disabled.
 * Footer bottom bar only; never inside nav[aria-label="Main"].
 */
export function MotionToggle({ tone = "ink" }: { tone?: "ink" | "light" }) {
  const snap = useSyncExternalStore(subscribeMotion, getMotionSnapshot, serverSnapshot);
  const pressed = snap !== "on";
  const os = snap === "os";
  const ink = tone === "ink";
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={os}
      title={os ? "Your device is already set to reduce motion" : undefined}
      onClick={() => setMotionPref(snap !== "site")}
      className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold disabled:cursor-not-allowed ${
        ink ? "border-white/15 text-white/80 hover:border-white/35 hover:text-white" : "border-hairline-strong bg-white text-text-2 hover:text-text"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative inline-block h-4 w-7 rounded-full ${pressed ? "bg-accent" : ink ? "bg-white/20" : "bg-border-strong"}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-3 rounded-full bg-white shadow-sm motion-ok:transition-[translate] motion-ok:duration-200 motion-ok:ease-glide ${
            pressed ? "translate-x-3" : ""
          }`}
        />
      </span>
      Reduce motion
      {os ? <span className="sr-only"> (set by your device)</span> : null}
    </button>
  );
}
