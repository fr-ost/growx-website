import { ToolGlyph, type ToolKey } from "@/components/motion/tool-glyph";

/**
 * A scaled-down ToolGlyph (the primitive only ships 56px and 88px) for eyebrows and link lists.
 * The 56px tile is scaled with `scale`, which never affects layout: the wrapper reserves the
 * final box, so there is no shift. aria-hidden via ToolGlyph.
 */
export function MiniGlyph({ tool, px = 28 }: { tool: ToolKey; px?: 24 | 28 | 32 }) {
  const scale = px / 56;
  return (
    <span aria-hidden="true" className="relative inline-block shrink-0 align-middle" style={{ width: px, height: px }}>
      <span className="absolute left-1/2 top-1/2 block" style={{ translate: "-50% -50%", scale: String(scale) }}>
        <ToolGlyph tool={tool} size="sm" />
      </span>
    </span>
  );
}
