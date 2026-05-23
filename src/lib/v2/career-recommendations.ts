import type { AppUser } from "@/lib/v2/types";
import type { PracticeSetting } from "@/lib/v2/onboarding-options";
import type { CvMetrics } from "@/lib/v2/cv-metrics";
import type { CareerHealthView } from "@/lib/v2/career-health-view";
import { getOnboardingMetadata, type OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { promotionReadinessLabel } from "@/lib/v2/career-language";
import { STATUS_LABELS } from "@/lib/design-system";
import type { InstrumentScore } from "@/lib/v2/onboarding-instruments";

export type RecommendationPriority = "urgent" | "high" | "medium" | "celebration";

export type RecommendationCategory =
  | "burnout"
  | "promotion"
  | "career_alignment"
  | "invisible_work"
  | "research"
  | "growth"
  | "wellbeing"
  | "quarterly";

export type CareerRecommendation = {
  id: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  message: string;
  coach_prompt: string;
  trigger: string;
  suggested_actions: { action: string; url: string }[];
};

export type CareerCoachingBrief = {
  headline: string;
  recommendations: CareerRecommendation[];
  primary_focus: CareerRecommendation | null;
  alert_count: number;
  celebration_count: number;
  mak_opener: string;
};

function instrumentScore(meta: OnboardingMetadata, id: string): InstrumentScore | undefined {
  const scores = meta.instrument_scores as Record<string, InstrumentScore> | undefined;
  return scores?.[id];
}

function trackEnergy(meta: OnboardingMetadata): number | null {
  const career = instrumentScore(meta, "career_aspirations");
  const v = career?.raw.track_energy;
  return typeof v === "number" ? v : null;
}

function invisibleHours(meta: OnboardingMetadata): number | null {
  const inv = instrumentScore(meta, "invisible_work");
  const v = inv?.raw.weekly_hours;
  return typeof v === "number" ? v : null;
}

function pfiBurnout(meta: OnboardingMetadata): number | null {
  const pfi = instrumentScore(meta, "pfi");
  const v = pfi?.raw.burnout;
  return typeof v === "number" ? v : null;
}

function domainsAboveThreshold(view: CareerHealthView, threshold: number): CareerHealthView["domains"] {
  return view.domains.filter((d) => d.score >= threshold);
}

function domainsBelowThreshold(view: CareerHealthView, threshold: number): CareerHealthView["domains"] {
  return view.domains.filter((d) => d.score < threshold);
}

function isAcademic(user: AppUser): boolean {
  return user.practice_setting === "Academic" || user.practice_setting === "Hybrid";
}

export function buildCareerRecommendations(input: {
  user: AppUser;
  careerHealth: CareerHealthView;
  cvMetrics?: CvMetrics | null;
}): CareerCoachingBrief {
  const { user, careerHealth, cvMetrics } = input;
  const meta = getOnboardingMetadata(user);
  const recs: CareerRecommendation[] = [];

  const burnout = pfiBurnout(meta);
  const energy = trackEnergy(meta);
  const invisible = invisibleHours(meta);
  const baselineInvisible = (meta.pulse_baseline?.invisible_hours as number | undefined) ?? invisible;
  const prevBurnout = meta.pulse_history?.[0]?.burnout_screen as number | undefined;
  const promotionLabel = promotionReadinessLabel(
    user.practice_setting as PracticeSetting | null,
    user.specialty,
  );

  // Burnout red flag
  if (burnout != null && burnout >= 3.325) {
    recs.push({
      id: "burnout-red-flag",
      priority: "urgent",
      category: "burnout",
      title: "Burnout needs attention",
      message:
        "Your well-being check shows elevated burnout risk. This isn't a personal failing — it's often a systems problem worth naming and addressing.",
      coach_prompt:
        "Explore what's driving exhaustion right now: workload, role creep, moral injury, or loss of meaning. Offer one concrete boundary or delegation experiment.",
      trigger: "PFI burnout screen ≥ 3.325",
      suggested_actions: [
        { action: "Talk about my energy", url: "/app/subjective" },
        { action: "Log invisible work", url: "/app/dashboard" },
      ],
    });
  } else if (burnout != null && burnout >= 2.5) {
    recs.push({
      id: "burnout-moderate",
      priority: "high",
      category: "wellbeing",
      title: "Monitor your well-being",
      message:
        "Your burnout risk is in the moderate range. Small shifts now can prevent a sharper decline during busy seasons.",
      coach_prompt: "Ask what drained them most this month and whether any task could be delegated or eliminated.",
      trigger: "PFI burnout screen 2.5–3.325",
      suggested_actions: [{ action: "Discuss my energy", url: "/app/subjective" }],
    });
  }

  // Burnout trajectory (quarter-over-quarter proxy from pulse history)
  if (
    burnout != null &&
    prevBurnout != null &&
    burnout - prevBurnout >= 1.5
  ) {
    recs.push({
      id: "burnout-trajectory",
      priority: "urgent",
      category: "burnout",
      title: "Burnout trend is worsening",
      message:
        "Your burnout signals have increased noticeably since your last check-in. Let's look at system-level factors, not just individual resilience.",
      coach_prompt:
        "Compare current vs prior quarter triggers. Surface invisible work, committee load, and EHR burden as structural contributors.",
      trigger: "Burnout score increase ≥ 1.5 points vs prior pulse",
      suggested_actions: [{ action: "Capture what's draining me", url: "/app/dashboard" }],
    });
  }

  // Invisible work spike
  if (
    invisible != null &&
    baselineInvisible != null &&
    baselineInvisible > 0 &&
    invisible > baselineInvisible * 1.5
  ) {
    recs.push({
      id: "invisible-work-spike",
      priority: "high",
      category: "invisible_work",
      title: "Unrecognized work has increased",
      message: `You reported about ${invisible} hours/week of unrecognized work — up more than 50% from your baseline. This often precedes burnout and promotion gaps.`,
      coach_prompt:
        "Identify the biggest invisible work category this quarter. Discuss making service legible in narratives and whether DEI/advocacy hours exceed specialty norms.",
      trigger: "Invisible hours > 150% of baseline",
      suggested_actions: [
        { action: "Log invisible work", url: "/app/dashboard" },
        { action: "Build promotion narrative", url: "/app/output" },
      ],
    });
  }

  // Task burden (BITS)
  const bits = instrumentScore(meta, "bits");
  if (bits && (bits.raw.unreasonable as number) >= 3.5) {
    recs.push({
      id: "task-burden-high",
      priority: "high",
      category: "invisible_work",
      title: "Task burden is high",
      message:
        "You're spending significant time on tasks that feel outside your core role. Naming this is the first step toward negotiating scope.",
      coach_prompt: "Explore which tasks feel unreasonable vs unnecessary. Suggest one conversation with a supervisor or delegate.",
      trigger: "BITS unreasonable subscale ≥ 3.5",
      suggested_actions: [{ action: "Discuss task burden with Mak", url: "/app/dashboard" }],
    });
  }

  // Career misalignment
  if (energy != null && energy < 4) {
    recs.push({
      id: "career-misalignment",
      priority: "high",
      category: "career_alignment",
      title: "Career alignment gap",
      message: `Your energy for your primary track (${user.primary_career_track ?? "current focus"}) is low (${energy}/10). There may be room to shift toward work that energizes you.`,
      coach_prompt:
        "Compare stated primary track vs time allocation. Present alternative lattice tracks without pushing a pivot — explore energizers vs drainers.",
      trigger: "Track energy score < 4/10",
      suggested_actions: [
        { action: "Explore career alignment", url: "/app/plan" },
        { action: "View Career Map", url: "/app/lattice" },
      ],
    });
  }

  // Track vs domain mismatch (educator track, low teaching)
  const teaching = careerHealth.domains.find(
    (d) => d.label === "Teaching Impact" || d.label === "Mentoring & Precepting",
  );
  if (
    user.primary_career_track === "Educator" &&
    teaching &&
    teaching.score < 55
  ) {
    recs.push({
      id: "educator-track-gap",
      priority: "medium",
      category: "career_alignment",
      title: "Educator track — teaching evidence gap",
      message:
        "You identify as an Educator, but your documented teaching impact is still emerging. Strengthening your portfolio could unlock promotion and alignment.",
      coach_prompt:
        "Ask about teaching evaluations, curriculum work, and mentoring not yet on the CV. Suggest documenting 2–3 teaching wins this quarter.",
      trigger: "Educator track + teaching domain < 55",
      suggested_actions: [
        { action: "Upload teaching portfolio", url: "/app/objective" },
        { action: "Draft educator narrative", url: "/app/output" },
      ],
    });
  }

  // Research influence low for researcher track (academic)
  const research = careerHealth.domains.find((d) => d.label === "Research Influence");
  if (
    isAcademic(user) &&
    user.primary_career_track === "Researcher" &&
    research &&
    research.score < 55
  ) {
    recs.push({
      id: "research-growth",
      priority: "medium",
      category: "research",
      title: "Research influence — room to grow",
      message:
        "For your researcher track, your published work footprint is below the typical range for your rank. This is the area with the most structured growth potential.",
      coach_prompt:
        "Explore publication pipeline, protected time, and collaboration strategies. Avoid shaming — frame as opportunity and institutional fit.",
      trigger: "Researcher track + research influence < 55",
      suggested_actions: [{ action: "Discuss research strategy", url: "/app/plan" }],
    });
  }

  // Community psychiatry - research de-emphasized message
  if (
    user.practice_setting === "Community" &&
    user.specialty?.toLowerCase().includes("psychiatr") &&
    research &&
    research.score < 50
  ) {
    recs.push({
      id: "community-impact-framing",
      priority: "medium",
      category: "growth",
      title: "Clinical impact is your primary footprint",
      message:
        "For community psychiatry, clinical excellence and patient outcomes often matter more than publications. Your impact may be stronger than bibliometrics suggest.",
      coach_prompt:
        "Reframe success around clinical volume, quality outcomes, and advocacy — not h-index. Ask what impact they want to make visible.",
      trigger: "Community psychiatry + modest research signals",
      suggested_actions: [{ action: "Capture clinical wins", url: "/app/dashboard" }],
    });
  }

  // Promotion window — ≥75 in 3+ domains (academic)
  const strongDomains = domainsAboveThreshold(careerHealth, 75);
  if (isAcademic(user) && strongDomains.length >= 3) {
    recs.push({
      id: "promotion-window",
      priority: "celebration",
      category: "promotion",
      title: `${promotionLabel} — strong position`,
      message: `You've met or exceeded benchmarks in ${strongDomains.length} areas (${strongDomains.map((d) => d.label).join(", ")}). This may be a good time to discuss promotion timeline with your chair.`,
      coach_prompt:
        "Celebrate strengths. Offer to generate a preliminary promotion readiness summary and identify remaining gaps.",
      trigger: "≥3 CDI domains ≥ 75th percentile equivalent",
      suggested_actions: [
        { action: "View promotion readiness", url: "/app/plan" },
        { action: "Start promotion narrative", url: "/app/output" },
      ],
    });
  }

  // Publication milestone (CV signals)
  if (cvMetrics && cvMetrics.evidence.publication_signals >= 3 && research && research.score >= 60) {
    recs.push({
      id: "publication-momentum",
      priority: "celebration",
      category: "research",
      title: "Publication momentum building",
      message:
        "Your CV shows growing publication activity. If citations are tracking up, your research influence may be moving toward the next rank threshold.",
      coach_prompt: "Congratulate and ask if they're targeting a specific journal, grant, or promotion milestone next.",
      trigger: "Publication signals detected on CV",
      suggested_actions: [{ action: "Update CV", url: "/app/objective" }],
    });
  }

  // Teaching portfolio strong → promotion nudge
  if (teaching && teaching.score >= 75 && isAcademic(user)) {
    recs.push({
      id: "teaching-promotion-nudge",
      priority: "medium",
      category: "promotion",
      title: "Teaching portfolio is promotion-ready",
      message:
        "Your teaching impact is strong enough to support a promotion case. Consider discussing timeline with your chair in the next 3 months.",
      coach_prompt: "Help them articulate 2–3 teaching narratives for a dossier. Connect to clinician-educator criteria.",
      trigger: "Teaching impact ≥ 75",
      suggested_actions: [{ action: "Draft teaching narrative", url: "/app/output" }],
    });
  }

  // Growth opportunities from weakest domains
  const weak = domainsBelowThreshold(careerHealth, 50).slice(0, 2);
  for (const domain of weak) {
    if (recs.some((r) => r.id === `growth-${domain.key}`)) continue;
    recs.push({
      id: `growth-${domain.key}`,
      priority: "medium",
      category: "growth",
      title: `Growth opportunity: ${domain.label}`,
      message: `${domain.label} (${domain.score}/100) — ${STATUS_LABELS[domain.status]} — ${domain.summary.split(".")[0]}.`,
      coach_prompt: `Explore one actionable step to strengthen ${domain.label.toLowerCase()} this quarter.`,
      trigger: `${domain.label} score < 50`,
      suggested_actions: [{ action: `Discuss ${domain.label}`, url: "/app/plan" }],
    });
  }

  // Default encouragement if empty
  if (recs.length === 0) {
    recs.push({
      id: "continue-conversation",
      priority: "medium",
      category: "growth",
      title: "Keep building your career story",
      message: careerHealth.aspiration_prompt,
      coach_prompt: "Open with their aspiration prompt and listen for energizers vs drainers.",
      trigger: "Baseline coaching",
      suggested_actions: [{ action: "Chat with Coach Mak", url: "/app/dashboard" }],
    });
  }

  const priorityOrder: Record<RecommendationPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    celebration: 3,
  };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const primary = recs.find((r) => r.priority === "urgent") ?? recs.find((r) => r.priority === "high") ?? recs[0];

  const alert_count = recs.filter((r) => r.priority === "urgent" || r.priority === "high").length;
  const celebration_count = recs.filter((r) => r.priority === "celebration").length;

  const headline =
    alert_count > 0
      ? `${alert_count} item${alert_count > 1 ? "s" : ""} need your attention`
      : celebration_count > 0
        ? "You're building momentum"
        : "Your career coaching focus this week";

  const mak_opener = primary
    ? `${primary.title}: ${primary.coach_prompt}`
    : "What's most on your mind about your career this week?";

  return {
    headline,
    recommendations: recs.slice(0, 6),
    primary_focus: primary,
    alert_count,
    celebration_count,
    mak_opener,
  };
}

export function recommendationsContextForMak(brief: CareerCoachingBrief): string {
  const lines = brief.recommendations.map(
    (r) => `[${r.priority.toUpperCase()}] ${r.title}: ${r.coach_prompt}`,
  );
  return `Active coaching recommendations:\n${lines.join("\n")}\n\nPrimary focus: ${brief.primary_focus?.title ?? "General career exploration"}`;
}
