import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments, extractCvMetadata } from "@/lib/v2/db";
import { isErrorResponse, jsonError, jsonOk, requireApiUser, getAppUser, upsertAppUser } from "@/lib/v2/api-helpers";
import {
  DocumentExtractError,
  extractDocumentText,
} from "@/lib/v2/document-upload";
import {
  documentFileNameFromRecord,
  documentLabelFromRecord,
  documentSubtypeFromRecord,
  resolveOnboardingDocumentUpload,
} from "@/lib/v2/onboarding-document-types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  mergeEnrichmentIntoMetadata,
  runApiEnrichment,
} from "@/lib/v2/api-enrichment";
import { persistEnrichmentSnapshot } from "@/lib/v2/career-data-repo";
import { sanitizeDocumentMetadataForUser } from "@/lib/v2/mempalace-key-facts";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const documents = await fetchDocuments(auth.userId, auth.demo);
  return jsonOk({
    documents: documents.map((d) => ({
      document_id: d.document_id,
      document_type: d.document_type,
      file_name: documentFileNameFromRecord(d),
      file_url: d.file_url,
      uploaded_at: d.uploaded_at,
      extraction_status: d.extraction_status,
      document_subtype: documentSubtypeFromRecord(d),
      document_label: documentLabelFromRecord(d),
      extracted_text_preview: d.extracted_text?.slice(0, 400) ?? "",
      metadata: sanitizeDocumentMetadataForUser(d.metadata ?? {}),
    })),
    total: documents.length,
  });
}

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

  let document_type = requestedType;
  let document_subtype = documentSubtype;
  let resolvedLabel = documentLabel;

  try {
    const resolved = resolveOnboardingDocumentUpload(documentSubtype, customLabel);
    document_type = resolved.document_type;
    document_subtype = resolved.document_subtype;
    resolvedLabel = resolved.document_label;
  } catch (e) {
    if (documentSubtype === "CV" || requestedType === "CV") {
      document_type = "CV";
      document_subtype = "CV";
      resolvedLabel = "CV / Resume";
    } else {
      return jsonError(
        "validation_error",
        e instanceof Error ? e.message : "Invalid document type",
        400,
      );
    }
  }
  let text: string;
  let sourceFormat: string;
  let wordCount: number;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractDocumentText(buffer, file.name, file.type);
    text = extracted.text;
    sourceFormat = extracted.format;
    wordCount = extracted.wordCount;
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
  const metadata = {
    ...extractCvMetadata(text),
    file_name: file.name,
    source_format: sourceFormat,
    word_count: wordCount,
    document_subtype,
    document_label: resolvedLabel,
  } as Record<string, unknown>;

  async function runEnrichmentAfterUpload() {
    if (document_type !== "CV") return null;
    const user = await getAppUser(userId, demo);
    if (!user) return null;
    const meta = getOnboardingMetadata(user);
    try {
      const snapshot = await runApiEnrichment({
        user,
        cvText: text,
        trigger: "cv_upload",
        previousSnapshot: meta.enrichment_snapshot ?? null,
      });
      const updatedMeta = mergeEnrichmentIntoMetadata(meta, snapshot);
      await upsertAppUser(
        userId,
        email,
        {
          cv_uploaded: true,
          onboarding_metadata: updatedMeta as Record<string, unknown>,
        },
        demo,
      );
      if (!demo) {
        await persistEnrichmentSnapshot(user, email, snapshot);
      }
      return snapshot;
    } catch (e) {
      console.error("API enrichment failed:", e);
      return null;
    }
  }

  if (demo) {
    const state = getServerDemo(userId);
    state.documents.unshift({
      document_id: docId,
      user_id: userId,
      document_type,
      file_url: null,
      file_name: file.name,
      extracted_text: text.slice(0, 5000),
      metadata,
      extraction_status: "completed",
      uploaded_at: now,
    });
    if (document_type === "CV") {
      state.user.cv_uploaded = true;
      void runEnrichmentAfterUpload();
    }
    return jsonOk({
      document_id: docId,
      document_type,
      document_subtype,
      document_label: resolvedLabel,
      extracted_text_preview: text.slice(0, 200),
      extraction_status: "completed",
      uploaded_at: now,
      enrichment_pending: document_type === "CV",
      cv_metrics: null,
    }, 201);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      document_id: docId,
      user_id: userId,
      document_type,
      file_name: file.name,
      extracted_text: text.slice(0, 50000),
      metadata,
      extraction_status: "completed",
    })
    .select("*")
    .single();
  if (error) return jsonError("server_error", error.message, 500);

  if (document_type === "CV") {
    await supabase.from("app_users").update({ cv_uploaded: true }).eq("user_id", userId);
    void runEnrichmentAfterUpload();
  }

  return jsonOk({
    document_id: data.document_id,
    document_type: data.document_type,
    document_subtype,
    document_label: resolvedLabel,
    extracted_text_preview: text.slice(0, 200),
    extraction_status: "completed",
    uploaded_at: data.uploaded_at,
    enrichment_pending: document_type === "CV",
    cv_metrics: null,
  }, 201);
}
