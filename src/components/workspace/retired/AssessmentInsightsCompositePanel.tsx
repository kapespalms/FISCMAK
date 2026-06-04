"use client";

/**
 * @retired 2026-05-21 — Composite metrics removed from user Insights tab.
 * Coherence score, CV-regex s-index, and recognition gap % lack validated evidence tiers.
 * Preserved for KP Admin Dashboard preview only.
 */

import {
  EyeOff,
  GitBranch,
  Users,
} from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { ASSESSMENT_MAK } from "@/lib/card-mak-prompts";
import type { AssessmentInsights } from "@/lib/v2/assessment-insights";

type AssessmentInsightsCompositePanelProps = {
  insights: Pick<
    AssessmentInsights,
    | "coherence_score"
    | "coherence_label"
    | "s_index"
    | "service_citizenship_summary"
    | "unrecognized_work_summary"
    | "recognition_gaps"
  >;
};

export function AssessmentInsightsCompositePanel({
  insights,
}: AssessmentInsightsCompositePanelProps) {
  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <CardSection
          compact
          eyebrow="Coherence"
          title={insights.coherence_score != null ? String(insights.coherence_score) : "—"}
          description={insights.coherence_label}
          icon={GitBranch}
          mak={ASSESSMENT_MAK.coherence}
        />
        <CardSection
          compact
          eyebrow="Service citizenship"
          title={insights.s_index != null ? String(insights.s_index) : "—"}
          description={
            insights.service_citizenship_summary ??
            "Breadth of service beyond clinical care"
          }
          icon={Users}
          mak={ASSESSMENT_MAK.service_citizenship}
        />
        <CardSection
          compact
          eyebrow="Unrecognized work"
          title="Hidden contribution"
          description={
            insights.unrecognized_work_summary ??
            "Work that may not appear on your CV or in compensation."
          }
          icon={EyeOff}
          mak={ASSESSMENT_MAK.unrecognized_work}
        />
      </div>

      <CardSection
        className="mb-6"
        eyebrow="CV gap analysis"
        title="Recognition gaps"
        icon={EyeOff}
        mak={ASSESSMENT_MAK.recognition_gaps}
      >
        <ul className="space-y-3 text-sm">
          {insights.recognition_gaps.map((g) => (
            <li key={g.domain} className="rounded-xl border border-cx-forest-dark/15 p-3">
              <p className="font-medium text-cx-text">{g.domain}</p>
              <p className="mt-1 text-cx-text/70">
                Conversation: {g.from_conversation}
              </p>
              <p className="text-cx-text/70">CV: {g.documented_on_cv}</p>
            </li>
          ))}
        </ul>
      </CardSection>
    </>
  );
}
