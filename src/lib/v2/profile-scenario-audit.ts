import { PRACTICE_SETTINGS } from "@/lib/v2/onboarding-options";
import {
  resolveProfileContract,
  type ProfileContract,
} from "@/lib/v2/profile-contract";
import { listAuditScenarioSpecs } from "@/lib/v2/profile-persona";
import { UH_PSYCH_CMC_PROGRAM } from "@/lib/v2/programs/registry";

export type ProfileScenarioSummaryRow = {
  scenario_id: string;
  persona_id: string;
  content_pack: string;
  instruments: number;
  required_docs: string;
  surfaces: number;
  gme: string;
  mak_stage: string;
};

export type ProfileScenarioAuditResult = {
  total_scenarios: number;
  rows: ProfileContract[];
  warnings: string[];
  gaps: string[];
  errors: string[];
};

export function auditProfileScenarios(): ProfileScenarioAuditResult {
  const warnings: string[] = [];
  const gaps: string[] = [];
  const errors: string[] = [];
  const rows: ProfileContract[] = [];

  for (const spec of listAuditScenarioSpecs(PRACTICE_SETTINGS)) {
    const program =
      spec.program ?? (spec.onboarding_path === "institutional" ? UH_PSYCH_CMC_PROGRAM : null);
    try {
      rows.push(resolveProfileContract({ ...spec, program }));
    } catch (err) {
      errors.push(`${spec.persona_id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const row of rows) {
    if (
      (row.career_stage === "Resident" || row.career_stage === "Fellow") &&
      row.evaluation_framework === null
    ) {
      gaps.push(
        `${row.scenario_id}: trainee evaluation framework resolved null for ${row.career_stage}`,
      );
    }

    const hasGmeSurfaces = row.user_surfaces.some((s) =>
      ["pre_ccc", "milestone_self_rating", "milestone_heatmap", "ilp"].includes(s),
    );
    if (hasGmeSurfaces && row.persona_id !== "institutional_program_trainee") {
      warnings.push(
        `${row.scenario_id}: GME surfaces exposed on public persona — check contract`,
      );
    }
  }

  return {
    total_scenarios: rows.length,
    rows,
    warnings,
    gaps,
    errors,
  };
}

export function formatProfileScenarioSummary(
  rows: ProfileContract[],
): ProfileScenarioSummaryRow[] {
  return rows.map((row) => ({
    scenario_id: row.scenario_id,
    persona_id: row.persona_id,
    content_pack: row.content_pack,
    instruments: row.instrument_ids.length,
    required_docs: row.required_doc_types.join(", ") || "—",
    surfaces: row.user_surfaces.length,
    gme: [
      row.requires_gme_placement_fields ? "pgy" : "",
      row.uses_fte_for_career_tracks ? "fte" : "",
      row.requires_academic_rank ? "rank" : "",
    ]
      .filter(Boolean)
      .join("+") || "—",
    mak_stage: row.mak_stage,
  }));
}
