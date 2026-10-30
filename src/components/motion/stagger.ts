import type { CSSProperties } from "react";

type VarValue = string | number;

/**
 * Typed inline custom properties for reveals, settles, demos, keycaps and beams.
 * Pass the index WITHIN THE VISUAL ROW (i % columns); the CSS caps the scroll
 * stagger at 4 steps of 7%, so every group has finished by entry 70%.
 */
export function stagger(i: number, extra?: CSSProperties): CSSProperties {
  return { "--i": i, ...extra } as CSSProperties;
}

/** Any set of `--custom` properties as an inline style, without casts at call sites. */
export function cssVars(vars: Record<`--${string}`, VarValue>, extra?: CSSProperties): CSSProperties {
  return { ...vars, ...extra } as CSSProperties;
}
