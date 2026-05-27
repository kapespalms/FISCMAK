import { getAppUser, isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonOk({ framework: null });
  }

  const profile = normalizeSpecialtyProfile(user);
  const framework = resolveTraineeEvaluationFramework({
    career_stage: user.career_stage,
    base_specialty: profile.base_specialty,
    subspecialty: profile.subspecialty,
    subspecialty_training_complete: profile.subspecialty_training_complete,
  });

  return jsonOk({ framework });
}
