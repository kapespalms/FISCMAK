/** SOAP section labels and display copy (SOAP keys are internal only). */

export const SUBJECTIVE_NAV_FALLBACK = "Perspective";

export const SOAP_TAB = {
  subjective: {
    nav: SUBJECTIVE_NAV_FALLBACK,
    title: "Perspective",
    description:
      "Career direction, professional satisfaction, task alignment, and work engagement.",
    chatEntry:
      "This section captures how you're doing — career direction, work engagement, and task alignment.",
  },
  objective: {
    nav: "Career Data",
    title: "Career Data",
    description:
      "What's on record — from your CV, uploads, enrichment, and what you've shared with Mak.",
    chatEntry:
      "This section holds your career data — documents, verified facts, activities, and your career map.",
  },
  assessment: {
    nav: "Insights",
    title: "Insights",
    description:
      "Synthesized career patterns from your perspective and career data — conversation coverage and reflection themes.",
    chatEntry:
      "This section synthesizes what Mak has learned into reflection themes and coaching coverage.",
  },
  plan: {
    nav: "Strategy",
    title: "Strategy",
    description: "Development, maintenance, and sustainability goals with quarterly milestones.",
    chatEntry: "This section tracks your strategy — goals and quarterly milestones.",
  },
  output: {
    nav: "Output Studio",
    title: "Output Studio",
    description: "Generated CVs, biosketches, reports, and career briefs.",
    chatEntry:
      "This section generates and manages your career documents from your career data.",
  },
} as const;

/** Top nav: Dr. {Last} when profile name is available. */
export function subjectiveNavLabel(displayName?: string | null): string {
  const name = displayName?.trim();
  return name || SUBJECTIVE_NAV_FALLBACK;
}

/** Page title on the subjective workspace. */
export function subjectivePageTitle(displayName?: string | null): string {
  const name = displayName?.trim();
  if (name) return `${name}'s perspective`;
  return SOAP_TAB.subjective.title;
}

export const SOAP_SECTION_ORDER = [
  "subjective",
  "objective",
  "assessment",
  "plan",
  "output",
] as const;

export type SoapSectionKey = (typeof SOAP_SECTION_ORDER)[number];

export type GoalFrameworkType = "development" | "maintenance" | "sustainability";

export const GOAL_FRAMEWORK_LABELS: Record<
  GoalFrameworkType,
  { label: string; description: string }
> = {
  development: {
    label: "Development Goal",
    description: "Build a new competency or advance toward your stated career objective.",
  },
  maintenance: {
    label: "Maintenance Goal",
    description: "Protect and sustain your current professional strengths.",
  },
  sustainability: {
    label: "Sustainability Goal",
    description:
      "Address professional strain, task alignment, or workload optimization.",
  },
};
