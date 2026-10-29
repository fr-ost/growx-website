/**
 * X (Twitter) text rules, ported from the GrowX extension (shared/content.js) so the free web tools count exactly like
 * the extension's composer:
 *   weightedLength  X's own character count: links count 23, most emoji and CJK characters count 2
 *   splitThread     a long text -> thread parts that each fit (a line with just "---" always starts a new part)
 */
export const POST_LIMIT = 280;
export const LONG_POST_LIMIT = 25_000;
export const MAX_THREAD_PARTS = 25;

const URL_RE = /\bhttps?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|co|ai|app|dev|me|ly|gg|xyz|so|tv|info|blog)(?:\/[^\s]*)?/gi;

/** Code points that count once (twitter-text "weightedRanges"); everything else counts twice. */
function charWeight(cp: number): number {
  if (cp <= 4351) return 1;
  if (cp >= 8192 && cp <= 8205) return 1;
  if (cp >= 8208 && cp <= 8223) return 1;
  if (cp >= 8242 && cp <= 8247) return 1;
  return 2;
}

export function weightedLength(text: string): number {
  let s = String(text || "").normalize("NFC");
  let n = 0;
  s = s.replace(URL_RE, () => {
    n += 23;
    return "";
  });
  // Emoji with joiners / skin tones count as one emoji (2).
  const seg = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  if (seg) {
    for (const { segment } of seg.segment(s)) {
      const cps = [...segment].map((c) => c.codePointAt(0) ?? 0);
      n += cps.length > 1 && cps.some((c) => c > 0xffff || c === 0x200d || (c >= 0xfe00 && c <= 0xfe0f)) ? 2 : cps.reduce((a, c) => a + charWeight(c), 0);
    }
  } else {
    for (const ch of s) n += charWeight(ch.codePointAt(0) ?? 0);
  }
  return n;
}

export const countLinks = (text: string) => (String(text || "").match(URL_RE) ?? []).length;

const fits = (text: string, limit: number) => weightedLength(text) <= limit;

/** Cut `text` at the last good break that still fits. */
function cutFitting(text: string, limit: number): [string, string] {
  if (fits(text, limit)) return [text, ""];
  const breaks = [/\n\s*\n/g, /\n/g, /[.!?…](?=\s)/g, /[;:,](?=\s)/g, /\s/g];
  for (const re of breaks) {
    let best = -1;
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      const end = m.index + (m[0].trim() ? m[0].length : 0);
      if (end > 0 && fits(text.slice(0, end).trimEnd(), limit)) best = end;
      else if (best >= 0) break;
      if (m[0] === "") re.lastIndex++;
    }
    if (best > Math.min(40, text.length / 4)) return [text.slice(0, best).trim(), text.slice(best).trim()];
  }
  // No break: hard cut by characters.
  let lo = 1;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fits(text.slice(0, mid), limit)) lo = mid;
    else hi = mid - 1;
  }
  return [text.slice(0, lo).trim(), text.slice(lo).trim()];
}

/** A long text -> parts. A line that is just "---" (or "—") always starts a new part. numbering adds " 1/n". */
export function splitThread(text: string, opts: { limit?: number; numbering?: boolean } = {}): string[] {
  const limit = opts.limit ?? POST_LIMIT;
  const chunks = String(text || "")
    .replace(/\r/g, "")
    .split(/\n[ \t]*(?:-{3,}|—)[ \t]*\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const room = opts.numbering ? 6 : 0;
  const parts: string[] = [];
  for (let c of chunks) {
    while (c) {
      const [head, rest] = cutFitting(c, limit - room);
      if (!head) break;
      parts.push(head);
      c = rest;
      if (parts.length >= MAX_THREAD_PARTS) break;
    }
    if (parts.length >= MAX_THREAD_PARTS) break;
  }
  if (opts.numbering && parts.length > 1) return parts.map((p, i) => `${p} ${i + 1}/${parts.length}`);
  return parts;
}
