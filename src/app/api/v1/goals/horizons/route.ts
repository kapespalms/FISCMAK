/**
 * Goals horizons API — Phase 2b.
 *
 * GET  /api/v1/goals/horizons  — all goal_records for current user, grouped by horizon
 * POST /api/v1/goals/horizons  — create a goal in a specific horizon
 *
 * ⚠️  goal_records migration (20260539 + 20260550) is founder-gated.
 *     All DB operations are wrapped in try/catch and return empty state
 *     gracefully if the table doesn't exist yet.
 *
 * Horizon → Framework mapping (spec Part X):
 *   3mo  → SMART    (specific, measurable, achievable, relevant, time_bound)
 *   1yr  → SMART_II (+implementation_intention)
 *   5yr  → WOOP     (wish, outcome, obstacle, plan)
 *   10yr → legacy   (title + description only)
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import type { GoalHorizon, GoalFramework, GoalRecord, GoalsByHorizon } from "@/lib/v2/goal-records";
import { HORIZON_FRAMEWORK, HORIZON_ORDER } from "@/lib/v2/goal-records";
// Re-export so existing callers of this route module still compile
export type { GoalHorizon, GoalFramework, GoalRecord, GoalsByHorizon } from "@/lib/v2/goal-records";
export { HORIZON_FRAMEWORK, HORIZON_LABELS, HORIZON_ORDER } from "@/lib/v2/goal-records";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({ goals: { "3mo": [], "1yr": [], "5yr": [], "10yr": [] } as GoalsByHorizon });
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("goal_records")
      .select(
        "id, user_id, horizon, framework, domain_index, " +
        "specific, measurable, achievable, relevant, time_bound, implementation_intention, " +
        "wish, outcome, obstacle, plan, " +
        "created_at, updated_at",
      )
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: true });

    if (error) {
      // Table may not be applied yet — return empty gracefully
      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        return jsonOk({ goals: { "3mo": [], "1yr": [], "5yr": [], "10yr": [] } as GoalsByHorizon, migration_pending: true });
      }
      return jsonError("db_error", error.message, 500);
    }

    const grouped: GoalsByHorizon = { "3mo": [], "1yr": [], "5yr": [], "10yr": [] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of (data ?? []) as any[]) {
      const h = row.horizon as GoalHorizon;
      const goal: GoalRecord = {
        id:           row.id as string,
        user_id:      row.user_id as string,
        horizon:      h,
        framework:    (row.framework as GoalFramework) ?? HORIZON_FRAMEWORK[h],
        domain_index: row.domain_index as number | null,
        title:        "",
        description:  null,
        specific:     row.specific as string | null,
        measurable:   row.measurable as string | null,
        achievable:   row.achievable as string | null,
        relevant:     row.relevant as string | null,
        time_bound:   row.time_bound as string | null,
        implementation_intention: row.implementation_intention as string | null,
        wish:         row.wish as string | null,
        outcome:      row.outcome as string | null,
        obstacle:     row.obstacle as string | null,
        plan:         row.plan as string | null,
        created_at:   row.created_at as string,
        updated_at:   row.updated_at as string,
      };
      // Derive display title from the most meaningful field
      goal.title = deriveTitle(goal);
      grouped[h].push(goal);
    }

    return jsonOk({ goals: grouped });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("relation") || msg.includes("does not exist")) {
      return jsonOk({ goals: { "3mo": [], "1yr": [], "5yr": [], "10yr": [] } as GoalsByHorizon, migration_pending: true });
    }
    return jsonError("db_error", msg, 500);
  }
}

function deriveTitle(g: GoalRecord): string {
  if (g.specific?.trim()) return g.specific.slice(0, 100);
  if (g.wish?.trim()) return g.wish.slice(0, 100);
  if (g.description?.trim()) return g.description.slice(0, 100);
  return g.title || "(untitled)";
}

type CreateBody = {
  horizon:     GoalHorizon;
  specific?:   string;
  measurable?: string;
  achievable?: string;
  relevant?:   string;
  time_bound?: string;
  implementation_intention?: string;
  wish?:       string;
  outcome?:    string;
  obstacle?:   string;
  plan?:       string;
  description?: string;
  domain_index?: number;
};

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Goal editing is not available in demo mode.", 403);

  let body: Partial<CreateBody>;
  try { body = (await request.json()) as Partial<CreateBody>; }
  catch { return jsonError("validation_error", "Invalid JSON.", 400); }

  if (!body.horizon || !["3mo", "1yr", "5yr", "10yr"].includes(body.horizon)) {
    return jsonError("validation_error", "Valid horizon is required (3mo|1yr|5yr|10yr).", 400);
  }

  const framework = HORIZON_FRAMEWORK[body.horizon as GoalHorizon];
  const now = new Date().toISOString();
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("goal_records")
      .insert({
        user_id:      auth.userId,
        horizon:      body.horizon,
        framework,
        domain_index: body.domain_index ?? null,
        specific:     body.specific?.trim() || null,
        measurable:   body.measurable?.trim() || null,
        achievable:   body.achievable?.trim() || null,
        relevant:     body.relevant?.trim() || null,
        time_bound:   body.time_bound?.trim() || null,
        implementation_intention: body.implementation_intention?.trim() || null,
        wish:         body.wish?.trim() || null,
        outcome:      body.outcome?.trim() || null,
        obstacle:     body.obstacle?.trim() || null,
        plan:         body.plan?.trim() || null,
        created_at:   now,
        updated_at:   now,
      })
      .select("id, horizon, framework, domain_index, specific, measurable, achievable, relevant, time_bound, implementation_intention, wish, outcome, obstacle, plan, created_at, updated_at")
      .single();

    if (error) return jsonError("db_error", error.message, 500);

    const goal: GoalRecord = {
      id: data.id as string, user_id: auth.userId, horizon: body.horizon as GoalHorizon,
      framework, domain_index: data.domain_index as number | null,
      title: "", description: null,
      specific: data.specific as string | null, measurable: data.measurable as string | null,
      achievable: data.achievable as string | null, relevant: data.relevant as string | null,
      time_bound: data.time_bound as string | null,
      implementation_intention: data.implementation_intention as string | null,
      wish: data.wish as string | null, outcome: data.outcome as string | null,
      obstacle: data.obstacle as string | null, plan: data.plan as string | null,
      created_at: data.created_at as string, updated_at: data.updated_at as string,
    };
    goal.title = deriveTitle(goal);

    return jsonOk({ goal }, 201);
  } catch (err) {
    return jsonError("db_error", err instanceof Error ? err.message : "Insert failed", 500);
  }
}
