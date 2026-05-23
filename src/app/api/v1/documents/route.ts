import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments, extractCvMetadata } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  DocumentExtractError,
  extractDocumentText,
} from "@/lib/v2/document-upload";

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
      return jsonOk({ error: e.code, message: e.message }, 400);
    }
    console.error("Document extraction failed:", e);
    return jsonOk(
      {
        error: "extraction_failed",
        message: "Could not read this file. Try .txt, .md, .pdf, or .docx.",
      },
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
  } as Record<string, unknown>;

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
    return jsonOk({
      document_id: docId,
      document_type,
      extracted_text_preview: text.slice(0, 200),
      extraction_status: "completed",
      uploaded_at: now,
      cv_metrics: {
        s_index: metadata.s_index as number,
        iwq: metadata.iwq as number,
        promotion_aligned_pct: metadata.promotion_aligned_pct as number,
      },
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
    .update({ cv_uploaded: true })
    .eq("user_id", auth.userId);
  return jsonOk({
    document_id: data.document_id,
    document_type: data.document_type,
    extracted_text_preview: text.slice(0, 200),
    extraction_status: "completed",
    uploaded_at: data.uploaded_at,
    cv_metrics: {
      s_index: metadata.s_index as number,
      iwq: metadata.iwq as number,
      promotion_aligned_pct: metadata.promotion_aligned_pct as number,
    },
  }, 201);
}
