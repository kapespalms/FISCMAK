import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { CareerGoal } from "@/lib/goals";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { goals } = body as { goals?: CareerGoal[] };

  const meta = getOnboardingMetadata(user);
  const updated = {
    ...meta,
    goals_confirmed: true,
    goals_confirmed_at: new Date().toISOString(),
    ...(goals?.length ? { stored_goals: goals } : {}),
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: updated as Record<string, unknown> },
    auth.demo,
  );

  return jsonOk({
    goals_confirmed: true,
    goals_count: goals?.length ?? meta.stored_goals?.length ?? 0,
  });
}
