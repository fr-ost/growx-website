/**
 * Light running around a card's edge (a rotating conic square inside a 1.5px masked ring).
 * - loop:  one turn / 7s, paused off-screen (counts toward the loop budget; max 2 visible)
 * - scroll: one turn per pass through the viewport (free while idle)
 * - focus: hidden at rest; shows and spins only while the parent `.group` has :focus-within
 * Parent needs `relative` + a border-radius (+ `group` for focus mode).
 * `onBorder={2}` sits the beam exactly on a parent's 2px border (inset: -2px) instead of inside it.
 */
export function BorderBeam({
  mode = "scroll",
  tone = "red",
  onBorder,
}: {
  mode?: "loop" | "scroll" | "focus";
  tone?: "red" | "white";
  onBorder?: 2;
}) {
  return (
    <span
      className="border-beam"
      data-mode={mode}
      data-tone={tone}
      data-inset={onBorder}
      aria-hidden="true"
      data-decor=""
      {...(mode === "loop" ? { "data-ambient": "" } : {})}
    >
      <i />
    </span>
  );
}
