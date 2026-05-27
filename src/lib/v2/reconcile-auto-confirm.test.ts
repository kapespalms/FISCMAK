import { describe, expect, it } from "vitest";
import { extractCvIdentifiers } from "@/lib/v2/api-enrichment";
import {
  applyAutoConfirmToReconciliationItems,
  isAutoReconcilablePublication,
  normalizeDoi,
  publicationVaultFlags,
} from "@/lib/v2/reconcile-auto-confirm";
import type { EnrichmentSnapshot } from "@/lib/v2/api-enrichment";

const CV_WITH_DOI = `
Publications
Smith K, et al. Novel findings in psychiatry. J Clin Psychiatry. 2024. doi:10.1000/abc.def
`;

describe("reconcile auto-confirm", () => {
  it("extracts DOI from CV text", () => {
    const ids = extractCvIdentifiers(CV_WITH_DOI);
    expect(ids.dois).toContain("10.1000/abc.def");
  });

  it("sets reconciled true when CV DOI matches API publication", () => {
    const cvIds = extractCvIdentifiers(CV_WITH_DOI);
    const flags = publicationVaultFlags(
      { doi: "10.1000/ABC.DEF", title: "Novel findings" },
      cvIds,
    );
    expect(flags).toEqual({
      reconciled: true,
      cv_listed: true,
      api_discovered: true,
      confidence: "exact_match",
    });
  });

  it("requires manual review when DOI not on CV", () => {
    const cvIds = extractCvIdentifiers(CV_WITH_DOI);
    const flags = publicationVaultFlags(
      { doi: "10.5555/other", title: "Other paper" },
      cvIds,
    );
    expect(flags.reconciled).toBe(false);
    expect(flags.confidence).toBe("manual_review");
    expect(flags.cv_listed).toBe(true);
  });

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
    const cvIds = extractCvIdentifiers(CV_WITH_DOI);
    const snapshot = {
      npi_verified: false,
      vault_extracts: {
        publications: [{ doi: cvIds.dois[0], title: "Novel findings" }],
        grant_ids: [],
      },
    } as EnrichmentSnapshot;

    const items = applyAutoConfirmToReconciliationItems(
      [
        {
          id: "enrichment-publications",
          source: "PubMed",
          label: "1 publication identifier detected",
          detail: "Confirm authorship.",
          status: "pending",
        },
      ],
      snapshot,
    );

    expect(items[0]?.status).toBe("confirmed");
    expect(items[0]?.confidence).toBe("exact_match");
  });
});
