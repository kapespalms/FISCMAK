import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments, extractCvMetadata } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const documents = await fetchDocuments(auth.userId, auth.demo);
  return jsonOk({
    documents: documents.map((d) => ({
      document_id: d.document_id,
      document_type: d.document_type,
      file_url: d.file_url,
      uploaded_at: d.uploaded_at,
      extraction_status: d.extraction_status,
    })),
    total: documents.length,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const document_type = (form.get("document_type") as string) || "CV";
  if (!file) {
    return jsonOk({ error: "validation_error", message: "File required" }, 400);
  }
  const text = await file.text();
  const docId = crypto.randomUUID();
  const now = new Date().toISOString();
  const metadata = {
    ...extractCvMetadata(text),
    file_name: file.name,
  };

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    state.documents.unshift({
      document_id: docId,
      user_id: auth.userId,
      document_type,
      file_url: null,
      file_name: file.name,
      extracted_text: text.slice(0, 5000),
      metadata,
      extraction_status: "completed",
      uploaded_at: now,
    });
    state.user.cv_uploaded = true;
    state.user.tier2_complete = true;
    return jsonOk({
      document_id: docId,
      document_type,
      extracted_text_preview: text.slice(0, 200),
      extraction_status: "completed",
      uploaded_at: now,
    }, 201);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      document_id: docId,
      user_id: auth.userId,
      document_type,
      file_name: file.name,
      extracted_text: text.slice(0, 50000),
      metadata,
      extraction_status: "completed",
    })
    .select("*")
    .single();
  if (error) return jsonOk({ error: "server_error", message: error.message }, 500);
  await supabase
    .from("app_users")
    .update({ cv_uploaded: true, tier2_complete: true })
    .eq("user_id", auth.userId);
  return jsonOk({
    document_id: data.document_id,
    document_type: data.document_type,
    extracted_text_preview: text.slice(0, 200),
    extraction_status: "completed",
    uploaded_at: data.uploaded_at,
  }, 201);
}
