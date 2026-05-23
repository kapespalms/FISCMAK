/** Spec table inventory (Tables 1–46) — reference metadata for implementation tracking */

export type SpecTableRow = {
  id: number;
  name: string;
  turnDefined: string;
  purpose: string;
  setting: string;
};

export const SPEC_TABLE_INVENTORY: SpecTableRow[] = [
  { id: 1, name: "Physician Identity Record", turnDefined: "Turn 18 (Layer 1)", purpose: "Core profile fields, sources, update cadence, privacy level", setting: "All" },
  { id: 2, name: "Structured Career Data Store", turnDefined: "Turn 18 (Layer 2)", purpose: "All career data categories, fields, sources, data types", setting: "All" },
  { id: 3, name: "API Enrichment Cache", turnDefined: "Turn 18 (Layer 3)", purpose: "External API sources, data cached, refresh cadence", setting: "All" },
  { id: 4, name: "Longitudinal Analytics Engine", turnDefined: "Turn 18 (Layer 4)", purpose: "Computed metrics, computation triggers, historical depth", setting: "All" },
  { id: 5, name: "Document Types by Setting", turnDefined: "Turn 18 (Part 2)", purpose: "CV, biosketch, portfolio components per setting", setting: "All" },
  { id: 6, name: "Template Tiers", turnDefined: "Turn 18 (Part 2)", purpose: "Platform standard, institutional custom, freeform", setting: "All" },
  { id: 7, name: "Standard Template Sources", turnDefined: "Turn 18 (Part 3)", purpose: "Template source and key sections per document type", setting: "All" },
  { id: 8, name: "Institutional Variation Handling", turnDefined: "Turn 18 (Part 3)", purpose: "Formatting differences across institutions", setting: "Academic" },
  { id: 9, name: "Lexical Integration Architecture", turnDefined: "Turn 18 (Part 4)", purpose: "Document canvas, structured data nodes, AI suggestion plugin", setting: "All" },
  { id: 10, name: "Document Generation Matrix", turnDefined: "Turn 19 (Part 5)", purpose: "Documents generated at each cadence, by setting", setting: "All" },
  { id: 11, name: "Privacy and Access Control", turnDefined: "Turn 19 (Part 6B)", purpose: "Data types, access levels, encryption, sharing", setting: "All" },
  { id: 12, name: "Notification and Trigger System", turnDefined: "Turn 19 (Part 6D)", purpose: "Trigger events, notifications, actions", setting: "All" },
  { id: 13, name: "Custom Lexical Node Types", turnDefined: "Turn 19 (Part 7)", purpose: "PublicationNode, GrantNode, etc.", setting: "All" },
  { id: 14, name: "Export Formats", turnDefined: "Turn 19 (Part 8)", purpose: ".docx, .pdf, .html, SciENcv XML, plain text", setting: "All" },
  { id: 15, name: "Profile Configuration Fields", turnDefined: "Turn 15 (Step 1)", purpose: "Specialty, career level, practice setting, rank, track", setting: "All" },
  { id: 16, name: "Document Upload Requirements by Level", turnDefined: "Turn 15 (Step 2)", purpose: "Required/optional documents per career level", setting: "All" },
  { id: 17, name: "API Enrichment by Setting", turnDefined: "Turn 15 (Step 2)", purpose: "Which APIs activate per setting", setting: "All" },
  { id: 18, name: "Questionnaire Battery by Level", turnDefined: "Turn 15 (Step 4)", purpose: "PFI, BITS, Career Aspirations, PIF, UWES-9", setting: "All" },
  { id: 19, name: "Academic Medicine Formulas", turnDefined: "Turn 15", purpose: "h-index, RCR, PFI, BITS, IWQ, CDI", setting: "Academic" },
  { id: 20, name: "Community Medicine Formulas", turnDefined: "Turn 15", purpose: "wRVU, scope-of-practice, quality composites, CDI", setting: "Community" },
  { id: 21, name: "Industry Formulas", turnDefined: "Turn 15", purpose: "Therapeutic area depth, advisory boards, Open Payments, CDI", setting: "Industry" },
  { id: 22, name: "CDI Weights by Specialty × Setting × Track", turnDefined: "Turn 16", purpose: "Component weights for Career Health Score", setting: "All" },
  { id: 23, name: "User-Facing Language Translation", turnDefined: "Turn 16", purpose: "Backend metric → user-facing label", setting: "All" },
  { id: 24, name: "Skill Translation Matrix", turnDefined: "Turn 17 (Part 1)", purpose: "Transferable vs. gap competencies between tracks", setting: "All" },
  { id: 25, name: "3-Goal Framework", turnDefined: "Turn 17 (Part 2)", purpose: "Development, Maintenance, Sustainability structure", setting: "All" },
  { id: 26, name: "Job Search Integration", turnDefined: "Turn 17 (Part 3)", purpose: "Aggregated sources, matching algorithm, fit scoring", setting: "All" },
  { id: 27, name: "Engagement Features", turnDefined: "Turn 20 (Part 1A)", purpose: "Streak tracking, milestones, benchmarking", setting: "All" },
  { id: 28, name: "Institutional Partnership Layer", turnDefined: "Turn 20 (Part 1B)", purpose: "Individual vs. institutional mode features", setting: "All" },
  { id: 29, name: "Data Portability", turnDefined: "Turn 20 (Part 1C)", purpose: "Export, ORCID sync, SciENcv, deletion", setting: "All" },
  { id: 30, name: "Accessibility", turnDefined: "Turn 20 (Part 1D)", purpose: "Mobile, language, WCAG, name/pronoun", setting: "All" },
  { id: 31, name: "SOAPO Tab Definitions", turnDefined: "Turn 20 (Part 2)", purpose: "Tab name, career meaning, contents, AI role", setting: "All" },
  { id: 32, name: "Dashboard Adaptations by Setting × Level", turnDefined: "Turn 20 (Part 3)", purpose: "Band emphasis per combination", setting: "All" },
  { id: 33, name: "AI Chatbot State Machine", turnDefined: "Turn 20 (Part 4)", purpose: "States, entry conditions, escalation triggers", setting: "All" },
  { id: 34, name: "Onboarding Step-by-Step", turnDefined: "Turn 21 (Part 1)", purpose: "7-step guided onboarding", setting: "All" },
  { id: 35, name: "Profile Configuration Screens", turnDefined: "Turn 21 (Step 2)", purpose: "5 sequential screens with adaptive logic", setting: "All" },
  { id: 36, name: "Subjective Tab Display Elements", turnDefined: "Turn 21 (Part 3)", purpose: "9 display elements with cadence", setting: "All" },
  { id: 37, name: "Objective Tab Display Elements", turnDefined: "Turn 21 (Part 3)", purpose: "9 display elements with cadence", setting: "All" },
  { id: 38, name: "Assessment Tab Display Elements", turnDefined: "Turn 21 (Part 3)", purpose: "8 display elements with cadence", setting: "All" },
  { id: 39, name: "Plan Tab Display Elements", turnDefined: "Turn 21 (Part 3)", purpose: "7 display elements with cadence", setting: "All" },
  { id: 40, name: "Output Tab Display Elements", turnDefined: "Turn 21 (Part 3)", purpose: "6 display elements with cadence", setting: "All" },
  { id: 41, name: "Invisible Work Categories", turnDefined: "This turn (Part 2)", purpose: "6 categories with BITS classification", setting: "All" },
  { id: 42, name: "Invisible Work by Career Level", turnDefined: "This turn (Part 2)", purpose: "Dominant categories and goal connection by level", setting: "All" },
  { id: 43, name: "Invisible Work → Goal Decision Logic", turnDefined: "This turn (Part 2)", purpose: "Finding thresholds and chatbot responses", setting: "All" },
  { id: 44, name: "Goal Adaptation by Setting × Level × Role", turnDefined: "This turn (Part 3)", purpose: "Goal examples for each combination", setting: "All" },
  { id: 45, name: "Implementation Checklist", turnDefined: "Turn 20 (Part 5)", purpose: "All components with status", setting: "All" },
  { id: 46, name: "Remaining Items for Production", turnDefined: "Turn 20 (Part 5)", purpose: "Analytics, billing, community, CME, IRB", setting: "All" },
];

export type MakConversationRow = {
  id: string;
  tab: string;
  trigger: string;
  name: string;
  items: string;
  minutes: number;
};

export const MAK_CONVERSATION_INVENTORY: MakConversationRow[] = [
  { id: "S-1", tab: "Subjective", trigger: "First visit", name: "Onboarding Entry", items: "Welcome + orientation", minutes: 1 },
  { id: "S-2", tab: "Subjective", trigger: "Onboarding", name: "Professional Fulfillment (PFI)", items: "6 items", minutes: 2 },
  { id: "S-3", tab: "Subjective", trigger: "Onboarding", name: "Work-Related Strain (PFI)", items: "10 items", minutes: 3 },
  { id: "S-4", tab: "Subjective", trigger: "Onboarding", name: "Task Alignment (BITS)", items: "8 items", minutes: 2 },
  { id: "S-5", tab: "Subjective", trigger: "Onboarding + quarterly", name: "Invisible Work Log", items: "6 categories + hours", minutes: 3 },
  { id: "S-6", tab: "Subjective", trigger: "Onboarding + annual", name: "Career Direction", items: "10 items", minutes: 3 },
  { id: "S-7", tab: "Subjective", trigger: "Onboarding + annual", name: "Work Engagement (UWES-9)", items: "9 items", minutes: 2 },
  { id: "S-8", tab: "Subjective", trigger: "Quarterly return", name: "Quarterly Pulse", items: "10 items", minutes: 5 },
  { id: "O-1", tab: "Objective", trigger: "First visit", name: "Onboarding Data Review", items: "Parsing + reconciliation", minutes: 3 },
  { id: "O-2", tab: "Objective", trigger: "Quarterly return", name: "Quarterly Data Update", items: "Changes + action items", minutes: 2 },
  { id: "A-1", tab: "Assessment", trigger: "First visit", name: "Onboarding Career Profile", items: "Career Health Score + Career Map", minutes: 2 },
  { id: "A-2", tab: "Assessment", trigger: "Quarterly return", name: "Quarterly Profile Update", items: "Changes + trajectory", minutes: 2 },
  { id: "P-1", tab: "Plan", trigger: "First visit", name: "Goal Setting Entry", items: "Framework + 3 proposals", minutes: 5 },
  { id: "P-2", tab: "Plan", trigger: "Track pivot", name: "Skill Translation Pathway", items: "Transferable vs. gap analysis", minutes: 3 },
  { id: "P-3", tab: "Plan", trigger: "Job search activated", name: "Position Search", items: "Configuration + matches", minutes: 5 },
  { id: "P-4", tab: "Plan", trigger: "Quarterly return", name: "Goal Tracking", items: "Milestone review per goal", minutes: 3 },
  { id: "P-5", tab: "Plan", trigger: "Annual", name: "Annual Goal Reset", items: "Year summary + new proposals", minutes: 10 },
  { id: "P-6", tab: "Plan", trigger: "Goal modification", name: "Goal Refinement", items: "Collaborative modification", minutes: 3 },
  { id: "O-1", tab: "Output", trigger: "Any visit", name: "Document Selection", items: "Document library + quick actions", minutes: 1 },
  { id: "O-2", tab: "Output", trigger: "CV update", name: "CV Update Flow", items: "New items review + editor", minutes: 3 },
  { id: "O-3", tab: "Output", trigger: "Cover letter", name: "Cover Letter Generation", items: "Position + institution + tone", minutes: 3 },
  { id: "O-4", tab: "Output", trigger: "Personal statement", name: "Personal Statement Generation", items: "Purpose + audience + themes", minutes: 5 },
];

export { ESCALATION_PROTOCOLS } from "@/lib/v2/escalation-protocols";
export { MAK_STATE_MACHINE } from "@/lib/v2/mak-state-machine";
