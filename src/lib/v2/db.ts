import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getServerDemo } from "@/lib/v2/demo-store";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { fetchJobEngagementFromDb } from "@/lib/v2/career-data-repo";
import type {
  AnalyticsDashboard,
  AppUser,
  CareerAssessment,
  DocumentRecord,
  Job,
  MemPalaceExport,
} from "@/lib/v2/types";
import {
  computeCareerReadinessIndex,
  computePathwayClarity,
  TOUCHPOINT_META,
} from "@/lib/v2/formulas";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { buildCareerHealthView } from "@/lib/v2/career-health-view";
import { buildCareerRecommendations } from "@/lib/v2/career-recommendations";
import { quarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import { DEMO_ACTIVITIES } from "@/lib/activities-storage";
import { DEMO_GOALS, type CareerGoal } from "@/lib/goals";
import type { ActivityEntry } from "@/lib/types/database";
import {
  buildDashboardLattice,
  buildDocumentCards,
  buildMetricHistory,
  buildObjectiveSummary,
  extractPulseHistory,
} from "@/lib/v2/dashboard-data";
import { settingDocumentLabels } from "@/lib/v2/dashboard-architecture";
import { annualRefreshStatus } from "@/lib/v2/annual-refresh";
import { buildEngagementNotifications } from "@/lib/v2/engagement-tracking";
import { buildCareerVaultModel } from "@/lib/v2/career-vault";
import { touchpointsEligible } from "@/lib/v2/touchpoint-eligibility";

export async function fetchAssessments(
  userId: string,
  demo: boolean,
): Promise<CareerAssessment[]> {
  if (demo) return getServerDemo(userId).assessments;
  const supabase = await createClient();
  const { data } = await supabase
    .from("career_assessments")
    .select("*")
    .eq("user_id", userId)
    .order("touchpoint_number");
  return (data ?? []) as CareerAssessment[];
}

export async function fetchDocuments(userId: string, demo: boolean): Promise<DocumentRecord[]> {
  if (demo) return getServerDemo(userId).documents;
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });
  return (data ?? []) as DocumentRecord[];
}

export async function fetchActivities(userId: string, demo: boolean): Promise<ActivityEntry[]> {
  if (demo) return DEMO_ACTIVITIES;
  if (!isSupabaseConfigured()) return DEMO_ACTIVITIES;
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_entries")
    .select("*")
    .eq("user_id", userId)
    .order("activity_date", { ascending: false })
    .limit(50);
  return (data as ActivityEntry[]) ?? DEMO_ACTIVITIES;
}

export async function fetchCareerGoals(userId: string, demo: boolean): Promise<CareerGoal[]> {
  if (demo) {
    const stored = getOnboardingMetadata(getServerDemo(userId).user).stored_goals;
    return stored?.length ? stored : DEMO_GOALS;
  }
  if (!isSupabaseConfigured()) return DEMO_GOALS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("career_goals")
    .select("*")
    .eq("user_id", userId)
    .order("priority", { ascending: true });
  if ((data as CareerGoal[])?.length) return data as CareerGoal[];

  const { data: userRow } = await supabase
    .from("app_users")
    .select("onboarding_metadata")
    .eq("user_id", userId)
    .maybeSingle();
  const meta = (userRow?.onboarding_metadata ?? {}) as { stored_goals?: CareerGoal[] };
  return meta.stored_goals?.length ? meta.stored_goals : DEMO_GOALS;
}

export async function fetchLatestMemPalace(
  userId: string,
  demo: boolean,
): Promise<MemPalaceExport | null> {
  if (demo) return getServerDemo(userId).mempalace;
  const supabase = await createClient();
  const { data } = await supabase
    .from("mempalace_exports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as MemPalaceExport | null;
}

export async function fetchJobs(demo: boolean): Promise<Job[]> {
  if (demo) {
    return [
      {
        job_id: "demo-job-1",
        source: "MedJobs",
        title: "Interventional Cardiologist",
        institution: "Mayo Clinic",
        location: "Rochester, MN",
        salary: 350000,
        specialties: ["Cardiology"],
        description: "Leading interventional cardiology program.",
        growth_potential: "HIGH",
        posted_date: new Date().toISOString().slice(0, 10),
      },
      {
        job_id: "demo-job-2",
        source: "LinkedIn",
        title: "Academic Hospitalist",
        institution: "Johns Hopkins",
        location: "Baltimore, MD",
        salary: 280000,
        specialties: ["Internal Medicine"],
        description: "Academic hospital medicine with teaching.",
        growth_potential: "HIGH",
        posted_date: new Date().toISOString().slice(0, 10),
      },
    ];
  }
  const supabase = await createClient();
  const { data } = await supabase.from("jobs").select("*").order("posted_date", { ascending: false });
  return (data ?? []) as Job[];
}

export async function buildAnalyticsDashboard(
  user: AppUser,
  demo: boolean,
): Promise<AnalyticsDashboard> {
  const assessments = await fetchAssessments(user.user_id, demo);
  const completed = assessments.filter((a) => a.completed_at);
  const completedTouchpoints = new Set(completed.map((a) => a.touchpoint_number)).size;
  const avgScore =
    completed.length > 0
      ? completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length
      : 0;
  const pathwayClarity = computePathwayClarity(user, completedTouchpoints);
  const cri = computeCareerReadinessIndex({
    avgAssessmentScore: avgScore,
    cvUploaded: user.cv_uploaded,
    pathwayClarity,
  });

  const burnout = completed.filter((a) => a.question_category === "BURNOUT");
  const currentBurnout = burnout.length > 0 ? burnout[burnout.length - 1].score : null;
  const prevBurnout = burnout.length > 1 ? burnout[burnout.length - 2].score : null;
  let trend: AnalyticsDashboard["burnout_trend"]["trend"] = "unknown";
  if (currentBurnout != null && prevBurnout != null) {
    trend = currentBurnout < prevBurnout ? "improving" : currentBurnout > prevBurnout ? "declining" : "stable";
  }

  const jobMatches = demo
    ? getServerDemo(user.user_id).jobMatches
    : [];
  let jobEngagement = {
    jobs_viewed: jobMatches.filter((j) => j.viewed_at).length,
    jobs_saved: jobMatches.filter((j) => j.saved_at).length,
    average_match_score:
      jobMatches.length > 0
        ? jobMatches.reduce((s, j) => s + j.match_score, 0) / jobMatches.length
        : null,
  };
  if (!demo) {
    jobEngagement = await fetchJobEngagementFromDb(user.user_id);
  }

  const nextTp = completedTouchpoints < 7 ? completedTouchpoints + 1 : null;
  const tpMeta = nextTp ? TOUCHPOINT_META[nextTp] : null;
  const dueDate = tpMeta
    ? new Date(new Date(user.created_at).getTime() + tpMeta.daysFromStart * 86400000).toISOString()
    : null;
  const daysUntil = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    : null;

  const documents = await fetchDocuments(user.user_id, demo);
  const activities = await fetchActivities(user.user_id, demo);
  const cv = documents.find((d) => d.document_type === "CV" && d.extracted_text);
  const cvMetrics = cv?.extracted_text
    ? computeCvMetrics(cv.extracted_text, assessments)
    : null;

  const careerHealth =
    user.tier1_complete
      ? buildCareerHealthView({ user, cvMetrics, assessments })
      : null;

  const coachingBrief = careerHealth
    ? buildCareerRecommendations({ user, careerHealth, cvMetrics })
    : null;

  const onboardingMeta = getOnboardingMetadata(user);
  const touchpointReady = demo || touchpointsEligible(user, onboardingMeta);
  const quarterlyPulse = touchpointReady ? quarterlyPulseStatus(onboardingMeta) : null;
  const annualRefresh = touchpointReady ? annualRefreshStatus(onboardingMeta) : null;
  const pulse_streak = onboardingMeta.pulse_history?.length ?? 0;
  const previous_career_health_score =
    onboardingMeta.pulse_history?.[0]?.career_health_score ?? null;
  const pulse_history = extractPulseHistory(onboardingMeta);

  const fulfillmentMetric = careerHealth?.wellbeing_metrics.find(
    (m) => m.id === "professional_fulfillment",
  );
  const strainMetric = careerHealth?.wellbeing_metrics.find((m) => m.id === "burnout_risk");
  const alignmentPct = careerHealth?.domains.length
    ? Math.round(
        careerHealth.domains.reduce((s, d) => s + d.score, 0) / careerHealth.domains.length,
      )
    : undefined;
  const taskAlignmentPct =
    cvMetrics?.bits_score != null ? Math.round(100 - cvMetrics.bits_score * 8) : undefined;

  const metric_history = buildMetricHistory(onboardingMeta, {
    fulfillment: fulfillmentMetric?.status === "strong" ? 72 : fulfillmentMetric?.status === "developing" ? 55 : 40,
    strain: strainMetric?.status === "strong" ? 72 : strainMetric?.status === "developing" ? 55 : 40,
    alignment: alignmentPct,
    taskAlignment: taskAlignmentPct,
  });

  const dashboard_lattice = buildDashboardLattice({
    activities,
    health: careerHealth,
  });

  const docLabels = settingDocumentLabels(user.practice_setting);
  const document_cards = buildDocumentCards(
    documents,
    user.practice_setting,
    docLabels.primary,
    docLabels.secondary,
  );

  const objective_summary = buildObjectiveSummary({
    user,
    meta: onboardingMeta,
    cvText: cv?.extracted_text,
    evidence: cvMetrics?.evidence ?? null,
    cvAvailable: Boolean(cvMetrics),
    setting: user.practice_setting,
    enrichment: onboardingMeta.enrichment_snapshot ?? null,
  });

  const career_vault = buildCareerVaultModel({
    setting: user.practice_setting,
    enrichment: onboardingMeta.enrichment_snapshot ?? null,
    objective: objective_summary,
  });

  return {
    career_readiness_index: careerHealth?.career_health_score ?? cri,
    career_health: careerHealth,
    coaching_brief: coachingBrief,
    quarterly_pulse: quarterlyPulse,
    annual_refresh: annualRefresh,
    engagement_notifications: buildEngagementNotifications(onboardingMeta),
    pulse_streak,
    previous_career_health_score,
    pulse_history,
    metric_history,
    dashboard_lattice,
    objective_summary,
    career_vault,
    document_cards,
    goal_milestone_history: onboardingMeta.goal_milestone_history ?? [],
    stalled_goal_title: onboardingMeta.stalled_goal_title ?? null,
    stalled_goal_quarters: onboardingMeta.stalled_goal_quarters ?? 0,
    onboarding_progress: {
      tier1_complete: user.tier1_complete,
      tier2_complete: user.tier2_complete,
      tier3_complete: user.tier3_complete,
    },
    assessment_progress: {
      completed_touchpoints: completedTouchpoints,
      total_touchpoints: 7,
      completion_percentage: Math.round((completedTouchpoints / 7) * 100),
    },
    burnout_trend: {
      current_score: currentBurnout,
      previous_score: prevBurnout,
      trend,
    },
    job_engagement: jobEngagement,
    job_search_active: onboardingMeta.job_search_active ?? false,
    next_touchpoint: tpMeta
      ? {
          number: nextTp!,
          category: tpMeta.title,
          due_date: dueDate,
          days_until_due: daysUntil,
        }
      : null,
    cv_metrics: cvMetrics
      ? {
          available: true,
          s_index: cvMetrics.s_index,
          iwq: cvMetrics.iwq,
          promotion_aligned_pct: cvMetrics.promotion_aligned_pct,
          bits_score: cvMetrics.bits_score,
          domain_scores: cvMetrics.domain_scores,
          invisible_work_signals: cvMetrics.evidence.invisible_work_signals,
          interpretation: cvMetrics.interpretation,
        }
      : {
          available: false,
          s_index: null,
          iwq: null,
          promotion_aligned_pct: null,
          bits_score: null,
          domain_scores: null,
          invisible_work_signals: [],
          interpretation: { s_index: null, iwq: null },
        },
  };
}

export function extractCvMetadata(
  text: string,
  assessments: CareerAssessment[] = [],
): Record<string, unknown> {
  const metrics = computeCvMetrics(text, assessments);
  const lines = text.split("\n").filter(Boolean);
  const lower = text.toLowerCase();
  const sections = [
    "education",
    "experience",
    "publications",
    "teaching",
    "leadership",
    "certifications",
  ].filter((section) => lower.includes(section));
  return {
    preview: lines.slice(0, 5).join("\n"),
    line_count: lines.length,
    word_count: text.split(/\s+/).filter(Boolean).length,
    sections_detected: sections,
    institutions: lines
      .filter((l) => /university|hospital|clinic|medical|school of medicine/i.test(l))
      .slice(0, 8),
    skills: ["clinical care", "teaching", "leadership", "research"].filter((s) =>
      lower.includes(s.slice(0, 4)),
    ),
    s_index: metrics.s_index,
    iwq: metrics.iwq,
    promotion_aligned_pct: metrics.promotion_aligned_pct,
    bits_score: metrics.bits_score,
    domain_scores: metrics.domain_scores,
    invisible_work_signals: metrics.evidence.invisible_work_signals,
  };
}
