import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function POST() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  const meta = getOnboardingMetadata(user);
  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        job_search_active: true,
        job_search_activated_at: new Date().toISOString(),
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk({ job_search_active: true });
}
