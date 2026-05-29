import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { annualRefreshStatus } from "@/lib/v2/annual-refresh";
import {
  advanceAnnualRefreshSession,
  buildAnnualModulePrompt,
  clearAnnualRefreshSession,
  currentAnnualModule,
  getAnnualRefreshSession,
  initAnnualRefreshSession,
} from "@/lib/v2/annual-mak-flow";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const session = getAnnualRefreshSession(meta);
  const activeModule = currentAnnualModule(meta);
  const annualDue = annualRefreshStatus(meta).due;

  return jsonOk({
    due: annualDue,
    session,
    current_module: activeModule,
    prompt: activeModule ? buildAnnualModulePrompt(activeModule) : null,
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
    meta = initAnnualRefreshSession(meta);
  } else if (action === "advance") {
    meta = getAnnualRefreshSession(meta)
      ? advanceAnnualRefreshSession(meta)
      : initAnnualRefreshSession(meta);
  } else if (action === "complete") {
    meta = clearAnnualRefreshSession(meta);
  } else {
    return jsonOk({ error: "validation_error", message: "Unknown action." }, 400);
  }

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: meta as Record<string, unknown> },
    auth.demo,
  );

  const activeModule = currentAnnualModule(meta);
  return jsonOk({
    session: getAnnualRefreshSession(meta),
    current_module: activeModule,
    prompt: activeModule ? buildAnnualModulePrompt(activeModule) : null,
  });
}
