import { describe, expect, it } from "vitest";
import type { DocumentRecord } from "@/lib/v2/types";
import { parseDocumentsToLatticeEvidence } from "@/lib/v2/lattice/document-parser";
import { TRACKS } from "@/lib/constants";

function cvDoc(text: string): DocumentRecord {
  return {
    document_id: "test-cv",
    user_id: "u1",
    document_type: "CV",
    extracted_text: text,
    uploaded_at: "2026-01-15T12:00:00Z",
    metadata: { document_label: "CV / Resume", file_name: "cv.pdf" },
  };
}

describe("parseDocumentsToLatticeEvidence — psychiatry CV", () => {
  it("places residency lines in clinical track, not mentoring", () => {
    const text = [
      "EDUCATION",
      "Psychiatry Residency, University Hospitals, 2020–2024",
      "PUBLICATIONS",
      "Palmer K, Smith J. Am J Psychiatry. 2024.",
    ].join("\n");

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const residency = evidence.find((e) => e.rawText.includes("Psychiatry Residency"));
    const publication = evidence.find((e) => e.rawText.includes("Am J Psychiatry"));

    expect(residency).toBeDefined();
    expect(TRACKS[residency!.fiscmak.trackIndex]).toBe("Clinician");
    expect(publication).toBeDefined();
    expect(TRACKS[publication!.fiscmak.trackIndex]).toBe("Researcher");
  });

  it("uses consultation-liaison section for C-L blocks", () => {
    const text = [
      "CONSULTATION-LIAISON PSYCHIATRY",
      "Led C-L service coverage for medical and surgical units; 400+ consultations annually.",
    ].join("\n");

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const cl = evidence.find((e) => e.rawText.includes("consultations"));
    expect(cl).toBeDefined();
    expect(TRACKS[cl!.fiscmak.trackIndex]).toBe("Clinician");
  });
});
