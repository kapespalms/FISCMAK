import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  insertRotationEntry,
  loadRotationEntries,
} from "@/lib/v2/gme/trainee-gme-data";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  try {
    const entries = await loadRotationEntries(auth.userId, auth.demo);
    return jsonOk({ entries, count: entries.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load rotation entries.";
    return jsonError("db_error", message, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  let body: {
    rotation_name?: string;
    pgy_level?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    site?: string | null;
    notes?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", "Invalid JSON body.", 400);
  }

  if (!body.rotation_name?.trim()) {
    return jsonError("validation_error", "rotation_name is required.", 400);
  }

  try {
    const entry = await insertRotationEntry(auth.userId, auth.email, auth.demo, {
      rotation_name: body.rotation_name,
      pgy_level: body.pgy_level,
      start_date: body.start_date,
      end_date: body.end_date,
      site: body.site,
      notes: body.notes,
    });
    return jsonOk({ entry }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not log rotation entry.";
    return jsonError("db_error", message, 500);
  }
}
