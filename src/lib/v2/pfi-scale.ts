/** PFI Likert scale — 0–4 everywhere user-facing (Brady et al. / OpenEvidence handoff). */

export const PFI_LIKERT_MAX = 4;

export const PFI_ANCHORS =
  "0 = not at all / never · 1 = rarely · 2 = sometimes · 3 = often · 4 = every day / completely";

/** Published PFI stems (verbatim) — onboarding clusters and quarterly 2-item screen. */
export const PFI_FULFILLMENT_STEM = "I feel happy when I am at work.";
export const PFI_EXHAUSTION_STEM = "I feel burned out from my work.";
export const PFI_DEPERSONALIZATION_STEM = "I have become more callous toward people.";
export const PFI_SELF_VALUATION_STEM = "I feel valued by my organization.";

export const PFI_SCALE_INSTRUCTION = `Rate from 0 (not at all) to 4 (extremely). ${PFI_ANCHORS}`;

export function clampPfiValue(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(PFI_LIKERT_MAX, Math.round(n)));
}

/** Map quarterly 2-item max (0–4 each) to PFI burnout composite used internally (0–10 scale). */
export function quarterlyBurnoutComposite(exhaustion: number, depersonalization: number): number {
  const mean = (clampPfiValue(exhaustion) + clampPfiValue(depersonalization)) / 2;
  return mean * 2.5;
}

export function pfiScreenPrompt(): string {
  return `Well-being screen — two standard questions:

1. "${PFI_EXHAUSTION_STEM}"
2. "${PFI_DEPERSONALIZATION_STEM}"

${PFI_SCALE_INSTRUCTION}

Share both numbers (0–4), or describe how you've been feeling this quarter.`;
}
