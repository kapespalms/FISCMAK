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

  const medhubUrl = process.env.MEDHUB_API_URL?.trim();
  const medhubKey = process.env.MEDHUB_API_KEY?.trim();
  const configured = Boolean(medhubUrl && medhubKey);
  const recent_runs = auth.demo ? [] : await loadRecentSyncRuns(programId);

  return jsonOk({
    configured,
    live_pull_available: false,
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

  const medhubUrl = process.env.MEDHUB_API_URL?.trim();
  const medhubKey = process.env.MEDHUB_API_KEY?.trim();
  const configured = Boolean(medhubUrl && medhubKey);

  const syncId = crypto.randomUUID();
  const detail = configured
    ? {
        message:
          "MedHub credentials detected but live pull is not yet wired — use CSV import for the pilot.",
        medhub_api_url: medhubUrl,
        fallback: "POST /api/v1/programs/:id/imports/csv",
      }
    : {
        message: "MedHub live sync not configured for this environment.",
        required_env: ["MEDHUB_API_URL", "MEDHUB_API_KEY"],
        fallback: "POST /api/v1/programs/:id/imports/csv",
        docs: "docs/seeds/PILOT_RESIDENT_SETUP.md",
      };

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      demo: true,
      sync_id: syncId,
      status: "not_configured",
      ...detail,
    });
  }

  const row = {
    sync_id: syncId,
    program_id: programId,
    triggered_by: auth.userId,
    status: configured ? "pending" : "not_configured",
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
    status: row.status,
    recent_runs,
    ...detail,
  });
}
