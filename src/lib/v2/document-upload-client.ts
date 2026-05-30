"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ACCEPTED_CV_LABEL,
  INLINE_UPLOAD_MAX_BYTES,
  USER_DOCUMENTS_BUCKET,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload-types";

export type DocumentUploadMeta = {
  document_type: string;
  document_subtype: string;
  document_label: string;
  custom_label?: string;
};

export type DocumentUploadResult = {
  document_id: string;
  document_type: string;
  document_subtype: string;
  document_label: string;
  extracted_text_preview?: string;
  extraction_status: string;
  uploaded_at?: string;
  enrichment_pending?: boolean;
};

function shouldUploadInline(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf") || lower.endsWith(".docx")) return false;
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return true;
  if (file.type.startsWith("text/")) return true;
  return file.size <= INLINE_UPLOAD_MAX_BYTES;
}

function uploadFormDataWithProgress(
  form: FormData,
  onProgress?: (progress: number) => void,
): Promise<DocumentUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        reject(new Error("Upload failed"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as DocumentUploadResult);
        return;
      }
      reject(new Error(typeof data.message === "string" ? data.message : "Upload failed"));
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.open("POST", "/api/v1/documents");
    xhr.send(form);
  });
}

async function uploadViaStorage(
  file: File,
  meta: DocumentUploadMeta,
  onProgress?: (progress: number) => void,
): Promise<DocumentUploadResult> {
  onProgress?.(5);

  const initRes = await fetch("/api/v1/documents/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      document_type: meta.document_type,
      document_subtype: meta.document_subtype,
      document_label: meta.document_label,
      custom_label: meta.custom_label,
    }),
  });
  const initData = await initRes.json();
  if (!initRes.ok) {
    throw new Error(typeof initData.message === "string" ? initData.message : "Upload failed");
  }

  onProgress?.(20);

  const supabase = createClient();
  const bucket =
    typeof initData.bucket === "string" ? initData.bucket : USER_DOCUMENTS_BUCKET;
  const storagePath =
    typeof initData.storage_path === "string" ? initData.storage_path : null;
  const documentId =
    typeof initData.document_id === "string" ? initData.document_id : null;

  if (!storagePath || !documentId) {
    throw new Error("Upload failed");
  }

  const { error: storageError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
    });

  if (storageError) {
    throw new Error(storageError.message || "Could not upload file to storage.");
  }

  onProgress?.(65);

  const processRes = await fetch(`/api/v1/documents/${documentId}/process`, {
    method: "POST",
  });
  const processData = await processRes.json();
  if (!processRes.ok) {
    throw new Error(
      typeof processData.message === "string" ? processData.message : "Processing failed",
    );
  }

  onProgress?.(100);
  return processData as DocumentUploadResult;
}

export async function uploadUserDocument(
  file: File,
  meta: DocumentUploadMeta,
  onProgress?: (progress: number) => void,
): Promise<DocumentUploadResult> {
  if (!isAcceptedCvFileName(file.name)) {
    throw new Error(`Upload ${ACCEPTED_CV_LABEL}, or paste text below.`);
  }

  if (!isSupabaseConfigured() || shouldUploadInline(file)) {
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", meta.document_type);
    form.append("document_subtype", meta.document_subtype);
    form.append("document_label", meta.document_label);
    if (meta.custom_label?.trim()) form.append("custom_label", meta.custom_label.trim());
    return uploadFormDataWithProgress(form, onProgress);
  }

  return uploadViaStorage(file, meta, onProgress);
}

export async function syncMempalaceAfterCvUpload() {
  await fetch("/api/v1/mempalace/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}
