import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonOk({ subcompetencies: [], primary_slug: null });
  }

  const profile = normalizeSpecialtyProfile(user);
  const framework = resolveTraineeEvaluationFramework({
    career_stage: user.career_stage,
    base_specialty: profile.base_specialty,
    subspecialty: profile.subspecialty,
    subspecialty_training_complete: profile.subspecialty_training_complete,
  });

  if (!framework) {
    return jsonOk({ subcompetencies: [], primary_slug: null });
  }

  return jsonOk({
    primary_slug: framework.primary_slug,
    primary_name: framework.primary_specialty,
    milestone_status: framework.milestone_status,
    subcompetencies: framework.subcompetencies,
  });
}
