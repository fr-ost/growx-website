import { cssVars } from "./stagger";

/**
 * A CSS-only rotating phrase: 2.6s per phrase, exactly two cycles, then it rests on
 * phrase 1 (WCAG 2.2.2). The slot is 1lh tall and as wide as the widest phrase (no CLS).
 * Screen readers hear `srText` once. Always place it inside a <p>, never a heading.
 * 4-7 phrases, each <= 26 characters; keep the font size <= 1.6rem so it fits 343px.
 */
export function WordRoll({
  phrases,
  srText,
  align = "start",
  className = "",
}: {
  phrases: readonly string[];
  srText: string;
  align?: "start" | "center";
  className?: string;
}) {
  const n = phrases.length;
  if (process.env.NODE_ENV !== "production" && (n < 4 || n > 7)) {
    throw new Error(`WordRoll needs 4-7 phrases, got ${n}.`);
  }
  return (
    <>
      <span
        className={`word-roll ${className}`}
        data-align={align}
        data-ambient=""
        aria-hidden="true"
        style={cssVars({ "--roll": `roll-${n}`, "--n": n })}
      >
        <span className="word-roll__track">
          {phrases.map((p, i) => (
            <span key={`${i}-${p}`}>{p}</span>
          ))}
          <span>{phrases[0]}</span>
        </span>
      </span>
      <span className="sr-only">{srText}</span>
    </>
  );
}
