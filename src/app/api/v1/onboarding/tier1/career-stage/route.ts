import {
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { isValidCareerStage } from "@/lib/v2/onboarding-options";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { career_stage } = await request.json();
  if (!isValidCareerStage(career_stage)) {
    return jsonOk({ error: "validation_error", message: "Invalid career stage" }, 400);
  }
  const user = await upsertAppUser(auth.userId, auth.email, {
    career_stage,
    tier1_complete: true,
  }, auth.demo);
  return jsonOk({
    career_stage: user.career_stage,
    tier1_complete: true,
    saved_at: new Date().toISOString(),
  });
}
