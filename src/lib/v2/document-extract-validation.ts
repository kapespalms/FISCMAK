/** Shared text validation for client- and server-side document extraction. */

export const MIN_EXTRACT_WORDS = 20;

export function normalizeExtractedText(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
}

export type ExtractValidationResult =
  | { ok: true; text: string; wordCount: number }
  | { ok: false; message: string; code: string };

export function validateExtractedText(raw: string): ExtractValidationResult {
  const text = normalizeExtractedText(raw);
  if (!text) {
    return {
      ok: false,
      message:
        "Could not extract readable text from this file. Try another format or paste your CV text.",
      code: "empty_extraction",
    };
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_EXTRACT_WORDS) {
    return {
      ok: false,
      message:
        "Extracted very little text — the file may be scanned or image-only. Paste your CV text instead.",
      code: "insufficient_text",
    };
  }

  return { ok: true, text, wordCount };
}
