import {
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { isValidSpecialty } from "@/lib/v2/onboarding-options";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { specialty } = await request.json();
  if (!specialty?.trim() || !isValidSpecialty(specialty.trim())) {
    return jsonOk({ error: "validation_error", message: "Select a specialty from the list" }, 400);
  }
  const user = await upsertAppUser(auth.userId, auth.email, {
    specialty: specialty.trim(),
  }, auth.demo);
  return jsonOk({ specialty: user.specialty, saved_at: new Date().toISOString() });
}
