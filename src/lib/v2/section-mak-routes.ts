import type { AppSection, MakFlowIntent } from "@/lib/mak-sections";
import { findDashboardMeceOptionByLabel } from "@/lib/v2/dashboard-mak-menu";

export type SectionQuickAction = {
  intent: MakFlowIntent;
  message: string;
  href?: string;
  focusInput?: boolean;
  touchpoint?: "annual" | "quarterly";
  goalFlow?: "set" | "modify";
};

function norm(label: string): string {
  return label.trim().toLowerCase();
}

/** MECE routing for Mak quick pills — one canonical destination per action. */
export function resolveSectionQuickAction(
  section: AppSection,
  label: string,
): SectionQuickAction | null {
  if (section === "dashboard") {
    const mece = findDashboardMeceOptionByLabel(label);
    if (!mece) return null;
    return {
      intent: mece.intent,
      message: mece.message,
      href: mece.href,
      focusInput: mece.focusInput,
    };
  }

  const n = norm(label);

  if (section === "objective") {
    if (n.includes("upload")) {
      return {
        intent: "upload",
        href: "/app/documents?upload=1",
        message: "I want to upload a document to my career vault.",
      };
    }
    if (n.includes("debrief") || n.includes("rotation")) {
      return {
        intent: "rotation_debrief",
        href: "/app/objective?tab=activities",
        message: "I'd like to debrief a rotation I just finished while it's still fresh.",
        focusInput: true,
      };
    }
    if (n.includes("narrative anchor") || n.includes("anchor")) {
      return {
        intent: "narrative_anchor",
        href: "/app/subjective",
        message:
          "Help me set my narrative anchor — specialty direction, origin story, and what I want to contribute.",
        focusInput: true,
      };
    }
    if (n.includes("translate") && (n.includes("pivot") || n.includes("career"))) {
      return {
        intent: "career_translation",
        href: "/app/objective?tab=activities",
        message:
          "Help me translate a clinical experience into outsider language for my career pivot.",
        focusInput: true,
      };
    }
    if (n.includes("capture") || n.includes("activity") || n.includes("invisible")) {
      return {
        intent: "capture",
        href: "/app/objective?tab=activities",
        message: "Help me capture career evidence that might not appear on my CV.",
        focusInput: true,
      };
    }
    if (n.includes("vault")) {
      return {
        intent: "review",
        href: "/app/objective?tab=vault",
        message: "Walk me through my Career Data vault — what's verified and what might be missing.",
      };
    }
    if (n.includes("reconcile") || n.includes("new item") || n.includes("confirm")) {
      return {
        intent: "review",
        href: "/app/objective?tab=reconcile",
        message: "Help me reconcile enrichment items I'm unsure about.",
      };
    }
    if (n.includes("lattice") || n.includes("map")) {
      return {
        intent: "review",
        href: "/app/objective?tab=lattice",
        message: "Help me interpret my career lattice — domains, tracks, and gaps.",
      };
    }
  }

  if (section === "subjective") {
    if (n.includes("pivot") && (n.includes("quarterly") || n.includes("capture"))) {
      return {
        intent: "pivot_quarterly",
        href: "/app/subjective",
        message: "Begin path-specific quarterly capture for my career pivot.",
      };
    }
    if (n.includes("career pivot") || n.includes("non-traditional") || n.includes("destination")) {
      return {
        intent: "career_pivot_onboarding",
        href: "/app/subjective",
        message: "Help me clarify my career direction — what energizes me, my strengths, and paths that fit.",
      };
    }
    if (n.includes("identity") || n.includes("leaving medicine")) {
      return {
        intent: "identity_navigation",
        href: "/app/subjective",
        message: "Help me navigate the identity side of my career transition.",
      };
    }
    if (n.includes("quarterly") && (n.includes("accomplish") || n.includes("promotion"))) {
      return {
        intent: "attending_quarterly",
        href: "/app/subjective",
        message: "Begin my quarterly accomplishment capture for promotion documentation.",
      };
    }
    if (n.includes("quarterly")) {
      return {
        intent: "discuss",
        href: "/app/subjective",
        message: "Let's begin my quarterly check-in — well-being, invisible work, and momentum.",
        touchpoint: "quarterly",
      };
    }
    if (n.includes("annual") || n.includes("direction")) {
      return {
        intent: "discuss",
        href: "/app/subjective",
        message: "I'd like to talk about my career direction — my track and 3-year objective.",
        touchpoint: "annual",
      };
    }
    if (n.includes("alignment") || n.includes("task")) {
      return {
        intent: "discuss",
        href: "/app/subjective",
        message: "Let's review my task alignment — what work fits my role versus what doesn't.",
      };
    }
    if (n.includes("objective")) {
      return {
        intent: "discuss",
        href: "/app/subjective",
        message: "I want to update my stated career objective with you.",
      };
    }
  }

  if (section === "plan") {
    if (n.includes("explore") && (n.includes("direction") || n.includes("career"))) {
      return {
        intent: "grow_exploration",
        href: "/app/plan",
        message:
          "Help me explore career direction before I commit — what good looks like and the smallest step to test.",
      };
    }
    if (
      n.includes("board") ||
      (n.includes("map") && (n.includes("mentor") || n.includes("sponsor")))
    ) {
      return {
        intent: "board_awareness",
        href: "/app/plan",
        message: "Help me map my Career Board — mentor, sponsor, coach, and connector.",
      };
    }
    if (n.includes("connect") && (n.includes("dr") || n.includes("reach out") || n.includes("cold"))) {
      return {
        intent: "board_building",
        href: "/app/plan",
        message: "Help me connect with someone for a Board role — including cold outreach if needed.",
      };
    }
    if (n.includes("sponsor") || n.includes("mentor") || n.includes("connector")) {
      return {
        intent: "board_building",
        href: "/app/plan",
        message: "Help me build a missing Board role — mentor, sponsor, coach, or connector.",
      };
    }
    if (n.includes("goal") && (n.includes("set") || n.includes("setup"))) {
      return {
        intent: "plan",
        href: "/app/plan",
        message: "Walk me through setting up my Development, Maintenance, and Sustainability goals.",
        goalFlow: "set",
      };
    }
  }

  if (section === "assessment") {
    if (n.includes("health score")) {
      return {
        intent: "assess",
        href: "/app/assessment",
        message: "Summarize my career pattern and what I should capture next.",
      };
    }
    if (n.includes("growth") || n.includes("opportunit")) {
      return {
        intent: "assess",
        href: "/app/assessment",
        message: "Show me growth opportunities from my career profile.",
      };
    }
    if (n.includes("advancement") || n.includes("readiness") || n.includes("promotion audit")) {
      return {
        intent: "promotion_readiness",
        href: "/app/assessment",
        message:
          "Run my promotion readiness audit — strengths, gaps, and timeline across all five domains.",
      };
    }
    if (n.includes("alignment")) {
      return {
        intent: "assess",
        href: "/app/assessment",
        message: "Walk me through my career alignment and coherence.",
      };
    }
  }

  if (section === "output") {
    const href = "/app/output";
    if (n.includes("cv") && !n.includes("cover")) {
      return { intent: "create", href, message: "Help me update my CV in Output Studio." };
    }
    if (n.includes("teaching portfolio")) {
      return {
        intent: "create",
        href,
        message:
          "Help me build my teaching portfolio — philosophy, responsibilities, evaluations, and educational scholarship.",
      };
    }
    if (n.includes("institutional cv") || (n.includes("academic cv") && !n.includes("update"))) {
      return {
        intent: "create",
        href,
        message: "Help me draft or update my institutional academic CV section by section.",
      };
    }
    if (n.includes("biosketch") || n.includes("nih")) {
      return { intent: "create", href, message: "Help me draft or update my NIH Biosketch." };
    }
    if (n.includes("career narrative") && !n.includes("promotion")) {
      return {
        intent: "personal_statement_arc",
        href,
        message:
          "Help me build my career narrative — stage-appropriate opening, body, and vision with track-specific emphasis.",
      };
    }
    if (n.includes("promotion narrative") || n.includes("promotion dossier")) {
      return {
        intent: "promotion_dossier",
        href,
        message: "Help me build my promotion career narrative section by section.",
      };
    }
    if (n.includes("personal statement")) {
      return {
        intent: "personal_statement_arc",
        href,
        message:
          "Help me build my personal statement from captured experiences — hook, origin, journey, and vision.",
      };
    }
    if (n.includes("fellowship") && n.includes("narrative")) {
      return {
        intent: "fellowship_mining",
        href: "/app/subjective",
        message:
          "Help me sharpen my fellowship narrative — subspecialty niche, scholarly thread, and defining moments.",
      };
    }
    if (n.includes("industry resume") || (n.includes("industry") && n.includes("resume"))) {
      return {
        intent: "pivot_narrative",
        href,
        message:
          "Help me build a 1–2 page industry resume from my clinical experience — translated, not academic CV.",
      };
    }
    if (
      n.includes("industry cover") ||
      (n.includes("pivot") && (n.includes("cover") || n.includes("letter") || n.includes("narrative")))
    ) {
      return {
        intent: "pivot_narrative",
        href,
        message:
          "Help me build my industry pivot cover letter — hook, clinical-to-industry bridge, value proposition, and close.",
      };
    }
    if (n.includes("resume") && !n.includes("cover")) {
      return {
        intent: "create",
        href,
        message: "Help me build a 1–2 page industry resume from my clinical experience — translated, not academic CV.",
      };
    }
    if (n.includes("cover letter") && !n.includes("pivot") && !n.includes("industry")) {
      return {
        intent: "create",
        href,
        message:
          "Help me draft my physician CV cover letter — stage-appropriate opening, body paragraphs, and closing tailored to the position.",
      };
    }
    if (n.includes("advancement") || n.includes("report")) {
      return {
        intent: "create",
        href,
        message: "Help me generate an advancement readiness report.",
      };
    }
  }

  return null;
}
