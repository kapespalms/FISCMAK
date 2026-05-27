import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments } from "@/lib/v2/db";
import { getAppUser, isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  CONTENT_JSON_KEY,
  DRAFT_TITLE_KEY,
  SOURCE_DOCUMENT_IDS_KEY,
  THEME_KEY,
  WORKSPACE_BUCKET_KEY,
  seedHeaderFromUser,
} from "@/lib/v2/documents-workspace";
import {
  emptyResumeContent,
  parseResumeContent,
  type ResumeContent,
} from "@/lib/v2/resume-content";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = await request.json().catch(() => ({}));
  const draftTitle =
    typeof body.draft_title === "string" && body.draft_title.trim()
      ? body.draft_title.trim()
      : "CV Draft";
  const sourceIds = Array.isArray(body.source_document_ids)
    ? body.source_document_ids.filter((id: unknown): id is string => typeof id === "string")
    : [];

  let content: ResumeContent | null = null;
  if (body.content_json) {
    content = parseResumeContent(body.content_json);
  }

  const user = await getAppUser(auth.userId, auth.demo);
  if (!content) {
    content = emptyResumeContent(user ? seedHeaderFromUser(user) : undefined);
  }

  const docId = crypto.randomUUID();
  const now = new Date().toISOString();
  const metadata: Record<string, unknown> = {
    [WORKSPACE_BUCKET_KEY]: "drafts",
    [CONTENT_JSON_KEY]: content,
    [THEME_KEY]: "spacious",
    [DRAFT_TITLE_KEY]: draftTitle,
    document_subtype: "CV_Draft",
    document_label: draftTitle,
    ...(sourceIds.length ? { [SOURCE_DOCUMENT_IDS_KEY]: sourceIds } : {}),
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
    return jsonOk({ document_id: docId, draft_title: draftTitle, content_json: content }, 201);
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
      content_json: content,
      uploaded_at: data.uploaded_at,
    },
    201,
  );
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const drafts = documents.filter((d) => d.metadata?.workspace_bucket === "drafts");
  return jsonOk({
    drafts: drafts.map((d) => ({
      document_id: d.document_id,
      draft_title:
        typeof d.metadata?.draft_title === "string"
          ? d.metadata.draft_title
          : "CV Draft",
      uploaded_at: d.uploaded_at,
      theme_key: d.metadata?.theme_key === "compact" ? "compact" : "spacious",
    })),
  });
}
