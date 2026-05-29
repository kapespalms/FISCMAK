/**
 * UH Psychiatry master elective catalog — Mak internal background only.
 * Supports elective planning, lattice tagging, and Output Studio framing.
 */

import catalog from "../../../../docs/seeds/uh-rotation-orientations/elective_catalog.json";

export type ElectiveCatalogEntry = {
  id: string;
  name: string;
  category: string;
  location?: string;
  faculty?: string[];
  contact?: string;
  timeframe: "block" | "longitudinal" | "either";
  timeframe_notes?: string;
  patient_care: "active" | "observational" | "both" | "na";
  outpatient_longitudinal?: boolean;
  schedule?: string;
  modality?: string;
  notes?: string;
  pgy_restrictions?: string;
  rotation_code?: string;
  lattice_tags?: string[];
};

type ElectiveCatalog = {
  coordination: {
    pgy3_4_coordinator: string;
    elective_request_contact: string;
    deadline_weeks_before: number;
    affiliation_contact: string;
    process_notes: string[];
  };
  categories: string[];
  category_lattice_hints: Record<string, string>;
  entries: ElectiveCatalogEntry[];
};

const DATA = catalog as ElectiveCatalog;

const ROTATION_CODE_TO_ELECTIVE: Record<string, string> = {
  access_clinic: "access_clinic",
  va_addiction: "addiction_psychiatry_va",
  outpatient_addiction: "addiction_psychiatry_va",
  mat_addiction: "addiction_psychiatry_va",
  geriatric_psychiatry: "geriatric_psychiatry_swg",
  uh_interventional: "va_neuromodulation",
  outpatient_adult: "walker_resident_clinic",
  outpatient_child: "child_psychiatry_ambulatory",
  qi: "quality_improvement",
  capu: "inpatient_child_cap",
  mpu_cl: "mpu",
  cl: "cl_senior",
  northcoast: "northcoast_forensic_long",
};

export function listElectiveCatalogEntries(): ElectiveCatalogEntry[] {
  return DATA.entries;
}

export function listElectiveCategories(): string[] {
  return DATA.categories;
}

export function electiveCatalogCoordination() {
  return DATA.coordination;
}

export type ElectiveCatalogFilters = {
  category?: string;
  timeframe?: ElectiveCatalogEntry["timeframe"] | "all";
  patientCare?: ElectiveCatalogEntry["patient_care"] | "all";
};

export function searchElectiveCatalogEntries(
  query: string,
  filters: ElectiveCatalogFilters = {},
): ElectiveCatalogEntry[] {
  const q = query.trim().toLowerCase();
  return DATA.entries.filter((entry) => {
    if (filters.category && filters.category !== "all" && entry.category !== filters.category) {
      return false;
    }
    if (filters.timeframe && filters.timeframe !== "all" && entry.timeframe !== filters.timeframe) {
      return false;
    }
    if (
      filters.patientCare &&
      filters.patientCare !== "all" &&
      entry.patient_care !== filters.patientCare
    ) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      entry.name,
      entry.category,
      entry.location,
      entry.contact,
      entry.schedule,
      entry.modality,
      entry.notes,
      entry.pgy_restrictions,
      ...(entry.faculty ?? []),
      ...(entry.lattice_tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getElectiveById(id: string): ElectiveCatalogEntry | undefined {
  return DATA.entries.find((e) => e.id === id);
}

export function findElectivesForRotation(rotationCodeOrLabel?: string | null): ElectiveCatalogEntry[] {
  if (!rotationCodeOrLabel?.trim()) return [];
  const code = rotationCodeOrLabel.trim().toLowerCase();
  const mappedId = ROTATION_CODE_TO_ELECTIVE[code];
  if (mappedId) {
    const hit = getElectiveById(mappedId);
    return hit ? [hit] : [];
  }
  const norm = code.replace(/_/g, " ");
  return DATA.entries.filter(
    (e) =>
      e.name.toLowerCase().includes(norm) ||
      e.id.replace(/_/g, " ").includes(norm) ||
      e.rotation_code === code,
  );
}

function formatEntry(e: ElectiveCatalogEntry): string {
  return [
    `${e.name} [${e.category}]`,
    e.location ? `Location: ${e.location}` : "",
    e.faculty?.length ? `Faculty: ${e.faculty.join(", ")}` : "",
    `Timeframe: ${e.timeframe}${e.timeframe_notes ? ` (${e.timeframe_notes})` : ""}`,
    `Patient care: ${e.patient_care}${e.outpatient_longitudinal ? "; counts as outpatient if longitudinal" : ""}`,
    e.schedule ? `Schedule: ${e.schedule}` : "",
    e.modality ? `Modality: ${e.modality}` : "",
    e.pgy_restrictions ? `PGY: ${e.pgy_restrictions}` : "",
    e.notes ? `Notes: ${e.notes}` : "",
    e.lattice_tags?.length ? `Lattice tags: ${e.lattice_tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Mak-only elective catalog context. Never list full catalog unprompted.
 */
export function buildElectiveCatalogMakContext(input: {
  pgyLevel?: string | null;
  currentRotation?: string | null;
  purpose?: "chat" | "lattice" | "output_studio" | "debrief";
}): string {
  const matched = findElectivesForRotation(input.currentRotation);
  const isElectiveRotation =
    input.currentRotation === "elective" ||
    matched.length > 0 ||
    input.purpose === "output_studio";

  if (!isElectiveRotation && input.purpose !== "lattice") {
    return [
      "[Elective catalog — internal]",
      `${DATA.entries.length} catalogued electives across ${DATA.categories.length} categories.`,
      "Use only when resident discusses elective planning, longitudinal clinic choice, ILP goals, or career narrative — do not enumerate unprompted.",
      `PGY3/4 coordinator: ${DATA.coordination.pgy3_4_coordinator}.`,
    ].join("\n");
  }

  const categorySummary = DATA.categories
    .map((c) => `${c} (${DATA.entries.filter((e) => e.category === c).length})`)
    .join("; ");

  const lines = [
    "[Elective catalog — internal; do not recite unless resident is planning or asking]",
    DATA.coordination.process_notes.map((n) => `- ${n}`).join("\n"),
    `Coordinator (PGY3/4/PPP): ${DATA.coordination.pgy3_4_coordinator}`,
    `Elective requests: ${DATA.coordination.elective_request_contact} · ${DATA.coordination.deadline_weeks_before} weeks prior`,
    input.pgyLevel ? `Resident PGY: ${input.pgyLevel}` : "",
    "",
    "Category lattice hints (silent use for activity capture):",
    ...Object.entries(DATA.category_lattice_hints).map(([cat, hint]) => `- ${cat}: ${hint}`),
    "",
    `Catalog overview (${DATA.entries.length} options): ${categorySummary}`,
  ];

  if (matched.length) {
    lines.push("", "Matched to current rotation/context:");
    for (const e of matched.slice(0, 4)) {
      lines.push(`- ${formatEntry(e)}`);
    }
  } else if (input.currentRotation === "elective") {
    lines.push(
      "",
      "Resident on generic elective block — ask which specific elective; then pull matching row from catalog.",
    );
  }

  if (input.purpose === "lattice") {
    lines.push(
      "",
      "Lattice: tag community electives toward Systems Thinking × Advocate; scholarly toward Scholarship × Researcher; forensic toward Clinical + Systems; college counseling toward Communication × Clinician.",
    );
  }

  if (input.purpose === "output_studio") {
    lines.push(
      "",
      "Output Studio: frame elective experiences as competency evidence (patient care, systems, scholarship) — not schedule logistics.",
    );
  }

  return lines.filter(Boolean).join("\n");
}
