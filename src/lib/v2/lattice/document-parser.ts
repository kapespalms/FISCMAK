import type { DocumentRecord } from "@/lib/v2/types";
import type { LatticeEvidence } from "@/lib/v2/lattice/types";
import {
  acgmeLevelIndex,
  inferDevelopmentLevel,
  keywordPlacement,
} from "@/lib/v2/lattice/ontology-bridge";
import {
  documentFileNameFromRecord,
  documentLabelFromRecord,
} from "@/lib/v2/onboarding-document-types";
import { matchTextToActivityPlacement } from "@/lib/v2/lattice/ontology-registry";

const SNIPPET_MIN = 30;
const SNIPPET_MAX = 480;
const MAX_SNIPPETS_PER_DOC = 150;

// ---------------------------------------------------------------------------
// CV section detection
// ---------------------------------------------------------------------------

interface SectionHint {
  domainIndex: number;
  trackIndex: number;
  acgmeKey: string;
  baseLevel: number;
}

interface SectionRule {
  pattern: RegExp;
  hint: SectionHint;
}

/**
 * Maps common CV/academic CV section headings to a FISCMAK lattice placement.
 * Used as a fallback when ontology and keyword matching both fail — ensures that
 * e.g. a publication entry under "PUBLICATIONS" still lands in Scholarship×Researcher
 * even if the entry text is just "Smith J et al. J Psychiatry. 2023."
 */
const CV_SECTION_RULES: SectionRule[] = [
  // GME training blocks (must precede generic "educat" teaching rule)
  {
    pattern: /\b(^education$|^training$|medical education|graduate medical|residency|fellowship|internship)\b/i,
    hint: { domainIndex: 0, trackIndex: 0, acgmeKey: "pc", baseLevel: 3 },
  },
  // Psychiatry subspecialty / rotation sections (ACGME psychiatry FAQ areas)
  {
    pattern: /\b(consultation.liaison|c-?l psych|psychosomatic|liaison psychiatry)\b/i,
    hint: { domainIndex: 0, trackIndex: 0, acgmeKey: "pc", baseLevel: 4 },
  },
  {
    pattern: /\b(addiction psychiatry|addiction medicine|substance use|mat\b|medication.assisted)\b/i,
    hint: { domainIndex: 0, trackIndex: 0, acgmeKey: "pc", baseLevel: 4 },
  },
  {
    pattern: /\b(child and adolescent|forensic psych|geriatric psych|sleep medicine)\b/i,
    hint: { domainIndex: 0, trackIndex: 0, acgmeKey: "pc", baseLevel: 4 },
  },
  {
    pattern: /\b(psychotherapy|psychopharmacology|inpatient psychiatry|emergency psychiatry)\b/i,
    hint: { domainIndex: 0, trackIndex: 0, acgmeKey: "pc", baseLevel: 3 },
  },
  // Medical Knowledge / Research track (mk → 1)
  {
    pattern: /\b(publications?|manuscripts?|papers?|peer.reviewed|abstracts?|posters?)\b/i,
    hint: { domainIndex: 1, trackIndex: 2, acgmeKey: "mk", baseLevel: 4 },
  },
  {
    pattern: /\b(research|grant|funded project|investigat|scholarly work)\b/i,
    hint: { domainIndex: 1, trackIndex: 2, acgmeKey: "mk", baseLevel: 3 },
  },
  // Practice-Based Learning / Teaching track (pbli → 2)
  {
    pattern: /\b(teaching|teach|educat|curriculum|pedagog|didactic|clerkship director|course director)\b/i,
    hint: { domainIndex: 2, trackIndex: 1, acgmeKey: "pbli", baseLevel: 3 },
  },
  // Presentations / Invited talks (mk → 1)
  {
    pattern: /\b(presentations?|invited talks?|grand rounds|visiting professor|keynote|plenary|conference|seminars?)\b/i,
    hint: { domainIndex: 1, trackIndex: 2, acgmeKey: "mk", baseLevel: 3 },
  },
  // Communication / Interpersonal (ics → 3)
  {
    pattern: /\b(communication|interpersonal|patient communication|family meeting|health literacy|shared decision|difficult conversation|interpreter)\b/i,
    hint: { domainIndex: 3, trackIndex: 0, acgmeKey: "ics", baseLevel: 3 },
  },
  // Collaboration & Teamwork (ics → 6)
  {
    pattern: /\b(interprofessional|interdisciplinary|multidisciplinary|collaborative practice|teamwork|care team|collaborative care)\b/i,
    hint: { domainIndex: 6, trackIndex: 0, acgmeKey: "ics", baseLevel: 3 },
  },
  // Mentoring track (ppd → 7)
  {
    pattern: /\b(mentor|coach|sponsor|career advising)\b/i,
    hint: { domainIndex: 7, trackIndex: 1, acgmeKey: "ics", baseLevel: 3 },
  },
  // Leadership / Administration (sbp → 5, Systems Thinking)
  {
    pattern: /\b(leadership|administration|administrative|committees?|director|chair|officer|board|governance)\b/i,
    hint: { domainIndex: 5, trackIndex: 3, acgmeKey: "sbp", baseLevel: 4 },
  },
  // Quality Improvement / Patient Safety (sbp → 5)
  {
    pattern: /\b(quality improvement|patient safety|qi\b|quality initiative|safety initiative|improvement project)\b/i,
    hint: { domainIndex: 5, trackIndex: 6, acgmeKey: "sbp", baseLevel: 3 },
  },
  // Advocacy / Policy (sbp → 5)
  {
    pattern: /\b(advocacy|policy|community health|global health|equity|diversity|inclusion|underserved|public health)\b/i,
    hint: { domainIndex: 5, trackIndex: 4, acgmeKey: "sbp", baseLevel: 3 },
  },
  // Innovation / Technology (pbli → 2)
  {
    pattern: /\b(innovation|technology|digital health|informatics|health tech|app|platform)\b/i,
    hint: { domainIndex: 2, trackIndex: 5, acgmeKey: "pbli", baseLevel: 3 },
  },
  // Wellness (ppd → 7)
  {
    pattern: /\b(wellness|wellbeing|well-being|resilience|burnout|self.care|mindfulness)\b/i,
    hint: { domainIndex: 7, trackIndex: 7, acgmeKey: "prof", baseLevel: 2 },
  },
  // Awards / Professionalism (prof → 4)
  {
    pattern: /\b(award|honor|recognition|prize|certificate|certification|distinction)\b/i,
    hint: { domainIndex: 4, trackIndex: 0, acgmeKey: "prof", baseLevel: 3 },
  },
  // Clinical experience (lowest priority — very broad)
  {
    pattern: /\b(clinical experience|patient care|rotation|clerkship|internship)\b/i,
    hint: { domainIndex: 0, trackIndex: 0, acgmeKey: "pc", baseLevel: 3 },
  },
];

/**
 * Returns true if `line` looks like a CV section heading.
 * Criteria: short (≤80 chars), no trailing sentence punctuation,
 * and either all-caps or a title-cased single phrase.
 */
function isLikelySectionHeading(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 80) return false;
  // Job titles, institutions, and dated lines are entries — not section headings
  if (/\b(19|20)\d{2}\b/.test(t)) return false;
  if (/\bat\s+[A-Z]/.test(t) || /\b(university|hospital|medical center|health system)\b/i.test(t)) {
    return false;
  }
  // All-caps heading, possibly with spaces, hyphens, slashes, &, colons
  if (/^[A-Z][A-Z\s\-\/&:()]+$/.test(t)) return true;
  // Short title-case line with no trailing sentence punctuation
  if (t.length <= 60 && !/[.;,!?]$/.test(t) && /^[A-Z]/.test(t)) {
    const lower = t.toLowerCase();
    const sectionWords = [
      "education", "training", "experience", "publication", "research",
      "teaching", "leadership", "administration", "committee", "award",
      "honor", "recognition", "service", "advocacy", "quality", "safety",
      "wellness", "innovation", "technology", "mentoring", "skills",
      "certification", "presentation", "grant", "funding", "activities",
      "clinical", "rotation", "fellowship", "residency", "internship",
      "volunteer", "outreach", "global", "equity", "diversity",
    ];
    return sectionWords.some((w) => lower.includes(w));
  }
  return false;
}

/**
 * Maps a section heading to a FISCMAK placement hint, or null if unrecognised.
 */
function sectionHintFromHeading(heading: string): SectionHint | null {
  for (const rule of CV_SECTION_RULES) {
    if (rule.pattern.test(heading)) return rule.hint;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Section-aware splitting
// ---------------------------------------------------------------------------

interface AnnotatedSnippet {
  text: string;
  sectionHint: SectionHint | null;
}

/**
 * Splits document text into snippets while tracking which CV section each
 * snippet came from. Handles:
 * - Double-newline paragraph breaks
 * - Single-newline CV entries (bullet points, year-prefixed lines, long lines)
 * - All-caps and title-case section headings
 */
function splitIntoAnnotatedSnippets(text: string): AnnotatedSnippet[] {
  const lines = text.split("\n");
  const results: AnnotatedSnippet[] = [];
  let currentSectionHint: SectionHint | null = null;
  let currentBlock: string[] = [];

  function flushBlock() {
    const combined = currentBlock
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    currentBlock = [];
    if (combined.length < SNIPPET_MIN) return;

    // Split oversized blocks into SNIPPET_MAX chunks
    for (let i = 0; i < combined.length; i += SNIPPET_MAX) {
      const slice = combined.slice(i, i + SNIPPET_MAX).trim();
      if (slice.length >= SNIPPET_MIN) {
        results.push({ text: slice, sectionHint: currentSectionHint });
      }
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line → flush current block (paragraph break)
    if (!trimmed) {
      flushBlock();
      continue;
    }

    // Detect section headings
    if (isLikelySectionHeading(trimmed)) {
      flushBlock();
      // Update section hint (keep previous if heading doesn't match a known section)
      const hint = sectionHintFromHeading(trimmed);
      if (hint) currentSectionHint = hint;
      // Don't include the heading text itself as a snippet
      continue;
    }

    // Detect the start of a new CV entry within the same section.
    // Flush the current block before starting a new one when:
    //   • Line starts with a bullet character
    //   • Line starts with a 4-digit year (e.g. "2019  Smith J et al.")
    //   • Current block has content and this line is a standalone long line
    const isBullet = /^[\-•·▪◦*►]/.test(trimmed);
    const isYearStart = /^\d{4}[\s\-–—]/.test(trimmed);
    const isStandaloneEntry = currentBlock.length > 0 && trimmed.length > 120;

    if ((isBullet || isYearStart || isStandaloneEntry) && currentBlock.length > 0) {
      flushBlock();
    }

    currentBlock.push(trimmed);
  }

  flushBlock();

  return results.slice(0, MAX_SNIPPETS_PER_DOC);
}

// ---------------------------------------------------------------------------
// Evidence construction
// ---------------------------------------------------------------------------

function snippetToEvidence(
  annotated: AnnotatedSnippet,
  doc: DocumentRecord,
  index: number,
): LatticeEvidence | null {
  const { text: snippet, sectionHint } = annotated;

  const ontology = matchTextToActivityPlacement(snippet);
  const keyword = keywordPlacement(snippet);

  // Placement priority: specific keyword → ontology → section heading → clinical keyword.
  //
  // Exception — clinical (domain 0) keywords yield to non-clinical section hints:
  // "rounds", "patient", "treatment" appear in almost any medical text and are
  // too broad to override a heading like PRESENTATIONS or COMMUNICATION.
  // When this yield fires, also skip the ontology scorer (which is equally noisy
  // on dense CV text) and use the heading directly.
  const clinicalKeywordYields =
    keyword?.domainIndex === 0 && sectionHint != null && sectionHint.domainIndex !== 0;

  let placement;
  if (clinicalKeywordYields) {
    // Section heading wins; clinical keyword kept as last-resort fallback in case
    // sectionHint is somehow absent (guard only — structurally it can't be null here).
    placement = sectionHint
      ? { domainIndex: sectionHint.domainIndex, trackIndex: sectionHint.trackIndex, acgmeKey: sectionHint.acgmeKey, developmentLevel: sectionHint.baseLevel }
      : { domainIndex: keyword!.domainIndex, trackIndex: keyword!.trackIndex, acgmeKey: keyword!.acgmeKey, developmentLevel: keyword!.developmentLevel };
  } else {
    placement = keyword
      ? { domainIndex: keyword.domainIndex, trackIndex: keyword.trackIndex, acgmeKey: keyword.acgmeKey, developmentLevel: keyword.developmentLevel }
      : ontology
        ? { domainIndex: ontology.domainIndex, trackIndex: ontology.trackIndex, acgmeKey: ontology.acgmeKey, developmentLevel: ontology.defaultDevelopmentLevel }
        : sectionHint
          ? { domainIndex: sectionHint.domainIndex, trackIndex: sectionHint.trackIndex, acgmeKey: sectionHint.acgmeKey, developmentLevel: sectionHint.baseLevel }
          : null;
  }

  if (!placement) return null;

  const level = inferDevelopmentLevel(snippet, placement.developmentLevel);

  return {
    id: `doc-${doc.document_id}-${index}`,
    source: "document",
    sourceLabel: documentLabelFromRecord(doc),
    rawText: snippet,
    date: doc.uploaded_at?.slice(0, 10) ?? null,
    energy: null,
    developmentLevel: level,
    documentId: doc.document_id,
    fiscmak: {
      domainIndex: placement.domainIndex,
      trackIndex: placement.trackIndex,
    },
    acgme: {
      competencyKey: placement.acgmeKey,
      levelIndex: acgmeLevelIndex(level),
    },
  };
}

export function parseDocumentsToLatticeEvidence(
  documents: DocumentRecord[],
): LatticeEvidence[] {
  const evidence: LatticeEvidence[] = [];

  for (const doc of documents) {
    const text = doc.extracted_text?.trim();
    if (!text) continue;

    const label = documentLabelFromRecord(doc);
    const fileName = documentFileNameFromRecord(doc);

    const snippets = splitIntoAnnotatedSnippets(text);

    if (snippets.length === 0) {
      // Document produced no snippets (e.g. very short plain text) — try a
      // single fallback placement from the first 800 characters.
      const fallback = keywordPlacement(text.slice(0, 800));
      if (fallback) {
        evidence.push({
          id: `doc-${doc.document_id}-0`,
          source: "document",
          sourceLabel: `${label} (${fileName})`,
          rawText: text.slice(0, 300),
          date: doc.uploaded_at?.slice(0, 10) ?? null,
          energy: null,
          developmentLevel: inferDevelopmentLevel(text, fallback.developmentLevel),
          documentId: doc.document_id,
          fiscmak: {
            domainIndex: fallback.domainIndex,
            trackIndex: fallback.trackIndex,
          },
          acgme: {
            competencyKey: fallback.acgmeKey,
            levelIndex: acgmeLevelIndex(fallback.developmentLevel),
          },
        });
      }
      continue;
    }

    snippets.forEach((annotated, i) => {
      const item = snippetToEvidence(annotated, doc, i);
      if (item) evidence.push(item);
    });
  }

  return evidence;
}

// ---------------------------------------------------------------------------
// CV → multi-cell weighted evidence rows (BUILD_ORDER 4.1 new model §8.2)
// ---------------------------------------------------------------------------

/**
 * Confidence tiers drive the confidence-triage UX (§8.3):
 *   ≥0.80  high   → auto-accept candidate (~85% of lines)
 *   0.60–0.79  medium → surface for physician review
 *   <0.60  low    → always surface for review
 *
 * Placement method → confidence:
 *   keyword + ontology agree on same domain  0.90
 *   keyword (ontology differs or absent)     0.85
 *   clinical keyword yielded to section hint 0.65
 *   ontology only                            0.70
 *   section hint only                        0.55
 */

/**
 * One cell in the multi-domain distribution for a CV line.
 * quadrant is always OV or SV — CV = visible work only; OI/SI
 * never appear here (invisible work is captured live, not parsed from a CV).
 */
export type CvCellWeight = {
  domain_index: number;
  track_index: number;
  /** Normalized weight ∈ [0.15, 1.0]; all cells for one row sum to 1.0. */
  weight: number;
  /** OV for objective career records; SV for subjective/reflective sections. */
  quadrant: "OV" | "SV";
};

export type ParsedCvRow = {
  raw_text: string;
  confidence_score: number;
  placement_method: "keyword" | "ontology" | "section_hint" | "keyword_yielded";
  /** Multi-cell distribution. Top ~3 cells, min weight 0.15, sum ≈ 1.0. */
  cells: CvCellWeight[];
};

/**
 * Base signal weights before normalization.
 * Keyword is the most specific signal; section hint the broadest.
 * When clinicalKeywordYields, the clinical keyword is suppressed and the
 * section hint dominates (0.70) with ontology as secondary (0.30).
 */
const BASE_WEIGHTS = { keyword: 0.50, ontology: 0.30, section_hint: 0.20 } as const;
const CLINICAL_YIELD_WEIGHTS = { section_hint: 0.70, ontology: 0.30 } as const;
const MIN_CELL_WEIGHT = 0.15;
const MAX_CELLS = 3;

type RawCell = { domainIndex: number; trackIndex: number; rawWeight: number };

function buildWeightedCells(
  keyword:  { domainIndex: number; trackIndex: number } | null,
  ontology: { domainIndex: number; trackIndex: number } | null,
  sectionHint: SectionHint | null,
  clinicalKeywordYields: boolean,
): Array<{ domainIndex: number; trackIndex: number; weight: number }> {
  const signals: RawCell[] = [];

  if (clinicalKeywordYields && sectionHint) {
    signals.push({ domainIndex: sectionHint.domainIndex, trackIndex: sectionHint.trackIndex, rawWeight: CLINICAL_YIELD_WEIGHTS.section_hint });
    if (ontology) signals.push({ domainIndex: ontology.domainIndex, trackIndex: ontology.trackIndex, rawWeight: CLINICAL_YIELD_WEIGHTS.ontology });
  } else {
    if (keyword)     signals.push({ domainIndex: keyword.domainIndex,     trackIndex: keyword.trackIndex,     rawWeight: BASE_WEIGHTS.keyword });
    if (ontology)    signals.push({ domainIndex: ontology.domainIndex,    trackIndex: ontology.trackIndex,    rawWeight: BASE_WEIGHTS.ontology });
    if (sectionHint) signals.push({ domainIndex: sectionHint.domainIndex, trackIndex: sectionHint.trackIndex, rawWeight: BASE_WEIGHTS.section_hint });
  }

  if (signals.length === 0) return [];

  // Merge cells with same (domain, track) by summing weights
  const cellMap = new Map<string, RawCell>();
  for (const sig of signals) {
    const key = `${sig.domainIndex}:${sig.trackIndex}`;
    const existing = cellMap.get(key);
    if (existing) {
      existing.rawWeight += sig.rawWeight;
    } else {
      cellMap.set(key, { ...sig });
    }
  }

  // Sort descending by weight, cap at MAX_CELLS, normalize
  let cells = Array.from(cellMap.values())
    .sort((a, b) => b.rawWeight - a.rawWeight)
    .slice(0, MAX_CELLS);

  const total = cells.reduce((s, c) => s + c.rawWeight, 0);
  cells = cells.map((c) => ({ ...c, rawWeight: c.rawWeight / total }));

  // Filter below minimum weight and renormalize
  cells = cells.filter((c) => c.rawWeight >= MIN_CELL_WEIGHT);
  if (cells.length === 0) return [];

  const finalTotal = cells.reduce((s, c) => s + c.rawWeight, 0);
  return cells.map(({ domainIndex, trackIndex, rawWeight }) => ({
    domainIndex,
    trackIndex,
    weight: rawWeight / finalTotal,
  }));
}

/**
 * Parse a document's extracted text into multi-cell weighted rows per the new
 * evidence model (§8.2). Each row carries a distribution across lattice cells;
 * all quadrants are OV or SV — no OI/SI ever produced from a CV (invisible work
 * is captured live via the weekly-pulse stream, not parsed from documents).
 */
export function parseDocumentToCvRows(text: string): ParsedCvRow[] {
  const snippets = splitIntoAnnotatedSnippets(text.trim());
  const rows: ParsedCvRow[] = [];

  for (const { text: snippet, sectionHint } of snippets) {
    const ontology = matchTextToActivityPlacement(snippet);
    const keyword  = keywordPlacement(snippet);

    const clinicalKeywordYields =
      keyword?.domainIndex === 0 && sectionHint != null && sectionHint.domainIndex !== 0;

    let method: ParsedCvRow["placement_method"];
    let confidence: number;

    if (clinicalKeywordYields) {
      method = "keyword_yielded";
      confidence = 0.65;
    } else if (keyword) {
      method = "keyword";
      confidence = (ontology && ontology.domainIndex === keyword.domainIndex) ? 0.90 : 0.85;
    } else if (ontology) {
      method = "ontology";
      confidence = 0.70;
    } else if (sectionHint) {
      method = "section_hint";
      confidence = 0.55;
    } else {
      continue; // no placement possible — skip snippet
    }

    const weightedCells = buildWeightedCells(keyword, ontology, sectionHint, clinicalKeywordYields);
    if (weightedCells.length === 0) continue;

    rows.push({
      raw_text: snippet,
      confidence_score: confidence,
      placement_method: method,
      cells: weightedCells.map(({ domainIndex, trackIndex, weight }) => ({
        domain_index: domainIndex,
        track_index:  trackIndex,
        weight,
        // CV work is always objective-visible; SV (subjective-visible) is a
        // possible refinement for personal-statement sections but deferred.
        quadrant: "OV" as const,
      })),
    });
  }

  return rows;
}
