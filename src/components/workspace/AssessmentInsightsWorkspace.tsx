"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { PageShell } from "@/components/layout/PageShell";
import { useAppShell } from "@/components/layout/AppShell";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { ASSESSMENT_MAK } from "@/lib/card-mak-prompts";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import type { AssessmentInsights } from "@/lib/v2/assessment-insights";

function statusBadge(status: "not_started" | "in_progress" | "complete") {
  if (status === "complete") return <Badge>Complete</Badge>;
  if (status === "in_progress") return <Badge energy="energizing">In conversation</Badge>;
  return <Badge energy="neutral">Not yet explored</Badge>;
}

export function AssessmentInsightsWorkspace() {
  const { startMakFlow } = useAppShell();
  const [insights, setInsights] = useState<AssessmentInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/assessments/insights");
      const data = await res.json();
      setInsights(data);
    } catch {
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function discussWithMak() {
    startMakFlow("assess", undefined, ASSESSMENT_MAK.overview.question);
  }

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading your career insights…</p>;
  }

  if (!insights) {
    return (
      <PageShell eyebrow={SOAP_TAB.assessment.nav} title={SOAP_TAB.assessment.title} maxWidth="lg">
        <CardSection
          eyebrow={SOAP_TAB.assessment.nav}
          title="Insights from conversation"
          description="Insights appear as you talk with Mak. No forms — just conversation."
          icon={Target}
          mak={ASSESSMENT_MAK.overview}
          footer={
            <Button onClick={discussWithMak}>Talk with Mak</Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={SOAP_TAB.assessment.nav}
      title={SOAP_TAB.assessment.title}
      subtitle={SOAP_TAB.assessment.description}
      maxWidth="lg"
      action={<Button onClick={discussWithMak}>Discuss with Mak</Button>}
    >
      <AcademicSoapSectionGate intent="assess" />

      <CardSection
        className="mb-6"
        accent="green"
        eyebrow="Career pattern"
        title={insights.career_pattern.label}
        description={insights.career_pattern.narrative}
        icon={Target}
        mak={ASSESSMENT_MAK.career_pattern}
        footer={
          <p className="text-xs font-medium text-cx-forest-dark/70">
            Conversation coverage: {insights.conversation_coverage_pct}% of coaching signals captured
          </p>
        }
      />

      <CardSection
        className="mb-6"
        eyebrow="Career check-ins"
        title="Collected in conversation"
        description="Mak weaves these topics into natural dialogue over weeks. Status updates automatically."
        icon={MessageSquare}
        mak={ASSESSMENT_MAK.touchpoints}
      >
        <div className="space-y-3">
          {insights.touchpoints.map((tp) => (
            <div
              key={tp.number}
              className="rounded-xl border border-cx-forest-dark/15 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-cx-forest-dark">{tp.title}</p>
                  <p className="text-xs text-cx-forest-dark/70">{tp.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(tp.status)}
                  <span className="text-xs text-cx-forest-dark/60">{tp.coverage_pct}% captured</span>
                  <MakDiscussLink
                    mak={ASSESSMENT_MAK.touchpoint(tp.number, tp.title)}
                    className="text-xs text-cx-forest-dark hover:text-cx-forest-dark/80"
                  />
                </div>
              </div>
              {tp.insights.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-cx-forest-dark/70">
                  {tp.insights.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              )}
              {tp.collected_signals.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {tp.collected_signals.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-md bg-cx-forest-dark/[0.04] px-3 py-2 text-xs"
                    >
                      <p className="font-medium text-cx-forest-dark">{s.label}</p>
                      <p className="mt-0.5 text-cx-forest-dark/70">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardSection>

      <div className="grid gap-4 md:grid-cols-2">
        <CardSection
          eyebrow="Profile analysis"
          title="Strengths & opportunities"
          icon={Sparkles}
          mak={ASSESSMENT_MAK.strengths}
        >
          <ul className="space-y-3 text-sm">
            {insights.strengths.map((s) => (
              <li key={`${s.domain}-${s.note}`} className="flex gap-2">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    s.status === "strength"
                      ? "bg-[#5FD65F]"
                      : s.status === "risk"
                        ? "bg-cx-attention"
                        : "bg-cx-forest-dark/40"
                  }`}
                />
                <div>
                  <p className="font-medium text-cx-forest-dark">{s.domain}</p>
                  <p className="text-cx-forest-dark/70">{s.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardSection>
      </div>

      <CardSection
        className="mt-6"
        accent="amber"
        eyebrow="Next step"
        title="Continue with Mak"
        description={insights.mak_suggested_opener}
        icon={MessageSquare}
        mak={ASSESSMENT_MAK.overview}
        footer={
          <>
            <Link href="/app/output">
              <Button variant="secondary">Create output from insights</Button>
            </Link>
            <Link href="/app/plan">
              <Button variant="secondary">Plan next steps</Button>
            </Link>
          </>
        }
      />
    </PageShell>
  );
}
