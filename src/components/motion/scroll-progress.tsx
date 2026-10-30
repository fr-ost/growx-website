/**
 * A 2px brand-gradient hairline bound to scroll(root) (rendered by the header).
 * On pages containing [data-progress-article] it follows that element instead.
 * Hidden without scroll-timeline support, with motion off, and in print. Pure CSS.
 */
export function ScrollProgress() {
  return <span className="scroll-progress" aria-hidden="true" data-decor="" />;
}
