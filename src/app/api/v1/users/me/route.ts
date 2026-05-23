import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  jsonError,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";

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
    specialty: user.specialty,
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
    last_active: user.last_active,
    created_at: user.created_at,
  });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();
  const user = await upsertAppUser(auth.userId, auth.email, {
    name: body.name,
    specialty: body.specialty,
    institution: body.institution,
    career_stage: body.career_stage,
    preferred_location: body.preferred_location,
  }, auth.demo);
  return jsonOk({ message: "Profile updated", ...user });
}
