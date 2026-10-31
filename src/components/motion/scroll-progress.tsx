/**
 * A 2px brand-gradient hairline bound to scroll(root) (rendered by the header).
 * On article pages (`article`) it follows the page's [data-progress-article] element instead.
 * Hidden without scroll-timeline support, with motion off, and in print. Pure CSS.
 */
export function ScrollProgress({ article = false }: { article?: boolean }) {
  return <span className="scroll-progress" aria-hidden="true" data-decor="" data-article={article ? "" : undefined} />;
}
