import { describe, expect, it } from "vitest";
import { lookupActivityPlacement } from "@/lib/v2/lattice/ontology-registry";

describe("ontology domain routing", () => {
  it("routes advocated_for_change to domain 3 (advocacy), not 6 (leadership)", () => {
    const placement = lookupActivityPlacement("advocated_for_change");
    expect(placement).not.toBeNull();
    expect(placement!.domainIndex).toBe(3);
    expect(placement!.subcompetencyKey).toBe("advocacy_social_change");
    expect(placement!.trackKey).toBe("advocate");
  });

  it("routes built_tool to domain 3 (innovation), not 6 (admin)", () => {
    const placement = lookupActivityPlacement("built_tool");
    expect(placement).not.toBeNull();
    expect(placement!.domainIndex).toBe(3);
    expect(placement!.subcompetencyKey).toBe("innovation_tool_building");
    expect(placement!.trackKey).toBe("innovator");
  });

  it("does not route advocacy or innovation activities to domain 6", () => {
    const advocacy = lookupActivityPlacement("advocated_for_change");
    const innovation = lookupActivityPlacement("built_tool");
    expect(advocacy!.domainIndex).not.toBe(6);
    expect(innovation!.domainIndex).not.toBe(6);
  });

  it("still routes leadership activities correctly to domain 6", () => {
    // Regression: leadership domain should not have been affected
    const leadership = lookupActivityPlacement("led_committee");
    if (leadership) {
      expect(leadership.domainIndex).toBe(6);
    }
  });

  it("returns null for unknown activity keys", () => {
    expect(lookupActivityPlacement("nonexistent_activity_xyz")).toBeNull();
    expect(lookupActivityPlacement(null)).toBeNull();
    expect(lookupActivityPlacement(undefined)).toBeNull();
  });

  it("respects track override when supplied", () => {
    const placement = lookupActivityPlacement("advocated_for_change", "researcher");
    expect(placement).not.toBeNull();
    expect(placement!.trackKey).toBe("researcher");
    expect(placement!.domainIndex).toBe(3);
  });
});
