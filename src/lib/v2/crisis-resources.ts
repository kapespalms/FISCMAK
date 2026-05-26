/** Crisis and wellness support resources — display only; Mak does not counsel. */

export type SupportResource = {
  id: string;
  label: string;
  detail: string;
  phone?: string;
  textInstruction?: string;
  url?: string;
  /** Prioritize for Ohio-based trainees (e.g. UH Psychiatry) */
  ohio?: boolean;
};

/** Immediate crisis — shown first when crisis language is detected */
export const PRIMARY_CRISIS_RESOURCES: SupportResource[] = [
  {
    id: "988",
    label: "988 Suicide & Crisis Lifeline",
    detail: "Call or text 988 (US). Free, confidential, 24/7.",
    phone: "988",
    url: "https://988lifeline.org",
  },
  {
    id: "physician_support_line",
    label: "Physician Support Line",
    detail: "Free and confidential support for physicians and medical students.",
    phone: "1-888-409-0141",
  },
  {
    id: "ohio_careline",
    label: "Ohio's Careline",
    detail: "Trained counselors for emotional support 24/7.",
    phone: "1-800-720-9616",
    url: "https://mha.ohio.gov/careline",
    ohio: true,
  },
  {
    id: "crisis_text_line",
    label: "Crisis Text Line",
    detail: "24/7 confidential text support for people of any age in crisis.",
    textInstruction: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
  },
];

/** Additional support — warmlines, specialized hotlines, treatment lines */
export const ADDITIONAL_SUPPORT_RESOURCES: SupportResource[] = [
  {
    id: "warmlines_directory",
    label: "Warmlines & Carelines directory",
    detail: "Explains what warmlines/carelines are and lists options by state.",
    url: "https://screening.mhanational.org/content/need-talk-someone-warmlines",
  },
  {
    id: "domestic_violence",
    label: "National Domestic Violence Hotline",
    detail: "Advocates for anyone experiencing domestic violence or questioning an unhealthy relationship.",
    phone: "1-800-799-7233",
    url: "https://www.thehotline.org",
  },
  {
    id: "lgbt_hotline",
    label: "LGBT National Hotline",
    detail: "Peer support for lesbian, gay, bisexual, and transgender callers.",
    phone: "1-888-843-4564",
    url: "https://www.glbthotline.org/peer-chat.html",
  },
  {
    id: "lgbt_near_me",
    label: "GLBT Near Me",
    detail: "Local LGBT community resources and services.",
    url: "https://www.glbtnearme.org",
  },
  {
    id: "rainn",
    label: "National Sexual Assault Hotline (RAINN)",
    detail: "Confidential support for survivors of sexual assault.",
    phone: "1-800-656-4673",
    url: "https://hotline.rainn.org",
  },
  {
    id: "eating_disorders",
    label: "Eating Disorder Helpline",
    detail: "Support and treatment referrals for eating disorders.",
    phone: "1-800-931-2237",
    url: "https://www.nationaleatingdisorders.org",
  },
  {
    id: "samhsa_treatment",
    label: "Drug & Alcohol Treatment Hotline",
    detail: "SAMHSA treatment referral and information service.",
    phone: "1-800-662-HELP",
    url: "https://www.samhsa.gov/find-help/national-helpline",
  },
];

/** @deprecated Use PRIMARY_CRISIS_RESOURCES — kept for existing imports */
export const CRISIS_RESOURCES = PRIMARY_CRISIS_RESOURCES.map((r) => ({
  label: r.label,
  detail: [r.phone, r.textInstruction, r.detail].filter(Boolean).join(" · "),
}));

export function orderSupportResources(input?: {
  /** UH Psychiatry and other Ohio programs */
  preferOhio?: boolean;
}): SupportResource[] {
  const primary = [...PRIMARY_CRISIS_RESOURCES];
  if (input?.preferOhio) {
    primary.sort((a, b) => Number(Boolean(b.ohio)) - Number(Boolean(a.ohio)));
  }
  return [...primary, ...ADDITIONAL_SUPPORT_RESOURCES];
}

export function formatResourceContact(r: SupportResource): string {
  const parts: string[] = [];
  if (r.phone) parts.push(`Call ${r.phone}`);
  if (r.textInstruction) parts.push(r.textInstruction);
  if (parts.length === 0) return r.detail;
  return `${parts.join(" · ")} — ${r.detail}`;
}
