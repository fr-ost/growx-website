import { CountUp } from "@/components/motion/count-up";
import { GrowthLine } from "@/components/motion/growth-line";
import { TRIAL_DAYS } from "@/config/pricing";
import s from "./trial-ticket.module.css";

/**
 * The pricing hero's aside: a perforated "admission" ticket for the free Premium trial.
 * Decorative (aria-hidden): the same facts are stated in the hero copy. Solid white text on
 * bg-brand-deep only. The day count is a real product fact (TRIAL_DAYS = 30) and counts up once;
 * the sheen sweeps once; tilt follows a fine pointer (max 3deg). Everything else is static.
 */
export function TrialTicket() {
  return (
    <div className="relative mx-auto w-full max-w-[26rem]" aria-hidden="true" data-decor="">
      <span className="glow-soft -bottom-12 left-1/2 h-32 w-[90%] -translate-x-1/2 [--glow:rgba(225,29,46,0.42)]" />
      <div data-tilt="3" className={`${s.ticket} relative overflow-clip rounded-[1.75rem] bg-brand-deep text-white`}>
        <span className={s.grid} />
        <span className="stage-sweep" />
        <div className="relative px-8 pb-7 pt-7">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/45">
              GrowX Premium
            </span>
            <GrowthLine mode="once" className="size-10 text-white" strokeWidth={7} />
          </div>
          <p className="mt-6 flex items-end gap-3">
            <CountUp value={TRIAL_DAYS} className="font-display text-[6.75rem] font-extrabold leading-[0.82] tracking-[-0.05em]" />
            <span className="pb-1 font-display text-4xl font-extrabold tracking-tight">days</span>
          </p>
          <p className="mt-4 font-display text-xl font-extrabold tracking-tight">Premium trial</p>
        </div>
        <span className={s.perf} />
        <div className={`${s.stub} relative flex items-center justify-between gap-4 px-8`}>
          <p className="text-sm font-semibold">No credit card · once per account</p>
          <span className={`${s.code} shrink-0`} />
        </div>
      </div>
    </div>
  );
}
