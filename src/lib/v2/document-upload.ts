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

function detectDocumentFormatFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null,
): DocumentFormat | null {
  const fromMeta = detectDocumentFormat(fileName, mimeType);
  if (fromMeta) return fromMeta;

  if (buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF") {
    return "pdf";
  }
  if (
    buffer.length >= 2 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (fileName.toLowerCase().endsWith(".docx") ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  ) {
    return "docx";
  }
  return null;
}

let pdfWorkerReady = false;

async function ensurePdfWorker(): Promise<void> {
  if (pdfWorkerReady) return;

  const { createRequire } = await import("node:module");
  const { pathToFileURL } = await import("node:url");
  const require = createRequire(import.meta.url);
  const { PDFParse } = await import("pdf-parse");

  try {
    const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
    PDFParse.setWorker(pathToFileURL(workerPath).href);
  } catch {
    // Fall back to pdf-parse defaults when the worker bundle is unavailable.
  }

  pdfWorkerReady = true;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  await ensurePdfWorker();
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF parsing failed";
    throw new DocumentExtractError(
      message.includes("Invalid PDF")
        ? "This PDF could not be opened. Try re-exporting it or upload a .docx / .txt copy."
        : `Could not read this PDF: ${message}`,
      "pdf_parse_failed",
    );
  } finally {
    await parser.destroy();
  }
}

export async function extractDocumentText(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null,
): Promise<{ text: string; format: DocumentFormat; wordCount: number }> {
  const format = detectDocumentFormatFromBuffer(buffer, fileName, mimeType);
  if (!format) {
    throw new DocumentExtractError(
      `Unsupported file type. Upload ${ACCEPTED_CV_LABEL}.`,
      "unsupported_format",
    );
  }

  let text = "";
  if (format === "pdf") {
    text = await extractPdfText(buffer);
  } else if (format === "docx") {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value ?? "";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "DOCX parsing failed";
      throw new DocumentExtractError(
        `Could not read this Word document: ${message}`,
        "docx_parse_failed",
      );
    }
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
