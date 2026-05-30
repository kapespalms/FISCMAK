import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  storageErrorMessage,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  isValidAcademicRank,
  isValidCareerLevel,
  isValidCareerTrack,
  isValidPgyLevel,
  isValidPracticeSetting,
  isTraineeCareerLevel,
  isMedicalStudent,
  requiresAcademicRank,
  requiresGmePlacementFields,
  PRIMARY_CAREER_TRACKS,
  academicRankForStorage,
  type AcademicRank,
  type CareerLevel,
  type PracticeSetting,
  type PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import {
  isValidCurrentGoal,
  type AdditionalDegreeEntry,
} from "@/lib/v2/onboarding-profile-fields";
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
import { onboardingProgressPatch } from "@/lib/v2/onboarding-progress";
import { FISCMAK_TERMS_VERSION } from "@/lib/legal/terms-content";
import { createClient } from "@/lib/supabase/server";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";

export async function POST(request: Request) {
  try {
    return await handleProfilePost(request);
  } catch (error) {
    console.error("[onboarding/profile] POST failed:", error);
    return jsonOk(
      { error: "internal_error", message: "Could not save profile. Please try again." },
      500,
    );
  }
}

async function handleProfilePost(request: Request) {
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
    specialty_interests,
    medical_student_year,
    additional_degrees,
    current_goal,
    other_industries,
    extracurricular_interests,
    academic_rank_other,
    terms_accepted,
    terms_version,
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
    specialty_interests?: string[];
    medical_student_year?: string | null;
    additional_degrees?: AdditionalDegreeEntry[];
    current_goal?: string | null;
    other_industries?: string[];
    extracurricular_interests?: string[];
    academic_rank_other?: string | null;
    terms_accepted?: boolean;
    terms_version?: string | null;
  };

  const resolvedBase =
    base_specialty ??
    specialty ??
    (specialty_interests?.length ? specialty_interests[0] : undefined);
  const medStudent = isMedicalStudent(career_stage);

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
  if (!terms_accepted) {
    return jsonOk(
      { error: "validation_error", message: "Accept the Terms & Conditions to continue." },
      400,
    );
  }
  if (!medStudent && (!resolvedBase || !isValidBaseSpecialty(resolvedBase))) {
    return jsonOk({ error: "validation_error", message: "Select a valid base specialty." }, 400);
  }
  if (medStudent && !medical_student_year?.trim()) {
    return jsonOk({ error: "validation_error", message: "Select your medical school year." }, 400);
  }
  if (
    subspecialty &&
    resolvedBase &&
    career_stage !== "Fellow" &&
    !isValidSubspecialtyForBase(resolvedBase, subspecialty)
  ) {
    return jsonOk(
      { error: "validation_error", message: "Select a subspecialty that matches your base specialty." },
      400,
    );
  }
  if (career_stage && resolvedBase) {
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
  if (
    !medStudent &&
    (!resolvedPracticeSetting || !isValidPracticeSetting(resolvedPracticeSetting))
  ) {
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
  if (academic_rank && !isValidAcademicRank(academic_rank)) {
    return jsonOk({ error: "validation_error", message: "Select a valid academic rank." }, 400);
  }
  if (requiresGmePlacementFields(career_stage)) {
    if (!pgy_level || !isValidPgyLevel(pgy_level)) {
      return jsonOk({ error: "validation_error", message: "Select your PGY level." }, 400);
    }
  }
  if (current_goal && !isValidCurrentGoal(current_goal)) {
    return jsonOk({ error: "validation_error", message: "Select a valid current goal." }, 400);
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

  const instrumentIds = deployedInstruments(career_stage, resolvedPracticeSetting ?? "Academic").map(
    (i) => i.id,
  );

  const specialtyFields = resolvedBase
    ? buildSpecialtyStorage({
        base_specialty: resolvedBase,
        subspecialty: subspecialty ?? null,
        subspecialty_training_complete,
        career_stage,
      })
    : {
        base_specialty: null,
        subspecialty: null,
        subspecialty_training_complete: false,
        specialty: null,
      };

  const trimmedOrigin = specialty_origin?.trim() ?? null;
  const narrativeAnchor =
    trimmedOrigin
      ? seedNarrativeAnchorFromOrigin({
          base_specialty: specialtyFields.base_specialty ?? resolvedBase ?? "Medicine",
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

  const storedAcademicRank =
    requiresAcademicRank(resolvedPracticeSetting ?? null, career_stage) && academic_rank
      ? academicRankForStorage(academic_rank)
      : { column: null, selection: null };

  if (!auth.demo) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUserRecord },
      } = await supabase.auth.getUser();
      if (authUserRecord) {
        await ensureAppUser(supabase, authUserRecord);
      }
    } catch (ensureError) {
      console.warn("[onboarding/profile] ensureAppUser skipped:", ensureError);
    }
  }

  let saveErrorMessage: string | null = null;
  const user = await upsertAppUser(
    auth.userId,
    auth.email,
    {
      name: name.trim(),
      ...specialtyFields,
      career_stage,
      practice_setting: medStudent ? null : resolvedPracticeSetting,
      institution: resolvedInstitution,
      academic_rank: storedAcademicRank.column,
      primary_career_track: resolvedPrimaryTrack,
      pgy_level: requiresGmePlacementFields(career_stage) ? (pgy_level ?? null) : null,
      current_rotation: null,
      specialty_origin: trimmedOrigin,
      primary_program_id: institutionalProgram?.id ?? authUser?.primary_program_id ?? null,
      content_pack: contentPack,
      tier1_complete: true,
      ...onboardingProgressPatch({ tier1_complete: true }),
      onboarding_metadata: {
        ...priorMeta,
        instrument_ids: instrumentIds,
        api_enrichment_plan: apiEnrichmentPlan(resolvedPracticeSetting ?? "Academic", career_stage),
        instrument_answers: priorMeta.instrument_answers ?? [],
        ...(resolvedInitials ? { trainee_initials: resolvedInitials } : {}),
        ...(rankings.length ? { career_track_rankings: rankings } : {}),
        ...(subspecialty_interests?.length
          ? { subspecialty_interests: subspecialty_interests.filter(Boolean) }
          : {}),
        ...(specialty_interests?.length
          ? { specialty_interests: specialty_interests.filter(Boolean) }
          : {}),
        ...(medical_student_year ? { medical_student_year } : {}),
        ...(additional_degrees?.length ? { additional_degrees } : {}),
        ...(current_goal ? { current_goal } : {}),
        ...(other_industries?.length
          ? { other_industries: other_industries.filter(Boolean) }
          : {}),
        ...(extracurricular_interests?.length
          ? { extracurricular_interests: extracurricular_interests.filter(Boolean) }
          : {}),
        ...(storedAcademicRank.selection && !storedAcademicRank.column
          ? { academic_rank_selection: storedAcademicRank.selection }
          : {}),
        ...(academic_rank_other ? { academic_rank_other } : {}),
        ...(uh_psych_enrichment_tracks?.length
          ? { uh_psych_enrichment_tracks: uh_psych_enrichment_tracks.filter(Boolean) }
          : {}),
        ...(institutionalProgram ? { call_schedule_note: "seeded_cmc_grid" } : {}),
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
        terms_acceptance: {
          accepted_at: new Date().toISOString(),
          version: FISCMAK_TERMS_VERSION,
          electronic_signature: true,
        },
      },
    },
    auth.demo,
  ).catch((err: unknown) => {
    saveErrorMessage = storageErrorMessage(err);
    console.error("[onboarding/profile] upsertAppUser failed:", err);
    return null;
  });

  if (!user) {
    return jsonOk(
      {
        error: "save_error",
        message: saveErrorMessage ?? "Could not save profile. Please try again.",
      },
      500,
    );
  }

  if (updatedMembership) {
    await syncProgramMembership({
      demo: auth.demo,
      userId: auth.userId,
      membership: updatedMembership,
    });
  }

  try {
    const assessment = await ensureTouchpointAssessment(auth.userId, auth.demo, 1, "INTRO");
    const seeds = seedAnswersFromProfile(user);
    if (seeds.length > 0) {
      await applyExtractedAnswers(auth.userId, auth.demo, assessment, seeds);
    }
  } catch (seedError) {
    console.warn("[onboarding/profile] assessment seed skipped:", seedError);
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
