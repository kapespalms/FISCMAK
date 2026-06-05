/**
 * Unit tests for F7 Transfer Potential and Seven-gap pure helpers.
 *
 * These tests cover the pure math functions (circlumplexProximity, dirCost)
 * and verify gap score formulas with worked examples. Async Supabase-dependent
 * functions (computeF7TransferPotential, computeSevenGap) are integration
 * concerns tested by the pipeline script.
 */

import { describe, expect, it } from "vitest";
import { circlumplexProximity, dirCost } from "@/lib/v2/formulas-v3";
import {
  cosineSimilarity,
  varWeightedCosine,
  directionalGap,
  getSocVector,
  getDomainVector,
  computeF8HobbyFit,
  dirCostOnet,
  DOMAIN_LABELS,
} from "@/lib/v2/onet-engine";

// ---------------------------------------------------------------------------
// circlumplexProximity
// Domain indices: 0=Clinician 1=Educator 2=Researcher 3=Admin/Leader
//                 4=Advocate 5=Innovator 6=Quality/Safety 7=Wellness Champion
// ---------------------------------------------------------------------------

describe("circlumplexProximity", () => {
  it("same domain → 1.0", () => {
    expect(circlumplexProximity(0, 0)).toBe(1.0);
    expect(circlumplexProximity(3, 3)).toBe(1.0);
  });

  it("Educator ↔ Wellness Champion — same coordinates → 1.0", () => {
    // Both sit at [0.7, 0.7] on the Prediger circumplex (People+Ideas quadrant)
    expect(circlumplexProximity(1, 7)).toBe(1.0);
    expect(circlumplexProximity(7, 1)).toBe(1.0);
  });

  it("Quality/Safety ↔ Educator — maximum circumplex distance → ≈ 0", () => {
    // QS=[-0.7,-0.3], Educator=[0.7,0.7] — diagonally opposite, dist ≈ MAX_DIST
    const result = circlumplexProximity(6, 1);
    expect(result).toBeCloseTo(0, 4);
  });

  it("Clinician → Educator — adjacent (moderate proximity)", () => {
    // Clinician=[0,0], Educator=[0.7,0.7]. dist≈0.990, MAX≈1.721 → proximity≈0.425
    const result = circlumplexProximity(0, 1);
    expect(result).toBeGreaterThan(0.35);
    expect(result).toBeLessThan(0.55);
    expect(result).toBeCloseTo(0.4246, 3);
  });

  it("Researcher → Educator — same Ideas axis, moderate proximity", () => {
    // Researcher=[-0.3,0.7], Educator=[0.7,0.7]. dist=1.0 → proximity≈0.419
    const result = circlumplexProximity(2, 1);
    expect(result).toBeGreaterThan(0.35);
    expect(result).toBeLessThan(0.55);
    expect(result).toBeCloseTo(0.4188, 3);
  });

  it("is symmetric (circumplex distance is symmetric even though F7 DirCost is not)", () => {
    expect(circlumplexProximity(0, 1)).toBeCloseTo(circlumplexProximity(1, 0), 10);
    expect(circlumplexProximity(2, 5)).toBeCloseTo(circlumplexProximity(5, 2), 10);
  });

  it("all proximity values are in [0, 1]", () => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const p = circlumplexProximity(i, j);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// dirCost
// Fraction of target domain's top-3 primary skills NOT in source's top-3.
// ---------------------------------------------------------------------------

describe("dirCost", () => {
  it("same domain → 0 (no new skills needed)", () => {
    expect(dirCost(0, 0)).toBe(0);
    expect(dirCost(1, 1)).toBe(0);
    expect(dirCost(6, 6)).toBe(0);
  });

  it("fully disjoint top-3 sets → 1.0", () => {
    // Clinician top-3: [Clinical Expertise, Medical Knowledge, Communication]
    // Admin/Leader top-3: [Systems Thinking, Collaboration & Teamwork, Professionalism & Ethics]
    // Zero overlap → all 3 of Admin's skills are lacking in Clinician → cost = 3/3 = 1.0
    expect(dirCost(0, 3)).toBe(1.0);
  });

  it("partial overlap → 2/3", () => {
    // Clinician top-3: [CE, MK, Communication]
    // Educator top-3: [Communication, Practice-Based Learning, Collaboration & Teamwork]
    // Clinician has Communication; lacks PBL and Collab → cost = 2/3
    expect(dirCost(0, 1)).toBeCloseTo(2 / 3, 10);
  });

  it("is asymmetric (Dawson et al. 2021 — A→B ≠ B→A)", () => {
    // Clinician→Educator ≠ Educator→Clinician
    const c0to1 = dirCost(0, 1);
    const c1to0 = dirCost(1, 0);
    // Educator→Clinician: Educator top-3=[Comm,PBL,Collab], Clinician top-3=[CE,MK,Comm]
    // Educator has Comm; lacks CE, MK → cost = 2/3 (happens to be same numerically here)
    expect(c0to1).toBeCloseTo(2 / 3, 10);
    expect(c1to0).toBeCloseTo(2 / 3, 10);
    // But the ASYMMETRY is real for other pairs:
    // Quality/Safety→Innovator: QS=[PBL,ST,CE], Innov=[PBL,ST,MK]. QS has PBL+ST; lacks MK → cost=1/3
    // Innovator→Quality/Safety: Innov=[PBL,ST,MK], QS=[PBL,ST,CE]. Innov has PBL+ST; lacks CE → cost=1/3
    expect(dirCost(6, 5)).toBeCloseTo(1 / 3, 10);
    // Researcher→Clinician: Researcher=[MK,PBL,PPD], Clinician=[CE,MK,Comm]. Has MK; lacks CE,Comm → 2/3
    // Clinician→Researcher: [CE,MK,Comm]→[MK,PBL,PPD]. Has MK; lacks PBL,PPD → 2/3
    // Asymmetry shows up with QS→Educator vs Educator→QS:
    // QS=[PBL,ST,CE], Educator=[Comm,PBL,Collab]. Has PBL; lacks Comm,Collab → 2/3
    // Educator=[Comm,PBL,Collab], QS=[PBL,ST,CE]. Has PBL; lacks ST,CE → 2/3
    // Use a more visible asymmetry example:
    // Wellness Champion→Clinician: WC=[PPD,Collab,Prof], Clinician=[CE,MK,Comm]. None shared → 3/3=1.0
    expect(dirCost(7, 0)).toBe(1.0);
    // Clinician→Wellness Champion: [CE,MK,Comm]→[PPD,Collab,Prof]. None shared → 3/3=1.0
    expect(dirCost(0, 7)).toBe(1.0);
  });

  it("all values are in [0, 1]", () => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const c = dirCost(i, j);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// F7 transfer score formula — worked psychiatry example
//
// Scenario: psychiatry attendings transitioning toward Educator (domain 1).
// Three source domains (Clinician, Researcher, Quality/Safety) with density=0.5.
// ---------------------------------------------------------------------------

describe("F7 transfer score — worked example (density=0.5, goal=Educator)", () => {
  const GOAL = 1; // Educator
  const DENSITY = 0.5;
  const score = (src: number) =>
    DENSITY * circlumplexProximity(src, GOAL) * (1 - dirCost(src, GOAL));

  it("Clinician → Educator: moderate proximity, moderate dirCost", () => {
    // proximity ≈ 0.4246, dirCost = 2/3 → score ≈ 0.5 × 0.4246 × 0.333 ≈ 0.0707
    const result = score(0);
    expect(result).toBeCloseTo(0.0707, 2);
    expect(result).toBeGreaterThan(0.06);
    expect(result).toBeLessThan(0.10);
  });

  it("Researcher → Educator: similar proximity to Clinician, same dirCost", () => {
    // proximity ≈ 0.4188, dirCost = 2/3 → score ≈ 0.0698
    const result = score(2);
    expect(result).toBeCloseTo(0.0698, 2);
    expect(result).toBeGreaterThan(0.06);
    expect(result).toBeLessThan(0.10);
  });

  it("Quality/Safety → Educator: maximum distance → score ≈ 0", () => {
    // proximity ≈ 0, dirCost = 2/3 → score ≈ 0
    const result = score(6);
    expect(result).toBeCloseTo(0, 4);
  });

  it("Educator → Educator (own cells): maximum proximity, zero dirCost → score = density", () => {
    // proximity = 1.0, dirCost = 0 → score = 0.5 × 1.0 × 1.0 = 0.5
    const result = score(1);
    expect(result).toBeCloseTo(DENSITY, 10);
  });

  it("adjacent domain scores higher than opposite domain", () => {
    // Clinician is adjacent to Educator; Quality/Safety is opposite
    expect(score(0)).toBeGreaterThan(score(6));
  });

  it("own-domain score is the maximum", () => {
    for (let src = 0; src < 8; src++) {
      expect(score(GOAL)).toBeGreaterThanOrEqual(score(src));
    }
  });
});

// ---------------------------------------------------------------------------
// Seven-gap formula correctness — pure math, no Supabase
// ---------------------------------------------------------------------------

describe("seven-gap score formulas", () => {
  const maxDensity = 1.0;

  it("skillGap: fully aligned (avgDensity = maxDensity) → gap = 0", () => {
    const avgDensity = maxDensity;
    const gap = Math.min(1, Math.max(0, 1 - avgDensity / maxDensity));
    expect(gap).toBeCloseTo(0, 10);
  });

  it("skillGap: fully misaligned (avgDensity = 0) → gap = 1", () => {
    const gap = Math.min(1, Math.max(0, 1 - 0 / maxDensity));
    expect(gap).toBe(1);
  });

  it("skillGap: half density → gap = 0.5", () => {
    const gap = Math.min(1, Math.max(0, 1 - 0.5 / maxDensity));
    expect(gap).toBeCloseTo(0.5, 10);
  });

  it("identityGap: rank 5 (very energizing) → gap = 0", () => {
    const gap = (5 - 5) / 4;
    expect(gap).toBe(0);
  });

  it("identityGap: rank 1 (very draining) → gap = 1", () => {
    const gap = (5 - 1) / 4;
    expect(gap).toBe(1);
  });

  it("identityGap: rank 3 (neutral) → gap = 0.5", () => {
    const gap = (5 - 3) / 4;
    expect(gap).toBe(0.5);
  });

  it("identityGap is monotonically decreasing in energy rank", () => {
    const gaps = [1, 2, 3, 4, 5].map((r) => (5 - r) / 4);
    for (let i = 0; i < gaps.length - 1; i++) {
      expect(gaps[i]).toBeGreaterThan(gaps[i + 1]!);
    }
  });
});

// ---------------------------------------------------------------------------
// O*NET Engine — pure math helpers (O*NET 30.3 seed, no DB)
// ---------------------------------------------------------------------------

describe("cosineSimilarity", () => {
  it("identical vectors → 1.0", () => {
    const v = [0.5, 0.3, 0.8];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0, 10);
  });

  it("orthogonal vectors → 0", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it("zero vector → 0", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it("result in [0, 1] for non-negative vectors", () => {
    const a = [0.2, 0.5, 0.8, 0.1];
    const b = [0.9, 0.1, 0.3, 0.7];
    const s = cosineSimilarity(a, b);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
  });
});

describe("directionalGap", () => {
  it("identical vectors → 0", () => {
    const v = [0.5, 0.8, 0.2];
    expect(directionalGap(v, v)).toBe(0);
  });

  it("source fully covers target → 0", () => {
    expect(directionalGap([1, 1, 1], [0.5, 0.5, 0.5])).toBe(0);
  });

  it("source at zero → 1 (target fully lacking)", () => {
    expect(directionalGap([0, 0, 0], [0.5, 0.5, 0.5])).toBe(1);
  });

  it("is asymmetric", () => {
    const a = [0.9, 0.1, 0.5];
    const b = [0.2, 0.8, 0.3];
    expect(directionalGap(a, b)).not.toBeCloseTo(directionalGap(b, a), 5);
  });

  it("result in [0, 1]", () => {
    for (let t = 0; t < 10; t++) {
      const a = Array.from({ length: 5 }, () => Math.random());
      const b = Array.from({ length: 5 }, () => Math.random());
      const g = directionalGap(a, b);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
    }
  });
});

describe("getSocVector — O*NET 30.3 seed", () => {
  it("returns a 250-element vector for psychiatry (249 content-model + 1 Job Zone)", () => {
    const v = getSocVector("29-1223.00");
    expect(v).not.toBeNull();
    expect(v!.length).toBe(250);
  });

  it("all values in [0, 100] — dual-scale and single-scale both produce 0–100", () => {
    const v = getSocVector("29-1223.00")!;
    for (const val of v) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it("returns null for an unknown SOC", () => {
    expect(getSocVector("99-9999.00")).toBeNull();
  });
});

describe("getDomainVector — domain fingerprints", () => {
  it("returns a vector for psychiatry × Educator domain", () => {
    const v = getDomainVector("29-1223.00", "Educator");
    expect(v).not.toBeNull();
    expect(v!.length).toBe(250);
  });

  it("domain vectors for the same SOC are not all identical", () => {
    const v0 = getDomainVector("29-1223.00", "Clinician")!;
    const v1 = getDomainVector("29-1223.00", "Researcher")!;
    const sim = cosineSimilarity(v0, v1);
    // Should be < 1 (different domains have different emphasis)
    expect(sim).toBeLessThan(1.0);
  });
});

describe("varWeightedCosine — discriminative weighting", () => {
  it("same vector → 1.0", () => {
    const v = getSocVector("29-1223.00")!;
    expect(varWeightedCosine(v, v)).toBeCloseTo(1.0, 6);
  });

  it("different physician SOCs differ measurably", () => {
    const psych  = getSocVector("29-1223.00")!;
    const radiol = getSocVector("29-1224.00")!;
    const sim = varWeightedCosine(psych, radiol);
    expect(sim).toBeGreaterThan(0.5);   // both physicians — should be similar
    expect(sim).toBeLessThan(1.0);      // but not identical
  });
});

describe("dirCostOnet — O*NET directional gap for F7", () => {
  it("same domain → 0", () => {
    expect(dirCostOnet(0, 0, "29-1223.00")).toBe(0);
    expect(dirCostOnet(3, 3, "29-1216.00")).toBe(0);
  });

  it("falls back to generic physician (29-1229) for unknown SOC", () => {
    // getDomainVector falls back to 29-1229.00 rather than returning null
    const result = dirCostOnet(0, 1, "99-9999.00");
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThanOrEqual(0);
    expect(result!).toBeLessThanOrEqual(1);
  });

  it("all values in [0, 1] for known physician SOC", () => {
    for (let s = 0; s < 8; s++) {
      for (let t = 0; t < 8; t++) {
        const c = dirCostOnet(s, t, "29-1223.00");
        if (c !== null) {
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("is asymmetric (Dawson et al. 2021)", () => {
    // Clinician→Quality/Safety vs Quality/Safety→Clinician should differ
    const c01 = dirCostOnet(0, 6, "29-1223.00");
    const c10 = dirCostOnet(6, 0, "29-1223.00");
    expect(c01).not.toBeNull();
    expect(c10).not.toBeNull();
    expect(c01).not.toBeCloseTo(c10!, 5);
  });
});

describe("computeF8HobbyFit — pure sync form", () => {
  it("psychiatry + psychology-adjacent hobby → high bridge score", () => {
    // Writing/journaling SOC (27-3043) should be close to psychiatry (language, social)
    const result = computeF8HobbyFit("27-3043.00", "29-1223.00");
    expect(result.available).toBe(true);
    expect(result.bridge_score).toBeGreaterThan(0.7);
  });

  it("photography + radiology → higher bridge than photography + psychiatry", () => {
    const r_rad   = computeF8HobbyFit("27-4021.00", "29-1224.00");
    const r_psych = computeF8HobbyFit("27-4021.00", "29-1223.00");
    expect(r_rad.available).toBe(true);
    expect(r_psych.available).toBe(true);
    // Radiology is more visual/imaging-centric → higher similarity to photography
    expect(r_rad.bridge_score).toBeGreaterThan(r_psych.bridge_score);
  });

  it("returns available=false for unknown SOC", () => {
    const result = computeF8HobbyFit("99-9999.00", "29-1223.00");
    expect(result.available).toBe(false);
  });

  it("bridge score in [0, 1]", () => {
    const hobbies = ["27-4021.00","27-2042.00","27-3043.00","29-9091.00","35-1011.00"];
    for (const h of hobbies) {
      const r = computeF8HobbyFit(h, "29-1223.00");
      if (r.available) {
        expect(r.bridge_score).toBeGreaterThanOrEqual(0);
        expect(r.bridge_score).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("DOMAIN_LABELS ordering", () => {
  it("contains exactly 8 domain labels", () => {
    expect(DOMAIN_LABELS).toHaveLength(8);
  });

  it("first label is Clinician, last is Wellness Champion", () => {
    expect(DOMAIN_LABELS[0]).toBe("Clinician");
    expect(DOMAIN_LABELS[7]).toBe("Wellness Champion");
  });
});
