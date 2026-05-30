import { FISCMAK_TERMS_LAST_UPDATED } from "@/lib/legal/terms-content";
import type { LegalSection } from "@/lib/legal/terms-content";

export const PRIVACY_POLICY_LAST_UPDATED = FISCMAK_TERMS_LAST_UPDATED;

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    id: "intro",
    title: "Overview",
    paragraphs: [
      "FISCMAK, LLC (“FISCMAK”, “we”, “us”) provides career intelligence tools for physicians and trainees. This Privacy Policy explains how we handle information you provide through onboarding, document uploads, activity logging, and Direct Chat with Coach Mak.",
      "By using the Platform, you agree to this Privacy Policy alongside our Terms of Service.",
    ],
  },
  {
    id: "direct-chat",
    title: "Direct Chat confidentiality",
    paragraphs: [
      "Conversations with Coach Mak in the Direct Chat interface are confidential to you. We do not sell, lease, or share granular chat logs or individual message content with your medical school, hospital, residency program, employer, or other third parties.",
      "Chat content is used solely to personalize your career profile, documents, and coaching experience within your account.",
    ],
  },
  {
    id: "institutional",
    title: "Institutional accounts",
    paragraphs: [
      "If your account is tied to an institutional B2B license, your Affiliated Institution may receive structured, aggregated summative reports for milestone tracking — never raw chat histories or granular text strings.",
      "Summative reports may include cohort benchmarks, competency milestones, and validated task metrics aligned with ACGME and AAMC frameworks. These reports may be used in Clinical Competency Committee (CCC) and program review processes.",
    ],
  },
  {
    id: "masking",
    title: "Cohort masking",
    paragraphs: [
      "When a residency track, fellowship program, or rotation cohort contains fewer than five (5) active users, individual metrics are pooled into broader department- or institution-level aggregates so that no single user can be re-identified from institutional dashboards.",
    ],
  },
  {
    id: "ownership",
    title: "Your documents and outputs",
    paragraphs: [
      "You retain ownership of materials you upload. Generated CVs, portfolios, and similar outputs produced by the Platform are assigned to you for download, export, and professional use — independent of your institutional affiliation.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We use industry-standard encryption in transit and at rest, role-based access controls, and session security. FISCMAK is designed for career intelligence — not clinical PHI. Do not enter protected health information in chat or activity logs.",
      "For additional detail, see our Security page.",
    ],
  },
  {
    id: "contact",
    title: "Questions",
    paragraphs: [
      "For privacy questions, use Connect with FISCMAK in the site footer or contact your program administrator for institutional accounts.",
    ],
  },
];
