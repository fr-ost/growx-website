/**
 * Two radial-gradient blobs (no filter) that drift on 28s / 34s alternating loops
 * at >= 768px. Paused off-screen by MotionRuntime ([data-ambient]); static when
 * `still`, under reduced motion and below 768px. Counts as 2 loops in the budget.
 */
export function Aurora({ tone = "light", still = false, className = "" }: { tone?: "light" | "ink"; still?: boolean; className?: string }) {
  return (
    <div className={`aurora ${className}`} data-tone={tone} data-still={still ? "" : undefined} data-ambient="" data-decor="" aria-hidden="true">
      <i />
      <i />
    </div>
  );
}
