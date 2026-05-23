import {
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  isValidAcademicRank,
  isValidCareerLevel,
  isValidCareerTrack,
  isValidPracticeSetting,
  isValidSpecialty,
  requiresAcademicRank,
  type AcademicRank,
  type CareerLevel,
  type PracticeSetting,
  type PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import { seedAnswersFromProfile } from "@/lib/v2/conversational-assessment";
import {
  applyExtractedAnswers,
  ensureTouchpointAssessment,
} from "@/lib/v2/conversational-assessment-service";
import { deployedInstruments, apiEnrichmentPlan } from "@/lib/v2/onboarding-touchpoint1";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();
  const {
    name,
    specialty,
    career_stage,
    practice_setting,
    academic_rank,
    primary_career_track,
  } = body as {
    name?: string;
    specialty?: string;
    career_stage?: CareerLevel;
    practice_setting?: PracticeSetting;
    academic_rank?: AcademicRank | null;
    primary_career_track?: PrimaryCareerTrack;
  };

  if (!name?.trim() || name.trim().length < 2) {
    return jsonOk({ error: "validation_error", message: "Enter your name." }, 400);
  }
  if (!specialty || !isValidSpecialty(specialty)) {
    return jsonOk({ error: "validation_error", message: "Select a valid specialty." }, 400);
  }
  if (!career_stage || !isValidCareerLevel(career_stage)) {
    return jsonOk({ error: "validation_error", message: "Select a valid career level." }, 400);
  }
  if (!practice_setting || !isValidPracticeSetting(practice_setting)) {
    return jsonOk({ error: "validation_error", message: "Select a practice setting." }, 400);
  }
  if (!primary_career_track || !isValidCareerTrack(primary_career_track)) {
    return jsonOk({ error: "validation_error", message: "Select a primary career track." }, 400);
  }
  if (requiresAcademicRank(practice_setting) && academic_rank && !isValidAcademicRank(academic_rank)) {
    return jsonOk({ error: "validation_error", message: "Select a valid academic rank." }, 400);
  }

  const instrumentIds = deployedInstruments(career_stage, practice_setting).map((i) => i.id);

  const user = await upsertAppUser(
    auth.userId,
    auth.email,
    {
      name: name.trim(),
      specialty,
      career_stage,
      practice_setting,
      academic_rank: requiresAcademicRank(practice_setting) ? (academic_rank ?? null) : null,
      primary_career_track,
      tier1_complete: true,
      onboarding_metadata: {
        instrument_ids: instrumentIds,
        api_enrichment_plan: apiEnrichmentPlan(practice_setting, career_stage),
        instrument_answers: [],
      },
    },
    auth.demo,
  );

  const assessment = await ensureTouchpointAssessment(auth.userId, auth.demo, 1, "INTRO");
  const seeds = seedAnswersFromProfile(user);
  if (seeds.length > 0) {
    await applyExtractedAnswers(auth.userId, auth.demo, assessment, seeds);
  }

  return jsonOk({
    user_id: user.user_id,
    name: user.name,
    specialty: user.specialty,
    career_stage: user.career_stage,
    practice_setting: user.practice_setting,
    academic_rank: user.academic_rank,
    primary_career_track: user.primary_career_track,
    tier1_complete: true,
    redirect: "/app/onboarding?step=documents",
    saved_at: new Date().toISOString(),
  });
}
