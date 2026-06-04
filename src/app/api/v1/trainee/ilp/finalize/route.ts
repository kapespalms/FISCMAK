import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { loadIlpGoals } from "@/lib/v2/gme/trainee-gme-data";

type GmeMeta = {
  gme?: {
    ilp_goals?: Record<string, Array<{ goal_id: string; locked_at?: string | null }>>;
  };
};

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  let body: { period?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const period = body.period ?? "current";
  const now = new Date().toISOString();

  if (!isSupabaseConfigured() || auth.demo) {
    const state = getServerDemo(auth.userId);
    const meta = (state.user.onboarding_metadata ?? {}) as GmeMeta;
    const gme = meta.gme ?? {};
    const periodGoals = (gme.ilp_goals?.[period] ?? []).map((g) => ({
      ...g,
      locked_at: g.locked_at ?? now,
    }));
    state.user = {
      ...state.user,
      onboarding_metadata: {
        ...(state.user.onboarding_metadata ?? {}),
        gme: {
          ...gme,
          ilp_goals: { ...(gme.ilp_goals ?? {}), [period]: periodGoals },
        },
      } as Record<string, unknown>,
    };
    const goals = await loadIlpGoals(auth.userId, auth.demo, period);
    return jsonOk({ period, goals, finalized: goals.length });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ilp_goals")
    .update({ locked_at: now })
    .eq("user_id", auth.userId)
    .eq("reporting_period", period)
    .is("locked_at", null);

  if (error) return jsonError("db_error", error.message, 500);

  const goals = await loadIlpGoals(auth.userId, false, period);
  return jsonOk({ period, goals, finalized: goals.length });
}
