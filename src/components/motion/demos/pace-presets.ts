/** Follow pace presets, exactly as in docs/PRODUCT_FACTS.md (extension v2.4.4). */
export type PaceId = "safe" | "balanced" | "turbo" | "xpremium";

export const PACE_PRESETS: readonly {
  id: PaceId;
  name: string;
  /** Seconds between follows [min, max]. */
  delay: readonly [number, number];
  restEvery: number;
  perHour: number;
  /** Approximate daily cap. */
  perDay: number;
  premium: boolean;
  note: string;
}[] = [
  { id: "safe", name: "Safe", delay: [45, 110], restEvery: 12, perHour: 18, perDay: 150, premium: false, note: "new accounts" },
  { id: "balanced", name: "Balanced", delay: [30, 75], restEvery: 18, perHour: 28, perDay: 280, premium: false, note: "recommended (default)" },
  { id: "turbo", name: "Turbo", delay: [18, 45], restEvery: 25, perHour: 40, perDay: 390, premium: true, note: "aged accounts" },
  { id: "xpremium", name: "X Premium", delay: [12, 32], restEvery: 35, perHour: 60, perDay: 800, premium: true, note: "accounts with X Premium only" },
] as const;

export function pacePreset(id: PaceId) {
  return PACE_PRESETS.find((p) => p.id === id) ?? PACE_PRESETS[1];
}
