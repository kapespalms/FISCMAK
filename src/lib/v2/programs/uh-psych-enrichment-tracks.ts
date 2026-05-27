/** UH Psychiatry residency enrichment tracks — institutional onboarding only. */

export type UhPsychEnrichmentTrack = {
  id: string;
  title: string;
  description: string;
  eligibility: string;
};

export const UH_PSYCH_ENRICHMENT_TRACKS: UhPsychEnrichmentTrack[] = [
  {
    id: "lme",
    title: "Leadership in Medical Education (LME) Track",
    description:
      "Three-year track with seminars on adult learning theory, educational research projects, and teaching opportunities.",
    eligibility: "Open to PGY-2 residents (usually applied for during PGY-1).",
  },
  {
    id: "reproductive_psychiatry",
    title: "Reproductive Psychiatry Track",
    description:
      "Clinical experiences and scholarly work focused on mental health across the reproductive lifecycle, in partnership with the Public and Community Psychiatry Fellowship.",
    eligibility: "Open to psychiatric physicians in the program.",
  },
  {
    id: "public_community_psychiatry",
    title: "Public and Community Psychiatry Fellowship",
    description:
      "Non-ACGME fellowship pathway emphasizing community psychiatry, public mental health systems, and population-level care.",
    eligibility: "Non-ACGME — open to eligible psychiatric physicians.",
  },
];
