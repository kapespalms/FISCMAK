import {
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  ACGME_SPECIALTIES,
  isValidCareerStage,
  type CareerStage,
} from "@/lib/v2/onboarding-options";
import { seedAnswersFromProfile } from "@/lib/v2/conversational-assessment";
import {
  applyExtractedAnswers,
  ensureTouchpointAssessment,
} from "@/lib/v2/conversational-assessment-service";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();
  const { name, specialty, career_stage } = body as {
    name?: string;
    specialty?: string;
    career_stage?: CareerStage;
  };

  if (!name?.trim() || name.trim().length < 2) {
    return jsonOk({ error: "validation_error", message: "Enter your name." }, 400);
  }
  if (!specialty || !ACGME_SPECIALTIES.includes(specialty as (typeof ACGME_SPECIALTIES)[number])) {
    return jsonOk({ error: "validation_error", message: "Select a valid specialty." }, 400);
  }
  if (!career_stage || !isValidCareerStage(career_stage)) {
    return jsonOk({ error: "validation_error", message: "Select a valid career stage." }, 400);
  }

  const user = await upsertAppUser(
    auth.userId,
    auth.email,
    {
      name: name.trim(),
      specialty,
      career_stage,
      tier1_complete: true,
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
    tier1_complete: true,
    redirect: "/app/dashboard?welcome=1",
    saved_at: new Date().toISOString(),
  });
}
