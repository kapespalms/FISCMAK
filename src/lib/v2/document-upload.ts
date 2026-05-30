import "server-only";

import * as mammoth from "mammoth";
import type { PDFParse as PDFParseClass } from "pdf-parse";
import {
  ACCEPTED_CV_LABEL,
  detectDocumentFormat,
  type DocumentFormat,
} from "@/lib/v2/document-upload-types";

// NOTE: pdf-parse v2 / pdfjs-dist v5 require DOMMatrix, Path2D, and ImageData
// globals that exist in browsers but are absent in Node.js / Vercel Lambdas.
// We apply minimal polyfills and then LAZILY import pdf-parse so the polyfills
// are guaranteed to be in place before pdfjs-dist module code evaluates.
// Do NOT convert this back to a static import — it will break on Vercel.

// ---------------------------------------------------------------------------
// DOM polyfills required by pdfjs-dist v5 in a Node.js environment
// ---------------------------------------------------------------------------

function applyPdfjsPolyfills(): void {
  if (typeof globalThis.DOMMatrix === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      is2D = true; isIdentity = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static fromMatrix() { return new (globalThis as any).DOMMatrix(); }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static fromFloat64Array() { return new (globalThis as any).DOMMatrix(); }
      translate() { return this; }
      scale() { return this; }
      rotate() { return this; }
      rotateAxisAngle() { return this; }
      skewX() { return this; }
      skewY() { return this; }
      multiply() { return this; }
      flipX() { return this; }
      flipY() { return this; }
      inverse() { return this; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformPoint(p: any) { return { x: p?.x ?? 0, y: p?.y ?? 0, z: 0, w: 1 }; }
      toFloat32Array() { return new Float32Array(16); }
      toFloat64Array() { return new Float64Array(16); }
      toJSON() { return {}; }
      toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
    };
  }
  if (typeof globalThis.Path2D === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Path2D = class Path2D {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addPath(_path: any, _transform?: any) {}
      closePath() {}
      moveTo(_x: number, _y: number) {}
      lineTo(_x: number, _y: number) {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      ellipse() {}
      rect() {}
    };
  }
  if (typeof globalThis.ImageData === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ImageData = class ImageData {
      width: number;
      height: number;
      data: Uint8ClampedArray;
      colorSpace = "srgb" as const;
      constructor(widthOrData: number | Uint8ClampedArray, width: number, height?: number) {
        if (typeof widthOrData === "number") {
          this.width = widthOrData;
          this.height = width;
          this.data = new Uint8ClampedArray(widthOrData * width * 4);
        } else {
          this.data = widthOrData;
          this.width = width;
          this.height = height ?? widthOrData.length / (width * 4);
        }
      }
    };
  }
}

// ---------------------------------------------------------------------------
// Lazy pdf-parse loader — polyfills applied before first import
// ---------------------------------------------------------------------------

let _PDFParse: typeof PDFParseClass | null = null;

async function getPDFParse(): Promise<typeof PDFParseClass> {
  if (_PDFParse) return _PDFParse;
  applyPdfjsPolyfills();
  const mod = await import("pdf-parse");
  _PDFParse = mod.PDFParse;
  return _PDFParse;
}

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

// One-time setup: point pdfjs-dist to its bundled worker script so serverless
// environments (Vercel, Lambda) don't fall back to a broken default URL.
let pdfWorkerReady = false;
async function ensurePdfWorker(PDFParse: typeof PDFParseClass): Promise<void> {
  if (pdfWorkerReady) return;
  try {
    const { createRequire } = await import("node:module");
    const { pathToFileURL } = await import("node:url");
    const req = createRequire(import.meta.url);
    const workerPath = req.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
    PDFParse.setWorker(pathToFileURL(workerPath).href);
  } catch {
    // If path resolution fails, pdf-parse falls back to its own default —
    // usually fine in dev; explicit path is the safety net for production.
  }
  pdfWorkerReady = true;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const PDFParse = await getPDFParse();
  await ensurePdfWorker(PDFParse);
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
