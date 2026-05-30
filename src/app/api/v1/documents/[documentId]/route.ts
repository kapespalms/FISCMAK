import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments } from "@/lib/v2/db";
import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
  upsertAppUser,
  getAppUser,
} from "@/lib/v2/api-helpers";
import {
  findCvDocument,
  isCvDocument,
  resolveOnboardingDocumentUpload,
  documentSubtypeFromRecord,
  documentLabelFromRecord,
  documentFileNameFromRecord,
} from "@/lib/v2/onboarding-document-types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { mergeEnrichmentIntoMetadata, runApiEnrichment } from "@/lib/v2/api-enrichment";
import { persistEnrichmentSnapshot } from "@/lib/v2/career-data-repo";
import {
  CONTENT_JSON_KEY,
  DRAFT_TITLE_KEY,
  THEME_KEY,
  WORKSPACE_BUCKET_KEY,
  documentListItem,
} from "@/lib/v2/documents-workspace";
import { parseResumeContent } from "@/lib/v2/resume-content";
import { sanitizeDocumentMetadataForUser } from "@/lib/v2/mempalace-key-facts";
import {
  USER_DOCUMENTS_BUCKET,
  storagePathFromMetadata,
} from "@/lib/v2/document-storage";

type RouteContext = { params: Promise<{ documentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { documentId } = await context.params;
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const doc = documents.find((item) => item.document_id === documentId);

  if (!doc) return jsonError("not_found", "Document not found", 404);

  const metadata = sanitizeDocumentMetadataForUser(doc.metadata ?? {});
  const extractionError =
    typeof doc.metadata?.extraction_error === "string" ? doc.metadata.extraction_error : null;

  return jsonOk({
    ...documentListItem(doc),
    document_subtype: documentSubtypeFromRecord(doc),
    document_label: documentLabelFromRecord(doc),
    file_name: documentFileNameFromRecord(doc),
    extracted_text_preview: doc.extracted_text?.slice(0, 400) ?? "",
    extraction_error: extractionError,
    metadata,
  });
}

function isDraftMetadata(metadata: Record<string, unknown>): boolean {
  return metadata[WORKSPACE_BUCKET_KEY] === "drafts" || Boolean(metadata[CONTENT_JSON_KEY]);
}

async function syncCvUploaded(userId: string, email: string, demo: boolean) {
  const documents = await fetchDocuments(userId, demo);
  const hasCv = documents.some(isCvDocument);
  const cv = findCvDocument(documents);

  if (demo) {
    getServerDemo(userId).user.cv_uploaded = hasCv;
  } else {
    const supabase = await createClient();
    await supabase.from("app_users").update({ cv_uploaded: hasCv }).eq("user_id", userId);
  }

  if (!hasCv || !cv?.extracted_text) return;

  const user = await getAppUser(userId, demo);
  if (!user) return;

  const meta = getOnboardingMetadata(user);
  try {
    const snapshot = await runApiEnrichment({
      user,
      cvText: cv.extracted_text,
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
  } catch (e) {
    console.error("CV enrichment after reclassification failed:", e);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { documentId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const documentSubtype = typeof body.document_subtype === "string" ? body.document_subtype : "";
  const customLabel = typeof body.custom_label === "string" ? body.custom_label : undefined;
  const hasDraftPatch =
    body.content_json !== undefined ||
    body.theme_key !== undefined ||
    body.draft_title !== undefined;

  if (!documentSubtype && !hasDraftPatch) {
    return jsonError(
      "validation_error",
      "document_subtype or draft fields (content_json, theme_key, draft_title) required",
      400,
    );
  }

  if (hasDraftPatch && !documentSubtype) {
    if (auth.demo) {
      const state = getServerDemo(auth.userId);
      const doc = state.documents.find((item) => item.document_id === documentId);
      if (!doc) return jsonError("not_found", "Document not found", 404);
      if (!isDraftMetadata(doc.metadata ?? {})) {
        return jsonError("validation_error", "Document is not a draft", 400);
      }
      const metadata = { ...doc.metadata };
      if (body.content_json !== undefined) {
        const parsed = parseResumeContent(body.content_json);
        if (!parsed) return jsonError("validation_error", "Invalid content_json", 400);
        metadata[CONTENT_JSON_KEY] = parsed;
      }
      if (body.theme_key === "compact" || body.theme_key === "spacious") {
        metadata[THEME_KEY] = body.theme_key;
      }
      if (typeof body.draft_title === "string" && body.draft_title.trim()) {
        metadata[DRAFT_TITLE_KEY] = body.draft_title.trim();
        metadata.document_label = body.draft_title.trim();
      }
      doc.metadata = metadata;
      return jsonOk({
        document_id: doc.document_id,
        content_json: metadata[CONTENT_JSON_KEY],
        theme_key: metadata[THEME_KEY],
        draft_title: metadata[DRAFT_TITLE_KEY],
      });
    }

    const supabase = await createClient();
    const { data: existing, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (fetchError) return jsonError("server_error", fetchError.message, 500);
    if (!existing) return jsonError("not_found", "Document not found", 404);

    const baseMeta = (existing.metadata ?? {}) as Record<string, unknown>;
    if (!isDraftMetadata(baseMeta)) {
      return jsonError("validation_error", "Document is not a draft", 400);
    }

    const metadata = { ...baseMeta };
    if (body.content_json !== undefined) {
      const parsed = parseResumeContent(body.content_json);
      if (!parsed) return jsonError("validation_error", "Invalid content_json", 400);
      metadata[CONTENT_JSON_KEY] = parsed;
    }
    if (body.theme_key === "compact" || body.theme_key === "spacious") {
      metadata[THEME_KEY] = body.theme_key;
    }
    if (typeof body.draft_title === "string" && body.draft_title.trim()) {
      metadata[DRAFT_TITLE_KEY] = body.draft_title.trim();
      metadata.document_label = body.draft_title.trim();
    }

    const { data, error } = await supabase
      .from("documents")
      .update({ metadata })
      .eq("document_id", documentId)
      .eq("user_id", auth.userId)
      .select("*")
      .single();

    if (error) return jsonError("server_error", error.message, 500);

    return jsonOk({
      document_id: data.document_id,
      content_json: metadata[CONTENT_JSON_KEY],
      theme_key: metadata[THEME_KEY],
      draft_title: metadata[DRAFT_TITLE_KEY],
    });
  }

  if (!documentSubtype) {
    return jsonError("validation_error", "document_subtype is required", 400);
  }

  let resolved;
  try {
    resolved = resolveOnboardingDocumentUpload(documentSubtype, customLabel);
  } catch (e) {
    return jsonError(
      "validation_error",
      e instanceof Error ? e.message : "Invalid document type",
      400,
    );
  }

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    const doc = state.documents.find((item) => item.document_id === documentId);
    if (!doc) return jsonError("not_found", "Document not found", 404);

    doc.document_type = resolved.document_type;
    doc.metadata = {
      ...doc.metadata,
      document_subtype: resolved.document_subtype,
      document_label: resolved.document_label,
    };
    void syncCvUploaded(auth.userId, auth.email, true);
    return jsonOk({
      document_id: doc.document_id,
      document_type: doc.document_type,
      document_subtype: resolved.document_subtype,
      document_label: resolved.document_label,
    });
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("documents")
    .select("*")
    .eq("document_id", documentId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (fetchError) return jsonError("server_error", fetchError.message, 500);
  if (!existing) return jsonError("not_found", "Document not found", 404);

  const metadata = {
    ...(existing.metadata ?? {}),
    document_subtype: resolved.document_subtype,
    document_label: resolved.document_label,
  };

  const { data, error } = await supabase
    .from("documents")
    .update({
      document_type: resolved.document_type,
      metadata,
    })
    .eq("document_id", documentId)
    .eq("user_id", auth.userId)
    .select("*")
    .single();

  if (error) return jsonError("server_error", error.message, 500);

  void syncCvUploaded(auth.userId, auth.email, false);

  return jsonOk({
    document_id: data.document_id,
    document_type: data.document_type,
    document_subtype: resolved.document_subtype,
    document_label: resolved.document_label,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { documentId } = await context.params;

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    const index = state.documents.findIndex((item) => item.document_id === documentId);
    if (index === -1) return jsonError("not_found", "Document not found", 404);
    state.documents.splice(index, 1);
    void syncCvUploaded(auth.userId, auth.email, true);
    return jsonOk({ deleted: true, document_id: documentId });
  }

  const documents = await fetchDocuments(auth.userId, auth.demo);
  const doc = documents.find((item) => item.document_id === documentId);
  if (!doc) return jsonError("not_found", "Document not found", 404);

  const storagePath = storagePathFromMetadata(doc.metadata);
  const supabase = await createClient();
  if (storagePath) {
    await supabase.storage.from(USER_DOCUMENTS_BUCKET).remove([storagePath]);
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", auth.userId);

  if (error) return jsonError("server_error", error.message, 500);

  void syncCvUploaded(auth.userId, auth.email, false);

  return jsonOk({ deleted: true, document_id: documentId });
}
