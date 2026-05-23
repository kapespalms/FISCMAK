import type { CareerGoal } from "@/lib/goals";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { fetchCareerGoals } from "@/lib/v2/db";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const goals = await fetchCareerGoals(auth.userId, auth.demo);
  const goalsConfirmed = user
    ? Boolean(getOnboardingMetadata(user).goals_confirmed)
    : false;
  return jsonOk({ goals, goals_confirmed: goalsConfirmed });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { goals } = body as { goals?: CareerGoal[] };
  if (!Array.isArray(goals)) {
    return jsonOk({ error: "validation_error", message: "Goals array required." }, 400);
  }

  const meta = getOnboardingMetadata(user);
  const updatedMeta = {
    ...meta,
    stored_goals: goals.map((g) => ({
      ...g,
      updated_at: new Date().toISOString(),
    })),
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: updatedMeta as Record<string, unknown> },
    auth.demo,
  );

  return jsonOk({ saved: goals.length });
}
