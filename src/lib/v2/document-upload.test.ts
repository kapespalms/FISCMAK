import { describe, expect, it } from "vitest";
import {
  resolveDocumentUploadFields,
  buildPendingDocumentMetadata,
  createPendingDocumentIds,
} from "@/lib/v2/document-process";
import { isAcceptedCvFileName } from "@/lib/v2/document-upload-types";

describe("isAcceptedCvFileName", () => {
  it("accepts .pdf, .docx, .txt, .md", () => {
    expect(isAcceptedCvFileName("cv.pdf")).toBe(true);
    expect(isAcceptedCvFileName("cv.docx")).toBe(true);
    expect(isAcceptedCvFileName("cv.txt")).toBe(true);
    expect(isAcceptedCvFileName("cv.md")).toBe(true);
  });

  it("rejects .png, .jpg, .exe, no extension", () => {
    expect(isAcceptedCvFileName("cv.png")).toBe(false);
    expect(isAcceptedCvFileName("cv.jpg")).toBe(false);
    expect(isAcceptedCvFileName("malware.exe")).toBe(false);
    expect(isAcceptedCvFileName("noextension")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isAcceptedCvFileName("CV.PDF")).toBe(true);
    expect(isAcceptedCvFileName("CV.DOCX")).toBe(true);
  });
});

describe("resolveDocumentUploadFields", () => {
  it("defaults to CV when no type provided", () => {
    const result = resolveDocumentUploadFields({});
    expect(result.document_type).toBe("CV");
    expect(result.document_subtype).toBe("CV");
    expect(result.document_label).toBeTruthy();
  });

  it("resolves CV subtype correctly", () => {
    const result = resolveDocumentUploadFields({
      requestedType: "CV",
      documentSubtype: "CV",
      documentLabel: "CV / Resume",
    });
    expect(result.document_type).toBe("CV");
    expect(result.document_subtype).toBe("CV");
  });

  it("falls back to CV when subtype is unknown and requestedType defaults to CV", () => {
    // requestedType defaults to "CV" — the catch block returns CV fallback, does not throw
    const result = resolveDocumentUploadFields({ documentSubtype: "NONEXISTENT_TYPE_XYZ" });
    expect(result.document_type).toBe("CV");
    expect(result.document_subtype).toBe("CV");
  });
});

describe("createPendingDocumentIds", () => {
  it("returns a UUID document_id and a storage path containing the user_id and document_id", () => {
    const userId = "user-abc-123";
    const { documentId, storagePath } = createPendingDocumentIds(userId, "cv.pdf");
    expect(documentId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(storagePath).toContain(userId);
    expect(storagePath).toContain(documentId);
  });

  it("includes the original file name in the storage path", () => {
    const { storagePath } = createPendingDocumentIds("u1", "my-cv.pdf");
    expect(storagePath).toContain("my-cv.pdf");
  });

  it("generates unique IDs on each call", () => {
    const a = createPendingDocumentIds("u1", "cv.pdf");
    const b = createPendingDocumentIds("u1", "cv.pdf");
    expect(a.documentId).not.toBe(b.documentId);
    expect(a.storagePath).not.toBe(b.storagePath);
  });
});

describe("buildPendingDocumentMetadata", () => {
  it("returns correct metadata shape for a CV upload", () => {
    const resolved = {
      document_type: "CV",
      document_subtype: "CV",
      document_label: "CV / Resume",
    };
    const meta = buildPendingDocumentMetadata({
      resolved,
      fileName: "cv.pdf",
      mimeType: "application/pdf",
      storagePath: "user-abc/doc-123/cv.pdf",
    });
    expect(meta.file_name).toBe("cv.pdf");
    expect(meta.document_subtype).toBe("CV");
    expect(meta.storage_path).toBe("user-abc/doc-123/cv.pdf");
    expect(meta.storage_bucket).toBe("user-documents");
    expect(meta.mime_type).toBe("application/pdf");
  });
});
