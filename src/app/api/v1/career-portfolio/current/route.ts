import {
  assemblePortfolioSummary,
  CROSS_CUTTING_PORTFOLIO_ELEMENTS,
  getPortfolioStageDef,
  normalizeCareerPortfolioStage,
  portfolioCompletion,
  type CareerPortfolioStageId,
  type PortfolioItemState,
} from "@/lib/v2/career-portfolio-templates";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

function resolvePortfolio(meta: ReturnType<typeof getOnboardingMetadata>, careerStage?: string | null) {
  const stored = meta.career_portfolio;
  const stageId = stored?.stage_id ?? normalizeCareerPortfolioStage(careerStage);
  return {
    stageId,
    items: stored?.items ?? {},
    crossCutting: stored?.cross_cutting ?? {},
  };
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = getOnboardingMetadata(user ?? ({} as import("@/lib/v2/types").AppUser));
  const { stageId, items, crossCutting } = resolvePortfolio(meta, user?.career_stage);
  const stage = getPortfolioStageDef(stageId);
  const completion = portfolioCompletion(stageId, items, crossCutting);

  return jsonOk({
    stage_id: stageId,
    focus: stage.focus,
    domains: stage.domains.map((d) => ({
      id: d.id,
      title: d.title,
      items: d.items.map((i) => ({
        id: i.id,
        label: i.label,
        hint: i.hint ?? null,
        checked: items[i.id]?.checked ?? false,
        notes: items[i.id]?.notes ?? null,
        updated_at: items[i.id]?.updated_at ?? null,
      })),
    })),
    cross_cutting: CROSS_CUTTING_PORTFOLIO_ELEMENTS.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      checked: crossCutting[c.id]?.checked ?? false,
      notes: crossCutting[c.id]?.notes ?? null,
      updated_at: crossCutting[c.id]?.updated_at ?? null,
    })),
    overall_completion: completion,
    summary_preview: assemblePortfolioSummary({ stageId, items, crossCutting }),
    user: { specialty: user?.specialty, career_stage: user?.career_stage },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = (await request.json()) as { stage_id?: CareerPortfolioStageId };
  const meta = getOnboardingMetadata(user);
  const current = resolvePortfolio(meta, user.career_stage);
  const stageId = body.stage_id ?? current.stageId;
  const now = new Date().toISOString();

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        career_portfolio: {
          stage_id: stageId,
          items: current.items,
          cross_cutting: current.crossCutting,
          updated_at: now,
        },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  const completion = portfolioCompletion(stageId, current.items, current.crossCutting);
  return jsonOk({
    stage_id: stageId,
    overall_completion: completion,
    summary_preview: assemblePortfolioSummary({
      stageId,
      items: current.items,
      crossCutting: current.crossCutting,
    }),
  });
}
