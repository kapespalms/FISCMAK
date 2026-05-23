import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getServerDemo } from "@/lib/v2/demo-store";
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
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

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
  const saved = jobMatches.filter((j) => j.saved_at);
  const avgMatch =
    jobMatches.length > 0
      ? jobMatches.reduce((s, j) => s + j.match_score, 0) / jobMatches.length
      : null;

  const nextTp = completedTouchpoints < 7 ? completedTouchpoints + 1 : null;
  const tpMeta = nextTp ? TOUCHPOINT_META[nextTp] : null;
  const dueDate = tpMeta
    ? new Date(new Date(user.created_at).getTime() + tpMeta.daysFromStart * 86400000).toISOString()
    : null;
  const daysUntil = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    : null;

  const documents = await fetchDocuments(user.user_id, demo);
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
  const quarterlyPulse = user.tier3_complete ? quarterlyPulseStatus(onboardingMeta) : null;

  return {
    career_readiness_index: careerHealth?.career_health_score ?? cri,
    career_health: careerHealth,
    coaching_brief: coachingBrief,
    quarterly_pulse: quarterlyPulse,
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
    job_engagement: {
      jobs_viewed: jobMatches.length,
      jobs_saved: saved.length,
      average_match_score: avgMatch,
    },
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
