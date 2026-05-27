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

export async function GET(
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

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({ surveys: [] });
  }

  try {
    const client = createAdminClient();
    const { data, error } = await client
      .from("pilot_coordinator_surveys")
      .select("*")
      .eq("program_id", programId)
      .order("submitted_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return jsonOk({ surveys: data ?? [] });
  } catch {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pilot_coordinator_surveys")
      .select("*")
      .eq("program_id", programId)
      .order("submitted_at", { ascending: false })
      .limit(20);
    if (error) {
      return jsonError("db_error", error.message, 500);
    }
    return jsonOk({ surveys: data ?? [] });
  }
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

  let body: {
    prep_minutes_manual?: number;
    prep_minutes_fiscmak?: number;
    percent_time_saved?: number;
    would_recommend?: boolean;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", "Invalid JSON body.", 400);
  }

  if (
    body.prep_minutes_manual == null ||
    body.prep_minutes_fiscmak == null ||
    body.percent_time_saved == null
  ) {
    return jsonError(
      "bad_request",
      "prep_minutes_manual, prep_minutes_fiscmak, and percent_time_saved are required.",
      400,
    );
  }

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      demo: true,
      message: "Survey recorded in demo mode (not persisted).",
      survey: body,
    });
  }

  const row = {
    program_id: programId,
    submitted_by: auth.userId,
    prep_minutes_manual: body.prep_minutes_manual,
    prep_minutes_fiscmak: body.prep_minutes_fiscmak,
    percent_time_saved: body.percent_time_saved,
    would_recommend: body.would_recommend ?? null,
    notes: body.notes?.trim() || null,
  };

  try {
    const client = createAdminClient();
    const { data, error } = await client
      .from("pilot_coordinator_surveys")
      .insert(row)
      .select("*")
      .single();
    if (error) throw error;
    return jsonOk({ survey: data });
  } catch {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pilot_coordinator_surveys")
      .insert(row)
      .select("*")
      .single();
    if (error) {
      return jsonError("db_error", error.message, 500);
    }
    return jsonOk({ survey: data });
  }
}
