export const ACCEPTED_CV_EXTENSIONS = [".txt", ".md", ".pdf", ".docx"] as const;

export const ACCEPTED_CV_ACCEPT =
  ".txt,.md,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const ACCEPTED_CV_LABEL = ".txt, .md, .pdf, or .docx";

export type DocumentFormat = "txt" | "md" | "pdf" | "docx";

export function isAcceptedCvFileName(name: string): boolean {
  return /\.(txt|md|pdf|docx)$/i.test(name);
}

export class DocumentExtractError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "DocumentExtractError";
    this.code = code;
  }
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

export async function extractDocumentText(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null,
): Promise<{ text: string; format: DocumentFormat; wordCount: number }> {
  const format = detectDocumentFormat(fileName, mimeType);
  if (!format) {
    throw new DocumentExtractError(
      `Unsupported file type. Upload ${ACCEPTED_CV_LABEL}.`,
      "unsupported_format",
    );
  }

  let text = "";
  if (format === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result.text ?? "";
    } finally {
      await parser.destroy();
    }
  } else if (format === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    text = result.value ?? "";
  } else {
    text = buffer.toString("utf8");
  }

  const normalized = text.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
  if (!normalized) {
    throw new DocumentExtractError(
      "Could not extract readable text from this file. Try another format or paste your CV text.",
      "empty_extraction",
    );
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) {
    throw new DocumentExtractError(
      "Extracted very little text — the file may be scanned or image-only. Paste your CV text instead.",
      "insufficient_text",
    );
  }

  return { text: normalized, format, wordCount };
}
