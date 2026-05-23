"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/brand/NavIcon";
import { DashboardOptionTabs } from "@/components/dashboard/DashboardOptionTabs";
import { DASHBOARD_OPTION_TABS } from "@/lib/mak-sections";
import { useAppShell } from "@/components/layout/AppShell";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { CvUploadPanel } from "@/components/documents/CvUploadPanel";
import { CareerHealthSnapshot } from "@/components/workspace/CareerHealthSnapshot";
import { CareerRecommendationsPanel } from "@/components/workspace/CareerRecommendationsPanel";
import { QuarterlyPulsePanel } from "@/components/workspace/QuarterlyPulsePanel";
import type { CareerRecommendation } from "@/lib/v2/career-recommendations";

const EMPTY_CV_METRICS: AnalyticsDashboard["cv_metrics"] = {
  available: false,
  s_index: null,
  iwq: null,
  promotion_aligned_pct: null,
  bits_score: null,
  domain_scores: null,
  invisible_work_signals: [],
  interpretation: { s_index: null, iwq: null },
};

export function DashboardWorkspace() {
  const { startMakFlow } = useAppShell();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<{
    tier3_complete?: boolean;
    specialty?: string;
    career_stage?: string;
    name?: string;
  } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/analytics/dashboard");
    const data = await res.json();
    setAnalytics(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    fetch("/api/v1/onboarding/status")
      .then((r) => r.json())
      .then((s) => {
        setOnboardingStatus(s);
        if (s.tier1_complete && !s.tier3_complete) {
          setShowWelcome(true);
        }
        if (welcome && s.tier1_complete && !s.tier3_complete) {
          startMakFlow("onboarding");
        }
      })
      .catch(() => {
        if (welcome) startMakFlow("onboarding");
      });
  }, [welcome, startMakFlow]);

  async function uploadCvFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", "CV");
    const res = await fetch("/api/v1/documents", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? "Upload failed");
    }

    await fetch("/api/v1/mempalace/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    setUploadSuccess(
      data.cv_metrics?.s_index != null
        ? "CV uploaded. Your Service Citizenship and Career Health snapshot are updating."
        : "CV uploaded successfully.",
    );
    await load();
    startMakFlow("upload");
  }

  function openUploadPanel() {
    setUploadOpen(true);
    setUploadError(null);
    setUploadSuccess(null);
  }

  function handleOptionTab(id: (typeof DASHBOARD_OPTION_TABS)[number]["id"], href: string) {
    setActiveTab(id);
    startMakFlow(id, href);
  }

  function discussRecommendation(rec: CareerRecommendation) {
    startMakFlow(
      "assess",
      undefined,
      `I'd like to focus on: ${rec.title}. ${rec.message}`,
    );
  }

  const cvMetrics = analytics?.cv_metrics ?? EMPTY_CV_METRICS;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Dashboard: Your Career At A Glance</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Career Health Score and coaching progress — plain language, no jargon
        </p>
      </div>

      <DashboardOptionTabs activeId={activeTab} onSelect={handleOptionTab} />

      {showWelcome && onboardingStatus && !onboardingStatus.tier3_complete && (
        <Card accent="green">
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">Welcome</p>
          <h2 className="mt-1 text-lg font-bold">
            {onboardingStatus.name ? `${onboardingStatus.name}, your dashboard is ready` : "Your dashboard is ready"}
          </h2>
          <p className="mt-2 text-sm text-fiscmak-muted">
            {onboardingStatus.specialty} · {onboardingStatus.career_stage}. Coach Mak is ready in
            the panel — start with the Lay of the Land tour, then chat for about 10–15 minutes.
            Questions you answer in conversation won&apos;t appear again as forms.
          </p>
        </Card>
      )}

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
          onClick={openUploadPanel}
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
          <div className="mt-4">
            <CvUploadPanel
              onUpload={async (file) => {
                setUploadError(null);
                setUploadSuccess(null);
                try {
                  await uploadCvFile(file);
                } catch (e) {
                  const message = e instanceof Error ? e.message : "Upload failed";
                  setUploadError(message);
                  throw e;
                }
              }}
            />
          </div>
          {uploadError && (
            <p className="mt-3 text-sm text-fiscmak-red">{uploadError}</p>
          )}
          {uploadSuccess && (
            <p className="mt-3 text-sm text-fiscmak-green">{uploadSuccess}</p>
          )}
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setUploadOpen(false)}
          >
            {uploadSuccess ? "Done" : "Cancel"}
          </Button>
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
            <Button onClick={openUploadPanel}>Upload CV</Button>
          </div>
        </Card>
      )}

      {loading || !analytics ? (
        <p className="text-sm text-fiscmak-muted">Loading analytics…</p>
      ) : (
        <>
          {analytics.quarterly_pulse && (
            <QuarterlyPulsePanel
              status={analytics.quarterly_pulse}
              onComplete={() => void load()}
            />
          )}

          {analytics.coaching_brief && (
            <CareerRecommendationsPanel
              brief={analytics.coaching_brief}
              onDiscuss={discussRecommendation}
            />
          )}

          {analytics.career_health ? (
            <Card>
              <CareerHealthSnapshot view={analytics.career_health} />
            </Card>
          ) : (
            <Card accent="green">
              <p className="font-semibold">Complete onboarding to see your Career Health snapshot</p>
              <p className="mt-2 text-sm text-fiscmak-muted">
                Finish your profile and conversation with Coach Mak — scores appear in plain career
                language, not formulas.
              </p>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Assessments</p>
              <p className="mt-2 text-3xl font-bold">
                {analytics.assessment_progress.completed_touchpoints}/7
              </p>
              <p className="mt-1 text-xs text-fiscmak-muted">
                {analytics.assessment_progress.completion_percentage}% complete
              </p>
              <Link href="/app/assessment" className="mt-2 inline-block text-xs text-fiscmak-green hover:underline">
                View insights →
              </Link>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Onboarding</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>{analytics.onboarding_progress.tier1_complete ? "✓" : "○"} Profile (5 anchors)</li>
                <li>{analytics.onboarding_progress.tier2_complete ? "✓" : "○"} Documents + reconcile</li>
                <li>{analytics.onboarding_progress.tier3_complete ? "✓" : "○"} Mak self-assessment</li>
              </ul>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">Well-being trend</p>
              <p className="mt-2 text-sm text-fiscmak-muted">
                {analytics.career_health?.wellbeing_metrics.find((m) => m.id === "burnout_risk")?.summary ??
                  "Complete your well-being check with Coach Mak."}
              </p>
            </Card>
          </div>

          {cvMetrics.available && cvMetrics.domain_scores && (
            <Card>
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">CV evidence (technical)</p>
              <p className="mt-1 text-xs text-fiscmak-muted">
                Domain scores from your CV — expand Career Health domains above for plain-language summaries.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(cvMetrics.domain_scores).map(([domain, score]) => (
                  <div key={domain} className="rounded-md border border-fiscmak-border px-3 py-2">
                    <p className="text-xs capitalize text-fiscmak-muted">{domain}</p>
                    <p className="text-2xl font-bold">{score}</p>
                  </div>
                ))}
              </div>
              {cvMetrics.invisible_work_signals.length > 0 && (
                <p className="mt-3 text-sm text-fiscmak-muted">
                  Unrecognized work signals: {cvMetrics.invisible_work_signals.join(", ")}
                </p>
              )}
            </Card>
          )}

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
                View patterns &amp; insights →
              </Link>
            </Card>
          )}

          <Card>
            <p className="text-xs font-semibold uppercase text-fiscmak-muted">Promotion readiness</p>
            <p className="mt-2 text-sm text-fiscmak-muted">
              Build your promotion dossier from assessment and coaching data.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/app/assessment">
                <Button variant="secondary">View career insights</Button>
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
