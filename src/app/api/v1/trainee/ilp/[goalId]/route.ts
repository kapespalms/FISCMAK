import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { patchIlpGoal } from "@/lib/v2/gme/trainee-gme-data";

type GmeMeta = {
  gme?: {
    ilp_goals?: Record<string, Array<{ goal_id: string; locked_at?: string | null }>>;
  };
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ goalId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { goalId } = await context.params;

  let body: {
    goal_text?: string;
    resources?: string | null;
    target_date?: string | null;
    status?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", "Invalid JSON body.", 400);
  }

  if (body.status && !["draft", "active", "completed", "deferred"].includes(body.status)) {
    return jsonError("bad_request", "Invalid status.", 400);
  }

  try {
    const goal = await patchIlpGoal(auth.userId, auth.email, auth.demo, goalId, body);
    if (!goal) {
      return jsonError("not_found", "ILP goal not found.", 404);
    }
    return jsonOk({ goal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update ILP goal.";
    return jsonError("db_error", message, 500);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ goalId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { goalId } = await context.params;

  if (!isSupabaseConfigured() || auth.demo) {
    const state = getServerDemo(auth.userId);
    const meta = (state.user.onboarding_metadata ?? {}) as GmeMeta;
    const gme = meta.gme ?? {};
    const periods = { ...(gme.ilp_goals ?? {}) };
    let found = false;
    for (const [period, goals] of Object.entries(periods)) {
      const idx = goals.findIndex((g) => g.goal_id === goalId);
      if (idx >= 0) {
        if (goals[idx].locked_at) {
          return jsonError("forbidden", "Submitted goals cannot be deleted.", 403);
        }
        periods[period] = goals.filter((g) => g.goal_id !== goalId);
        found = true;
        break;
      }
    }
    if (!found) return jsonError("not_found", "ILP goal not found.", 404);
    state.user = {
      ...state.user,
      onboarding_metadata: {
        ...(state.user.onboarding_metadata ?? {}),
        gme: { ...gme, ilp_goals: periods },
      } as Record<string, unknown>,
    };
    return jsonOk({ deleted: true });
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("ilp_goals")
    .select("locked_at")
    .eq("goal_id", goalId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (!existing) return jsonError("not_found", "ILP goal not found.", 404);
  if (existing.locked_at) {
    return jsonError("forbidden", "Submitted goals cannot be deleted.", 403);
  }

  const { error } = await supabase
    .from("ilp_goals")
    .delete()
    .eq("goal_id", goalId)
    .eq("user_id", auth.userId);

  if (error) return jsonError("db_error", error.message, 500);
  return jsonOk({ deleted: true });
}
