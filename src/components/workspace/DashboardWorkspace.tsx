"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/brand/NavIcon";
import { DashboardOptionTabs } from "@/components/dashboard/DashboardOptionTabs";
import { DASHBOARD_OPTION_TABS } from "@/lib/mak-sections";
import { useAppShell } from "@/components/layout/AppShell";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { ACCEPTED_CV_ACCEPT } from "@/lib/v2/document-upload";

export function DashboardWorkspace() {
  const { startMakFlow } = useAppShell();
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/analytics/dashboard");
    const data = await res.json();
    setAnalytics(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", "CV");
    await fetch("/api/v1/documents", { method: "POST", body: form });
    await fetch("/api/v1/mempalace/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    startMakFlow("upload", "/app/objective?tab=documents");
    setUploadOpen(false);
    void load();
    e.target.value = "";
  }

  function handleOptionTab(id: (typeof DASHBOARD_OPTION_TABS)[number]["id"], href: string) {
    setActiveTab(id);
    startMakFlow(id, href);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Dashboard: Your Career At A Glance</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">Career Readiness Index and coaching progress</p>
      </div>

      <DashboardOptionTabs activeId={activeTab} onSelect={handleOptionTab} />

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => startMakFlow("capture")}
          className="flex min-h-12 items-center gap-3 rounded-lg bg-fiscmak-green px-4 py-3 text-left text-white hover:bg-fiscmak-green-dark"
        >
          <Zap size={22} />
          <div>
            <p className="font-semibold">Capture Invisible Work</p>
            <p className="text-xs opacity-90">Log an activity in 30 seconds</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="flex min-h-12 items-center gap-3 rounded-lg border border-fiscmak-border bg-white px-4 py-3 text-left hover:bg-fiscmak-subtle"
        >
          <Upload size={22} className="text-fiscmak-muted" />
          <div>
            <p className="font-semibold">Upload Document</p>
            <p className="text-xs text-fiscmak-muted">CV, dossier, or template</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => startMakFlow("create", "/app/output")}
          className="flex min-h-12 items-center gap-3 rounded-lg border border-fiscmak-border bg-white px-4 py-3 text-left hover:bg-fiscmak-subtle"
        >
          <NavIcon src="/brand/nav/output.png" alt="Create" size={22} />
          <div>
            <p className="font-semibold">Create Output</p>
            <p className="text-xs text-fiscmak-muted">Narrative, CV, or review</p>
          </div>
        </button>
      </div>

      {uploadOpen && (
        <Card>
          <h2 className="font-semibold">Upload document</h2>
          <input type="file" accept={ACCEPTED_CV_ACCEPT} className="mt-4 block w-full text-sm" onChange={handleUploadFile} />
          <Button variant="secondary" className="mt-3" onClick={() => setUploadOpen(false)}>Cancel</Button>
        </Card>
      )}

      {analytics && !analytics.onboarding_progress.tier2_complete && (
        <Card className="border-fiscmak-green/40 bg-fiscmak-green-light/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Complete Tier 2 — upload your CV</p>
              <p className="text-sm text-fiscmak-muted">
                Optional, but helps Mak personalize coaching and MemPalace memory.
              </p>
            </div>
            <Link href="/app/onboarding/tier2">
              <Button>Upload CV</Button>
            </Link>
          </div>
        </Card>
      )}

      {loading || !analytics ? (
        <p className="text-sm text-fiscmak-muted">Loading analytics…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card accent="green">
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Career Readiness</p>
              <p className="mt-2 text-4xl font-bold text-fiscmak-green">{analytics.career_readiness_index}</p>
              <p className="mt-1 text-xs text-fiscmak-muted">CRI composite score</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Onboarding</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>{analytics.onboarding_progress.tier1_complete ? "✓" : "○"} Tier 1</li>
                <li>{analytics.onboarding_progress.tier2_complete ? "✓" : "○"} Tier 2 CV</li>
                <li>{analytics.onboarding_progress.tier3_complete ? "✓" : "○"} Tier 3 goals</li>
              </ul>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Assessments</p>
              <p className="mt-2 text-3xl font-bold">
                {analytics.assessment_progress.completed_touchpoints}/7
              </p>
              <p className="mt-1 text-xs text-fiscmak-muted">
                {analytics.assessment_progress.completion_percentage}% complete
              </p>
              <Link href="/app/assessment" className="mt-2 inline-block text-xs text-fiscmak-green hover:underline">
                Continue →
              </Link>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Burnout trend</p>
              <p className="mt-2 text-3xl font-bold">
                {analytics.burnout_trend.current_score ?? "—"}
              </p>
              <p className="mt-1 text-xs capitalize text-fiscmak-muted">{analytics.burnout_trend.trend}</p>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Job engagement</p>
              <p className="mt-2 text-sm">
                Viewed {analytics.job_engagement.jobs_viewed} · Saved {analytics.job_engagement.jobs_saved}
              </p>
              {analytics.job_engagement.average_match_score != null && (
                <p className="text-sm text-fiscmak-muted">
                  Avg match {Math.round(analytics.job_engagement.average_match_score)}%
                </p>
              )}
              <Link href="/app/jobs" className="mt-2 inline-block text-sm text-fiscmak-green hover:underline">
                View job matches →
              </Link>
            </Card>
            {analytics.next_touchpoint && (
              <Card accent="amber">
                <p className="text-xs font-semibold uppercase text-fiscmak-muted">Next touchpoint</p>
                <p className="mt-2 font-semibold">
                  TP{analytics.next_touchpoint.number}: {analytics.next_touchpoint.category}
                </p>
                {analytics.next_touchpoint.days_until_due != null && (
                  <p className="mt-1 text-sm text-fiscmak-muted">
                    Due in {analytics.next_touchpoint.days_until_due} days
                  </p>
                )}
                <Link href="/app/assessment" className="mt-2 inline-block text-sm text-fiscmak-green hover:underline">
                  Start assessment →
                </Link>
              </Card>
            )}
          </div>

          <Card>
            <p className="text-xs font-semibold uppercase text-fiscmak-muted">Promotion readiness</p>
            <p className="mt-2 text-sm text-fiscmak-muted">
              Build your promotion dossier from assessment and coaching data.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/app/assessment">
                <Button variant="secondary">Assess patterns</Button>
              </Link>
              <Link href="/app/output">
                <Button>Create narrative</Button>
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
