import type { AppUser, Job } from "@/lib/v2/types";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { ACGME_SPECIALTIES } from "@/lib/v2/onboarding-options";

/** Board-certifiable base specialties that commonly have fellowship pathways. */
export const SUBSPECIALTIES_BY_BASE: Record<string, readonly string[]> = {
  "Internal Medicine": [
    "Adolescent Medicine",
    "Cardiovascular Disease",
    "Clinical Cardiac Electrophysiology",
    "Critical Care Medicine",
    "Endocrinology, Diabetes and Metabolism",
    "Gastroenterology",
    "Geriatric Medicine",
    "Hematology",
    "Hematology and Oncology",
    "Infectious Disease",
    "Interventional Cardiology",
    "Nephrology",
    "Pulmonary Disease",
    "Rheumatology",
    "Sleep Medicine",
    "Hospice and Palliative Medicine",
  ],
  Pediatrics: [
    "Adolescent Medicine",
    "Child Neurology",
    "Developmental-Behavioral Pediatrics",
    "Neonatal-Perinatal Medicine",
    "Pediatric Cardiology",
    "Pediatric Critical Care Medicine",
    "Pediatric Emergency Medicine",
    "Pediatric Endocrinology",
    "Pediatric Gastroenterology",
    "Pediatric Hematology-Oncology",
    "Pediatric Hospital Medicine",
    "Pediatric Infectious Diseases",
    "Pediatric Nephrology",
    "Pediatric Pulmonology",
    "Pediatric Rheumatology",
  ],
  Surgery: [
    "Colon and Rectal Surgery",
    "Hand Surgery",
    "Orthopaedic Sports Medicine",
    "Pediatric Surgery",
    "Surgical Critical Care",
    "Thoracic Surgery",
    "Vascular Surgery",
  ],
  "Obstetrics and Gynecology": [
    "Female Pelvic Medicine and Reconstructive Surgery",
    "Gynecologic Oncology",
    "Maternal-Fetal Medicine",
  ],
  Psychiatry: [
    "Addiction Psychiatry",
    "Child and Adolescent Psychiatry",
    "Forensic Psychiatry",
    "Geriatric Psychiatry",
  ],
  Neurology: [
    "Clinical Neurophysiology",
    "Epilepsy",
    "Neurocritical Care",
    "Vascular Neurology",
  ],
  "Physical Medicine and Rehabilitation": [
    "Neurotology",
    "Pediatric Rehabilitation Medicine",
    "Spinal Cord Injury Medicine",
  ],
  Radiology: [
    "Interventional Radiology",
    "Neuroradiology",
    "Nuclear Radiology",
    "Pediatric Radiology",
  ],
  "Radiology - Diagnostic": [
    "Interventional Radiology",
    "Neuroradiology",
    "Nuclear Radiology",
    "Pediatric Radiology",
  ],
  Anesthesiology: ["Critical Care Medicine", "Pain Medicine"],
  "Emergency Medicine": [
    "Emergency Medical Services",
    "Medical Toxicology",
    "Pediatric Emergency Medicine",
  ],
  "Family Medicine": [
    "Geriatric Medicine",
    "Hospice and Palliative Medicine",
    "Sleep Medicine",
    "Sports Medicine",
  ],
  Dermatology: ["Dermatopathology"],
  Pathology: [
    "Anatomic and Clinical Pathology",
    "Blood Banking/Transfusion Medicine",
    "Cytopathology",
    "Forensic Pathology",
    "Neuropathology",
  ],
};

const ALL_SUBSPECIALTIES = new Set(
  Object.values(SUBSPECIALTIES_BY_BASE).flatMap((list) => list),
);

const SUBSPECIALTY_TO_BASE = new Map<string, string>();
for (const [base, subs] of Object.entries(SUBSPECIALTIES_BY_BASE)) {
  for (const sub of subs) {
    if (!SUBSPECIALTY_TO_BASE.has(sub)) SUBSPECIALTY_TO_BASE.set(sub, base);
  }
}

/** Primary specialties for intake (base training programs). */
export const BASE_SPECIALTIES: readonly string[] = [
  ...new Set([
    ...Object.keys(SUBSPECIALTIES_BY_BASE),
    ...ACGME_SPECIALTIES.filter((s) => !ALL_SUBSPECIALTIES.has(s)),
  ]),
].sort((a, b) => a.localeCompare(b));

export type SpecialtyProfile = {
  base_specialty: string | null;
  subspecialty: string | null;
  subspecialty_training_complete: boolean;
  /** Legacy display field — effective practice specialty */
  specialty: string | null;
};

export function subspecialtiesForBase(base: string): string[] {
  return [...(SUBSPECIALTIES_BY_BASE[base] ?? [])].sort((a, b) => a.localeCompare(b));
}

export function hasSubspecialtyOptions(base: string): boolean {
  return subspecialtiesForBase(base).length > 0;
}

export function isValidBaseSpecialty(value: string): boolean {
  return BASE_SPECIALTIES.includes(value);
}

export function isValidSubspecialtyForBase(base: string, subspecialty: string): boolean {
  return subspecialtiesForBase(base).includes(subspecialty);
}

export function findBaseForSubspecialty(subspecialty: string): string | null {
  return SUBSPECIALTY_TO_BASE.get(subspecialty) ?? null;
}

export function migrateLegacySpecialty(specialty: string | null): SpecialtyProfile {
  if (!specialty) {
    return {
      base_specialty: null,
      subspecialty: null,
      subspecialty_training_complete: false,
      specialty: null,
    };
  }
  const parent = findBaseForSubspecialty(specialty);
  if (parent) {
    return {
      base_specialty: parent,
      subspecialty: specialty,
      subspecialty_training_complete: true,
      specialty,
    };
  }
  return {
    base_specialty: specialty,
    subspecialty: null,
    subspecialty_training_complete: false,
    specialty,
  };
}

export function normalizeSpecialtyProfile(
  user: Pick<
    AppUser,
    | "specialty"
    | "base_specialty"
    | "subspecialty"
    | "subspecialty_training_complete"
    | "career_stage"
  >,
): SpecialtyProfile {
  if (user.base_specialty) {
    const specialty =
      user.subspecialty && user.subspecialty_training_complete
        ? user.subspecialty
        : user.base_specialty;
    return {
      base_specialty: user.base_specialty,
      subspecialty: user.subspecialty,
      subspecialty_training_complete: Boolean(user.subspecialty_training_complete),
      specialty,
    };
  }
  return migrateLegacySpecialty(user.specialty);
}

export function defaultTrainingComplete(
  careerStage: CareerStage | null | undefined,
  subspecialty: string | null,
): boolean {
  if (!subspecialty) return false;
  if (careerStage === "Fellow" || careerStage === "Resident" || careerStage === "Medical Student") {
    return false;
  }
  return true;
}

export function buildSpecialtyStorage(input: {
  base_specialty: string;
  subspecialty?: string | null;
  subspecialty_training_complete?: boolean;
  career_stage?: CareerStage | null;
}): SpecialtyProfile {
  const subspecialty = input.subspecialty?.trim() || null;
  let subspecialty_training_complete =
    input.subspecialty_training_complete ??
    defaultTrainingComplete(input.career_stage, subspecialty);

  if (!subspecialty) {
    subspecialty_training_complete = false;
  }

  const specialty =
    subspecialty && subspecialty_training_complete ? subspecialty : input.base_specialty;

  return {
    base_specialty: input.base_specialty,
    subspecialty,
    subspecialty_training_complete,
    specialty,
  };
}

export function formatSpecialtyLine(profile: SpecialtyProfile): string {
  if (!profile.base_specialty) return profile.specialty ?? "Medicine";
  if (!profile.subspecialty) return profile.base_specialty;
  if (profile.subspecialty_training_complete) return profile.subspecialty;
  return `${profile.base_specialty} · ${profile.subspecialty} (fellowship in progress)`;
}

export type JobSpecialtyRequirement = {
  baseSpecialty: string | null;
  requiredSubspecialty: string | null;
  acceptsBaseOnly: boolean;
};

const CARDIOLOGY_SUBSPECIALTIES = new Set([
  "Cardiovascular Disease",
  "Interventional Cardiology",
  "Clinical Cardiac Electrophysiology",
  "Pediatric Cardiology",
]);

export function inferJobSpecialtyRequirement(
  job: Pick<Job, "title" | "specialties" | "required_subspecialty" | "required_base_specialty">,
): JobSpecialtyRequirement {
  if (job.required_subspecialty) {
    const base =
      job.required_base_specialty ??
      findBaseForSubspecialty(job.required_subspecialty) ??
      job.specialties[0] ??
      null;
    return {
      baseSpecialty: base,
      requiredSubspecialty: job.required_subspecialty,
      acceptsBaseOnly: false,
    };
  }

  const title = job.title.toLowerCase();
  const tags = job.specialties.map((s) => s.toLowerCase());

  if (/interventional cardiolog/.test(title)) {
    return {
      baseSpecialty: "Internal Medicine",
      requiredSubspecialty: "Interventional Cardiology",
      acceptsBaseOnly: false,
    };
  }
  if (/cardiolog|electrophysiolog/.test(title) || tags.includes("cardiology")) {
    return {
      baseSpecialty: "Internal Medicine",
      requiredSubspecialty: "Cardiovascular Disease",
      acceptsBaseOnly: false,
    };
  }
  if (
    /hospitalist|general internist|internal medicine physician/.test(title) ||
    (tags.includes("internal medicine") && !tags.includes("cardiology"))
  ) {
    return {
      baseSpecialty: "Internal Medicine",
      requiredSubspecialty: null,
      acceptsBaseOnly: true,
    };
  }

  const baseFromTags = job.specialties.find((s) => isValidBaseSpecialty(s)) ?? job.specialties[0] ?? null;
  return {
    baseSpecialty: baseFromTags,
    requiredSubspecialty: null,
    acceptsBaseOnly: true,
  };
}

/**
 * 0–1 specialty alignment for job matching.
 * Subspecialty-required roles score low for base-only physicians.
 */
export function computeSpecialtyMatchScore(
  job: Pick<Job, "title" | "specialties" | "required_subspecialty" | "required_base_specialty">,
  user: Pick<
    AppUser,
    | "specialty"
    | "base_specialty"
    | "subspecialty"
    | "subspecialty_training_complete"
    | "career_stage"
  >,
): number {
  const profile = normalizeSpecialtyProfile(user);
  const req = inferJobSpecialtyRequirement(job);

  if (!profile.base_specialty) return 0.5;

  if (req.requiredSubspecialty) {
    const baseMatch = profile.base_specialty === req.baseSpecialty ? 1 : 0.4;
    if (baseMatch < 0.5) return 0.2;

    if (
      profile.subspecialty === req.requiredSubspecialty &&
      profile.subspecialty_training_complete
    ) {
      return 1;
    }

    if (profile.subspecialty === req.requiredSubspecialty && !profile.subspecialty_training_complete) {
      return 0.55;
    }

    if (
      profile.subspecialty &&
      profile.subspecialty_training_complete &&
      CARDIOLOGY_SUBSPECIALTIES.has(profile.subspecialty) &&
      CARDIOLOGY_SUBSPECIALTIES.has(req.requiredSubspecialty)
    ) {
      return 0.75;
    }

    if (!profile.subspecialty) {
      return 0.12;
    }

    return 0.25;
  }

  if (req.baseSpecialty && profile.base_specialty === req.baseSpecialty) {
    return 1;
  }

  if (
    profile.subspecialty &&
    profile.subspecialty_training_complete &&
    req.baseSpecialty &&
    findBaseForSubspecialty(profile.subspecialty) === req.baseSpecialty
  ) {
    return 0.9;
  }

  if (req.baseSpecialty && profile.base_specialty !== req.baseSpecialty) {
    return 0.35;
  }

  return 0.6;
}

export function filterBaseSpecialties(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...BASE_SPECIALTIES];
  return BASE_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
}

export function filterSubspecialties(base: string, query: string): string[] {
  const q = query.trim().toLowerCase();
  const list = subspecialtiesForBase(base);
  if (!q) return list;
  return list.filter((s) => s.toLowerCase().includes(q));
}
