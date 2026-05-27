import type { AppUser, Job } from "@/lib/v2/types";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { isTraineeCareerLevel } from "@/lib/v2/onboarding-options";
import {
  getPrimaryForSubspecialty,
  getSubsByPrimaryRecord,
  isAcgmePrimarySpecialty,
  isAcgmeSubspecialtyForPrimary,
  listAcgmePrimarySpecialtyNames,
  listAllAcgmeProgramNames,
  normalizeToAcgmePrimaryName,
  normalizeToAcgmeSubspecialtyName,
} from "@/lib/v2/gme/acgme-specialty-registry";
export const SUBSPECIALTIES_BY_BASE: Record<string, readonly string[]> = getSubsByPrimaryRecord();

/** ACGME-accredited primary (core) residency specialties — Appendix B 2024-2025. */
export const BASE_SPECIALTIES: readonly string[] = listAcgmePrimarySpecialtyNames();

/** All ACGME primary + subspecialty program names for attending search / legacy lists. */
export const ACGME_PROGRAM_NAMES: readonly string[] = [...listAllAcgmeProgramNames(), "Other"];

export type SpecialtyProfile = {
  base_specialty: string | null;
  subspecialty: string | null;
  subspecialty_training_complete: boolean;
  /** Legacy display field — effective practice specialty */
  specialty: string | null;
};

export function subspecialtiesForBase(base: string): string[] {
  const normalized = normalizeToAcgmePrimaryName(base) ?? base;
  return [...(SUBSPECIALTIES_BY_BASE[normalized] ?? [])].sort((a, b) => a.localeCompare(b));
}

export function hasSubspecialtyOptions(base: string): boolean {
  return subspecialtiesForBase(base).length > 0;
}

export function isValidBaseSpecialty(value: string): boolean {
  return isAcgmePrimarySpecialty(value);
}

export function isValidSubspecialtyForBase(base: string, subspecialty: string): boolean {
  return isAcgmeSubspecialtyForPrimary(base, subspecialty);
}

export function findBaseForSubspecialty(subspecialty: string): string | null {
  const primary = getPrimaryForSubspecialty(subspecialty);
  return primary?.name ?? null;
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
  const normalizedSub = normalizeToAcgmeSubspecialtyName(specialty);
  if (normalizedSub) {
    const parent = findBaseForSubspecialty(normalizedSub);
    if (parent) {
      return {
        base_specialty: parent,
        subspecialty: normalizedSub,
        subspecialty_training_complete: true,
        specialty: normalizedSub,
      };
    }
  }
  const normalizedBase = normalizeToAcgmePrimaryName(specialty);
  return {
    base_specialty: normalizedBase ?? specialty,
    subspecialty: null,
    subspecialty_training_complete: false,
    specialty: normalizedBase ?? specialty,
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
    const base = normalizeToAcgmePrimaryName(user.base_specialty) ?? user.base_specialty;
    const sub = user.subspecialty
      ? normalizeToAcgmeSubspecialtyName(user.subspecialty, base) ?? user.subspecialty
      : null;
    const specialty =
      sub && user.subspecialty_training_complete ? sub : base;
    return {
      base_specialty: base,
      subspecialty: sub,
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
  const base = normalizeToAcgmePrimaryName(input.base_specialty) ?? input.base_specialty;
  const subspecialtyRaw = input.subspecialty?.trim() || null;
  const subspecialty = subspecialtyRaw
    ? normalizeToAcgmeSubspecialtyName(subspecialtyRaw, base) ?? subspecialtyRaw
    : null;
  let subspecialty_training_complete =
    input.subspecialty_training_complete ??
    defaultTrainingComplete(input.career_stage, subspecialty);

  if (!subspecialty) {
    subspecialty_training_complete = false;
  }

  const specialty =
    subspecialty && subspecialty_training_complete ? subspecialty : base;

  return {
    base_specialty: base,
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
  "Cardiovascular disease",
  "Interventional cardiology",
  "Clinical cardiac electrophysiology",
  "Pediatric cardiology",
]);

export function inferJobSpecialtyRequirement(
  job: Pick<Job, "title" | "specialties" | "required_subspecialty" | "required_base_specialty">,
): JobSpecialtyRequirement {
  if (job.required_subspecialty) {
    const normalizedSub =
      normalizeToAcgmeSubspecialtyName(job.required_subspecialty) ?? job.required_subspecialty;
    const base =
      job.required_base_specialty ??
      findBaseForSubspecialty(normalizedSub) ??
      job.specialties[0] ??
      null;
    return {
      baseSpecialty: base,
      requiredSubspecialty: normalizedSub,
      acceptsBaseOnly: false,
    };
  }

  const title = job.title.toLowerCase();
  const tags = job.specialties.map((s) => s.toLowerCase());

  if (/interventional cardiolog/.test(title)) {
    return {
      baseSpecialty: "Internal medicine",
      requiredSubspecialty: "Interventional cardiology",
      acceptsBaseOnly: false,
    };
  }
  if (/cardiolog|electrophysiolog/.test(title) || tags.includes("cardiology")) {
    return {
      baseSpecialty: "Internal medicine",
      requiredSubspecialty: "Cardiovascular disease",
      acceptsBaseOnly: false,
    };
  }
  if (
    /hospitalist|general internist|internal medicine physician/.test(title) ||
    (tags.includes("internal medicine") && !tags.includes("cardiology"))
  ) {
    return {
      baseSpecialty: "Internal medicine",
      requiredSubspecialty: null,
      acceptsBaseOnly: true,
    };
  }

  const baseFromTags =
    job.specialties.map((s) => normalizeToAcgmePrimaryName(s)).find(Boolean) ??
    job.specialties[0] ??
    null;
  return {
    baseSpecialty: baseFromTags,
    requiredSubspecialty: null,
    acceptsBaseOnly: true,
  };
}

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

export function filterBaseSpecialties(query: string, careerStage?: CareerStage | null): string[] {
  const q = query.trim().toLowerCase();
  const list = BASE_SPECIALTIES;
  if (!q) return [...list];
  return list.filter((s) => s.toLowerCase().includes(q));
}

export function filterSubspecialties(base: string, query: string, careerStage?: CareerStage | null): string[] {
  const q = query.trim().toLowerCase();
  const list =
    careerStage === "Fellow"
      ? [...listAllAcgmeProgramNames()].filter((name) => {
          const parent = getPrimaryForSubspecialty(name);
          return parent != null;
        })
      : subspecialtiesForBase(base);
  if (!q) return list;
  return list.filter((s) => s.toLowerCase().includes(q));
}

/** Trainees must pick from ACGME registry; attendings may use broader program list. */
export function isTraineeSpecialtySelection(value: string, careerStage?: CareerStage | null): boolean {
  if (isTraineeCareerLevel(careerStage)) {
    return isAcgmePrimarySpecialty(value);
  }
  return ACGME_PROGRAM_NAMES.includes(value);
}

export { isTraineeCareerLevel };
