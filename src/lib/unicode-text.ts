/**
 * "Bold text" for X (Twitter) and other places without formatting: plain letters mapped to Unicode's Mathematical
 * Alphanumeric Symbols. They look bold or italic but are different characters, so X counts each as 2 and screen readers
 * may read them letter by letter or skip them.
 */
export interface UnicodeStyle {
  id: string;
  name: string;
  /** Code point of styled "A", "a" and "0" (digits are optional). */
  upper: number;
  lower: number;
  digit?: number;
  /** Letters Unicode encodes elsewhere (the "holes" in the block). */
  exceptions?: Record<string, number>;
}

export const STYLES: UnicodeStyle[] = [
  { id: "bold", name: "Bold", upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  { id: "italic", name: "Italic", upper: 0x1d434, lower: 0x1d44e, exceptions: { h: 0x210e } },
  { id: "bold-italic", name: "Bold italic", upper: 0x1d468, lower: 0x1d482 },
  { id: "sans-bold", name: "Sans bold", upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  { id: "sans-italic", name: "Sans italic", upper: 0x1d608, lower: 0x1d622 },
  { id: "sans-bold-italic", name: "Sans bold italic", upper: 0x1d63c, lower: 0x1d656 },
  { id: "monospace", name: "Monospace", upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 },
  {
    id: "script",
    name: "Script",
    upper: 0x1d49c,
    lower: 0x1d4b6,
    exceptions: { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 },
  },
  { id: "bold-script", name: "Bold script", upper: 0x1d4d0, lower: 0x1d4ea },
  {
    id: "double-struck",
    name: "Double-struck",
    upper: 0x1d538,
    lower: 0x1d552,
    digit: 0x1d7d8,
    exceptions: { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 },
  },
  { id: "fraktur", name: "Fraktur", upper: 0x1d504, lower: 0x1d51e, exceptions: { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 } },
  { id: "bold-fraktur", name: "Bold fraktur", upper: 0x1d56c, lower: 0x1d586 },
];

export function styleText(text: string, style: UnicodeStyle): string {
  let out = "";
  for (const ch of text) {
    const ex = style.exceptions?.[ch];
    if (ex) out += String.fromCodePoint(ex);
    else if (ch >= "A" && ch <= "Z") out += String.fromCodePoint(style.upper + ch.charCodeAt(0) - 65);
    else if (ch >= "a" && ch <= "z") out += String.fromCodePoint(style.lower + ch.charCodeAt(0) - 97);
    else if (style.digit && ch >= "0" && ch <= "9") out += String.fromCodePoint(style.digit + ch.charCodeAt(0) - 48);
    else out += ch;
  }
  return out;
}

/** Combining-mark styles: a mark after every visible character. */
export const MARKS = [
  { id: "strikethrough", name: "Strikethrough", mark: "̶" },
  { id: "underline", name: "Underline", mark: "̲" },
] as const;

export const markText = (text: string, mark: string) => [...text].map((c) => (c === "\n" || c === " " ? c : c + mark)).join("");
