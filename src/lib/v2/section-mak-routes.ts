import type { AppSection, MakFlowIntent } from "@/lib/mak-sections";
import { findDashboardMeceOptionByLabel } from "@/lib/v2/dashboard-mak-menu";

export type SectionQuickAction = {
  intent: MakFlowIntent;
  message: string;
  href?: string;
  focusInput?: boolean;
  touchpoint?: "annual" | "quarterly";
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
        href: "/app/objective?tab=documents&upload=1",
        message: "I want to upload a document to my career vault.",
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

  if (section === "assessment") {
    if (n.includes("health score")) {
      return {
        intent: "assess",
        href: "/app/assessment",
        message: "Explain my Career Health Score and what would improve it.",
      };
    }
    if (n.includes("growth") || n.includes("opportunit")) {
      return {
        intent: "assess",
        href: "/app/assessment",
        message: "Show me growth opportunities from my career profile.",
      };
    }
    if (n.includes("alignment")) {
      return {
        intent: "assess",
        href: "/app/assessment",
        message: "Walk me through my career alignment and coherence.",
      };
    }
    if (n.includes("advancement") || n.includes("readiness")) {
      return {
        intent: "assess",
        href: "/app/assessment",
        message: "Discuss my advancement readiness and what's missing.",
      };
    }
  }

  if (section === "output") {
    const href = "/app/output";
    if (n.includes("cv") && !n.includes("cover")) {
      return { intent: "create", href, message: "Help me update my CV in Output Studio." };
    }
    if (n.includes("biosketch") || n.includes("nih")) {
      return { intent: "create", href, message: "Help me draft or update my NIH Biosketch." };
    }
    if (n.includes("cover letter")) {
      return { intent: "create", href, message: "Help me generate a cover letter." };
    }
    if (n.includes("personal statement")) {
      return { intent: "create", href, message: "Help me draft a personal statement." };
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
