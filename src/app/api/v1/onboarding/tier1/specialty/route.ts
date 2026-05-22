import {
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { specialty } = await request.json();
  if (!specialty?.trim()) {
    return jsonOk({ error: "validation_error", message: "Specialty required" }, 400);
  }
  const user = await upsertAppUser(auth.userId, auth.email, {
    specialty: specialty.trim(),
  }, auth.demo);
  return jsonOk({ specialty: user.specialty, saved_at: new Date().toISOString() });
}
