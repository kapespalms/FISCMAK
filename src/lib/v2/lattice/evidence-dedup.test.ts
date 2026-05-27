import { describe, expect, it } from "vitest";
import { dedupeLatticeEvidence, latticeEvidenceDedupKey } from "@/lib/v2/lattice/evidence-dedup";
import type { LatticeEvidence } from "@/lib/v2/lattice/types";

function evidence(
  partial: Partial<LatticeEvidence> & Pick<LatticeEvidence, "id" | "source">,
): LatticeEvidence {
  return {
    sourceLabel: partial.source,
    rawText: "sample",
    date: "2025-03-15",
    energy: null,
    developmentLevel: 2,
    fiscmak: { domainIndex: 1, trackIndex: 0 },
    acgme: { competencyKey: "medical_knowledge", levelIndex: 1 },
    ...partial,
  };
}

describe("latticeEvidenceDedupKey", () => {
  it("groups by domain, track, competency, and month", () => {
    const a = evidence({ id: "a", source: "activity" });
    const b = evidence({ id: "b", source: "document" });
    expect(latticeEvidenceDedupKey(a)).toBe(latticeEvidenceDedupKey(b));
  });
});

describe("dedupeLatticeEvidence", () => {
  it("keeps activity over document for the same cell and month", () => {
    const activity = evidence({ id: "act-1", source: "activity", developmentLevel: 2 });
    const document = evidence({ id: "doc-1", source: "document", developmentLevel: 3 });
    const { deduped, rawCount, dedupedCount } = dedupeLatticeEvidence([activity, document]);
    expect(rawCount).toBe(2);
    expect(dedupedCount).toBe(1);
    expect(deduped[0]?.source).toBe("activity");
  });

  it("does not collapse unrelated cells", () => {
    const a = evidence({
      id: "a",
      source: "activity",
      fiscmak: { domainIndex: 0, trackIndex: 0 },
    });
    const b = evidence({
      id: "b",
      source: "document",
      fiscmak: { domainIndex: 2, trackIndex: 1 },
    });
    const { dedupedCount } = dedupeLatticeEvidence([a, b]);
    expect(dedupedCount).toBe(2);
  });
});
