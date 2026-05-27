import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
  verifyTraineeInProgram,
} from "@/lib/v2/gme/gme-program-access";
import { synthesizeNarratives } from "@/lib/v2/gme/narrative-synthesis";
import type { ParsedMedhubEvalRow } from "@/lib/v2/gme/medhub-csv-import";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(
  request: Request,
  context: { params: Promise<{ programId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { programId: programParam } = await context.params;
  const programId = resolveProgramId(programParam);
  if (!programId) {
    return jsonError("not_found", "Program not found.", 404);
  }

  const allowed = await canAccessProgramStaffTools(auth.userId, auth.email, programId);
  if (!allowed) {
    return jsonError("forbidden", "Program staff access required.", 403);
  }

  const { searchParams } = new URL(request.url);
  const traineeUserId = searchParams.get("trainee");
  const period = searchParams.get("period") ?? "current";

  if (!traineeUserId) {
    return jsonError("bad_request", "Query param trainee (user id) is required.", 400);
  }

  const inProgram = await verifyTraineeInProgram(traineeUserId, programId);
  if (!inProgram && !auth.demo) {
    return jsonError("not_found", "Trainee not found in this program.", 404);
  }

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      period,
      synthesis: synthesizeNarratives([]),
    });
  }

  const supabase = await createClient();
  const { data: evals, error } = await supabase
    .from("rotation_evaluations")
    .select("eval_id, rotation_name, supervisor_name, narrative_text")
    .eq("program_id", programId)
    .eq("trainee_user_id", traineeUserId)
    .order("eval_date", { ascending: false });

  if (error) {
    return jsonError("db_error", error.message, 500);
  }

  const evaluations: ParsedMedhubEvalRow[] = (evals ?? []).map((row) => ({
    eval_id: row.eval_id,
    form_name: null,
    form_version: null,
    trainee_initials: null,
    pgy_level: null,
    supervisor_name: row.supervisor_name,
    rotation_name: row.rotation_name,
    eval_date: null,
    narrative_text: row.narrative_text,
    numeric_scores: {},
    raw_row: {},
  }));

  return jsonOk({
    period,
    trainee_user_id: traineeUserId,
    synthesis: synthesizeNarratives(evaluations),
  });
}
