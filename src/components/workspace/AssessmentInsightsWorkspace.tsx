"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/layout/PageShell";
import { useAppShell } from "@/components/layout/AppShell";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
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
    startMakFlow("assess");
  }

  if (loading) {
    return <p className="text-sm text-cx-text-secondary">Loading your career insights…</p>;
  }

  if (!insights) {
    return (
      <PageShell eyebrow="Career profile" title="Assessment insights" maxWidth="lg">
        <Card>
          <p className="text-cx-body">
            Insights appear as you talk with Coach Mak. No forms — just conversation.
          </p>
          <Button className="mt-4" onClick={discussWithMak}>
            Talk with Coach Mak
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Career profile"
      title="Assessment insights"
      subtitle="Synthesized Career Health Score, Career Map, and benchmarked standing"
      maxWidth="lg"
      action={<Button onClick={discussWithMak}>Discuss with Coach Mak</Button>}
    >
      <AcademicSoapSectionGate intent="assess" />

      <Card accent="green" className="mb-6">
        <p className="text-cx-label uppercase">Career pattern</p>
        <h2 className="mt-2 text-cx-h2">{insights.career_pattern.label}</h2>
        <p className="mt-2 text-cx-body">{insights.career_pattern.narrative}</p>
        <p className="mt-3 text-cx-label">
          Conversation coverage: {insights.conversation_coverage_pct}% of coaching signals captured
        </p>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">Coherence</p>
          <p className="mt-2 text-4xl font-bold text-fiscmak-green">
            {insights.coherence_score ?? "—"}
          </p>
          <p className="mt-1 text-xs text-fiscmak-muted">{insights.coherence_label}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">Service Citizenship</p>
          <p className="mt-2 text-4xl font-bold">{insights.s_index ?? "—"}</p>
          <p className="mt-1 text-xs text-fiscmak-muted">
            {insights.service_citizenship_summary ?? "Breadth of service beyond clinical care"}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">Unrecognized Work</p>
          <p className="mt-2 text-sm text-fiscmak-muted">
            {insights.unrecognized_work_summary ??
              "Work that may not appear on your CV or in compensation — discuss with Mak."}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Seven touchpoints — collected in conversation</h2>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Mak weaves these topics into natural dialogue over weeks. Status updates automatically.
        </p>
        <div className="mt-4 space-y-3">
          {insights.touchpoints.map((tp) => (
            <div
              key={tp.number}
              className="rounded-lg border border-fiscmak-border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    TP{tp.number}: {tp.title}
                  </p>
                  <p className="text-xs text-fiscmak-muted">{tp.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(tp.status)}
                  <span className="text-xs text-fiscmak-muted">{tp.coverage_pct}% captured</span>
                </div>
              </div>
              {tp.insights.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-fiscmak-muted">
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
                      className="rounded-md bg-fiscmak-subtle px-3 py-2 text-xs"
                    >
                      <p className="font-medium text-foreground">{s.label}</p>
                      <p className="mt-0.5 text-fiscmak-muted">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Strengths &amp; opportunities</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {insights.strengths.map((s) => (
              <li key={`${s.domain}-${s.note}`} className="flex gap-2">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    s.status === "strength"
                      ? "bg-fiscmak-green"
                      : s.status === "risk"
                        ? "bg-fiscmak-red"
                        : "bg-fiscmak-amber"
                  }`}
                />
                <div>
                  <p className="font-medium">{s.domain}</p>
                  <p className="text-fiscmak-muted">{s.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-semibold">Recognition gaps</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {insights.recognition_gaps.map((g) => (
              <li key={g.domain} className="rounded-md border border-fiscmak-border p-3">
                <p className="font-medium">{g.domain}</p>
                <p className="mt-1 text-fiscmak-muted">
                  Conversation: {g.from_conversation}
                </p>
                <p className="text-fiscmak-muted">CV: {g.documented_on_cv}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card accent="amber">
        <p className="font-semibold">Continue with Mak</p>
        <p className="mt-2 text-sm text-fiscmak-muted">{insights.mak_suggested_opener}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={discussWithMak}>Open Coach Mak</Button>
          <Link href="/app/output">
            <Button variant="secondary">Create output from insights</Button>
          </Link>
          <Link href="/app/plan">
            <Button variant="secondary">Plan next steps</Button>
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
