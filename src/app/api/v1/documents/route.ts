import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments } from "@/lib/v2/db";
import { isErrorResponse, jsonError, jsonOk, requireApiUser, getAppUser, upsertAppUser } from "@/lib/v2/api-helpers";
import { DocumentExtractError } from "@/lib/v2/document-upload";
import {
  buildProcessedDocumentPayload,
  documentUploadResponse,
  markCvUploadedFlag,
  resolveDocumentUploadFields,
  runCvEnrichmentAfterUpload,
} from "@/lib/v2/document-process";
import {
  documentFileNameFromRecord,
  documentLabelFromRecord,
  documentSubtypeFromRecord,
} from "@/lib/v2/onboarding-document-types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { sanitizeDocumentMetadataForUser } from "@/lib/v2/mempalace-key-facts";
import { invalidateLatticeDocumentCache } from "@/lib/v2/lattice/invalidate-cache";
import { documentListItem, documentBucketCounts } from "@/lib/v2/documents-workspace";
import { resumeContentFromMetadata } from "@/lib/v2/resume-content";
import { getUserOutputTemplates } from "@/lib/v2/output-user-templates";

export const runtime = "nodejs";

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

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const user = await getAppUser(auth.userId, auth.demo);
  const meta = user ? getOnboardingMetadata(user) : null;
  const templateCount = meta ? Object.keys(getUserOutputTemplates(meta)).length : 0;
  return jsonOk({
    documents: documents.map((d) => {
      const content = resumeContentFromMetadata(d.metadata);
      return {
        ...documentListItem(d),
        file_url: d.file_url,
        document_subtype: documentSubtypeFromRecord(d),
        extracted_text_preview: d.extracted_text?.slice(0, 400) ?? "",
        content_json: content,
        metadata: sanitizeDocumentMetadataForUser(d.metadata ?? {}),
      };
    }),
    total: documents.length,
    bucket_counts: documentBucketCounts(documents, templateCount),
  });
}

/** Inline upload path — demo mode, pasted text, and small files. PDF/DOCX use Storage + /process. */
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { userId, email, demo } = auth;
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const requestedType = (form.get("document_type") as string) || "CV";
  const documentSubtype = (form.get("document_subtype") as string) || requestedType;
  const documentLabel = (form.get("document_label") as string) || "";
  const customLabel = (form.get("custom_label") as string) || documentLabel;

  if (!file) {
    return jsonError("validation_error", "File required", 400);
  }

  let resolved;
  try {
    resolved = resolveDocumentUploadFields({
      requestedType,
      documentSubtype,
      documentLabel,
      customLabel,
    });
  } catch (e) {
    return jsonError(
      "validation_error",
      e instanceof Error ? e.message : "Invalid document type",
      400,
    );
  }

  const { document_type, document_subtype, document_label: resolvedLabel } = resolved;

  let processed;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    processed = await buildProcessedDocumentPayload(
      buffer,
      file.name,
      file.type,
      resolved,
    );
  } catch (e) {
    if (e instanceof DocumentExtractError) {
      return jsonError("extraction_error", e.message, 400, { code: e.code });
    }
    console.error("Document extraction failed:", e);
    return jsonError(
      "extraction_failed",
      "Could not read this file. Try .txt, .md, .pdf, or .docx.",
      400,
    );
  }

  const docId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (demo) {
    const state = getServerDemo(userId);
    state.documents.unshift({
      document_id: docId,
      user_id: userId,
      document_type,
      file_url: null,
      file_name: file.name,
      extracted_text: processed.text.slice(0, 5000),
      metadata: processed.metadata,
      extraction_status: "completed",
      uploaded_at: now,
    });
    await markCvUploadedFlag(userId, demo, document_type);
    void runCvEnrichmentAfterUpload({
      userId,
      email,
      demo,
      documentType: document_type,
      cvText: processed.text,
    });
    void clearLatticeDocumentCache(userId, email, demo);
    return jsonOk(
      documentUploadResponse(
        {
          document_id: docId,
          document_type,
          uploaded_at: now,
          extraction_status: "completed",
          extracted_text: processed.text,
        },
        resolved,
      ),
      201,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      document_id: docId,
      user_id: userId,
      document_type,
      file_name: file.name,
      extracted_text: processed.text.slice(0, 50000),
      metadata: processed.metadata,
      extraction_status: "completed",
    })
    .select("*")
    .single();
  if (error) return jsonError("server_error", error.message, 500);

  await markCvUploadedFlag(userId, demo, document_type);
  void runCvEnrichmentAfterUpload({
    userId,
    email,
    demo,
    documentType: document_type,
    cvText: processed.text,
  });
  void clearLatticeDocumentCache(userId, email, demo);

  return jsonOk(
    documentUploadResponse(
      {
        document_id: data.document_id,
        document_type: data.document_type,
        uploaded_at: data.uploaded_at,
        extraction_status: data.extraction_status,
        extracted_text: processed.text,
      },
      resolved,
    ),
    201,
  );
}
