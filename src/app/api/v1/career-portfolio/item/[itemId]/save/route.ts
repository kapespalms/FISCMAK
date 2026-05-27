import { portfolioItemById, normalizeCareerPortfolioStage } from "@/lib/v2/career-portfolio-templates";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { itemId } = await params;

  if (!portfolioItemById(itemId)) {
    return jsonOk({ error: "validation_error", message: "Unknown portfolio item" }, 400);
  }

  const body = (await request.json()) as { checked?: boolean; notes?: string };
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const stored = meta.career_portfolio;
  const stageId = stored?.stage_id ?? normalizeCareerPortfolioStage(user.career_stage);
  const now = new Date().toISOString();
  const isCross = itemId.startsWith("cross_");

  const items = { ...(stored?.items ?? {}) };
  const crossCutting = { ...(stored?.cross_cutting ?? {}) };
  const patch = {
    ...(isCross ? crossCutting[itemId] : items[itemId]),
    ...(body.checked !== undefined ? { checked: body.checked } : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
    updated_at: now,
  };

  if (isCross) crossCutting[itemId] = patch;
  else items[itemId] = patch;

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        career_portfolio: { stage_id: stageId, items, cross_cutting: crossCutting, updated_at: now },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk({ item_id: itemId, saved_at: now });
}
