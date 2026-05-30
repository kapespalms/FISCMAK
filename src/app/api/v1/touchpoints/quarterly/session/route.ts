import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { quarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import {
  advanceQuarterlyPulseSession,
  buildQuarterlyModulePrompt,
  clearQuarterlyPulseSession,
  currentQuarterlyModule,
  getQuarterlyPulseSession,
  initQuarterlyPulseSession,
} from "@/lib/v2/quarterly-mak-flow";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const session = getQuarterlyPulseSession(meta);
  const activeModule = currentQuarterlyModule(meta);
  const pulseDue = quarterlyPulseStatus(meta).due;

  return jsonOk({
    due: pulseDue,
    session,
    current_module: activeModule,
    prompt: activeModule
      ? buildQuarterlyModulePrompt(activeModule, user.practice_setting ?? "Academic")
      : null,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { action } = body as { action?: "init" | "advance" | "complete" };

  let meta = getOnboardingMetadata(user);

  if (action === "init") {
    meta = initQuarterlyPulseSession(meta);
  } else if (action === "advance") {
    meta = getQuarterlyPulseSession(meta)
      ? advanceQuarterlyPulseSession(meta)
      : initQuarterlyPulseSession(meta);
  } else if (action === "complete") {
    meta = clearQuarterlyPulseSession(meta);
  } else {
    return jsonOk({ error: "validation_error", message: "Unknown action." }, 400);
  }

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: meta as Record<string, unknown> },
    auth.demo,
  );

  const activeModule = currentQuarterlyModule(meta);
  return jsonOk({
    session: getQuarterlyPulseSession(meta),
    current_module: activeModule,
    prompt: activeModule
      ? buildQuarterlyModulePrompt(activeModule, user.practice_setting ?? "Academic")
      : null,
  });
}
