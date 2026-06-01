import {
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { isValidSpecialty } from "@/lib/v2/onboarding-options";
import { lookupSocCode } from "@/lib/v2/specialty-soc-map";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { specialty } = await request.json();
  if (!specialty?.trim() || !isValidSpecialty(specialty.trim())) {
    return jsonOk({ error: "validation_error", message: "Select a specialty from the list" }, 400);
  }
  const trimmed = specialty.trim();
  const onet_soc_code = lookupSocCode(trimmed);
  const user = await upsertAppUser(auth.userId, auth.email, {
    specialty: trimmed,
    onet_soc_code,
  }, auth.demo);
  return jsonOk({ specialty: user.specialty, onet_soc_code: user.onet_soc_code, saved_at: new Date().toISOString() });
}
