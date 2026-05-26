/**
 * UH Psychiatry rotation orientation — **Mak internal background only**.
 * Logistics from the resident Google Site; not shown in UI or auto-disclosed to residents.
 * Helps Mak with lattice placement, capture questions, debriefs, and Output Studio framing.
 */

import index from "../../../../docs/seeds/uh-rotation-orientations/index.json";
import cl from "../../../../docs/seeds/uh-rotation-orientations/cl.json";
import mpuCl from "../../../../docs/seeds/uh-rotation-orientations/mpu_cl.json";
import vaCt6 from "../../../../docs/seeds/uh-rotation-orientations/va_ct6.json";
import capu from "../../../../docs/seeds/uh-rotation-orientations/capu.json";
import uhConcord from "../../../../docs/seeds/uh-rotation-orientations/uh_concord.json";
import northcoast from "../../../../docs/seeds/uh-rotation-orientations/northcoast.json";
import call from "../../../../docs/seeds/uh-rotation-orientations/call.json";
import neurology from "../../../../docs/seeds/uh-rotation-orientations/neurology.json";
import psychEdVa from "../../../../docs/seeds/uh-rotation-orientations/psych_ed_va.json";
import outpatientChild from "../../../../docs/seeds/uh-rotation-orientations/outpatient_child.json";
import medtox from "../../../../docs/seeds/uh-rotation-orientations/medtox.json";
import vaIm from "../../../../docs/seeds/uh-rotation-orientations/va_im.json";
import elective from "../../../../docs/seeds/uh-rotation-orientations/elective.json";
import { buildElectiveCatalogMakContext } from "@/lib/v2/programs/elective-catalog";
import { buildClinicalGuidesMakContext } from "@/lib/v2/programs/program-clinical-guides";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

export type RotationOrientationPack = {
  rotation_code: string;
  service_name: string;
  category: "psychiatry_core" | "off_service" | "operational" | "elective" | "longitudinal";
  source: {
    website_section?: string;
    last_updated?: string;
    drive_files?: Array<{ label: string; url: string }>;
    curriculum_seed?: string | null;
  };
  prior_to_rotation: string[];
  overview: string;
  location?: string[];
  personnel?: string[];
  schedule?: string[];
  logistics?: string[];
  resources?: string[];
  recommended_reading?: string[];
  debrief_prompts: string[];
  capture_tags: string[];
};

type OrientationIndexEntry = {
  rotation_code: string;
  service_name: string;
  category: RotationOrientationPack["category"];
  orientation_seed?: string;
  curriculum_seed?: string | null;
  website_section: string;
  last_updated?: string;
  status: "seeded" | "orientation_only" | "pending";
  drive_files?: Array<{ label: string; url: string }>;
  aliases?: string[];
};

/** Prepended to every Mak background block — residents never see this. */
export const MAK_TRAINEE_BACKGROUND_RULES = `[Mak internal — program & rotation background]
Do NOT recite rotation logistics, schedules, site addresses, or personnel unless the resident explicitly asks.
Do NOT mention orientation packs, seeds, or that you have program documentation.
Use silently to: ask sharper capture/debrief questions; suggest career lattice domain×track; frame Output Studio drafts (ILP, career narrative, CV bullets) in residency-appropriate language; connect moments to ACGME/ILP themes when natural.
For suicide/violence assessment topics: help residents identify factors they considered — never assign or state low/moderate/high risk for any patient.
Never invent patient details or claim the resident did specific rotation tasks they have not described.`;

const PACKS: Record<string, RotationOrientationPack> = {
  cl: cl as RotationOrientationPack,
  mpu_cl: mpuCl as RotationOrientationPack,
  va_ct6: vaCt6 as RotationOrientationPack,
  capu: capu as RotationOrientationPack,
  uh_concord: uhConcord as RotationOrientationPack,
  northcoast: northcoast as RotationOrientationPack,
  call: call as RotationOrientationPack,
  neurology: neurology as RotationOrientationPack,
  psych_ed_uh_va: psychEdVa as RotationOrientationPack,
  outpatient_child: outpatientChild as RotationOrientationPack,
  medtox: medtox as RotationOrientationPack,
  va_im: vaIm as RotationOrientationPack,
  elective: elective as RotationOrientationPack,
};

/** Tag → suggested lattice domain × track (for activity capture & lattice interpretation). */
const CAPTURE_TAG_LATTICE: Record<string, Array<{ domain: string; track: string }>> = {
  "consult note": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Communication", track: "Clinician" },
  ],
  "capacity evaluation": [{ domain: "Clinical Expertise", track: "Clinician" }],
  delirium: [{ domain: "Clinical Expertise", track: "Clinician" }],
  "team communication": [{ domain: "Communication", track: "Clinician" }],
  "collateral history": [{ domain: "Communication", track: "Clinician" }],
  "suicide risk assessment": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Professionalism & Ethics", track: "Quality/Safety" },
  ],
  "forensic psychiatry": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Systems Thinking", track: "Advocate" },
  ],
  "child psychiatry": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "family meeting": [{ domain: "Communication", track: "Clinician" }],
  "interdisciplinary team": [{ domain: "Collaboration & Teamwork", track: "Clinician" }],
  "after-hours coverage": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "psychiatric emergency": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "neurology consult": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Scholarship & Learning", track: "Clinician" },
  ],
  "med-psych interface": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Systems Thinking", track: "Quality/Safety" },
  ],
  "involuntary commitment": [
    { domain: "Systems Thinking", track: "Advocate" },
    { domain: "Professionalism & Ethics", track: "Clinician" },
  ],
  "ED consultation": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "disposition planning": [{ domain: "Systems Thinking", track: "Clinician" }],
  "graduated responsibility": [{ domain: "Personal & Professional Development", track: "Clinician" }],
  "outpatient psychiatry": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Communication", track: "Clinician" },
  ],
  telepsychiatry: [{ domain: "Communication", track: "Clinician" }],
  "medication management": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "medical toxicology": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Scholarship & Learning", track: "Researcher" },
  ],
  MAT: [{ domain: "Clinical Expertise", track: "Clinician" }],
  "addiction psychiatry": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "case presentation": [{ domain: "Scholarship & Learning", track: "Educator" }],
  "internal medicine wards": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Scholarship & Learning", track: "Clinician" },
  ],
  "admission H&P": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "differential diagnosis": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "bedside teaching": [{ domain: "Communication", track: "Educator" }],
  "care coordination": [
    { domain: "Systems Thinking", track: "Clinician" },
    { domain: "Collaboration & Teamwork", track: "Clinician" },
  ],
  procedure: [{ domain: "Clinical Expertise", track: "Clinician" }],
  "resource utilization": [{ domain: "Systems Thinking", track: "Quality/Safety" }],
  "risk assessment": [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Professionalism & Ethics", track: "Quality/Safety" },
  ],
  "safety planning": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "violence assessment": [{ domain: "Clinical Expertise", track: "Clinician" }],
  "suicide prevention": [{ domain: "Professionalism & Ethics", track: "Quality/Safety" }],
  "lethal means counseling": [{ domain: "Clinical Expertise", track: "Clinician" }],
};

const CATEGORY_LATTICE_DEFAULTS: Record<
  RotationOrientationPack["category"],
  Array<{ domain: string; track: string }>
> = {
  psychiatry_core: [{ domain: "Clinical Expertise", track: "Clinician" }],
  off_service: [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Scholarship & Learning", track: "Clinician" },
  ],
  operational: [{ domain: "Clinical Expertise", track: "Clinician" }],
  elective: [{ domain: "Personal & Professional Development", track: "Clinician" }],
  longitudinal: [
    { domain: "Clinical Expertise", track: "Clinician" },
    { domain: "Communication", track: "Educator" },
  ],
};

export const UH_ROTATION_ORIENTATION_INDEX = index.rotations as OrientationIndexEntry[];

export function listRotationOrientationIndex(): OrientationIndexEntry[] {
  return UH_ROTATION_ORIENTATION_INDEX;
}

export function getRotationOrientationPack(
  rotationCodeOrLabel: string | null | undefined,
): RotationOrientationPack | null {
  if (!rotationCodeOrLabel?.trim()) return null;
  const key = normalizeRotationCode(rotationCodeOrLabel);
  return PACKS[key] ?? null;
}

export function normalizeRotationCode(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const byCode = UH_ROTATION_ORIENTATION_INDEX.find((r) => r.rotation_code === trimmed);
  if (byCode) return byCode.rotation_code;
  const byLabel = UH_ROTATION_ORIENTATION_INDEX.find(
    (r) => r.service_name.toLowerCase() === trimmed,
  );
  if (byLabel) return byLabel.rotation_code;
  const byAlias = UH_ROTATION_ORIENTATION_INDEX.find((r) =>
    r.aliases?.some((a) => a.toLowerCase() === trimmed),
  );
  return byAlias?.rotation_code ?? trimmed.replace(/\s+/g, "_");
}

export function suggestLatticePlacements(
  pack: RotationOrientationPack | null,
): Array<{ domain: string; track: string }> {
  if (!pack) return [];
  const seen = new Set<string>();
  const out: Array<{ domain: string; track: string }> = [];

  function add(items: Array<{ domain: string; track: string }>) {
    for (const item of items) {
      const key = `${item.domain}:${item.track}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    }
  }

  add(CATEGORY_LATTICE_DEFAULTS[pack.category] ?? []);
  for (const tag of pack.capture_tags) {
    add(CAPTURE_TAG_LATTICE[tag] ?? []);
  }
  return out.slice(0, 6);
}

function formatPackBackground(pack: RotationOrientationPack, pgyLevel?: string | null): string {
  const lattice = suggestLatticePlacements(pack);
  return [
    `Current rotation: ${pack.service_name} (${pack.category.replace(/_/g, " ")}).`,
    pgyLevel ? `PGY: ${pgyLevel}.` : "",
    `Clinical context: ${pack.overview}`,
    pack.logistics?.length ? `Workflow notes: ${pack.logistics.slice(0, 3).join(" ")}` : "",
    lattice.length
      ? `Lattice placement hints: ${lattice.map((l) => `${l.domain} × ${l.track}`).join("; ")}.`
      : "",
    pack.capture_tags.length ? `Capture themes: ${pack.capture_tags.join(", ")}.` : "",
    pack.debrief_prompts.length
      ? `Debrief question bank (use adaptively, one at a time): ${pack.debrief_prompts.slice(0, 3).join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Full Mak background for institutional UH Psychiatry trainees.
 * Inject into system context only — never render in UI or user-facing copy.
 */
export function resolveTraineeBackgroundPurpose(input: {
  flowIntent?: string | null;
  section?: string;
  hasRotationDebriefSession?: boolean;
}): "chat" | "lattice" | "output_studio" | "debrief" {
  if (input.hasRotationDebriefSession || input.flowIntent === "rotation_debrief") {
    return "debrief";
  }
  if (input.flowIntent === "capture") return "lattice";
  if (
    input.section === "output" ||
    input.flowIntent === "create" ||
    input.flowIntent === "personal_statement_arc" ||
    input.flowIntent === "promotion_dossier" ||
    input.flowIntent === "pivot_narrative" ||
    input.flowIntent === "fellowship_mining"
  ) {
    return "output_studio";
  }
  return "chat";
}

export function buildTraineeProgramBackgroundForMak(input: {
  program?: ResidencyProgram | null;
  currentRotation?: string | null;
  pgyLevel?: string | null;
  traineeInitials?: string | null;
  purpose?: "chat" | "lattice" | "output_studio" | "debrief";
}): string {
  if (!input.program) return "";

  const pack = getRotationOrientationPack(input.currentRotation ?? null);
  const electiveContext =
    input.program.slug === "uh-psych-cmc"
      ? buildElectiveCatalogMakContext({
          pgyLevel: input.pgyLevel,
          currentRotation: input.currentRotation,
          purpose: input.purpose,
        })
      : "";

  const clinicalGuideContext =
    input.program.slug === "uh-psych-cmc"
      ? buildClinicalGuidesMakContext({
          program: input.program,
          purpose: input.purpose,
        })
      : "";

  const purposeHint =
    input.purpose === "lattice"
      ? "Focus: help classify activities into domain×track using rotation context."
      : input.purpose === "output_studio"
        ? "Focus: frame career documents (ILP, narrative, CV bullets) using rotation-appropriate competency language — not logistics."
        : input.purpose === "debrief"
          ? "Focus: adaptive debrief questions from the question bank; do not lecture about the rotation."
          : "";

  return [
    MAK_TRAINEE_BACKGROUND_RULES,
    "",
    `Program: ${input.program.display_title} · ${input.program.academic_year}.`,
    input.traineeInitials ? `Roster initials: ${input.traineeInitials}.` : "",
    purposeHint,
    pack ? formatPackBackground(pack, input.pgyLevel) : "",
    electiveContext,
    clinicalGuideContext,
    !pack && input.currentRotation
      ? `Current rotation label: ${input.currentRotation} (no orientation pack seeded yet).`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** @deprecated Use buildTraineeProgramBackgroundForMak — kept for internal callers migrating */
export function buildRotationOrientationMakContext(input: {
  rotationCodeOrLabel?: string | null;
  pgyLevel?: string | null;
}): string {
  const pack = getRotationOrientationPack(input.rotationCodeOrLabel ?? null);
  if (!pack) return "";
  return formatPackBackground(pack, input.pgyLevel);
}
