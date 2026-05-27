import type { ProgramRotation } from "@/lib/v2/programs/registry";

export type RotationCatalogSection = {
  id: string;
  title: string;
  description: string;
  rotationCodes: string[];
};

/** MECE-ish catalog groupings for UH Psychiatry rotation reference. */
export const UH_PSYCH_ROTATION_SECTIONS: RotationCatalogSection[] = [
  {
    id: "overview",
    title: "Overview",
    description:
      "PGY-1 and PGY-2 follow the published block schedule (inpatient-heavy, structured rotations). PGY-3 and PGY-4 shift toward longitudinal outpatient, electives, and individualized weekly schedules set every 6–12 months.",
    rotationCodes: [],
  },
  {
    id: "inpatient",
    title: "Inpatient",
    description: "Adult and child inpatient units, emergency psychiatry, and night float.",
    rotationCodes: [
      "va_ct6",
      "uh_concord",
      "swg",
      "northcoast",
      "capu",
      "psych_ed_uh",
      "psych_ed_uh_va",
      "call",
      "nf",
    ],
  },
  {
    id: "outpatient",
    title: "Outpatient & clinics",
    description: "Ambulatory clinics, psychotherapy, access, addiction, and geriatric outpatient.",
    rotationCodes: [
      "outpatient_adult",
      "outpatient_child",
      "outpatient_addiction",
      "va_addiction",
      "mat_addiction",
      "access_clinic",
      "psychotherapy_clinic",
      "geriatric_psychiatry",
      "uh_interventional",
    ],
  },
  {
    id: "consult",
    title: "Consultation & liaison",
    description: "C-L psychiatry across adult, MPU, and child services.",
    rotationCodes: ["cl", "mpu_cl", "child_cl"],
  },
  {
    id: "off_service",
    title: "Off-service",
    description: "Required medicine, neurology, pediatrics, ED, and toxicology blocks.",
    rotationCodes: [
      "neurology",
      "va_im",
      "va_ed_im",
      "uh_ed",
      "uh_im",
      "pediatrics",
      "peds_ed",
      "medtox",
    ],
  },
  {
    id: "elective",
    title: "Electives & enrichment",
    description: "Individualized electives, QI, vacation, and extra duty.",
    rotationCodes: ["elective", "qi", "vacation", "extra_duty"],
  },
];

const INPATIENT_CODES = new Set(
  UH_PSYCH_ROTATION_SECTIONS.find((s) => s.id === "inpatient")!.rotationCodes,
);
const OUTPATIENT_CODES = new Set(
  UH_PSYCH_ROTATION_SECTIONS.find((s) => s.id === "outpatient")!.rotationCodes,
);

export function rotationCatalogForProgram(rotations: ProgramRotation[]) {
  const byCode = new Map(rotations.map((r) => [r.code, r]));
  return UH_PSYCH_ROTATION_SECTIONS.map((section) => ({
    ...section,
    rotations: section.rotationCodes
      .map((code) => byCode.get(code))
      .filter((r): r is ProgramRotation => Boolean(r)),
  }));
}

export function groupedRotationsForSelect(rotations: ProgramRotation[]) {
  const used = new Set<string>();
  const groups = UH_PSYCH_ROTATION_SECTIONS.filter((s) => s.id !== "overview").map(
    (section) => {
      const items = section.rotationCodes
        .map((code) => rotations.find((r) => r.code === code))
        .filter((r): r is ProgramRotation => {
          if (!r) return false;
          used.add(r.code);
          return true;
        });
      return { label: section.title, rotations: items };
    },
  );
  const rest = rotations.filter((r) => !used.has(r.code));
  if (rest.length) groups.push({ label: "Other", rotations: rest });
  return groups;
}

export function isBlockSchedulePgy(pgy: string | null | undefined): boolean {
  return pgy === "PGY-1" || pgy === "PGY-2";
}

export function rotationTone(code: string): string {
  if (INPATIENT_CODES.has(code)) return "bg-violet-100 text-violet-900 border-violet-200";
  if (OUTPATIENT_CODES.has(code)) return "bg-sky-100 text-sky-900 border-sky-200";
  if (code === "cl" || code === "mpu_cl" || code === "child_cl") {
    return "bg-amber-100 text-amber-900 border-amber-200";
  }
  if (code === "elective" || code === "qi") return "bg-emerald-100 text-emerald-900 border-emerald-200";
  if (code === "vacation" || code === "extra_duty" || code === "call" || code === "nf") {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }
  return "bg-cx-forest-dark/10 text-cx-forest-dark border-cx-forest-dark/15";
}
