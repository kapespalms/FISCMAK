import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { extractCvMetadata } from "@/lib/v2/db";
import { getAppUser, upsertAppUser } from "@/lib/v2/api-helpers";
import {
  DocumentExtractError,
  buildDocumentTextFromClientExtraction,
  extractDocumentText,
} from "@/lib/v2/document-upload";
import { resolveOnboardingDocumentUpload } from "@/lib/v2/onboarding-document-types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  mergeEnrichmentIntoMetadata,
  runApiEnrichment,
} from "@/lib/v2/api-enrichment";
import { persistEnrichmentSnapshot } from "@/lib/v2/career-data-repo";
import { markDocumentsUploadProgress } from "@/lib/v2/onboarding-progress";
import {
  USER_DOCUMENTS_BUCKET,
  userDocumentStoragePath,
} from "@/lib/v2/document-storage";
import type { DocumentRecord } from "@/lib/v2/types";

export type ResolvedDocumentUpload = {
  document_type: string;
  document_subtype: string;
  document_label: string;
};

export function resolveDocumentUploadFields(input: {
  requestedType?: string;
  documentSubtype?: string;
  documentLabel?: string;
  customLabel?: string;
}): ResolvedDocumentUpload {
  const requestedType = input.requestedType || "CV";
  const documentSubtype = input.documentSubtype || requestedType;
  const documentLabel = input.documentLabel || "";
  const customLabel = input.customLabel || documentLabel;

  try {
    return resolveOnboardingDocumentUpload(documentSubtype, customLabel);
  } catch (e) {
    if (documentSubtype === "CV" || requestedType === "CV") {
      return {
        document_type: "CV",
        document_subtype: "CV",
        document_label: "CV / Resume",
      };
    }
    throw e;
  }
}

export type ProcessedDocumentPayload = {
  text: string;
  sourceFormat: string;
  wordCount: number;
  metadata: Record<string, unknown>;
};

export async function buildProcessedDocumentPayload(
  buffer: Buffer,
  fileName: string,
  mimeType: string | null | undefined,
  resolved: ResolvedDocumentUpload,
): Promise<ProcessedDocumentPayload> {
  const extracted = await extractDocumentText(buffer, fileName, mimeType ?? null);
  const metadata = {
    ...extractCvMetadata(extracted.text),
    file_name: fileName,
    source_format: extracted.format,
    word_count: extracted.wordCount,
    document_subtype: resolved.document_subtype,
    document_label: resolved.document_label,
    workspace_bucket: "sources",
    extraction_source: "server",
  } as Record<string, unknown>;

  return {
    text: extracted.text,
    sourceFormat: extracted.format,
    wordCount: extracted.wordCount,
    metadata,
  };
}

export function buildProcessedDocumentPayloadFromClientText(
  clientText: string,
  fileName: string,
  resolved: ResolvedDocumentUpload,
): ProcessedDocumentPayload {
  const extracted = buildDocumentTextFromClientExtraction(clientText, fileName);
  const metadata = {
    ...extractCvMetadata(extracted.text),
    file_name: fileName,
    source_format: extracted.format,
    word_count: extracted.wordCount,
    document_subtype: resolved.document_subtype,
    document_label: resolved.document_label,
    workspace_bucket: "sources",
    extraction_source: "client_pdfjs",
  } as Record<string, unknown>;

  return {
    text: extracted.text,
    sourceFormat: extracted.format,
    wordCount: extracted.wordCount,
    metadata,
  };
}

export async function runCvEnrichmentAfterUpload(input: {
  userId: string;
  email: string;
  demo: boolean;
  documentType: string;
  cvText: string;
}) {
  if (input.documentType !== "CV") return null;

  const user = await getAppUser(input.userId, input.demo);
  if (!user) return null;

  const meta = getOnboardingMetadata(user);
  try {
    const snapshot = await runApiEnrichment({
      user,
      cvText: input.cvText,
      trigger: "cv_upload",
      previousSnapshot: meta.enrichment_snapshot ?? null,
    });
    const updatedMeta = mergeEnrichmentIntoMetadata(meta, snapshot);
    await upsertAppUser(
      input.userId,
      input.email,
      {
        cv_uploaded: true,
        ...markDocumentsUploadProgress(),
        onboarding_metadata: updatedMeta as Record<string, unknown>,
      },
      input.demo,
    );
    if (!input.demo) {
      await persistEnrichmentSnapshot(user, input.email, snapshot);
    }
    return snapshot;
  } catch (e) {
    console.error("API enrichment failed:", e);
    return null;
  }
}

export function documentUploadResponse(doc: {
  document_id: string;
  document_type: string;
  uploaded_at: string;
  extraction_status: string;
  extracted_text?: string | null;
}, resolved: ResolvedDocumentUpload) {
  return {
    document_id: doc.document_id,
    document_type: doc.document_type,
    document_subtype: resolved.document_subtype,
    document_label: resolved.document_label,
    extracted_text_preview: doc.extracted_text?.slice(0, 200) ?? "",
    extraction_status: doc.extraction_status,
    uploaded_at: doc.uploaded_at,
    enrichment_pending: doc.document_type === "CV",
    cv_metrics: null,
  };
}

export async function markCvUploadedFlag(
  userId: string,
  demo: boolean,
  documentType: string,
) {
  if (documentType !== "CV") return;

  if (demo) {
    getServerDemo(userId).user.cv_uploaded = true;
    Object.assign(getServerDemo(userId).user, markDocumentsUploadProgress());
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("app_users")
    .update({ cv_uploaded: true, ...markDocumentsUploadProgress() })
    .eq("user_id", userId);
}

export async function processDocumentFromStorage(input: {
  userId: string;
  email: string;
  demo: boolean;
  document: DocumentRecord;
  clientExtractedText?: string | null;
}): Promise<
  | { ok: true; response: ReturnType<typeof documentUploadResponse> }
  | { ok: false; message: string; code?: string; status: number }
> {
  const metadata = { ...(input.document.metadata ?? {}) };
  const storagePath =
    (typeof metadata.storage_path === "string" && metadata.storage_path) ||
    input.document.file_url;
  const mimeType =
    (typeof metadata.mime_type === "string" && metadata.mime_type) || null;
  const fileName = input.document.file_name ?? "document";

  if (!storagePath) {
    return {
      ok: false,
      status: 400,
      message: "No stored file found for this document.",
      code: "missing_storage",
    };
  }

  const resolved: ResolvedDocumentUpload = {
    document_type: input.document.document_type,
    document_subtype:
      (typeof metadata.document_subtype === "string" && metadata.document_subtype) ||
      input.document.document_type,
    document_label:
      (typeof metadata.document_label === "string" && metadata.document_label) ||
      input.document.document_type,
  };

  if (input.demo) {
    return {
      ok: false,
      status: 400,
      message: "Storage processing is unavailable in demo mode.",
      code: "demo_mode",
    };
  }

  const supabase = await createClient();
  await supabase
    .from("documents")
    .update({ extraction_status: "processing" })
    .eq("document_id", input.document.document_id)
    .eq("user_id", input.userId);

  const clientText = input.clientExtractedText?.trim();
  let processed: ProcessedDocumentPayload | null = null;

  if (clientText) {
    try {
      processed = buildProcessedDocumentPayloadFromClientText(
        clientText,
        fileName,
        resolved,
      );
    } catch (e) {
      if (e instanceof DocumentExtractError) {
        const failedMeta = {
          ...metadata,
          extraction_error: e.message,
          extraction_code: e.code,
        };
        await supabase
          .from("documents")
          .update({ extraction_status: "failed", metadata: failedMeta })
          .eq("document_id", input.document.document_id)
          .eq("user_id", input.userId);
        return { ok: false, status: 400, message: e.message, code: e.code };
      }
      console.error("Client PDF text processing failed:", e);
    }
  }

  if (!processed) {
    const { data: blob, error: downloadError } = await supabase.storage
      .from(USER_DOCUMENTS_BUCKET)
      .download(storagePath);

    if (downloadError || !blob) {
      const failedMeta = {
        ...metadata,
        extraction_error: downloadError?.message ?? "Could not download file from storage.",
      };
      await supabase
        .from("documents")
        .update({ extraction_status: "failed", metadata: failedMeta })
        .eq("document_id", input.document.document_id)
        .eq("user_id", input.userId);
      return {
        ok: false,
        status: 500,
        message: "Could not read uploaded file. Try uploading again.",
        code: "storage_download_failed",
      };
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    try {
      processed = await buildProcessedDocumentPayload(
        buffer,
        fileName,
        mimeType,
        resolved,
      );
    } catch (e) {
      const message =
        e instanceof DocumentExtractError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not read this file. Try .txt, .md, .pdf, or .docx.";
      const code = e instanceof DocumentExtractError ? e.code : "extraction_failed";
      const failedMeta = { ...metadata, extraction_error: message, extraction_code: code };
      await supabase
        .from("documents")
        .update({ extraction_status: "failed", metadata: failedMeta })
        .eq("document_id", input.document.document_id)
        .eq("user_id", input.userId);
      return { ok: false, status: 400, message, code };
    }
  }

  try {
    const nextMetadata = {
      ...processed.metadata,
      storage_path: storagePath,
      storage_bucket: USER_DOCUMENTS_BUCKET,
      mime_type: mimeType,
    };

    const { data, error } = await supabase
      .from("documents")
      .update({
        extracted_text: processed.text.slice(0, 50000),
        metadata: nextMetadata,
        extraction_status: "completed",
      })
      .eq("document_id", input.document.document_id)
      .eq("user_id", input.userId)
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        status: 500,
        message: error?.message ?? "Could not save extracted text.",
        code: "persist_failed",
      };
    }

    await markCvUploadedFlag(input.userId, input.demo, resolved.document_type);
    void runCvEnrichmentAfterUpload({
      userId: input.userId,
      email: input.email,
      demo: input.demo,
      documentType: resolved.document_type,
      cvText: processed.text,
    });

    return {
      ok: true,
      response: documentUploadResponse(
        {
          document_id: data.document_id,
          document_type: data.document_type,
          uploaded_at: data.uploaded_at,
          extraction_status: data.extraction_status,
          extracted_text: processed.text,
        },
        resolved,
      ),
    };
  } catch (e) {
    const message =
      e instanceof DocumentExtractError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Could not read this file. Try .txt, .md, .pdf, or .docx.";
    const code = e instanceof DocumentExtractError ? e.code : "extraction_failed";
    const failedMeta = { ...metadata, extraction_error: message, extraction_code: code };
    await supabase
      .from("documents")
      .update({ extraction_status: "failed", metadata: failedMeta })
      .eq("document_id", input.document.document_id)
      .eq("user_id", input.userId);
    return { ok: false, status: 400, message, code };
  }
}

export function buildPendingDocumentMetadata(input: {
  resolved: ResolvedDocumentUpload;
  fileName: string;
  mimeType: string;
  storagePath: string;
}) {
  return {
    file_name: input.fileName,
    document_subtype: input.resolved.document_subtype,
    document_label: input.resolved.document_label,
    workspace_bucket: "sources",
    storage_path: input.storagePath,
    storage_bucket: USER_DOCUMENTS_BUCKET,
    mime_type: input.mimeType,
  } as Record<string, unknown>;
}

export function createPendingDocumentIds(userId: string, fileName: string) {
  const documentId = crypto.randomUUID();
  return {
    documentId,
    storagePath: userDocumentStoragePath(userId, documentId, fileName),
  };
}
