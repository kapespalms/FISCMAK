import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  jsonError,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  buildSpecialtyStorage,
  isValidBaseSpecialty,
  isValidSubspecialtyForBase,
} from "@/lib/v2/specialty-hierarchy";
import type { CareerStage } from "@/lib/v2/onboarding-options";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  let user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    user = await upsertAppUser(auth.userId, auth.email, {}, auth.demo);
  }
  return jsonOk({
    user_id: user.user_id,
    email: user.email,
    name: user.name,
    profile_photo_url:
      (user.onboarding_metadata?.profile_photo_url as string | undefined) ?? null,
    specialty: user.specialty,
    base_specialty: user.base_specialty,
    subspecialty: user.subspecialty,
    subspecialty_training_complete: user.subspecialty_training_complete,
    career_stage: user.career_stage,
    practice_setting: user.practice_setting,
    academic_rank: user.academic_rank,
    primary_career_track: user.primary_career_track,
    institution: user.institution,
    cv_uploaded: user.cv_uploaded,
    career_readiness_index: null,
    tier1_complete: user.tier1_complete,
    tier2_complete: user.tier2_complete,
    tier3_complete: user.tier3_complete,
    onboarding_status: user.onboarding_status ?? null,
    current_onboarding_step: user.current_onboarding_step ?? null,
    coach_mak_conversation_id: user.coach_mak_conversation_id ?? null,
    last_active: user.last_active,
    created_at: user.created_at,
  });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();

  const patch: Record<string, unknown> = {
    name: body.name,
    institution: body.institution,
    career_stage: body.career_stage as CareerStage | undefined,
    preferred_location: body.preferred_location,
  };

  const resolvedBase = body.base_specialty ?? body.specialty;
  if (resolvedBase !== undefined) {
    if (resolvedBase && !isValidBaseSpecialty(resolvedBase)) {
      return jsonError("validation_error", "Select a valid base specialty.", 400);
    }
    if (body.subspecialty && !isValidSubspecialtyForBase(resolvedBase, body.subspecialty)) {
      return jsonError(
        "validation_error",
        "Select a subspecialty that matches your base specialty.",
        400,
      );
    }
    if (resolvedBase) {
      Object.assign(
        patch,
        buildSpecialtyStorage({
          base_specialty: resolvedBase,
          subspecialty: body.subspecialty ?? null,
          subspecialty_training_complete: body.subspecialty_training_complete,
          career_stage: body.career_stage,
        }),
      );
    }
  } else if (body.specialty !== undefined) {
    patch.specialty = body.specialty;
  }

  const user = await upsertAppUser(auth.userId, auth.email, patch, auth.demo);
  return jsonOk({ message: "Profile updated", ...user });
}
