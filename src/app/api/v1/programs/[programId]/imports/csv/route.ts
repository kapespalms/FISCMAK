import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
} from "@/lib/v2/gme/gme-program-access";
import { parseMedhubCsv } from "@/lib/v2/gme/medhub-csv-import";

async function linkInitialsToUserIds(programId: string, initials: string[]) {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("app_users")
    .select("user_id, onboarding_metadata")
    .eq("primary_program_id", programId);

  const map = new Map<string, string>();
  for (const user of users ?? []) {
    const meta = user.onboarding_metadata as { trainee_initials?: string } | null;
    const key = meta?.trainee_initials?.trim().toUpperCase();
    if (key) map.set(key, user.user_id);
  }

  return initials.map((initial) => ({
    initials: initial,
    trainee_user_id: map.get(initial) ?? null,
  }));
}

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

  const body = (await request.json().catch(() => null)) as {
    csv_text?: string;
    file_name?: string;
  } | null;

  const csvText = body?.csv_text?.trim();
  if (!csvText) {
    return jsonError("validation_error", "Provide csv_text in request body.", 400);
  }

  const { rows, quality } = parseMedhubCsv(csvText);
  if (!rows.length) {
    return jsonError("validation_error", "No evaluation rows parsed from CSV.", 400, {
      quality,
    });
  }

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      demo: true,
      program_id: programId,
      file_name: body?.file_name ?? "upload.csv",
      quality,
      preview: rows.slice(0, 5),
      message: "Demo mode — CSV parsed but not persisted. Configure Supabase to store imports.",
    });
  }

  const supabase = await createClient();
  const importId = crypto.randomUUID();
  const initials = [
    ...new Set(rows.map((r) => r.trainee_initials).filter((v): v is string => Boolean(v))),
  ];
  const links = await linkInitialsToUserIds(programId, initials);
  const linkMap = new Map(links.map((l) => [l.initials, l.trainee_user_id]));

  const { error: importError } = await supabase.from("evaluation_imports").insert({
    import_id: importId,
    program_id: programId,
    source: "medhub_csv",
    uploaded_by: auth.userId,
    file_name: body?.file_name ?? "medhub.csv",
    row_count: rows.length,
    mapping_snapshot: { form: "medhub_outpatient_wide_v1" },
    quality_report: quality,
    status: "completed",
  });

  if (importError) {
    return jsonError("db_error", importError.message, 500);
  }

  const evalRows = rows.map((row) => ({
    eval_id: row.eval_id ?? crypto.randomUUID(),
    import_id: importId,
    program_id: programId,
    trainee_user_id: row.trainee_initials ? linkMap.get(row.trainee_initials) ?? null : null,
    trainee_initials: row.trainee_initials,
    form_name: row.form_name,
    form_version: row.form_version,
    rotation_name: row.rotation_name,
    pgy_level: row.pgy_level,
    eval_date: row.eval_date,
    supervisor_name: row.supervisor_name,
    numeric_scores: row.numeric_scores,
    narrative_text: row.narrative_text,
    raw_row: row.raw_row,
  }));

  const { error: evalError } = await supabase.from("rotation_evaluations").insert(evalRows);
  if (evalError) {
    return jsonError("db_error", evalError.message, 500);
  }

  const linked = evalRows.filter((r) => r.trainee_user_id).length;

  return jsonOk({
    import_id: importId,
    program_id: programId,
    row_count: rows.length,
    linked_trainee_rows: linked,
    unlinked_trainee_rows: rows.length - linked,
    quality,
  });
}
