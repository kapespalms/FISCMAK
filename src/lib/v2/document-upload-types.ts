// Client-safe exports only — safe to import from "use client" components.

export type DocumentUploadInput = {
  file: Buffer;
  documentType: string;
  subtype: string;
  label: string;
};

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
] as const;

export const ACCEPTED_CV_EXTENSIONS = [".txt", ".md", ".pdf", ".docx"] as const;

export const ACCEPTED_CV_ACCEPT =
  ".txt,.md,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const ACCEPTED_CV_LABEL = ".txt, .md, .pdf, or .docx";

export type DocumentFormat = "txt" | "md" | "pdf" | "docx";

export function isAcceptedCvFileName(name: string): boolean {
  return /\.(txt|md|pdf|docx)$/i.test(name);
}

export function detectDocumentFormat(
  fileName: string,
  mimeType?: string | null,
): DocumentFormat | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf") || mimeType === "application/pdf") return "pdf";
  if (
    lower.endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (lower.endsWith(".md")) return "md";
  if (lower.endsWith(".txt") || mimeType?.startsWith("text/")) return "txt";
  return null;
}
