import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments } from "@/lib/v2/db";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  documentLabelFromRecord,
} from "@/lib/v2/onboarding-document-types";
import {
  CONTENT_JSON_KEY,
  DRAFT_TITLE_KEY,
  SOURCE_DOCUMENT_IDS_KEY,
  THEME_KEY,
  WORKSPACE_BUCKET_KEY,
} from "@/lib/v2/documents-workspace";
import { mergeCvSourcesWithLlm } from "@/lib/v2/merge-cvs";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = await request.json().catch(() => ({}));
  const documentIds = Array.isArray(body.document_ids)
    ? body.document_ids.filter((id: unknown): id is string => typeof id === "string")
    : [];

  if (documentIds.length === 0) {
    return jsonError("validation_error", "document_ids array is required", 400);
  }

  const documents = await fetchDocuments(auth.userId, auth.demo);
  const sources = documentIds
    .map((id: string) => {
      const doc = documents.find((d) => d.document_id === id);
      if (!doc?.extracted_text?.trim()) return null;
      return {
        document_id: doc.document_id,
        label: documentLabelFromRecord(doc),
        text: doc.extracted_text,
      };
    })
    .filter(
      (s: { document_id: string; label: string; text: string } | null): s is {
        document_id: string;
        label: string;
        text: string;
      } => s !== null,
    );

  if (sources.length === 0) {
    return jsonError(
      "validation_error",
      "No sources with extracted text found for the given document_ids",
      400,
    );
  }

  const { content_json, merge_flags } = await mergeCvSourcesWithLlm({ sources });
  const draftTitle =
    typeof body.draft_title === "string" && body.draft_title.trim()
      ? body.draft_title.trim()
      : `Merged CV (${sources.length} sources)`;

  const docId = crypto.randomUUID();
  const now = new Date().toISOString();
  const metadata: Record<string, unknown> = {
    [WORKSPACE_BUCKET_KEY]: "drafts",
    [CONTENT_JSON_KEY]: content_json,
    [THEME_KEY]: "spacious",
    [DRAFT_TITLE_KEY]: draftTitle,
    document_subtype: "CV_Draft",
    document_label: draftTitle,
    [SOURCE_DOCUMENT_IDS_KEY]: documentIds,
    merge_flags,
  };

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    state.documents.unshift({
      document_id: docId,
      user_id: auth.userId,
      document_type: "Resume",
      file_url: null,
      file_name: null,
      extracted_text: null,
      metadata,
      extraction_status: "completed",
      uploaded_at: now,
    });
    return jsonOk(
      {
        document_id: docId,
        draft_title: draftTitle,
        content_json,
        merge_flags,
        incomplete_fields: content_json.incomplete_fields,
      },
      201,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      document_id: docId,
      user_id: auth.userId,
      document_type: "Resume",
      metadata,
      extraction_status: "completed",
    })
    .select("*")
    .single();

  if (error) return jsonError("server_error", error.message, 500);

  return jsonOk(
    {
      document_id: data.document_id,
      draft_title: draftTitle,
      content_json,
      merge_flags,
      incomplete_fields: content_json.incomplete_fields,
      uploaded_at: data.uploaded_at,
    },
    201,
  );
}
