import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
} from "@/lib/v2/gme/gme-program-access";
import { parsePriteCsv } from "@/lib/v2/gme/prite-csv-import";

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

  const body = (await request.json().catch(() => null)) as { csv_text?: string } | null;
  const csvText = body?.csv_text?.trim();
  if (!csvText) {
    return jsonError("validation_error", "Provide csv_text in request body.", 400);
  }

  const { rows, quality } = parsePriteCsv(csvText);
  if (!rows.length) {
    return jsonError("validation_error", "No PRITE rows parsed.", 400, { quality });
  }

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      demo: true,
      row_count: rows.length,
      quality,
      preview: rows.slice(0, 5),
    });
  }

  const initials = [...new Set(rows.map((r) => r.trainee_initials))];
  const links = await linkInitialsToUserIds(programId, initials);
  const linkMap = new Map(links.map((l) => [l.initials, l.trainee_user_id]));

  const supabase = await createClient();
  const examRows = rows.flatMap((row) => {
    const traineeUserId = linkMap.get(row.trainee_initials);
    if (!traineeUserId) return [];
    return [
      {
        exam_id: crypto.randomUUID(),
        program_id: programId,
        trainee_user_id: traineeUserId,
        exam_type: row.exam_type,
        exam_year: row.exam_year,
        overall_percentile: row.overall_percentile,
        domain_scores: row.domain_scores,
      },
    ];
  });

  if (!examRows.length) {
    return jsonError("validation_error", "No rows linked to program trainees.", 400, { quality });
  }

  const { error } = await supabase.from("in_training_exams").upsert(examRows, {
    onConflict: "trainee_user_id,exam_type,exam_year",
  });

  if (error) {
    return jsonError("db_error", error.message, 500);
  }

  return jsonOk({
    row_count: examRows.length,
    unlinked_rows: rows.length - examRows.length,
    quality,
  });
}
