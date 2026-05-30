import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  isOnboardingStatus,
  resolvePostLoginPath,
  type OnboardingStatus,
} from "@/lib/v2/onboarding-progress";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  return jsonOk({
    path: resolvePostLoginPath(user),
    onboarding_status: user.onboarding_status ?? "NOT_STARTED",
    current_onboarding_step: user.current_onboarding_step ?? null,
    coach_mak_conversation_id: user.coach_mak_conversation_id ?? null,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();
  const {
    current_onboarding_step,
    onboarding_status,
    coach_mak_conversation_id,
    profile_draft,
  } = body as {
    current_onboarding_step?: number | null;
    onboarding_status?: OnboardingStatus;
    coach_mak_conversation_id?: string | null;
    profile_draft?: Record<string, unknown>;
  };

  const user = await getAppUser(auth.userId, auth.demo);
  const priorMeta = user ? getOnboardingMetadata(user) : {};

  const patch: Record<string, unknown> = {};

  if (current_onboarding_step !== undefined) {
    if (
      current_onboarding_step !== null &&
      (current_onboarding_step < 1 || current_onboarding_step > 3)
    ) {
      return jsonOk(
        { error: "validation_error", message: "current_onboarding_step must be 1–3." },
        400,
      );
    }
    patch.current_onboarding_step = current_onboarding_step;
  }

  if (onboarding_status !== undefined) {
    if (!isOnboardingStatus(onboarding_status)) {
      return jsonOk({ error: "validation_error", message: "Invalid onboarding_status." }, 400);
    }
    patch.onboarding_status = onboarding_status;
  }

  if (coach_mak_conversation_id !== undefined) {
    patch.coach_mak_conversation_id = coach_mak_conversation_id;
  }

  if (profile_draft !== undefined) {
    patch.onboarding_metadata = {
      ...priorMeta,
      profile_draft,
    };
  }

  if (Object.keys(patch).length === 0) {
    return jsonOk({ error: "validation_error", message: "No fields to update." }, 400);
  }

  const saved = await upsertAppUser(auth.userId, auth.email, patch, auth.demo);

  return jsonOk({
    onboarding_status: saved.onboarding_status ?? "NOT_STARTED",
    current_onboarding_step: saved.current_onboarding_step ?? null,
    coach_mak_conversation_id: saved.coach_mak_conversation_id ?? null,
    saved_at: new Date().toISOString(),
  });
}
