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
  const meta = nextTp ? TOUCHPOINT_META[nextTp] : null;
  const dueDate = meta
    ? new Date(new Date(user.created_at).getTime() + meta.daysFromStart * 86400000).toISOString()
    : null;
  const daysUntil = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    : null;

  return {
    career_readiness_index: cri,
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
    next_touchpoint: meta
      ? {
          number: nextTp!,
          category: meta.title,
          due_date: dueDate,
          days_until_due: daysUntil,
        }
      : null,
  };
}

export function extractCvMetadata(text: string): Record<string, unknown> {
  const lines = text.split("\n").filter(Boolean);
  return {
    preview: lines.slice(0, 5).join("\n"),
    line_count: lines.length,
    institutions: lines.filter((l) => /university|hospital|clinic|medical/i.test(l)).slice(0, 5),
    skills: ["clinical care", "teaching", "leadership"].filter((s) =>
      text.toLowerCase().includes(s.slice(0, 4)),
    ),
  };
}
