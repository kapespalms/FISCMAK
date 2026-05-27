import { nextInstrumentPrompt } from "@/lib/v2/instrument-conversation-prompts";
import type { AppUser } from "@/lib/v2/types";
import { formatDisplayName } from "@/lib/mak-greeting";

export const SELF_ASSESSMENT_MAK_INTRO_KEY = "fiscmak_self_assessment_mak_intro";

export const TOUR_STORAGE_KEY = "fiscmak_lay_of_land_tour_seen";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  highlight?: string;
};

export const LAY_OF_LAND_STEPS: TourStep[] = [
  {
    id: "dashboard",
    title: "Dashboard — your career at a glance",
    body: "Wellbeing metrics, activity capture, and quick actions — your home base for coaching progress.",
    highlight: "Home base for coaching progress",
  },
  {
    id: "subjective",
    title: "Your perspective — how you're doing",
    body: "Track energy, burnout signals, and wellbeing. Mak uses this to personalize coaching.",
    highlight: "Your inner experience matters",
  },
  {
    id: "objective",
    title: "Career Data — what's on record",
    body: "Log activities, upload your CV, and see your career map. This feeds promotion narratives and coaching.",
    highlight: "Make invisible work visible",
  },
  {
    id: "assessment",
    title: "Insights — career patterns",
    body: "This page shows insights from everything Mak learns — check-in progress, strengths, recognition gaps, and coherence. You never answer forms here; conversation fills it in automatically.",
    highlight: "Results and insights, not questions",
  },
  {
    id: "plan",
    title: "Strategy — goals & next steps",
    body: "Set promotion timelines, goals, and next steps with Mak's guidance.",
    highlight: "Turn insight into action",
  },
  {
    id: "output",
    title: "Output Studio — create documents",
    body: "Generate promotion narratives, CV updates, and review drafts from your coaching data.",
    highlight: "Publish your story",
  },
  {
    id: "mak",
    title: "Coach Mak — always here",
    body: "The panel on the left is your coach. Most onboarding happens through conversation — about 10–15 minutes to start.",
    highlight: "Talk, don't form-fill",
  },
];

export function buildWelcomeGreeting(user: AppUser): string {
  const name =
    formatDisplayName(user.name?.split(" ")[0], user.name?.split(" ").slice(1).join(" ")) ??
    (user.name ? `Dr. ${user.name.split(" ").pop()}` : null);
  const salutation = name ? `Welcome, ${name}.` : "Welcome.";
  const setting = user.practice_setting ? ` · ${user.practice_setting}` : "";
  const track = user.primary_career_track ? ` · ${user.primary_career_track} track` : "";
  return `${salutation} I'm Coach Mak.

You're set up as ${user.specialty ?? "a physician"} · ${user.career_stage ?? "career stage pending"}${setting}${track}.

Next we'll walk through your self-assessment battery conversationally — PFI wellbeing, career aspirations, and more. No forms.

When you're ready, take the **Lay of the Land** tour (link below) — then tell me: on a 0–4 scale, how fulfilled do you feel in your work overall?`;
}

export function buildOnboardingSuggestedActions() {
  return [
    { action: "Lay of the Land tour", url: "#tour" },
    { action: "I'm focused on promotion", url: "/app/dashboard" },
    { action: "Help me see invisible work", url: "/app/dashboard" },
  ];
}

/** Opening copy after onboarding instruments step (dashboard welcome). */
export function buildSelfAssessmentIntro(user: AppUser): string {
  const first =
    formatDisplayName(user.name?.split(" ")[0], user.name?.split(" ").slice(1).join(" ")) ??
    (user.name ? `Dr. ${user.name.split(" ").pop()}` : null);
  const salutation = first ? `${first},` : "Welcome back.";
  const next = nextInstrumentPrompt(user);
  return `${salutation} your profile and Career Data are set — great work.

Next is your **self-assessment battery**: validated instruments (fulfillment, burnout signals, career energy, and more) woven into conversation — no forms.

${next ? `Let's start here:\n\n${next}` : "Tell me when you're ready and we'll begin with your first instrument cluster."}`;
}

export function isTourSeen(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TOUR_STORAGE_KEY) === "1";
}

export function markTourSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOUR_STORAGE_KEY, "1");
}
