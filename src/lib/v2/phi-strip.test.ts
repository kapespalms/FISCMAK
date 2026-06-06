/**
 * B1 gate tests — must pass with no LLM in the loop.
 * Run: npx vitest run src/lib/v2/phi-strip.test.ts
 */
import { describe, it, expect } from "vitest";
import { stripPhi } from "@/lib/v2/phi-strip";

describe("stripPhi — B1 gate: deterministic PHI removal without LLM", () => {

  describe("MRN", () => {
    it("strips MRN with colon", () => {
      const { scrubbed, tokensFound } = stripPhi("patient MRN: 1234567");
      expect(scrubbed).toBe("patient [MRN]");
      expect(tokensFound).toContain("mrn");
    });

    it("strips MRN with hash no space", () => {
      const { scrubbed } = stripPhi("pulled chart MRN#9876543");
      expect(scrubbed).toBe("pulled chart [MRN]");
    });

    it("strips medical record number spelled out", () => {
      const { scrubbed } = stripPhi("medical record number 12345678");
      expect(scrubbed).toBe("[MRN]");
    });

    it("strips patient id with colon", () => {
      const { scrubbed } = stripPhi("patient id: 55555");
      expect(scrubbed).toBe("[MRN]");
    });
  });

  describe("SSN", () => {
    it("strips hyphenated SSN", () => {
      const { scrubbed, tokensFound } = stripPhi("SSN 123-45-6789 on file");
      expect(scrubbed).toBe("SSN [SSN] on file");
      expect(tokensFound).toContain("ssn");
    });

    it("strips space-separated SSN", () => {
      const { scrubbed } = stripPhi("social 321 54 9876");
      expect(scrubbed).toBe("social [SSN]");
    });
  });

  describe("phone", () => {
    it("strips phone with parens", () => {
      const { scrubbed, tokensFound } = stripPhi("call me at (216) 555-1234");
      expect(scrubbed).toBe("call me at [PHONE]");
      expect(tokensFound).toContain("phone");
    });

    it("strips dotted phone", () => {
      const { scrubbed } = stripPhi("phone 216.555.1234 after hours");
      expect(scrubbed).toBe("phone [PHONE] after hours");
    });

    it("strips hyphenated phone", () => {
      const { scrubbed } = stripPhi("216-555-4321");
      expect(scrubbed).toBe("[PHONE]");
    });
  });

  describe("email", () => {
    it("strips email address", () => {
      const { scrubbed, tokensFound } = stripPhi("contact jane.doe@hospital.org about this");
      expect(scrubbed).toBe("contact [EMAIL] about this");
      expect(tokensFound).toContain("email");
    });

    it("strips email in a sentence", () => {
      const { scrubbed } = stripPhi("send to resident.smith@uhresidency.edu");
      expect(scrubbed).toBe("send to [EMAIL]");
    });
  });

  describe("DOB", () => {
    it("strips DOB with label", () => {
      const { scrubbed, tokensFound } = stripPhi("DOB: 01/15/1980");
      expect(scrubbed).toBe("[DOB]");
      expect(tokensFound).toContain("dob");
    });

    it("strips date of birth spelled out", () => {
      const { scrubbed } = stripPhi("date of birth 03-22-1975");
      expect(scrubbed).toBe("[DOB]");
    });

    it("strips born with date", () => {
      const { scrubbed } = stripPhi("born 11/04/1990 per chart");
      expect(scrubbed).toBe("[DOB] per chart");
    });

    it("does NOT strip a standalone date with no context word", () => {
      // Bare dates (e.g. today's date) should not be stripped
      const { scrubbed, tokensFound } = stripPhi("appointment on 06/05/2026");
      expect(scrubbed).toBe("appointment on 06/05/2026");
      expect(tokensFound).not.toContain("dob");
    });
  });

  describe("name — Jane-Doe gate test", () => {
    it("strips 'patient Jane Doe'", () => {
      const { scrubbed, tokensFound } = stripPhi("patient Jane Doe had a psychotic break");
      expect(scrubbed).toBe("patient [NAME] had a psychotic break");
      expect(tokensFound).toContain("name");
    });

    it("strips 'pt Jane Doe'", () => {
      const { scrubbed, tokensFound } = stripPhi("pt Jane Doe presented with anxiety");
      expect(scrubbed).toBe("patient [NAME] presented with anxiety");
      expect(tokensFound).toContain("name");
    });

    it("strips 'pt. Jane Doe'", () => {
      const { scrubbed } = stripPhi("pt. Jane Doe came in for follow-up");
      expect(scrubbed).toBe("patient [NAME] came in for follow-up");
    });

    it("strips honorific name — Mr. John Smith", () => {
      const { scrubbed, tokensFound } = stripPhi("spoke with Mr. John Smith today");
      expect(scrubbed).toBe("spoke with [NAME] today");
      expect(tokensFound).toContain("name");
    });

    it("strips Dr. honorific", () => {
      const { scrubbed } = stripPhi("referred by Dr. Maria Chen");
      expect(scrubbed).toBe("referred by [NAME]");
    });

    it("does NOT strip single-word capitalized terms (e.g. specialty names)", () => {
      // "patient Care" should not strip since only one cap word follows
      const { scrubbed } = stripPhi("focus on patient care outcomes");
      expect(scrubbed).toBe("focus on patient care outcomes");
    });
  });

  describe("clean text — must pass through unchanged", () => {
    it("passes career capture text unchanged", () => {
      const text = "Completed a difficult psychiatric evaluation in the ED today";
      const { scrubbed, tokensFound } = stripPhi(text);
      expect(scrubbed).toBe(text);
      expect(tokensFound).toHaveLength(0);
    });

    it("passes invisible work text unchanged", () => {
      const text = "did a ton of prior auths and inbox messages after hours — exhausting";
      const { scrubbed, tokensFound } = stripPhi(text);
      expect(scrubbed).toBe(text);
      expect(tokensFound).toHaveLength(0);
    });

    it("passes publication capture unchanged", () => {
      const text = "published in JAMA psychiatry — systematic review on clozapine monitoring";
      const { scrubbed, tokensFound } = stripPhi(text);
      expect(scrubbed).toBe(text);
      expect(tokensFound).toHaveLength(0);
    });

    it("passes empty string", () => {
      const { scrubbed, tokensFound } = stripPhi("");
      expect(scrubbed).toBe("");
      expect(tokensFound).toHaveLength(0);
    });
  });

  describe("multi-token — combined PHI", () => {
    it("strips multiple PHI types in one call", () => {
      const input = "patient Jane Doe MRN: 1234567 DOB: 05/10/1985 call 216-555-9999";
      const { scrubbed, tokensFound } = stripPhi(input);
      expect(scrubbed).not.toContain("Jane");
      expect(scrubbed).not.toContain("1234567");
      expect(scrubbed).not.toContain("1985");
      expect(scrubbed).not.toContain("9999");
      expect(tokensFound).toContain("name");
      expect(tokensFound).toContain("mrn");
      expect(tokensFound).toContain("dob");
      expect(tokensFound).toContain("phone");
    });

    it("strips MRN + email in one call", () => {
      const { scrubbed, tokensFound } = stripPhi(
        "patient id: 11111 email john@example.com"
      );
      expect(scrubbed).not.toContain("11111");
      expect(scrubbed).not.toContain("john@example.com");
      expect(tokensFound).toContain("mrn");
      expect(tokensFound).toContain("email");
    });
  });
});
