/**
 * The 8 FISCMAK Career Domains (Part IV). domain_index 0–7 is the canonical
 * lattice coordinate; name matches PRIMARY_CAREER_TRACKS order exactly.
 *
 * DOMAIN_IDENTITIES — the 8 career identity domains (columns of the 8×8 lattice).
 * Vocabulary: DOMAINS = identities (Clinician…); SKILLS = tasks (Clinical Expertise…).
 * Used by energy-ranking and quarterly-snapshot forms where the full object
 * (name + description) is needed. Index matches DOMAINS array in constants.ts.
 */
export const DOMAIN_IDENTITIES = [
  {
    index: 0,
    name: "Clinician",
    description: "Direct patient care, clinical expertise, medical decision-making",
  },
  {
    index: 1,
    name: "Educator",
    description: "Teaching, mentoring, curriculum development, feedback",
  },
  {
    index: 2,
    name: "Researcher",
    description: "Scholarship, evidence generation, scientific contribution",
  },
  {
    index: 3,
    name: "Administrator / Leader",
    description: "Organizational leadership, strategy, operations, policy",
  },
  {
    index: 4,
    name: "Advocate",
    description: "Systems change, health equity, community health, policy",
  },
  {
    index: 5,
    name: "Innovator",
    description: "Quality improvement, tool building, protocol design, digital health",
  },
  {
    index: 6,
    name: "Quality / Safety",
    description: "Safety review, systems analysis, standardization, outcomes improvement",
  },
  {
    index: 7,
    name: "Wellness Champion",
    description: "Peer support, culture change, wellness programming, professional identity",
  },
] as const;

export type CareerDomainIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
