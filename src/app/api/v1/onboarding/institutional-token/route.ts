import { previewInstitutionalToken } from "@/lib/v2/programs/institutional-onboarding-tokens";
import { jsonError, jsonOk } from "@/lib/v2/api-helpers";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return jsonError("validation_error", "Token required", 400);
  }
  const preview = await previewInstitutionalToken(token);
  return jsonOk(preview, preview.valid ? 200 : 404);
}
