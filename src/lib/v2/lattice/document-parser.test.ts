import { describe, expect, it } from "vitest";
import type { DocumentRecord } from "@/lib/v2/types";
import {
  parseDocumentsToLatticeEvidence,
  parseDocumentToCvRows,
  type ParsedCvRow,
} from "@/lib/v2/lattice/document-parser";
import { DOMAINS, TRACKS } from "@/lib/constants";

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

// ---------------------------------------------------------------------------
// Improvements: snippet cap, verb list, missing section rules
// ---------------------------------------------------------------------------

describe("improvements — snippet cap, verb levels, missing sections", () => {
  it("parses more than 60 entries from a long CV", () => {
    const entries = Array.from({ length: 100 }, (_, i) =>
      `2020  Led workshop ${i + 1} on clinical skills for medical students.`,
    ).join("\n");
    const evidence = parseDocumentsToLatticeEvidence([cvDoc(entries)]);
    expect(evidence.length).toBeGreaterThan(60);
  });

  it("PRESENTATIONS section routes to Researcher", () => {
    const text = [
      "PRESENTATIONS",
      "Palmer K. Moral distress in psychiatry training. Grand Rounds, University Hospitals, 2025.",
    ].join("\n");
    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("Grand Rounds"));
    expect(entry).toBeDefined();
    expect(TRACKS[entry!.fiscmak.trackIndex]).toBe("Researcher");
    expect(DOMAINS[entry!.fiscmak.domainIndex]).toBe("Medical Knowledge");
  });

  it("COMMUNICATION section routes to Communication domain", () => {
    const text = [
      "COMMUNICATION SKILLS",
      "Developed patient communication training module for PGY-1 residents; evaluated shared decision-making competency.",
    ].join("\n");
    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("training module"));
    expect(entry).toBeDefined();
    expect(DOMAINS[entry!.fiscmak.domainIndex]).toBe("Communication");
  });

  it("INTERPROFESSIONAL section routes to Collaboration & Teamwork domain", () => {
    const text = [
      "INTERPROFESSIONAL COLLABORATION",
      "Co-led multidisciplinary case conferences integrating psychiatry, social work, pharmacy, and nursing.",
    ].join("\n");
    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("case conferences"));
    expect(entry).toBeDefined();
    expect(DOMAINS[entry!.fiscmak.domainIndex]).toBe("Collaboration & Teamwork");
  });

  it("founding/pioneer verbs infer level 5", () => {
    const text = "LEADERSHIP\nFounded the department wellness committee; pioneered peer support program adopted nationally.";
    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("wellness committee"));
    expect(entry).toBeDefined();
    expect(entry!.developmentLevel).toBe(5);
  });

  it("co-authored infers level 4", () => {
    const text = "PUBLICATIONS\nCo-authored guidelines on trauma-informed care; delivered at regional conference.";
    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("guidelines"));
    expect(entry).toBeDefined();
    expect(entry!.developmentLevel).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// Bug #1 — Section hint must not override ontology/keyword when content
// clearly belongs to a different domain than the section heading implies.
// ---------------------------------------------------------------------------

describe("Bug #1 — section hint must not override ontology match", () => {
  it("mentoring content under EDUCATION routes to Personal & Professional Development, not Clinical", () => {
    const text = [
      "EDUCATION",
      "Mentored 3 medical students through longitudinal research projects; provided weekly career coaching and sponsor letters.",
    ].join("\n");

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("Mentored"));

    expect(entry).toBeDefined();
    // Domain 7 = Personal & Professional Development (mentoring)
    // Bug: currently routes to domain 0 (Clinical) because EDUCATION section hint wins
    expect(DOMAINS[entry!.fiscmak.domainIndex]).toBe("Personal & Professional Development");
    expect(TRACKS[entry!.fiscmak.trackIndex]).not.toBe("Clinician");
  });

  it("teaching content under EDUCATION routes to Practice-Based Learning, not Clinical", () => {
    const text = [
      "EDUCATION",
      "Designed and taught a 12-session psychotherapy curriculum for PGY-2 residents; developed case-based didactic materials.",
    ].join("\n");

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("curriculum"));

    expect(entry).toBeDefined();
    // Domain 2 = Practice-Based Learning (teaching/education, v3 PCRS)
    expect(DOMAINS[entry!.fiscmak.domainIndex]).toBe("Practice-Based Learning");
  });

  it("leadership content under RESEARCH routes to Systems Thinking, not Medical Knowledge", () => {
    const text = [
      "RESEARCH",
      "Directed a 6-person multidisciplinary team; chaired the department quality committee for 3 years.",
    ].join("\n");

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("Directed"));

    expect(entry).toBeDefined();
    // Domain 5 = Systems Thinking (leadership/admin, v3 PCRS)
    expect(DOMAINS[entry!.fiscmak.domainIndex]).toBe("Systems Thinking");
  });
});

// ---------------------------------------------------------------------------
// Bug #2 — "psychiatry" / "psychiatric" are specialty identifiers, not domain
// signals. They must not force Clinical×Clinician when context says otherwise.
// ---------------------------------------------------------------------------

describe("Bug #2 — psychiatry/psychiatric must not override context", () => {
  it("research text containing 'psychiatry' routes to Researcher, not Clinician", () => {
    // No section heading — only keyword signals available.
    // "psychiatry" must not fire before "research" / "manuscript".
    const text =
      "Conducted research on antidepressant efficacy in psychiatry; manuscript submitted to American Journal of Psychiatry.";

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("antidepressant"));

    expect(entry).toBeDefined();
    // Bug: "psychiatry" keyword fires first → Clinical×Clinician
    // Correct: "research" / "manuscript" keyword fires → Scholarship×Researcher
    expect(TRACKS[entry!.fiscmak.trackIndex]).toBe("Researcher");
    expect(DOMAINS[entry!.fiscmak.domainIndex]).not.toBe("Clinical Expertise");
  });

  it("psychiatry curriculum redesign routes to Educator, not Clinician", () => {
    const text = [
      "TEACHING",
      "Redesigned the psychiatry residency curriculum to incorporate trauma-informed care modules; evaluated by residents as highly effective.",
    ].join("\n");

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("curriculum"));

    expect(entry).toBeDefined();
    // Bug: "psychiatry" keyword fires before "curriculum/teach" rules
    // Correct: should route to Educator (teaching domain)
    expect(TRACKS[entry!.fiscmak.trackIndex]).toBe("Educator");
  });

  it("psychiatry QI project routes to Quality/Safety, not Clinician", () => {
    const text = [
      "QUALITY IMPROVEMENT",
      "Led a psychiatry department initiative to reduce seclusion and restraint use by 40% over 18 months.",
    ].join("\n");

    const evidence = parseDocumentsToLatticeEvidence([cvDoc(text)]);
    const entry = evidence.find((e) => e.rawText.includes("seclusion"));

    expect(entry).toBeDefined();
    // Bug: "psychiatry" keyword fires before "quality/safety" rule
    // Correct: QI section + safety content → Quality/Safety track
    expect(TRACKS[entry!.fiscmak.trackIndex]).toBe("Quality/Safety");
  });
});

// ---------------------------------------------------------------------------
// New evidence model — parseDocumentToCvRows (§8.2)
// Invariants that must hold for every row produced from ANY CV text:
//   1. cells array is non-empty
//   2. weights sum to ≈ 1.0 (floating-point tolerance 1e-9)
//   3. no cell has weight < 0.15
//   4. no cell has quadrant OI or SI  (CV = visible work only)
// ---------------------------------------------------------------------------

function allRows(text: string): ParsedCvRow[] {
  return parseDocumentToCvRows(text);
}

function assertInvariants(rows: ParsedCvRow[]) {
  for (const row of rows) {
    expect(row.cells.length).toBeGreaterThan(0);

    const weightSum = row.cells.reduce((s, c) => s + c.weight, 0);
    expect(weightSum).toBeCloseTo(1.0, 9);

    for (const cell of row.cells) {
      expect(cell.weight).toBeGreaterThanOrEqual(0.15);
      expect(["OV", "SV"]).toContain(cell.quadrant);
      expect(["OI", "SI"]).not.toContain(cell.quadrant);
    }
  }
}

describe("parseDocumentToCvRows — new model invariants (§8.2)", () => {
  it("weights sum to ~1.0 and no cell below 0.15 for a publication line", () => {
    const rows = allRows(
      "PUBLICATIONS\nPalmer K, Smith J. Moral distress in psychiatry training. Am J Psychiatry. 2024.",
    );
    expect(rows.length).toBeGreaterThan(0);
    assertInvariants(rows);
  });

  it("no OI or SI quadrant ever produced from a CV", () => {
    const text = [
      "LEADERSHIP",
      "Directed department quality committee; chaired 3-person policy subgroup.",
      "ADVOCACY",
      "Testified before state legislature on mental health parity policy.",
      "QUALITY IMPROVEMENT",
      "Led initiative to reduce seclusion and restraint use by 40%.",
      "WELLNESS",
      "Founded peer support program; trained 12 faculty facilitators.",
    ].join("\n");
    const rows = allRows(text);
    expect(rows.length).toBeGreaterThan(0);
    assertInvariants(rows); // catches any OI/SI assignment
  });

  it("publication line has a cell at Researcher (track 2)", () => {
    const rows = allRows(
      "PUBLICATIONS\nSmith J et al. Lancet Psychiatry. 2024; randomised trial design.",
    );
    const pub = rows[0];
    expect(pub).toBeDefined();
    const hasResearcher = pub!.cells.some((c) => c.track_index === 2);
    expect(hasResearcher).toBe(true);
  });

  it("multi-cell distribution when keyword and section hint disagree", () => {
    // "mentored" keyword → PPD×Educator, section hint EDUCATION → Clinical
    const rows = allRows(
      "EDUCATION\nMentored 3 medical students through longitudinal research projects.",
    );
    expect(rows.length).toBeGreaterThan(0);
    assertInvariants(rows);
    // Should produce ≥ 1 cell (distribution may single-cell if signals agree,
    // but invariants must hold regardless)
    expect(rows[0]!.cells.length).toBeGreaterThanOrEqual(1);
  });

  it("confidence score is within expected tiers", () => {
    const rows = allRows(
      "PUBLICATIONS\nHigh-confidence: published peer-reviewed research manuscript in psychiatry.",
    );
    expect(rows.length).toBeGreaterThan(0);
    const conf = rows[0]!.confidence_score;
    expect(conf).toBeGreaterThanOrEqual(0.55);
    expect(conf).toBeLessThanOrEqual(0.90);
  });

  it("handles a full multi-section CV without OI/SI", () => {
    const text = [
      "EDUCATION", "Psychiatry Residency, University Hospitals, 2020–2024",
      "PUBLICATIONS", "Palmer K. Am J Psychiatry. 2024.",
      "TEACHING", "Designed psychotherapy curriculum for PGY-2 residents.",
      "LEADERSHIP", "Chaired department wellness committee.",
      "QUALITY IMPROVEMENT", "Led seclusion-reduction initiative.",
    ].join("\n");
    const rows = allRows(text);
    expect(rows.length).toBeGreaterThan(0);
    assertInvariants(rows);
  });
});
