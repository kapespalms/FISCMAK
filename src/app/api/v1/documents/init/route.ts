import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { isAcceptedCvFileName } from "@/lib/v2/document-upload-types";
import {
  buildPendingDocumentMetadata,
  createPendingDocumentIds,
  resolveDocumentUploadFields,
} from "@/lib/v2/document-process";
import {
  MAX_DOCUMENT_BYTES,
  USER_DOCUMENTS_BUCKET,
} from "@/lib/v2/document-storage";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type InitBody = {
  file_name?: string;
  mime_type?: string;
  document_type?: string;
  document_subtype?: string;
  document_label?: string;
  custom_label?: string;
  size_bytes?: number;
};

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonError(
      "demo_mode",
      "Use direct upload in demo mode, or sign in with a full account.",
      400,
    );
  }

  let body: InitBody;
  try {
    body = (await request.json()) as InitBody;
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const fileName = body.file_name?.trim();
  if (!fileName) {
    return jsonError("validation_error", "file_name is required.", 400);
  }
  if (!isAcceptedCvFileName(fileName)) {
    return jsonError(
      "validation_error",
      "Unsupported file type. Use .txt, .md, .pdf, or .docx.",
      400,
    );
  }

  const sizeBytes = typeof body.size_bytes === "number" ? body.size_bytes : null;
  if (sizeBytes != null && sizeBytes > MAX_DOCUMENT_BYTES) {
    return jsonError(
      "validation_error",
      "File must be under 25 MB.",
      400,
    );
  }

  let resolved;
  try {
    resolved = resolveDocumentUploadFields({
      requestedType: body.document_type,
      documentSubtype: body.document_subtype,
      documentLabel: body.document_label,
      customLabel: body.custom_label,
    });
  } catch (e) {
    return jsonError(
      "validation_error",
      e instanceof Error ? e.message : "Invalid document type",
      400,
    );
  }

  const mimeType = body.mime_type?.trim() || "application/octet-stream";
  const { documentId, storagePath } = createPendingDocumentIds(auth.userId, fileName);
  const metadata = buildPendingDocumentMetadata({
    resolved,
    fileName,
    mimeType,
    storagePath,
  });

  const supabase = await createClient();
  const { error } = await supabase.from("documents").insert({
    document_id: documentId,
    user_id: auth.userId,
    document_type: resolved.document_type,
    file_name: fileName,
    file_url: storagePath,
    metadata,
    extraction_status: "pending",
  });

  if (error) {
    return jsonError("server_error", error.message, 500);
  }

  return jsonOk(
    {
      document_id: documentId,
      bucket: USER_DOCUMENTS_BUCKET,
      storage_path: storagePath,
      extraction_status: "pending",
    },
    201,
  );
}
