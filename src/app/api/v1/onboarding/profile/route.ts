import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  isValidAcademicRank,
  isValidCareerLevel,
  isValidCareerTrack,
  isValidPgyLevel,
  isValidPracticeSetting,
  isTraineeCareerLevel,
  requiresAcademicRank,
  requiresGmePlacementFields,
  PRIMARY_CAREER_TRACKS,
  type AcademicRank,
  type CareerLevel,
  type PracticeSetting,
  type PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import {
  resolveTraineeEvaluationFramework,
  validateTraineeSpecialtySelection,
} from "@/lib/v2/gme/trainee-evaluation-framework";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { onboardingPathFromMetadata } from "@/lib/v2/onboarding-path";
import {
  buildSpecialtyStorage,
  isValidBaseSpecialty,
  isValidSubspecialtyForBase,
} from "@/lib/v2/specialty-hierarchy";
import { seedAnswersFromProfile } from "@/lib/v2/conversational-assessment";
import {
  applyExtractedAnswers,
  ensureTouchpointAssessment,
} from "@/lib/v2/conversational-assessment-service";
import { deployedInstruments, apiEnrichmentPlan } from "@/lib/v2/onboarding-touchpoint1";
import { deriveContentPack } from "@/lib/v2/programs/program-membership";
import { syncProgramMembership } from "@/lib/v2/programs/sync-program-membership";
import { seedNarrativeAnchorFromOrigin } from "@/lib/v2/trainee-origin";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();
  const {
    name,
    specialty,
    base_specialty,
    subspecialty,
    subspecialty_training_complete,
    career_stage,
    practice_setting,
    academic_rank,
    primary_career_track,
    pgy_level,
    current_rotation,
    specialty_origin,
    trainee_initials,
    career_track_rankings,
    subspecialty_interests,
    uh_psych_enrichment_tracks,
  } = body as {
    name?: string;
    specialty?: string;
    base_specialty?: string;
    subspecialty?: string | null;
    subspecialty_training_complete?: boolean;
    career_stage?: CareerLevel;
    practice_setting?: PracticeSetting;
    academic_rank?: AcademicRank | null;
    primary_career_track?: PrimaryCareerTrack;
    pgy_level?: string | null;
    current_rotation?: string | null;
    specialty_origin?: string | null;
    trainee_initials?: string | null;
    career_track_rankings?: Array<{
      track: PrimaryCareerTrack;
      rank: number;
      hours_per_week?: number;
      fte?: number;
    }>;
    subspecialty_interests?: string[];
    uh_psych_enrichment_tracks?: string[];
  };

  const resolvedBase = base_specialty ?? specialty;

  const authUser = await getAppUser(auth.userId, auth.demo);
  const priorMeta = authUser ? getOnboardingMetadata(authUser) : {};
  const pathCtx = onboardingPathFromMetadata(priorMeta);
  const institutionalProgram = pathCtx?.path === "institutional" ? pathCtx.program : null;
  const resolvedPracticeSetting = institutionalProgram
    ? institutionalProgram.default_practice_setting
    : practice_setting;

  if (!name?.trim() || name.trim().length < 2) {
    return jsonOk({ error: "validation_error", message: "Enter your name." }, 400);
  }
  if (!resolvedBase || !isValidBaseSpecialty(resolvedBase)) {
    return jsonOk({ error: "validation_error", message: "Select a valid base specialty." }, 400);
  }
  if (
    subspecialty &&
    career_stage !== "Fellow" &&
    !isValidSubspecialtyForBase(resolvedBase, subspecialty)
  ) {
    return jsonOk(
      { error: "validation_error", message: "Select a subspecialty that matches your base specialty." },
      400,
    );
  }
  if (career_stage) {
    const traineeSpecialty = validateTraineeSpecialtySelection({
      career_stage,
      base_specialty: resolvedBase,
      subspecialty,
      subspecialty_training_complete,
    });
    if (!traineeSpecialty.valid) {
      return jsonOk(
        { error: "validation_error", message: traineeSpecialty.errors[0] ?? "Invalid trainee specialty selection." },
        400,
      );
    }
  }
  if (!career_stage || !isValidCareerLevel(career_stage)) {
    return jsonOk({ error: "validation_error", message: "Select a valid career level." }, 400);
  }
  if (!resolvedPracticeSetting || !isValidPracticeSetting(resolvedPracticeSetting)) {
    return jsonOk({ error: "validation_error", message: "Select a practice setting." }, 400);
  }

  const rankings = career_track_rankings ?? [];
  const resolvedPrimaryTrack =
    rankings.length > 0
      ? [...rankings].sort((a, b) => a.rank - b.rank)[0]?.track
      : primary_career_track;
  if (!resolvedPrimaryTrack || !isValidCareerTrack(resolvedPrimaryTrack)) {
    return jsonOk({ error: "validation_error", message: "Rank your career tracks." }, 400);
  }
  if (rankings.length > 0) {
    const ranks = rankings.map((r) => r.rank);
    const expected = PRIMARY_CAREER_TRACKS.map((_, i) => i + 1);
    const validTracks = rankings.every((r) => isValidCareerTrack(r.track));
    const uniqueRanks = new Set(ranks).size === ranks.length;
    if (!validTracks || ranks.length !== PRIMARY_CAREER_TRACKS.length || !uniqueRanks) {
      return jsonOk(
        { error: "validation_error", message: "Assign a unique rank (1–8) to each career track." },
        400,
      );
    }
  }
  if (requiresAcademicRank(resolvedPracticeSetting) && academic_rank && !isValidAcademicRank(academic_rank)) {
    return jsonOk({ error: "validation_error", message: "Select a valid academic rank." }, 400);
  }
  if (requiresGmePlacementFields(career_stage)) {
    if (!pgy_level || !isValidPgyLevel(pgy_level)) {
      return jsonOk({ error: "validation_error", message: "Select your PGY level." }, 400);
    }
    if (!current_rotation?.trim()) {
      return jsonOk({ error: "validation_error", message: "Enter your current rotation." }, 400);
    }
  }
  if (isTraineeCareerLevel(career_stage) && !specialty_origin?.trim()) {
    return jsonOk(
      {
        error: "validation_error",
        message: "Share what drew you to your specialty — even one sentence.",
      },
      400,
    );
  }

  if (institutionalProgram) {
    if (resolvedBase !== institutionalProgram.base_specialty) {
      return jsonOk(
        {
          error: "validation_error",
          message: `This program onboarding is locked to ${institutionalProgram.base_specialty}.`,
        },
        400,
      );
    }
    if (
      !institutionalProgram.career_stages_allowed.includes(
        career_stage as "Resident" | "Fellow",
      )
    ) {
      return jsonOk(
        {
          error: "validation_error",
          message: "Select Resident or Fellow for program onboarding.",
        },
        400,
      );
    }
  }

  const resolvedInstitution = institutionalProgram?.institution_name ?? authUser?.institution ?? null;

  const instrumentIds = deployedInstruments(career_stage, resolvedPracticeSetting).map((i) => i.id);

  const specialtyFields = buildSpecialtyStorage({
    base_specialty: resolvedBase,
    subspecialty: subspecialty ?? null,
    subspecialty_training_complete,
    career_stage,
  });

  const trimmedOrigin = specialty_origin?.trim() ?? null;
  const trimmedRotation = current_rotation?.trim() ?? null;
  const narrativeAnchor =
    trimmedOrigin && isTraineeCareerLevel(career_stage)
      ? seedNarrativeAnchorFromOrigin({
          base_specialty: resolvedBase,
          subspecialty: subspecialty ?? null,
          specialty_origin: trimmedOrigin,
          existing: priorMeta.narrative_anchor,
        })
      : priorMeta.narrative_anchor;

  const contentPack = deriveContentPack(career_stage, Boolean(institutionalProgram));
  const updatedMembership = priorMeta.program_membership
    ? {
        ...priorMeta.program_membership,
        pgy_level: requiresGmePlacementFields(career_stage) ? (pgy_level ?? null) : priorMeta.program_membership.pgy_level,
      }
    : undefined;

  const evaluationFramework = resolveTraineeEvaluationFramework({
    career_stage,
    base_specialty: specialtyFields.base_specialty,
    subspecialty: specialtyFields.subspecialty,
    subspecialty_training_complete: specialtyFields.subspecialty_training_complete,
  });

  const resolvedInitials =
    priorMeta.trainee_initials?.trim().toUpperCase() ??
    trainee_initials?.trim().toUpperCase() ??
    null;

  const user = await upsertAppUser(
    auth.userId,
    auth.email,
    {
      name: name.trim(),
      ...specialtyFields,
      career_stage,
      practice_setting: resolvedPracticeSetting,
      institution: resolvedInstitution,
      academic_rank: requiresAcademicRank(resolvedPracticeSetting) ? (academic_rank ?? null) : null,
      primary_career_track: resolvedPrimaryTrack,
      pgy_level: requiresGmePlacementFields(career_stage) ? (pgy_level ?? null) : null,
      current_rotation: requiresGmePlacementFields(career_stage) ? trimmedRotation : null,
      specialty_origin: isTraineeCareerLevel(career_stage) ? trimmedOrigin : null,
      primary_program_id: institutionalProgram?.id ?? authUser?.primary_program_id ?? null,
      content_pack: contentPack,
      tier1_complete: true,
      onboarding_metadata: {
        ...priorMeta,
        instrument_ids: instrumentIds,
        api_enrichment_plan: apiEnrichmentPlan(resolvedPracticeSetting, career_stage),
        instrument_answers: priorMeta.instrument_answers ?? [],
        ...(resolvedInitials ? { trainee_initials: resolvedInitials } : {}),
        ...(rankings.length ? { career_track_rankings: rankings } : {}),
        ...(subspecialty_interests?.length
          ? { subspecialty_interests: subspecialty_interests.filter(Boolean) }
          : {}),
        ...(uh_psych_enrichment_tracks?.length
          ? { uh_psych_enrichment_tracks: uh_psych_enrichment_tracks.filter(Boolean) }
          : {}),
        ...(institutionalProgram ? { call_schedule_note: "not_configured" } : {}),
        ...(updatedMembership ? { program_membership: updatedMembership } : {}),
        ...(narrativeAnchor ? { narrative_anchor: narrativeAnchor } : {}),
        ...(evaluationFramework
          ? {
              evaluation_framework: {
                primary_slug: evaluationFramework.evaluation_primary_slug,
                primary_name: evaluationFramework.evaluation_primary_name,
                subspecialty: evaluationFramework.subspecialty,
                milestone_status: evaluationFramework.milestone_status,
                milestone_version: evaluationFramework.milestone_version,
                universal_competency_keys: evaluationFramework.universal_competencies.map((c) => c.key),
                subcompetency_ids: evaluationFramework.subcompetencies.map((s) => s.id),
                mapping_notes: evaluationFramework.mapping_notes,
              },
            }
          : {}),
      },
    },
    auth.demo,
  );

  if (updatedMembership) {
    await syncProgramMembership({
      demo: auth.demo,
      userId: auth.userId,
      membership: updatedMembership,
    });
  }

  const assessment = await ensureTouchpointAssessment(auth.userId, auth.demo, 1, "INTRO");
  const seeds = seedAnswersFromProfile(user);
  if (seeds.length > 0) {
    await applyExtractedAnswers(auth.userId, auth.demo, assessment, seeds);
  }

  return jsonOk({
    user_id: user.user_id,
    name: user.name,
    specialty: user.specialty,
    base_specialty: user.base_specialty,
    subspecialty: user.subspecialty,
    subspecialty_training_complete: user.subspecialty_training_complete,
    career_stage: user.career_stage,
    practice_setting: user.practice_setting,
    academic_rank: user.academic_rank,
    primary_career_track: user.primary_career_track,
    pgy_level: user.pgy_level,
    current_rotation: user.current_rotation,
    specialty_origin: user.specialty_origin,
    evaluation_framework: evaluationFramework,
    tier1_complete: true,
    redirect: "/app/onboarding?step=documents",
    saved_at: new Date().toISOString(),
  });
}
