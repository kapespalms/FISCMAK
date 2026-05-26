import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { buildCareerHealthView } from "@/lib/v2/career-health-view";
import { buildCareerVaultModel } from "@/lib/v2/career-vault";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { buildObjectiveSummary } from "@/lib/v2/dashboard-data";
import {
  buildAnalyticsDashboard,
  fetchCareerGoals,
  fetchDocuments,
} from "@/lib/v2/db";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  buildOutputGenerationContext,
  buildOutputGenerationPrompt,
  buildOutputPrefill,
} from "@/lib/v2/output-generation";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { templateType, readiness } = body as {
    templateType?: string;
    readiness?: {
      target_rank: string;
      target_track: string;
      overall_readiness: number;
      promotion_timeline: string;
      strengths: { domain: string; score: number; note: string }[];
      gaps: { domain: string; score: number; note: string; suggestion: string }[];
    };
  };

  if (!templateType) {
    return jsonOk({ error: "validation_error", message: "templateType required." }, 400);
  }

  const meta = getOnboardingMetadata(user);
  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const cvMetrics = cv?.extracted_text ? computeCvMetrics(cv.extracted_text, []) : null;
  const health = buildCareerHealthView({ user, cvMetrics });
  const goals = await fetchCareerGoals(auth.userId, auth.demo);

  const objective = buildObjectiveSummary({
    user,
    meta,
    cvText: cv?.extracted_text,
    evidence: cvMetrics?.evidence ?? null,
    cvAvailable: Boolean(cv?.extracted_text),
    setting: user.practice_setting,
    enrichment: meta.enrichment_snapshot ?? null,
  });

  const vault = buildCareerVaultModel({
    setting: user.practice_setting,
    enrichment: meta.enrichment_snapshot ?? null,
    objective,
  });

  const ctx = await buildOutputGenerationContext({
    user,
    meta,
    templateType,
    vault,
    goals,
    health,
    cvText: cv?.extracted_text,
    cvEvidence: cvMetrics?.evidence ?? null,
    readiness: readiness ?? null,
    documents: docs,
  });

  const prefill = buildOutputPrefill(ctx);
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  let content = prefill;
  let source: "ai" | "vault_prefill" = "vault_prefill";

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 2048,
          messages: [
            {
              role: "user",
              content: buildOutputGenerationPrompt(ctx),
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.content?.find((b: { type: string }) => b.type === "text")?.text;
        if (text) {
          content = text;
          source = "ai";
        }
      }
    } catch (e) {
      console.error("Output generation failed:", e);
    }
  }

  return jsonOk({
    content,
    source,
    templateType,
    user_template: ctx.userOutputTemplate
      ? {
          file_name: ctx.userOutputTemplate.file_name,
          word_count: ctx.userOutputTemplate.word_count,
        }
      : null,
    enrichment_delta: ctx.enrichmentDelta,
    vault_summary: vault.summary,
    pending_review: vault.pending_review,
  });
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const dashboard = await buildAnalyticsDashboard(user, auth.demo);

  return jsonOk({
    career_vault: dashboard.career_vault,
    objective_summary: dashboard.objective_summary,
    enrichment_delta:
      dashboard.career_vault.changes_since_quarter ??
      dashboard.objective_summary.changesSinceQuarter,
  });
}
