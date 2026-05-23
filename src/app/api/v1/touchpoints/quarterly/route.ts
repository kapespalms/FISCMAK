import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { buildCareerHealthView } from "@/lib/v2/career-health-view";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  buildQuarterlyPulseSummary,
  parsePulseAnswers,
  quarterlyPulseStatus,
  type PulseAnswer,
} from "@/lib/v2/quarterly-pulse";
import { fetchDocuments } from "@/lib/v2/db";
import { burnoutRiskFromPfi } from "@/lib/v2/career-language";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const status = quarterlyPulseStatus(meta);

  return jsonOk(status);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { answers } = body as { answers?: PulseAnswer[] };
  if (!answers?.length) {
    return jsonOk({ error: "validation_error", message: "Pulse answers required." }, 400);
  }

  const meta = getOnboardingMetadata(user);
  const parsed = parsePulseAnswers(answers);
  const quarter = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;
  const now = new Date().toISOString();

  const baseline = meta.pulse_baseline ?? {};
  if (!baseline.invisible_hours && parsed.invisible_hours) {
    baseline.invisible_hours = parsed.invisible_hours;
    baseline.captured_at = now;
  }

  const prevScore = meta.cdi?.score ?? null;
  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const cvMetrics = cv?.extracted_text ? computeCvMetrics(cv.extracted_text, []) : null;
  const health = buildCareerHealthView({ user, cvMetrics });
  const newScore = health.career_health_score;

  const invisibleDeltaPct =
    baseline.invisible_hours && parsed.invisible_hours
      ? ((parsed.invisible_hours - baseline.invisible_hours) / baseline.invisible_hours) * 100
      : null;

  const burnoutLight = burnoutRiskFromPfi(
    parsed.burnout_screen != null ? parsed.burnout_screen / 1.2 : null,
  ).light;

  const cvAchievement = answers.find((a) => a.module_id === "cv_update")?.value;
  const summary = buildQuarterlyPulseSummary({
    quarter,
    prevScore,
    newScore,
    burnoutLight,
    invisibleHours: parsed.invisible_hours ?? null,
    invisibleDeltaPct,
    achievements: cvAchievement ? String(cvAchievement).slice(0, 120) : undefined,
  });

  const record = {
    quarter,
    completed_at: now,
    burnout_screen: parsed.burnout_screen,
    invisible_hours: parsed.invisible_hours,
    track_energy: parsed.track_energy,
    summary,
  };

  const updatedMeta = {
    ...meta,
    pulse_baseline: baseline,
    pulse_history: [record, ...(meta.pulse_history ?? [])].slice(0, 8),
    last_quarterly_summary: summary,
    cdi: { score: newScore, domains: Object.fromEntries(health.domains.map((d) => [d.label, d.score])) },
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: updatedMeta as Record<string, unknown> },
    auth.demo,
  );

  const triggers: string[] = [];
  if (parsed.burnout_screen != null && parsed.burnout_screen >= 4) {
    triggers.push("Full well-being assessment recommended at next login");
  }
  if (invisibleDeltaPct != null && invisibleDeltaPct > 25) {
    triggers.push("Full task burden reassessment recommended");
  }
  if (parsed.track_energy != null && parsed.track_energy < 4) {
    triggers.push("Career alignment conversation recommended");
  }

  return jsonOk({
    quarter,
    summary,
    career_health_score: newScore,
    triggers,
    completed_at: now,
  });
}
