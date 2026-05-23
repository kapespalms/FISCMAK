/** Professional SOAPO tab labels and display copy (spec Part 2–3) */

export const SOAP_TAB = {
  subjective: {
    nav: "Career Perspective",
    title: "Career Perspective",
    description:
      "Self-reported career direction, professional satisfaction, task alignment, and work engagement.",
    chatEntry:
      "This section captures your professional perspective — career direction, work engagement, and task alignment.",
  },
  objective: {
    nav: "Career Data",
    title: "Career Data",
    description:
      "Verified career data from uploaded documents and public databases.",
    chatEntry:
      "This section displays verified career data from your uploaded documents and public databases.",
  },
  assessment: {
    nav: "Career Profile",
    title: "Career Profile",
    description:
      "Synthesized Career Health Score, Career Map, and benchmarked standing.",
    chatEntry:
      "This section synthesizes your Career Perspective and Career Data into a comprehensive Career Profile.",
  },
  plan: {
    nav: "Career Strategy",
    title: "Career Strategy",
    description: "Development, maintenance, and sustainability goals with quarterly milestones.",
    chatEntry:
      "This section tracks your career goals and quarterly milestones.",
  },
  output: {
    nav: "Career Documents",
    title: "Career Documents",
    description: "Generated CVs, biosketches, reports, and career briefs.",
    chatEntry:
      "This section generates and manages your career documents from Career Data.",
  },
} as const;

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
