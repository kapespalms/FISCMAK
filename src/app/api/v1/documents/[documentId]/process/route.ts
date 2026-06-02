import { fetchDocuments } from "@/lib/v2/db";
import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
  getAppUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { processDocumentFromStorage } from "@/lib/v2/document-process";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { invalidateLatticeDocumentCache } from "@/lib/v2/lattice/invalidate-cache";
// TODO(4.1): import seedCvEvidenceRows from the new-model document-activities
// module once it is built to §8.2 (multi-cell weighted, OV/SV only).

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ documentId: string }> };

async function clearLatticeDocumentCache(userId: string, email: string, demo: boolean) {
  const user = await getAppUser(userId, demo);
  if (!user) return;
  const meta = getOnboardingMetadata(user);
  if (!meta.lattice_document_cache) return;
  await upsertAppUser(
    userId,
    email,
    { onboarding_metadata: invalidateLatticeDocumentCache(meta) as Record<string, unknown> },
    demo,
  );
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { documentId } = await context.params;
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const document = documents.find((doc) => doc.document_id === documentId);

  if (!document) {
    return jsonError("not_found", "Document not found.", 404);
  }

  if (document.extraction_status === "completed") {
    return jsonOk({
      document_id: document.document_id,
      extraction_status: "completed",
      already_processed: true,
    });
  }

  if (document.extraction_status === "processing") {
    return jsonOk({
      document_id: document.document_id,
      extraction_status: "processing",
    });
  }

  let clientExtractedText: string | null = null;
  try {
    const body = (await request.json()) as { client_extracted_text?: unknown };
    if (typeof body.client_extracted_text === "string") {
      clientExtractedText = body.client_extracted_text;
    }
  } catch {
    // Empty body — server-side extraction fallback.
  }

  const result = await processDocumentFromStorage({
    userId: auth.userId,
    email: auth.email,
    demo: auth.demo,
    document,
    clientExtractedText,
  });

  if (!result.ok) {
    return jsonError(
      result.code === "extraction_failed" || result.code?.startsWith("docx") || result.code?.startsWith("pdf")
        ? "extraction_error"
        : "processing_error",
      result.message,
      result.status,
      result.code ? { code: result.code } : undefined,
    );
  }

  void clearLatticeDocumentCache(auth.userId, auth.email, auth.demo);

  // pending_cv_lines: will be populated by the new-model seed function (§8.2).
  // Stubbed at 0 until document-activities.ts is rebuilt to the multi-cell model.
  const pendingCvLines = 0;

  return jsonOk({ ...result.response, pending_cv_lines: pendingCvLines }, 200);
}
