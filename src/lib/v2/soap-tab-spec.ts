/** SOAP section labels and display copy */

export const SOAP_TAB = {
  subjective: {
    nav: "Perspective",
    title: "Perspective",
    description:
      "Self-reported career direction, professional satisfaction, task alignment, and work engagement.",
    chatEntry:
      "This section captures your perspective — career direction, work engagement, and task alignment.",
  },
  objective: {
    nav: "Objective",
    title: "Objective",
    description:
      "Verified career data from uploaded documents and public databases.",
    chatEntry:
      "This section displays verified objective data from your documents and public databases.",
  },
  assessment: {
    nav: "Insights",
    title: "Insights",
    description:
      "Synthesized career patterns from Perspective and Objective — conversation coverage and reflection themes.",
    chatEntry:
      "This section synthesizes your Perspective and Objective data into reflection themes and conversation coverage.",
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
      "This section generates and manages your career documents from Objective data.",
  },
} as const;

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
