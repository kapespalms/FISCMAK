import {
  completionForDocumentSection,
  documentIdForSection,
  documentSectionById,
  normalizeCoreDocumentId,
} from "@/lib/v2/academic-core-document-templates";
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
  { params }: { params: Promise<{ documentId: string; sectionId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { documentId: rawDocId, sectionId } = await params;
  const documentId = normalizeCoreDocumentId(rawDocId);
  const def = documentSectionById(sectionId);

  if (!def || documentIdForSection(sectionId) !== documentId) {
    return jsonOk({ error: "validation_error", message: "Unknown section" }, 400);
  }

  const { content } = (await request.json()) as { content?: string };
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const stored = meta.academic_core_documents?.[documentId];
  const now = new Date().toISOString();
  const completion = completionForDocumentSection(content ?? "", def.targetWords);

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
        academic_core_documents: {
          ...(meta.academic_core_documents ?? {}),
          [documentId]: { sections: nextSections, updated_at: now },
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
