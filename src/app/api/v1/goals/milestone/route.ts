import type { CareerGoal } from "@/lib/goals";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { fetchCareerGoals } from "@/lib/v2/db";
import {
  applyMilestoneStatus,
  findCurrentMilestoneIndex,
  type MilestoneStatus,
} from "@/lib/v2/goal-milestone-actions";
import { updateGoalMilestoneHistory } from "@/lib/v2/goal-milestone-tracking";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { goal_id, milestone_index, status } = body as {
    goal_id?: string;
    milestone_index?: number;
    status?: MilestoneStatus;
  };

  if (!goal_id || status == null) {
    return jsonOk(
      { error: "validation_error", message: "goal_id and status required." },
      400,
    );
  }

  const goals = await fetchCareerGoals(auth.userId, auth.demo);
  const index = goals.findIndex((g) => g.id === goal_id);
  if (index < 0) {
    return jsonOk({ error: "not_found", message: "Goal not found." }, 404);
  }

  const resolvedIndex =
    milestone_index ?? findCurrentMilestoneIndex(goals[index]);
  const updatedGoal = applyMilestoneStatus(goals[index], resolvedIndex, status);
  const nextGoals = goals.map((g, i) => (i === index ? updatedGoal : g));

  let meta = getOnboardingMetadata(user);
  meta = {
    ...meta,
    stored_goals: nextGoals,
  };
  meta = updateGoalMilestoneHistory(meta, nextGoals);

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: meta as Record<string, unknown> },
    auth.demo,
  );

  return jsonOk({
    goal: updatedGoal,
    goals: nextGoals,
    stalled_goal: meta.stalled_goal_title
      ? { title: meta.stalled_goal_title, quarters: meta.stalled_goal_quarters }
      : null,
  });
}
