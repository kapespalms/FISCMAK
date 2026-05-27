import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
import { fetchMedhubEvaluationsLive } from "@/lib/v2/gme/medhub-sync-client";

async function loadRecentSyncRuns(programId: string, limit = 5) {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("medhub_sync_runs")
      .select("sync_id, status, started_at, finished_at, detail")
      .eq("program_id", programId)
      .order("started_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

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

export async function GET(
  _request: Request,
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

  const configured = Boolean(
    process.env.MEDHUB_API_URL?.trim() && process.env.MEDHUB_API_KEY?.trim(),
  );
  const recent_runs = auth.demo ? [] : await loadRecentSyncRuns(programId);

  return jsonOk({
    configured,
    live_pull_available: configured,
    fallback: "POST /api/v1/programs/:id/imports/csv",
    recent_runs,
  });
}

export async function POST(
  _request: Request,
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

  const syncId = crypto.randomUUID();

  if (!isSupabaseConfigured() || auth.demo) {
    const live = await fetchMedhubEvaluationsLive();
    return jsonOk({
      demo: true,
      sync_id: syncId,
      status: live.ok ? "completed" : "not_configured",
      row_count: live.ok ? live.rows.length : 0,
      message: live.ok ? `Demo: fetched ${live.rows.length} row(s).` : live.reason,
      fallback: "POST /api/v1/programs/:id/imports/csv",
    });
  }

  const live = await fetchMedhubEvaluationsLive();
  let status: string;
  let detail: Record<string, unknown>;
  let imported = 0;

  if (!live.ok) {
    status = live.source === "not_configured" ? "not_configured" : "failed";
    detail = {
      message: live.reason,
      required_env: ["MEDHUB_API_URL", "MEDHUB_API_KEY"],
      fallback: "POST /api/v1/programs/:id/imports/csv",
      docs: "docs/DEPLOY_PILOT.md",
    };
  } else {
    const supabase = await createClient();
    const importId = crypto.randomUUID();
    const initials = [
      ...new Set(live.rows.map((r) => r.trainee_initials).filter((v): v is string => Boolean(v))),
    ];
    const links = await linkInitialsToUserIds(programId, initials);
    const linkMap = new Map(links.map((l) => [l.initials, l.trainee_user_id]));

    await supabase.from("evaluation_imports").insert({
      import_id: importId,
      program_id: programId,
      source: "medhub_api",
      uploaded_by: auth.userId,
      file_name: "medhub_live_sync",
      row_count: live.rows.length,
      mapping_snapshot: { form: "medhub_live_v1" },
      quality_report: { source: "live_api" },
      status: "completed",
    });

    const evalRows = live.rows.map((row) => ({
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
      status = "failed";
      detail = { message: evalError.message, fetched_rows: live.rows.length };
    } else {
      status = "completed";
      imported = evalRows.length;
      detail = {
        message: `Live MedHub sync imported ${imported} evaluation(s).`,
        import_id: importId,
        linked_trainee_rows: evalRows.filter((r) => r.trainee_user_id).length,
      };
    }
  }

  const row = {
    sync_id: syncId,
    program_id: programId,
    triggered_by: auth.userId,
    status,
    detail,
    finished_at: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    await admin.from("medhub_sync_runs").insert(row);
  } catch {
    const supabase = await createClient();
    await supabase.from("medhub_sync_runs").insert(row);
  }

  const recent_runs = await loadRecentSyncRuns(programId);

  return jsonOk({
    sync_id: syncId,
    status,
    row_count: imported,
    recent_runs,
    ...detail,
  });
}
