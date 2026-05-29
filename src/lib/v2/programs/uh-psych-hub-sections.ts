/**
 * UH Psych Hub — training-level rotation groupings (mirrors resident Google Site IA).
 */

export type UhPsychHubSection = {
  id: string;
  title: string;
  slugs: string[];
};

export const UH_PGY12_HUB_SECTIONS: UhPsychHubSection[] = [
  {
    id: "inpatient",
    title: "Inpatient psychiatry",
    slugs: [
      "call",
      "cl",
      "elective",
      "geriatric_psychiatry",
      "northcoast",
      "uh_concord",
      "swg",
      "va_ct6",
      "capu",
      "mpu_cl",
    ],
  },
  {
    id: "off_service",
    title: "Off-service",
    slugs: [
      "uh_ed",
      "va_ed_im",
      "peds_ed",
      "va_im",
      "uh_im",
      "medtox",
      "neurology",
    ],
  },
  {
    id: "early_outpatient",
    title: "Outpatient & specialty (PGY1/2 blocks)",
    slugs: [
      "access_clinic",
      "outpatient_addiction",
      "psych_ed_uh_va",
      "psych_ed_uh",
      "uh_interventional",
    ],
  },
];

export const UH_PGY34_HUB_SECTIONS: UhPsychHubSection[] = [
  {
    id: "longitudinal",
    title: "Longitudinal outpatient",
    slugs: [
      "outpatient_adult",
      "outpatient_child",
      "psychotherapy_clinic",
      "access_clinic",
      "outpatient_addiction",
      "geriatric_psychiatry",
      "uh_interventional",
    ],
  },
  {
    id: "senior",
    title: "Senior year & electives",
    slugs: ["elective", "extra_duty", "qi"],
  },
];

export const UH_PROGRAM_ADMIN_SLUGS = ["clinical-skills", "electives"] as const;

export type SemiAnnualReviewItem = {
  id: string;
  label: string;
  href: string;
  detail: string;
};

export const SEMI_ANNUAL_REVIEW_ITEMS: SemiAnnualReviewItem[] = [
  {
    id: "cv",
    label: "Updated CV",
    href: "/app/career-data",
    detail: "Upload or refresh your CV in Career Data before the meeting.",
  },
  {
    id: "smart_goals",
    label: "SMART goals & ILP",
    href: "/app/strategy",
    detail: "Review individualized learning plan goals and career direction with Mak.",
  },
  {
    id: "portfolio",
    label: "MedHub portfolio",
    href: "/app/output",
    detail: "Portfolio entries, clinical skills verification, and evidence drafts.",
  },
  {
    id: "evaluations",
    label: "MedHub evaluations",
    href: "/app/schedule?tab=links",
    detail: "Pull up recent rotation evals — discuss progress and faculty feedback.",
  },
];

export const SEMI_ANNUAL_MEETING = {
  title: "Semi-annual review",
  hosts: "Program Director Dr. Kathleen Cerny or APD Dr. Andrew Hunt",
  cadence: "Twice per year — bring updated CV, SMART goals, portfolio, and be ready to discuss MedHub evaluations.",
};
