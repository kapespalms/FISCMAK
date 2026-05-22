import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { fetchAssessments, fetchDocuments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";

const DOMAIN_LABELS: Record<string, string> = {
  teaching: "Teaching",
  scholarship: "Educational Scholarship",
  clinical: "Clinical",
  service: "Service/Leadership",
};

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  await getAppUser(auth.userId, auth.demo);
  const assessments = await fetchAssessments(auth.userId, auth.demo);
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const cv = documents.find((d) => d.document_type === "CV" && d.extracted_text);
  const tp5 = assessments.find((a) => a.touchpoint_number === 5 && a.completed_at);

  const strengths: { domain: string; score: number; note: string }[] = [];
  const gaps: { domain: string; score: number; note: string; suggestion: string }[] = [];

  if (cv?.extracted_text) {
    const metrics = computeCvMetrics(cv.extracted_text, assessments);
    for (const [key, score] of Object.entries(metrics.domain_scores)) {
      const label = DOMAIN_LABELS[key] ?? key;
      if (score >= 60) {
        strengths.push({
          domain: label,
          score,
          note: `CV evidence supports ${label.toLowerCase()} impact.`,
        });
      } else if (score < 40) {
        gaps.push({
          domain: label,
          score,
          note: `Limited ${label.toLowerCase()} documentation on CV.`,
          suggestion:
            key === "scholarship"
              ? "Connect with MedEd collaborators for a curriculum study or peer-reviewed education publication."
              : `Capture and document ${label.toLowerCase()} activities with Mak.`,
        });
      }
    }

    if (metrics.iwq >= 50) {
      gaps.push({
        domain: "Invisible Work Recognition",
        score: metrics.iwq,
        note: metrics.interpretation.iwq,
        suggestion:
          "Formalize mentoring, committee, or QI work in your promotion narrative and dossier.",
      });
    }

    return jsonOk({
      target_track: "Clinician-Educator",
      target_rank: "Associate Professor",
      strengths: strengths.length
        ? strengths
        : [{ domain: "Clinical", score: metrics.domain_scores.clinical, note: "Baseline clinical footprint detected." }],
      gaps: gaps.length
        ? gaps
        : [
            {
              domain: "Documentation",
              score: 40,
              note: "Continue building promotion-domain evidence.",
              suggestion: "Complete TP5 assessment for personalized gap analysis.",
            },
          ],
      overall_readiness: tp5?.score ?? Math.round(metrics.promotion_aligned_pct * 0.7 + metrics.s_index * 0.3),
      promotion_timeline: metrics.iwq >= 60 ? "24-30 months" : "18-24 months",
      cv_metrics: {
        s_index: metrics.s_index,
        iwq: metrics.iwq,
        promotion_aligned_pct: metrics.promotion_aligned_pct,
      },
    });
  }

  return jsonOk({
    target_track: "Clinician-Educator",
    target_rank: "Associate Professor",
    strengths: [
      { domain: "Teaching", score: 85, note: "Strong teaching hours and evaluations" },
      { domain: "Clinical", score: 90, note: "Active practice maintained" },
    ],
    gaps: [
      {
        domain: "Educational Scholarship",
        score: 40,
        note: "Need 2-3 peer-reviewed education publications",
        suggestion: "Connect with MedEd collaborators for a curriculum study.",
      },
    ],
    overall_readiness: tp5?.score ?? 65,
    promotion_timeline: "18-24 months",
    cv_metrics: null,
  });
}
