import {
  CAREER_LEVELS,
  PRACTICE_SETTINGS,
  requiresAcademicRank,
  requiresGmePlacementFields,
  usesFteForCareerTracks,
  type CareerLevel,
  type PracticeSetting,
} from "@/lib/v2/onboarding-options";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import {
  normalizeCareerStage,
  type CareerConversationStage,
} from "@/lib/v2/mak-conversation-models";
import {
  apiEnrichmentPlan,
  deployedInstruments,
  documentRequirements,
  requiredDocuments,
} from "@/lib/v2/onboarding-touchpoint1";
import { deriveContentPack } from "@/lib/v2/programs/program-membership";
import { UH_PSYCH_CMC_PROGRAM } from "@/lib/v2/programs/registry";
import type { MakContentPack } from "@/lib/v2/mak-conversation-models";

export type OnboardingPath = "public" | "institutional";

export type ProfileScenarioRow = {
  scenario_id: string;
  onboarding_path: OnboardingPath;
  career_stage: CareerLevel;
  practice_setting: PracticeSetting;
  content_pack: MakContentPack;
  instrument_count: number;
  instrument_ids: string[];
  required_doc_types: string[];
  doc_count: number;
  api_enrichment: ReturnType<typeof apiEnrichmentPlan>;
  requires_gme_placement_fields: boolean;
  uses_fte_for_career_tracks: boolean;
  requires_academic_rank: boolean;
  mak_stage: CareerConversationStage;
  evaluation_framework: {
    primary_specialty: string;
    milestone_status: string;
    subcompetency_count: number;
  } | null;
  institutional_career_stage_allowed: boolean | null;
};

export type ProfileScenarioAuditResult = {
  total_scenarios: number;
  rows: ProfileScenarioRow[];
  warnings: string[];
  gaps: string[];
  errors: string[];
};

const INSTITUTIONAL_PROGRAM = UH_PSYCH_CMC_PROGRAM;
const TRAINEE_BASE_SPECIALTY = INSTITUTIONAL_PROGRAM.base_specialty;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function scenarioId(
  path: OnboardingPath,
  careerStage: CareerLevel,
  practiceSetting: PracticeSetting,
): string {
  return `${path}:${slugify(careerStage)}:${slugify(practiceSetting)}`;
}

function buildScenario(
  path: OnboardingPath,
  careerStage: CareerLevel,
  practiceSetting: PracticeSetting,
): ProfileScenarioRow {
  const institutional = path === "institutional";
  const docs = documentRequirements(careerStage, practiceSetting);
  const required = requiredDocuments(careerStage, practiceSetting);
  const instruments = deployedInstruments(careerStage, practiceSetting);
  const evaluationFramework = resolveTraineeEvaluationFramework({
    career_stage: careerStage,
    base_specialty: TRAINEE_BASE_SPECIALTY,
  });

  const institutionalAllowed =
    path === "institutional"
      ? INSTITUTIONAL_PROGRAM.career_stages_allowed.includes(
          careerStage as "Resident" | "Fellow",
        )
      : null;

  return {
    scenario_id: scenarioId(path, careerStage, practiceSetting),
    onboarding_path: path,
    career_stage: careerStage,
    practice_setting: practiceSetting,
    content_pack: deriveContentPack(careerStage, institutional),
    instrument_count: instruments.length,
    instrument_ids: instruments.map((i) => i.id),
    required_doc_types: required.map((d) => d.type),
    doc_count: docs.length,
    api_enrichment: apiEnrichmentPlan(practiceSetting, careerStage),
    requires_gme_placement_fields: requiresGmePlacementFields(careerStage),
    uses_fte_for_career_tracks: usesFteForCareerTracks(careerStage),
    requires_academic_rank: requiresAcademicRank(practiceSetting),
    mak_stage: normalizeCareerStage(careerStage),
    evaluation_framework: evaluationFramework
      ? {
          primary_specialty: evaluationFramework.primary_specialty,
          milestone_status: evaluationFramework.milestone_status,
          subcompetency_count: evaluationFramework.subcompetencies.length,
        }
      : null,
    institutional_career_stage_allowed: institutionalAllowed,
  };
}

export function auditProfileScenarios(): ProfileScenarioAuditResult {
  const rows: ProfileScenarioRow[] = [];
  const warnings: string[] = [];
  const gaps: string[] = [];
  const errors: string[] = [];

  for (const careerStage of CAREER_LEVELS) {
    for (const practiceSetting of PRACTICE_SETTINGS) {
      const id = scenarioId("public", careerStage, practiceSetting);
      try {
        rows.push(buildScenario("public", careerStage, practiceSetting));
      } catch (err) {
        errors.push(`${id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  const institutionalSetting = INSTITUTIONAL_PROGRAM.default_practice_setting;
  for (const careerStage of CAREER_LEVELS) {
    const id = scenarioId("institutional", careerStage, institutionalSetting);
    try {
      const row = buildScenario("institutional", careerStage, institutionalSetting);
      rows.push(row);

      if (row.institutional_career_stage_allowed === false) {
        warnings.push(
          `${id}: career stage "${careerStage}" is not in ${INSTITUTIONAL_PROGRAM.slug} career_stages_allowed (${INSTITUTIONAL_PROGRAM.career_stages_allowed.join(", ")})`,
        );
      }
    } catch (err) {
      errors.push(`${id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const row of rows) {
    if (
      (row.career_stage === "Resident" || row.career_stage === "Fellow") &&
      row.evaluation_framework === null
    ) {
      gaps.push(
        `${row.scenario_id}: trainee evaluation framework resolved null for ${row.career_stage} with ${TRAINEE_BASE_SPECIALTY}`,
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

export type ProfileScenarioSummaryRow = {
  scenario_id: string;
  content_pack: string;
  instruments: number;
  required_docs: string;
  gme: string;
  mak_stage: string;
};

export function formatProfileScenarioSummary(rows: ProfileScenarioRow[]): ProfileScenarioSummaryRow[] {
  return rows.map((row) => ({
    scenario_id: row.scenario_id,
    content_pack: row.content_pack,
    instruments: row.instrument_count,
    required_docs: row.required_doc_types.join(", ") || "—",
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
