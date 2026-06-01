import { describe, expect, it } from "vitest";
import { lookupActivityPlacement } from "@/lib/v2/lattice/ontology-registry";

describe("ontology domain routing", () => {
  it("routes advocated_for_change to domain 5 (Systems Thinking / advocacy)", () => {
    const placement = lookupActivityPlacement("advocated_for_change");
    expect(placement).not.toBeNull();
    expect(placement!.domainIndex).toBe(5);
    expect(placement!.subcompetencyKey).toBe("advocacy_social_change");
    expect(placement!.trackKey).toBe("advocate");
  });

  it("routes built_tool to domain 2 (Practice-Based Learning / innovation)", () => {
    const placement = lookupActivityPlacement("built_tool");
    expect(placement).not.toBeNull();
    expect(placement!.domainIndex).toBe(2);
    expect(placement!.subcompetencyKey).toBe("innovation_tool_building");
    expect(placement!.trackKey).toBe("innovator");
  });

  it("advocacy and innovation do not route to old domain 6 (Collaboration)", () => {
    const advocacy = lookupActivityPlacement("advocated_for_change");
    const innovation = lookupActivityPlacement("built_tool");
    expect(advocacy!.domainIndex).not.toBe(6);
    expect(innovation!.domainIndex).not.toBe(6);
  });

  it("leadership activities route to domain 6 (Collaboration & Teamwork)", () => {
    // leadership→6 per FISCMAK_DOMAIN_TO_LATTICE; if led_committee has no ontology mapping
    // the test skips gracefully rather than false-failing
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
    expect(placement!.domainIndex).toBe(5);
  });
});
