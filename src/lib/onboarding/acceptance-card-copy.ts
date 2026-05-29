/** Verbatim copy for Step 1 Card 5 — Account Initialization acceptance. */
export const ACCEPTANCE_CARD_COPY = {
  kicker: "Step 1: Core Profile",
  title: "ACCOUNT INITIALIZATION",
  heading: "ACCOUNT INITIALIZATION & PRIVACY ALIGNMENT",
  cardBadge: (current: number, total: number) => `Card ${current} of ${total}`,
  intro:
    "Before Coach Mak initializes your profile, please verify how your proprietary data is protected and ring-fenced on this platform:",
  checkbox1:
    "I acknowledge that my Direct Chat text and conversations are 100% confidential and NEVER shared with my institution, Program Director, or CCC.",
  checkbox2:
    "I understand that my institution only receives high-level, aggregated summative reports for milestone tracking, which are completely masked if my track has fewer than 5 peers.",
  checkbox3:
    "I understand that I own 100% of all generated CVs, portfolios, and academic documents permanently.",
  legalPrefix: 'By clicking "Accept & Initialize Profile," I agree to the complete',
  termsLabel: "FISCMAK Terms & Conditions",
  privacyLabel: "Privacy Policy",
  acceptButton: "Accept & Initialize Profile",
  acceptButtonLoading: "Initializing…",
} as const;
