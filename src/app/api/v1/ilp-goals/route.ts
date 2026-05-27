import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  insertIlpGoals,
  loadIlpGoals,
  patchIlpGoal,
} from "@/lib/v2/gme/trainee-gme-data";

type IlpGoalBody = {
  goal_id?: string;
  period?: string;
  subcompetency_id?: string | null;
  goal_text?: string;
  resources?: string | null;
  target_date?: string | null;
  status?: string;
  goals?: Array<{
    subcompetency_id?: string | null;
    goal_text: string;
    resources?: string | null;
    target_date?: string | null;
    status?: string;
  }>;
};

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  try {
    const goals = await loadIlpGoals(auth.userId, auth.demo, period);
    return jsonOk({ period, goals });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load ILP goals.";
    return jsonError("db_error", message, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  let body: IlpGoalBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", "Invalid JSON body.", 400);
  }

  const period = body.period ?? "current";

  if (body.goal_id) {
    if (!body.goal_text && body.status === undefined && body.resources === undefined && body.target_date === undefined) {
      return jsonError("validation_error", "Provide fields to update.", 400);
    }
    try {
      const existing = await loadIlpGoals(auth.userId, auth.demo, period);
      const current = existing.find((g) => g.goal_id === body.goal_id);
      if (!current) return jsonError("not_found", "ILP goal not found.", 404);
      if (current.locked_at) {
        return jsonError("forbidden", "Approved goals cannot be edited.", 403);
      }
      const goal = await patchIlpGoal(auth.userId, auth.email, auth.demo, body.goal_id, {
        goal_text: body.goal_text,
        resources: body.resources,
        target_date: body.target_date,
        status: body.status,
      });
      if (!goal) return jsonError("not_found", "ILP goal not found.", 404);
      return jsonOk({ goal });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update ILP goal.";
      return jsonError("db_error", message, 500);
    }
  }

  const toCreate =
    body.goals ??
    (body.goal_text
      ? [
          {
            subcompetency_id: body.subcompetency_id,
            goal_text: body.goal_text,
            resources: body.resources,
            target_date: body.target_date,
            status: body.status,
          },
        ]
      : []);

  if (!toCreate.length || toCreate.some((g) => !g.goal_text?.trim())) {
    return jsonError("validation_error", "goal_text is required.", 400);
  }

  for (const goal of toCreate) {
    if (goal.status && !["draft", "active", "completed", "deferred"].includes(goal.status)) {
      return jsonError("validation_error", "Invalid status.", 400);
    }
  }

  try {
    const goals = await insertIlpGoals(
      auth.userId,
      auth.email,
      auth.demo,
      period,
      toCreate.map((g) => ({
        subcompetency_id: g.subcompetency_id ?? null,
        goal_text: g.goal_text.trim(),
        resources: g.resources ?? null,
        target_date: g.target_date ?? null,
        status: g.status ?? "draft",
        source: "trainee",
      })),
    );
    return jsonOk({ period, goals }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create ILP goals.";
    return jsonError("db_error", message, 500);
  }
}
