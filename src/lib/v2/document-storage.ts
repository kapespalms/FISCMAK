import "server-only";

export const USER_DOCUMENTS_BUCKET = "user-documents";

/** 25 MB — above Vercel's default 4.5 MB request body limit for inline uploads. */
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export function sanitizeDocumentFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop()?.trim() || "document";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned || "document";
}

export function userDocumentStoragePath(
  userId: string,
  documentId: string,
  fileName: string,
): string {
  return `${userId}/${documentId}/${sanitizeDocumentFileName(fileName)}`;
}

export function storagePathFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  const path = metadata?.storage_path;
  return typeof path === "string" && path.trim() ? path.trim() : null;
}
