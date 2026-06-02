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
import { seedActivityEntriesFromCv } from "@/lib/v2/document-activities";

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

  // Seed activity_entries staging rows from parsed CV. Non-blocking; gracefully
  // skips if migration 20260552 not yet applied.
  const pendingCvLines = await seedActivityEntriesFromCv({
    userId: auth.userId,
    documentId,
    documentType: document.document_type,
    extractedText: clientExtractedText ?? document.extracted_text ?? "",
    demo: auth.demo,
  });

  return jsonOk({ ...result.response, pending_cv_lines: pendingCvLines }, 200);
}
