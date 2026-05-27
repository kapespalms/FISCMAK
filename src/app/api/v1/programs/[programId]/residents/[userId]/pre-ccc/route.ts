import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
} from "@/lib/v2/gme/gme-program-access";
import type { ParsedMedhubEvalRow } from "@/lib/v2/gme/medhub-csv-import";
import { buildPreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";

export async function GET(
  request: Request,
  context: { params: Promise<{ programId: string; userId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { programId: programParam, userId } = await context.params;
  const programId = resolveProgramId(programParam);
  if (!programId) {
    return jsonError("not_found", "Program not found.", 404);
  }

  const staff = await canAccessProgramStaffTools(auth.userId, auth.email, programId);
  const self = auth.userId === userId;
  if (!staff && !self) {
    return jsonError("forbidden", "Not authorized for this trainee summary.", 403);
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      demo: true,
      summary: buildPreCccSummary({
        traineeUserId: userId,
        reportingPeriod: period,
        evaluations: [],
      }),
    });
  }

  const supabase = await createClient();
  const { data: evals, error } = await supabase
    .from("rotation_evaluations")
    .select(
      "eval_id, trainee_initials, pgy_level, rotation_name, supervisor_name, eval_date, form_name, numeric_scores, narrative_text",
    )
    .eq("program_id", programId)
    .eq("trainee_user_id", userId)
    .order("eval_date", { ascending: false });

  if (error) {
    return jsonError("db_error", error.message, 500);
  }

  const { data: trainee } = await supabase
    .from("app_users")
    .select("pgy_level, onboarding_metadata")
    .eq("user_id", userId)
    .maybeSingle();

  const meta = trainee?.onboarding_metadata as { trainee_initials?: string } | null;

  const evaluations: ParsedMedhubEvalRow[] = (evals ?? []).map((row) => ({
    eval_id: row.eval_id,
    form_name: row.form_name,
    form_version: null,
    trainee_initials: row.trainee_initials,
    pgy_level: row.pgy_level,
    supervisor_name: row.supervisor_name,
    rotation_name: row.rotation_name,
    eval_date: row.eval_date,
    narrative_text: row.narrative_text,
    numeric_scores: (row.numeric_scores ?? {}) as Record<string, number>,
    raw_row: {},
  }));

  const summary = buildPreCccSummary({
    traineeUserId: userId,
    traineeInitials: meta?.trainee_initials ?? evaluations[0]?.trainee_initials ?? null,
    pgyLevel: trainee?.pgy_level ?? evaluations[0]?.pgy_level ?? null,
    reportingPeriod: period,
    evaluations,
  });

  return jsonOk({ summary });
}
