import type { AppSection } from "@/lib/mak-sections";

const EXACT_REPLIES: Record<string, string> = {
  "Find invisible work":
    "Let's hunt for work that never makes the CV — committee prep, mentoring, workflow fixes, family meetings. What's one thing from this week that felt important but invisible?",
  "Log new activity":
    "Tell me what you did in your own words. I'll help classify it and make it visible.",
  "Upload a document":
    "Use Upload Document on the dashboard, or paste CV text under Objective → Documents. I can help you pull activities out of it.",
  "Review my lattice":
    "Open Objective → Lattice to see your 8×8 map. Where do you see empty cells that don't match how you actually spend your time?",
  "I'm energized":
    "Good to hear. What's giving you that energy right now — patient care, teaching, a project, or something else?",
  "I'm drained":
    "That sounds heavy. What pulled the most from you today — volume, admin, conflict, or something else?",
  "I'm balanced":
    "A steady day can be a good sign. What's keeping things in balance for you this week?",
  "Show my strengths":
    "From what you've logged, teaching and patient-facing work show up often. What strength do you wish your institution saw more clearly?",
  "Show my blind spots":
    "Blind spots are often invisible work and under-documented leadership. Where do you do important work that nobody tracks?",
  "What's my career pattern?":
    "The pattern forming is Clinician-Educator with emerging systems leadership — strong teaching signal, growing admin footprint. Does that fit how you see yourself?",
  "What's draining me?":
    "Draining work often clusters in admin and visibility gaps. What tasks leave you tired even when you're done?",
  "Generate outputs":
    "Head to Output Studio — pick a template like annual review or promotion narrative and we'll build from your evidence.",
  "Plan my next move":
    "What's the next career milestone on your mind — promotion, new role, protected time for research?",
  "Track my progress":
    "Check Plan for active goals and Objective for logged evidence. Which goal should we focus on first?",
  "Get promotion ready":
    "Promotion is about visible evidence. What gap worries you most — leadership, teaching, scholarship, or service?",
  "Academic tenure":
    "Tenure narratives need a through-line. What's the story you want the committee to remember about your impact?",
  "Annual performance review":
    "Let's anchor on outcomes, not just hours. What are 2–3 wins from this year you'd want your chair to know?",
  "Promotion narrative":
    "Promotion is a case, not a CV dump. What role are you aiming for, and what evidence best supports it?",
  "Community health impact":
    "Community impact stories need people and outcomes. Who benefited, and what changed because of your work?",
  "Capture invisible work":
    "Let's make your work visible. What did you just do — even if it feels too small to mention?",
  "Discuss my energy":
    "How's your energy this week? You can use the slider on Subjective, or just tell me here.",
  "Review my activities":
    "Let's look at what you've logged. What stands out — or what's missing that you know you did?",
};

function sectionFallback(section: AppSection | undefined): string {
  switch (section) {
    case "subjective":
      return "I'm listening. How are you feeling about work this week — energized, drained, or somewhere in between?";
    case "objective":
      return "Describe something you accomplished recently. I'll help you name it and place it on your lattice.";
    case "assessment":
      return "What pattern are you noticing in your career right now — or what feels misaligned?";
    case "plan":
      return "What's the next move you're considering? We can shape it into a concrete goal.";
    case "output":
      return "What document are you trying to produce? A review, promotion packet, teaching statement, or something else?";
    default:
      return "I'm here with you. What's on your mind about your career this week?";
  }
}

export function demoMakReply(
  message: string,
  section?: AppSection,
): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return sectionFallback(section);
  }

  const exact = EXACT_REPLIES[trimmed];
  if (exact) return exact;

  const lower = trimmed.toLowerCase();

  if (lower.includes("invisible") || lower.includes("hidden work")) {
    return EXACT_REPLIES["Find invisible work"];
  }
  if (lower.includes("burnout") || lower.includes("exhausted")) {
    return "Burnout signals matter. What's been taking the most out of you — workload, type of work, or lack of recognition?";
  }
  if (lower.includes("teach") || lower.includes("mentor")) {
    return "Teaching and mentoring are often under-counted. How much time did it take, and who benefited?";
  }
  if (lower.includes("committee") || lower.includes("admin")) {
    return "Admin and committee work is easy to dismiss — but it's leadership. What was the scope, and what changed because you were involved?";
  }

  return `${sectionFallback(section)} You said: "${trimmed.slice(0, 100)}${trimmed.length > 100 ? "…" : ""}"`;
}
