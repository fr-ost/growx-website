import { TRIAL_DAYS } from "@/config/pricing";

const DAYS = Array.from({ length: TRIAL_DAYS }, (_, i) => i);

/** One row of day ticks. Every 7th day and the last day stand taller (a calendar rhythm, no numbers). */
function TickRow({ lit }: { lit: boolean }) {
  return (
    <div className="flex h-8 items-end justify-between">
      {DAYS.map((d) => (
        <span
          key={d}
          className={`w-[3px] rounded-full ${d % 7 === 0 || d === TRIAL_DAYS - 1 ? "h-8" : "h-5"} ${
            lit ? (d === TRIAL_DAYS - 1 ? "bg-accent-on-ink" : "bg-white") : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * The trial as {TRIAL_DAYS} day ticks. The lit copy is drawn once, left to right, by clip-path
 * (1.2 s after 600 ms). Its static base is the final frame: every tick lit. The ticks are
 * decorative; the label below carries the meaning as real text.
 */
export function TrialTicks({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative" aria-hidden="true" data-decor="">
        <TickRow lit={false} />
        <div className="absolute inset-0 motion-ok:[animation:draw-x_1.2s_var(--ease-expo)_0.6s_both]">
          <TickRow lit />
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold tabular-nums text-white/75">{TRIAL_DAYS} days · no credit card</p>
    </div>
  );
}
