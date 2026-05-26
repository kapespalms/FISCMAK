import {
  assembleIndustryDocument,
  buildIndustryCareerMakContext,
  completionForIndustrySection,
  enrichIndustrySectionPrompts,
  getSectionsForIndustryDocument,
  INDUSTRY_COVER_LETTER_TIPS,
  INDUSTRY_RECRUITING_SECTORS,
  INDUSTRY_STAGE_POSITIONING,
  INDUSTRY_TRANSITION_TIPS,
  mapPivotPathToIndustry,
  normalizeIndustryCareerStage,
  normalizeIndustryDocumentType,
  normalizeIndustrySector,
  type IndustryCareerStageId,
  type IndustryDocumentType,
  type IndustrySectorId,
} from "@/lib/v2/industry-career-templates";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export type IndustrySectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
};

function resolveIndustryCareer(
  meta: ReturnType<typeof getOnboardingMetadata>,
  documentType: IndustryDocumentType,
  user?: {
    career_stage?: string | null;
    specialty?: string | null;
    practice_setting?: string | null;
  },
) {
  const stored = meta.industry_career_documents?.[documentType];
  const stageId = stored?.stage_id ?? normalizeIndustryCareerStage(user?.career_stage);
  const sectorId =
    stored?.sector_id ??
    mapPivotPathToIndustry(meta.career_pivot_context?.target_path) ??
    normalizeIndustrySector(null);
  return {
    stageId,
    sectorId,
    sections: stored?.sections ?? {},
  };
}

function rowsForDocument(
  documentType: IndustryDocumentType,
  sectorId: IndustrySectorId,
  stageId: IndustryCareerStageId,
  sections: Record<string, { content?: string; completion_percentage?: number }>,
): IndustrySectionRow[] {
  return getSectionsForIndustryDocument(documentType, sectorId).map((def) => {
    const saved = sections[def.id];
    const content = saved?.content ?? null;
    return {
      section: def.id,
      title: def.title,
      subtitle: def.subtitle,
      target_words: def.targetWords,
      content,
      completion_percentage:
        saved?.completion_percentage ??
        completionForIndustrySection(content ?? "", def.targetWords),
      prompts: enrichIndustrySectionPrompts(def.prompts, {
        documentType,
        sectorId,
        stageId,
        sectionId: def.id,
      }),
    };
  });
}

function buildPayload(
  documentType: IndustryDocumentType,
  stageId: IndustryCareerStageId,
  sectorId: IndustrySectorId,
  sections: Record<string, { content?: string; completion_percentage?: number }>,
  user?: {
    name?: string | null;
    specialty?: string | null;
    career_stage?: string | null;
  },
) {
  const sector = INDUSTRY_RECRUITING_SECTORS.find((s) => s.id === sectorId)!;
  const stage = INDUSTRY_STAGE_POSITIONING[stageId];
  const rows = rowsForDocument(documentType, sectorId, stageId, sections);
  const overall = rows.length
    ? Math.round(rows.reduce((sum, s) => sum + s.completion_percentage, 0) / rows.length)
    : 0;

  return {
    document_type: documentType,
    sector_id: sectorId,
    stage_id: stageId,
    sector_label: sector.label,
    sector_roles: sector.roles,
    stage_positioning: stage ?? null,
    transition_tips: INDUSTRY_TRANSITION_TIPS,
    cover_letter_tips: INDUSTRY_COVER_LETTER_TIPS[sectorId],
    recruiting_sectors: INDUSTRY_RECRUITING_SECTORS.map((s) => ({
      id: s.id,
      label: s.label,
      hasDetailedResumeTemplate: s.hasDetailedResumeTemplate,
    })),
    sections: rows,
    overall_completion: overall,
    full_draft_preview: assembleIndustryDocument({
      documentType,
      sectorId,
      stageId,
      sections,
    }),
    mak_context: buildIndustryCareerMakContext({
      documentType,
      sectorId,
      stageId,
      specialty: user?.specialty ?? undefined,
    }),
    user: {
      name: user?.name,
      specialty: user?.specialty,
      career_stage: user?.career_stage,
    },
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentType: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { documentType: rawType } = await params;
  const documentType = normalizeIndustryDocumentType(rawType);

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = getOnboardingMetadata(user ?? ({} as import("@/lib/v2/types").AppUser));
  const ctx = resolveIndustryCareer(meta, documentType, user ?? undefined);

  return jsonOk(
    buildPayload(documentType, ctx.stageId, ctx.sectorId, ctx.sections, user ?? undefined),
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ documentType: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const { documentType: rawType } = await params;
  const documentType = normalizeIndustryDocumentType(rawType);
  const body = (await request.json()) as {
    stage_id?: IndustryCareerStageId;
    sector_id?: IndustrySectorId;
  };

  const meta = getOnboardingMetadata(user);
  const current = resolveIndustryCareer(meta, documentType, user);
  const stageId = body.stage_id ?? current.stageId;
  const sectorId = body.sector_id ?? current.sectorId;
  const now = new Date().toISOString();

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        industry_career_documents: {
          ...(meta.industry_career_documents ?? {}),
          [documentType]: {
            stage_id: stageId,
            sector_id: sectorId,
            sections: current.sections,
            updated_at: now,
          },
        },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk(
    buildPayload(documentType, stageId, sectorId, current.sections, user),
  );
}
