/**
 * FCWI instrument definitions — internal only.
 * "FCWI" never appears in physician-facing UI (§C governance).
 * Wording and split-scale assignment are exact per Master Review Part VIII.
 *
 * Split scale (scoring 0–4 identical across both):
 *   frequency → Never / Rarely / Sometimes / Often / Always (items 1,2,6,8,9)
 *   agreement → Strongly disagree / Disagree / Neutral / Agree / Strongly agree (items 3,4,5,7)
 */

export const FCWI_SCALE_FREQUENCY = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Always" },
] as const;

export const FCWI_SCALE_AGREEMENT = [
  { value: 0, label: "Strongly disagree" },
  { value: 1, label: "Disagree" },
  { value: 2, label: "Neutral" },
  { value: 3, label: "Agree" },
  { value: 4, label: "Strongly agree" },
] as const;

export type FcwiScale = "frequency" | "agreement";

export const FCWI_ITEMS = [
  { item: 1, scale: "frequency" as FcwiScale, text: "The work I spend most time on depletes my energy." },
  { item: 2, scale: "frequency" as FcwiScale, text: "I feel disconnected from the people I work with or care for." },
  { item: 3, scale: "agreement" as FcwiScale, text: "My work feels meaningful and aligned with why I entered medicine." },
  { item: 4, scale: "agreement" as FcwiScale, text: "I feel satisfied with what I've accomplished." },
  { item: 5, scale: "agreement" as FcwiScale, text: "I feel in control of my professional direction." },
  { item: 6, scale: "frequency" as FcwiScale, text: "Even on demanding days, the work I do most leaves me energized." },
  { item: 7, scale: "agreement" as FcwiScale, text: "The work that matters most to me is recognized by my institution." },
  { item: 8, scale: "frequency" as FcwiScale, text: "After a mistake, I learn from it rather than feel shame." },
  { item: 9, scale: "frequency" as FcwiScale, text: "I prioritize my health even under high demand." },
] as const;

export function scaleLabels(scale: FcwiScale) {
  return scale === "frequency" ? FCWI_SCALE_FREQUENCY : FCWI_SCALE_AGREEMENT;
}

export type FcwiFrequencyTier = "onboarding" | "monthly" | "quarterly" | "annual" | "ad_hoc";

/** Convert a 9-element array of item scores to the DB column map. */
export function itemsToDbRow(items: number[]): Record<string, number> {
  return Object.fromEntries(items.map((v, i) => [`item_${i + 1}`, v]));
}
