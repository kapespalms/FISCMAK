import {
  completionForIndustrySection,
  getSectionsForIndustryDocument,
  industrySectionById,
  mapPivotPathToIndustry,
  normalizeIndustryCareerStage,
  normalizeIndustryDocumentType,
  normalizeIndustrySector,
  type IndustryDocumentType,
} from "@/lib/v2/industry-career-templates";
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
  {
    params,
  }: { params: Promise<{ documentType: string; sectionId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { documentType: rawType, sectionId } = await params;
  const documentType = normalizeIndustryDocumentType(rawType);

  const def = industrySectionById(sectionId);
  if (!def) {
    return jsonOk({ error: "validation_error", message: "Unknown section" }, 400);
  }

  const { content } = (await request.json()) as { content?: string };
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const stored = meta.industry_career_documents?.[documentType];
  const stageId = stored?.stage_id ?? normalizeIndustryCareerStage(user.career_stage);
  const sectorId =
    stored?.sector_id ??
    mapPivotPathToIndustry(meta.career_pivot_context?.target_path) ??
    normalizeIndustrySector(null);

  const validIds = getSectionsForIndustryDocument(documentType, sectorId).map((s) => s.id);
  if (!validIds.includes(sectionId)) {
    return jsonOk({ error: "validation_error", message: "Section not valid for current context" }, 400);
  }

  const now = new Date().toISOString();
  const completion = completionForIndustrySection(content ?? "", def.targetWords);
  const nextSections = {
    ...(stored?.sections ?? {}),
    [sectionId]: {
      content: content ?? "",
      completion_percentage: completion,
      last_edited: now,
    },
  };

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
            sections: nextSections,
            updated_at: now,
          },
        },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk({
    section: sectionId,
    content: content ?? "",
    completion_percentage: completion,
    saved_at: now,
  });
}
