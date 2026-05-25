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
} from "@/lib/v2/onboarding-document-types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { mergeEnrichmentIntoMetadata, runApiEnrichment } from "@/lib/v2/api-enrichment";
import { persistEnrichmentSnapshot } from "@/lib/v2/career-data-repo";

type RouteContext = { params: Promise<{ documentId: string }> };

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

  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", auth.userId);

  if (error) return jsonError("server_error", error.message, 500);

  void syncCvUploaded(auth.userId, auth.email, false);

  return jsonOk({ deleted: true, document_id: documentId });
}
