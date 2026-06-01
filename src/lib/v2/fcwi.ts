/**
 * FCWI instrument definitions — internal only.
 * "FCWI" never appears in physician-facing UI (§C governance).
 * Wording is exact per Master Review Part VIII.
 */

export const FCWI_ITEMS = [
  { item: 1, text: "The work I spend most time on depletes my energy." },
  { item: 2, text: "I feel disconnected from the people I work with or care for." },
  { item: 3, text: "My work feels meaningful and aligned with why I entered medicine." },
  { item: 4, text: "I feel satisfied with what I've accomplished." },
  { item: 5, text: "I feel in control of my professional direction." },
  { item: 6, text: "The work I spend most time on gives me energy." },
  { item: 7, text: "The work that matters most to me is recognized by my institution." },
  { item: 8, text: "After a mistake, I learn from it rather than feel shame." },
  { item: 9, text: "I prioritize my health even under high demand." },
] as const;

export const FCWI_LIKERT = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Always" },
] as const;

export type FcwiFrequencyTier = "onboarding" | "monthly" | "quarterly" | "annual" | "ad_hoc";

/** Convert a 9-element array of item scores to the DB column map. */
export function itemsToDbRow(items: number[]): Record<string, number> {
  return Object.fromEntries(items.map((v, i) => [`item_${i + 1}`, v]));
}
