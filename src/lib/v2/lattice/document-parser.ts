import {
  documentFileNameFromRecord,
  documentLabelFromRecord,
} from "@/lib/v2/onboarding-document-types";
import type { DocumentRecord } from "@/lib/v2/types";
import type { LatticeEvidence } from "@/lib/v2/lattice/types";
import {
  acgmeLevelIndex,
  inferDevelopmentLevel,
  keywordPlacement,
} from "@/lib/v2/lattice/ontology-bridge";

const SNIPPET_MIN = 40;
const SNIPPET_MAX = 480;
const MAX_SNIPPETS_PER_DOC = 24;

function splitIntoSnippets(text: string): string[] {
  const chunks = text
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= SNIPPET_MIN);

  const out: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= SNIPPET_MAX) {
      out.push(chunk);
      continue;
    }
    for (let i = 0; i < chunk.length; i += SNIPPET_MAX) {
      const slice = chunk.slice(i, i + SNIPPET_MAX).trim();
      if (slice.length >= SNIPPET_MIN) out.push(slice);
    }
  }
  return out.slice(0, MAX_SNIPPETS_PER_DOC);
}

function snippetToEvidence(
  snippet: string,
  doc: DocumentRecord,
  index: number,
): LatticeEvidence | null {
  const placement = keywordPlacement(snippet);
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
    const snippets = splitIntoSnippets(text);
    if (snippets.length === 0) {
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
    snippets.forEach((snippet, i) => {
      const item = snippetToEvidence(snippet, doc, i);
      if (item) evidence.push(item);
    });
  }
  return evidence;
}
