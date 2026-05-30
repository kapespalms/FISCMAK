import "server-only";

import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import {
  ACCEPTED_CV_LABEL,
  detectDocumentFormat,
  type DocumentFormat,
} from "@/lib/v2/document-upload-types";

// NOTE: Do NOT import from "pdf-parse/worker". That submodule pulls in
// @napi-rs/canvas (native .node binaries) which are only needed for page
// rendering (screenshots). Text extraction works fine with just PDFParse.

export class DocumentExtractError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "DocumentExtractError";
    this.code = code;
  }
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

async function extractPdfText(buffer: Buffer): Promise<string> {
  // PDFParse handles text extraction without canvas — no setWorker() needed.
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
