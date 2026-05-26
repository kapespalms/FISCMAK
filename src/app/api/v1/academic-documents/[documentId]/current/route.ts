import {
  assembleFullDocument,
  buildDocumentMakContext,
  completionForDocumentSection,
  getCoreDocumentDef,
  getSectionsForDocument,
  normalizeCoreDocumentId,
  type AcademicCoreDocumentId,
} from "@/lib/v2/academic-core-document-templates";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export type CoreDocumentSectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
};

function resolveDocument(
  meta: ReturnType<typeof getOnboardingMetadata>,
  documentId: AcademicCoreDocumentId,
) {
  const stored = meta.academic_core_documents?.[documentId];
  return { sections: stored?.sections ?? {} };
}

function rowsForDocument(
  documentId: AcademicCoreDocumentId,
  sections: Record<string, { content?: string; completion_percentage?: number }>,
): CoreDocumentSectionRow[] {
  return getSectionsForDocument(documentId).map((def) => {
    const saved = sections[def.id];
    const content = saved?.content ?? null;
    return {
      section: def.id,
      title: def.title,
      subtitle: def.subtitle,
      target_words: def.targetWords,
      content,
      completion_percentage:
        saved?.completion_percentage ?? completionForDocumentSection(content ?? "", def.targetWords),
      prompts: def.prompts,
    };
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { documentId: rawId } = await params;
  const documentId = normalizeCoreDocumentId(rawId);
  const doc = getCoreDocumentDef(documentId);

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = getOnboardingMetadata(user ?? ({} as import("@/lib/v2/types").AppUser));
  const { sections } = resolveDocument(meta, documentId);
  const rows = rowsForDocument(documentId, sections);
  const overall = rows.length
    ? Math.round(rows.reduce((sum, s) => sum + s.completion_percentage, 0) / rows.length)
    : 0;

  return jsonOk({
    document_id: documentId,
    label: doc.label,
    description: doc.description,
    formatting_notes: doc.formattingNotes,
    sections: rows,
    overall_completion: overall,
    full_draft_preview: assembleFullDocument(documentId, sections),
    mak_context: buildDocumentMakContext(documentId),
    user: {
      name: user?.name,
      specialty: user?.specialty,
      career_stage: user?.career_stage,
      academic_rank: user?.academic_rank,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { documentId: rawId } = await params;
  const documentId = normalizeCoreDocumentId(rawId);

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const { sections } = resolveDocument(meta, documentId);
  const now = new Date().toISOString();

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        academic_core_documents: {
          ...(meta.academic_core_documents ?? {}),
          [documentId]: { sections, updated_at: now },
        },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  const rows = rowsForDocument(documentId, sections);
  const overall = rows.length
    ? Math.round(rows.reduce((sum, s) => sum + s.completion_percentage, 0) / rows.length)
    : 0;

  return jsonOk({
    document_id: documentId,
    overall_completion: overall,
    full_draft_preview: assembleFullDocument(documentId, sections),
  });
}
