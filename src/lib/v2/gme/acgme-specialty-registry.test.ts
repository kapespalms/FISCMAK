import { describe, expect, it } from "vitest";
import {
  auditAcgmeOnboardingCoverage,
  isAcgmePrimarySpecialty,
  isAcgmeSubspecialtyForPrimary,
  listAcgmePrimarySpecialtyNames,
  normalizeToAcgmePrimaryName,
} from "@/lib/v2/gme/acgme-specialty-registry";
import {
  resolveTraineeEvaluationFramework,
  validateTraineeSpecialtySelection,
} from "@/lib/v2/gme/trainee-evaluation-framework";

describe("ACGME specialty registry", () => {
  it("includes all Appendix B primaries in onboarding", () => {
    const audit = auditAcgmeOnboardingCoverage();
    expect(audit.primary_count).toBeGreaterThanOrEqual(35);
    expect(audit.rows.every((r) => r.in_onboarding)).toBe(true);
    expect(listAcgmePrimarySpecialtyNames().length).toBe(audit.primary_count);
  });

  it("normalizes legacy specialty labels", () => {
    expect(normalizeToAcgmePrimaryName("Emergency Medicine")).toBe("Emergency medicine");
    expect(normalizeToAcgmePrimaryName("Psychiatry")).toBe("Psychiatry");
  });

  it("maps psychiatry subspecialties to psychiatry", () => {
    expect(isAcgmeSubspecialtyForPrimary("Psychiatry", "Addiction psychiatry")).toBe(true);
    expect(isAcgmeSubspecialtyForPrimary("Psychiatry", "Addiction Medicine")).toBe(true);
    expect(isAcgmeSubspecialtyForPrimary("Psychiatry", "Consultation-Liaison Psychiatry")).toBe(
      true,
    );
    expect(isAcgmePrimarySpecialty("Psychiatry")).toBe(true);
  });
});

describe("trainee evaluation framework", () => {
  it("returns universal six + psychiatry milestones for psych resident", () => {
    const fw = resolveTraineeEvaluationFramework({
      career_stage: "Resident",
      base_specialty: "Psychiatry",
    });
    expect(fw).not.toBeNull();
    expect(fw?.universal_competencies).toHaveLength(6);
    expect(fw?.milestone_status).toBe("seeded");
    expect(fw?.subcompetencies.length).toBe(21);
  });

  it("requires fellowship subspecialty for fellows", () => {
    const validation = validateTraineeSpecialtySelection({
      career_stage: "Fellow",
      base_specialty: "Internal medicine",
      subspecialty: null,
    });
    expect(validation.valid).toBe(false);
  });

  it("accepts cross-primary multidisciplinary fellowships", () => {
    const validation = validateTraineeSpecialtySelection({
      career_stage: "Fellow",
      base_specialty: "Anesthesiology",
      subspecialty: "Sleep medicine (multidisciplinary)",
    });
    expect(validation.valid).toBe(true);
  });

  it("rejects subspecialty for residents", () => {
    const validation = validateTraineeSpecialtySelection({
      career_stage: "Resident",
      base_specialty: "Internal medicine",
      subspecialty: "Cardiovascular disease",
    });
    expect(validation.valid).toBe(false);
  });
});
