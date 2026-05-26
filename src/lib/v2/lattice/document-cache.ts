import type { DocumentRecord } from "@/lib/v2/types";
import type { LatticeEvidence } from "@/lib/v2/lattice/types";
import { parseDocumentsToLatticeEvidence } from "@/lib/v2/lattice/document-parser";

export type LatticeDocumentCache = {
  parsed_at: string;
  fingerprints: Record<string, string>;
  evidence: LatticeEvidence[];
};

function fingerprint(doc: DocumentRecord): string {
  const len = doc.extracted_text?.length ?? 0;
  return `${doc.uploaded_at}|${doc.extraction_status}|${len}`;
}

function cacheIsFresh(
  documents: DocumentRecord[],
  cache: LatticeDocumentCache | undefined,
): boolean {
  if (!cache) return false;
  if (documents.length !== Object.keys(cache.fingerprints).length) return false;
  for (const doc of documents) {
    if (cache.fingerprints[doc.document_id] !== fingerprint(doc)) return false;
  }
  return true;
}

export function resolveCachedDocumentEvidence(
  documents: DocumentRecord[],
  cache: LatticeDocumentCache | undefined,
): { evidence: LatticeEvidence[]; cache: LatticeDocumentCache; fromCache: boolean } {
  if (cacheIsFresh(documents, cache)) {
    return { evidence: cache!.evidence, cache: cache!, fromCache: true };
  }

  const evidence = parseDocumentsToLatticeEvidence(documents);
  const nextCache: LatticeDocumentCache = {
    parsed_at: new Date().toISOString(),
    fingerprints: Object.fromEntries(
      documents.map((d) => [d.document_id, fingerprint(d)]),
    ),
    evidence,
  };
  return { evidence, cache: nextCache, fromCache: false };
}
