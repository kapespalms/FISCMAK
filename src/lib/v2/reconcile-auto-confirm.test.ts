import { describe, expect, it } from "vitest";
import {
  applyAutoConfirmToReconciliationItems,
  isAutoReconcilablePublication,
  normalizeDoi,
} from "@/lib/v2/reconcile-auto-confirm";
import type { EnrichmentSnapshot } from "@/lib/v2/api-enrichment";

describe("reconcile auto-confirm", () => {
  it("matches DOI case-insensitively", () => {
    expect(
      isAutoReconcilablePublication(
        { doi: "10.1000/abc", title: "Paper" },
        { dois: ["10.1000/ABC"], pmids: [], grantIds: [] },
      ),
    ).toBe(true);
    expect(normalizeDoi("https://doi.org/10.1000/ABC")).toBe("10.1000/abc");
  });

  it("auto-confirms enrichment-publications when all vault pubs match CV ids", () => {
    const snapshot = {
      npi_verified: false,
      vault_extracts: {
        publications: [
          { doi: "10.1000/a", title: "A" },
          { pmid: "12345678", title: "B" },
        ],
        grant_ids: [],
      },
    } as EnrichmentSnapshot;

    const items = applyAutoConfirmToReconciliationItems(
      [
        {
          id: "enrichment-publications",
          source: "PubMed",
          label: "2 identifiers",
          detail: "",
          status: "pending",
        },
      ],
      snapshot,
    );

    expect(items[0]?.status).toBe("confirmed");
  });
});
