import type { CareerLevel, PracticeSetting } from "@/lib/v2/onboarding-options";
import {
  PRACTICE_SETTINGS,
  requiresAcademicRank,
  requiresGmePlacementFields,
  usesFteForCareerTracks,
} from "@/lib/v2/onboarding-options";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import {
  normalizeCareerStage,
  type CareerConversationStage,
  type MakContentPack,
} from "@/lib/v2/mak-conversation-models";
import {
  apiEnrichmentPlan,
  deployedInstruments,
  documentRequirements,
  requiredDocuments,
  type OnboardingInstrument,
} from "@/lib/v2/onboarding-touchpoint1";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { AppUser } from "@/lib/v2/types";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";
import { getProgramById } from "@/lib/v2/programs/registry";
import { onboardingPathFromMetadata } from "@/lib/v2/onboarding-path";
import {
  auditScenarioId,
  isInstitutionalPersona,
  listAuditScenarioSpecs,
  resolvePersona,
  type AuditScenarioSpec,
  type PersonaId,
} from "@/lib/v2/profile-persona";

/** MECE onboarding layers — each persona runs a subset in order. */
export type OnboardingLayer = "path" | "identity" | "instruments" | "documents" | "goals";

/** User-visible product surfaces — gated by persona contract. */
export type UserSurface =
  | "dashboard_wellbeing"
  | "lattice"
  | "goals"
  | "quarterly_pulse"
  | "annual_refresh"
  | "career_narrative"
  | "promotion_dossier"
  | "jobs"
  | "pre_ccc"
  | "milestone_self_rating"
  | "milestone_heatmap"
  | "ilp"
  | "schedule"
  | "education_hub";

/** Program staff tools — never shown on trainee/attending home; KP Admin / staff RBAC only. */
export type StaffSurface =
  | "medhub_import"
  | "cohort_heatmap"
  | "batch_pre_ccc"
  | "ilp_approval"
  | "coordinator_survey";

/** Internal metrics — never rendered in user UI or trainee-facing APIs. */
export type InternalMetric =
  | "career_health_score"
  | "career_readiness_index"
  | "s_index"
  | "iwq"
  | "coherence_score"
  | "internal_coaching_signals"
  | "recognition_gaps"
  | "cv_regex_metrics"
  | "cohort_individual_rank";

const INTERNAL_METRICS: readonly InternalMetric[] = [
  "career_health_score",
  "career_readiness_index",
  "s_index",
  "iwq",
  "coherence_score",
  "internal_coaching_signals",
  "recognition_gaps",
  "cv_regex_metrics",
  "cohort_individual_rank",
] as const;

const BASE_PUBLIC_SURFACES: UserSurface[] = [
  "dashboard_wellbeing",
  "lattice",
  "goals",
  "quarterly_pulse",
  "annual_refresh",
  "career_narrative",
];

const TRAINEE_GME_SURFACES: UserSurface[] = [
  "pre_ccc",
  "milestone_self_rating",
  "milestone_heatmap",
  "ilp",
  "schedule",
  "education_hub",
];

const ATTENDING_SURFACES: UserSurface[] = ["promotion_dossier", "jobs"];

type PersonaTemplate = {
  content_pack: MakContentPack;
  onboarding_layers: OnboardingLayer[];
  user_surfaces: UserSurface[];
  cohort_aggregate_only: boolean;
};

const PERSONA_TEMPLATES: Record<PersonaId, PersonaTemplate> = {
  public_med_student: {
    content_pack: "trainee",
    onboarding_layers: ["path", "identity", "instruments", "documents", "goals"],
    user_surfaces: [...BASE_PUBLIC_SURFACES],
    cohort_aggregate_only: false,
  },
  public_resident: {
    content_pack: "trainee",
    onboarding_layers: ["path", "identity", "instruments", "documents", "goals"],
    user_surfaces: [...BASE_PUBLIC_SURFACES],
    cohort_aggregate_only: false,
  },
  public_fellow: {
    content_pack: "trainee",
    onboarding_layers: ["path", "identity", "instruments", "documents", "goals"],
    user_surfaces: [...BASE_PUBLIC_SURFACES],
    cohort_aggregate_only: false,
  },
  public_early_attending: {
    content_pack: "early_attending",
    onboarding_layers: ["path", "identity", "instruments", "documents", "goals"],
    user_surfaces: [...BASE_PUBLIC_SURFACES, "promotion_dossier", "jobs"],
    cohort_aggregate_only: false,
  },
  public_mid_attending: {
    content_pack: "default",
    onboarding_layers: ["path", "identity", "instruments", "documents", "goals"],
    user_surfaces: [...BASE_PUBLIC_SURFACES, ...ATTENDING_SURFACES],
    cohort_aggregate_only: false,
  },
  public_late_attending: {
    content_pack: "default",
    onboarding_layers: ["path", "identity", "instruments", "documents", "goals"],
    user_surfaces: [...BASE_PUBLIC_SURFACES, ...ATTENDING_SURFACES],
    cohort_aggregate_only: false,
  },
  public_retired: {
    content_pack: "default",
    onboarding_layers: ["path", "identity", "instruments", "documents"],
    user_surfaces: ["dashboard_wellbeing", "lattice", "career_narrative"],
    cohort_aggregate_only: false,
  },
  institutional_program_trainee: {
    content_pack: "trainee",
    onboarding_layers: ["path", "identity", "instruments", "documents", "goals"],
    user_surfaces: [...BASE_PUBLIC_SURFACES, ...TRAINEE_GME_SURFACES],
    cohort_aggregate_only: true,
  },
};

export type ProfileContract = {
  persona_id: PersonaId;
  scenario_id: string;
  onboarding_path: "public" | "institutional";
  career_stage: CareerLevel;
  practice_setting: PracticeSetting;
  content_pack: MakContentPack;
  mak_stage: CareerConversationStage;
  onboarding_layers: OnboardingLayer[];
  user_surfaces: UserSurface[];
  staff_surfaces: StaffSurface[];
  internal_only_metrics: InternalMetric[];
  cohort_aggregate_only: boolean;
  instrument_ids: string[];
  instruments: OnboardingInstrument[];
  required_doc_types: string[];
  doc_count: number;
  requires_gme_placement_fields: boolean;
  uses_fte_for_career_tracks: boolean;
  requires_academic_rank: boolean;
  api_enrichment: ReturnType<typeof apiEnrichmentPlan>;
  evaluation_framework: {
    primary_specialty: string;
    milestone_status: string;
    subcompetency_count: number;
  } | null;
};

export function resolveProfileContract(spec: AuditScenarioSpec): ProfileContract {
  const template = PERSONA_TEMPLATES[spec.persona_id];
  const instruments = deployedInstruments(spec.career_stage, spec.practice_setting);
  const docs = documentRequirements(spec.career_stage, spec.practice_setting);
  const required = requiredDocuments(spec.career_stage, spec.practice_setting);

  const baseSpecialty = spec.program?.base_specialty ?? "Psychiatry";
  const evaluationFramework = resolveTraineeEvaluationFramework({
    career_stage: spec.career_stage,
    base_specialty: baseSpecialty,
  });

  return {
    persona_id: spec.persona_id,
    scenario_id: auditScenarioId(spec),
    onboarding_path: spec.onboarding_path,
    career_stage: spec.career_stage,
    practice_setting: spec.practice_setting,
    content_pack: template.content_pack,
    mak_stage: normalizeCareerStage(spec.career_stage),
    onboarding_layers: template.onboarding_layers,
    user_surfaces: template.user_surfaces,
    staff_surfaces: isInstitutionalPersona(spec.persona_id)
      ? [
          "medhub_import",
          "cohort_heatmap",
          "batch_pre_ccc",
          "ilp_approval",
          "coordinator_survey",
        ]
      : [],
    internal_only_metrics: [...INTERNAL_METRICS],
    cohort_aggregate_only: template.cohort_aggregate_only,
    instrument_ids: instruments.map((i) => i.id),
    instruments,
    required_doc_types: required.map((d) => d.type),
    doc_count: docs.length,
    requires_gme_placement_fields: requiresGmePlacementFields(spec.career_stage),
    uses_fte_for_career_tracks: usesFteForCareerTracks(spec.career_stage),
    requires_academic_rank: requiresAcademicRank(spec.practice_setting, spec.career_stage),
    api_enrichment: apiEnrichmentPlan(spec.practice_setting, spec.career_stage),
    evaluation_framework: evaluationFramework
      ? {
          primary_specialty: evaluationFramework.primary_specialty,
          milestone_status: evaluationFramework.milestone_status,
          subcompetency_count: evaluationFramework.subcompetencies.length,
        }
      : null,
  };
}

export function resolveProfileContractFromUser(
  user: Pick<
    AppUser,
    "career_stage" | "practice_setting" | "primary_program_id" | "onboarding_metadata"
  >,
): ProfileContract | null {
  const meta = (user.onboarding_metadata ?? {}) as OnboardingMetadata;
  const pathCtx = onboardingPathFromMetadata(meta);
  const onboarding_path = pathCtx?.path ?? meta.onboarding_path ?? "public";
  const program =
    pathCtx?.program ??
    (user.primary_program_id ? getProgramById(user.primary_program_id) : null) ??
    null;

  const career_stage = user.career_stage;
  if (!career_stage) return null;

  const persona_id = resolvePersona({
    onboarding_path,
    career_stage,
    program,
  });
  if (!persona_id) return null;

  const practice_setting =
    onboarding_path === "institutional" && program
      ? program.default_practice_setting
      : user.practice_setting ?? "Academic";

  return resolveProfileContract({
    persona_id,
    onboarding_path,
    career_stage,
    practice_setting,
    program,
  });
}

export function contentPackFor(
  careerStage: CareerLevel | null | undefined,
  institutional: boolean,
): MakContentPack {
  if (institutional) {
    if (careerStage === "Resident" || careerStage === "Fellow") {
      return PERSONA_TEMPLATES.institutional_program_trainee.content_pack;
    }
    return "trainee";
  }
  if (!careerStage) return "default";
  const persona = resolvePersona({
    onboarding_path: "public",
    career_stage: careerStage,
    program: null,
  });
  if (!persona) return "default";
  return PERSONA_TEMPLATES[persona].content_pack;
}

export function userHasSurface(
  contract: ProfileContract | null | undefined,
  surface: UserSurface,
): boolean {
  return Boolean(contract?.user_surfaces.includes(surface));
}

export function listAllAuditContracts(): ProfileContract[] {
  return listAuditScenarioSpecs(PRACTICE_SETTINGS).map(resolveProfileContract);
}
