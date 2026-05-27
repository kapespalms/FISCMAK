import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
} from "@/lib/v2/gme/gme-program-access";

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

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({ imports: [], demo: true });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluation_imports")
    .select(
      "import_id, source, file_name, row_count, quality_report, status, imported_at, uploaded_by",
    )
    .eq("program_id", programId)
    .order("imported_at", { ascending: false })
    .limit(50);

  if (error) {
    return jsonError("db_error", error.message, 500);
  }

  return jsonOk({ imports: data ?? [] });
}
