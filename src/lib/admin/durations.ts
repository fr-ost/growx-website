// Client-safe constants for the admin UI and API validation.
export type GiftDuration = "7d" | "30d" | "90d" | "1y" | "lifetime";
export const GIFT_DURATIONS: { id: GiftDuration; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "1y", label: "1 year" },
  { id: "lifetime", label: "Lifetime" },
];
export const GIFT_DURATION_IDS = GIFT_DURATIONS.map((d) => d.id) as [GiftDuration, ...GiftDuration[]];
export const durationLabel = (id: string) => GIFT_DURATIONS.find((d) => d.id === id)?.label ?? id;
