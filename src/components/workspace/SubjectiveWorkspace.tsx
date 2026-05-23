"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricRow } from "@/components/ui/MetricRow";
import { useAppShell } from "@/components/layout/AppShell";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { dominantInvisibleWorkByLevel } from "@/lib/v2/invisible-work-taxonomy";
import type { CareerHealthView } from "@/lib/v2/career-health-view";
import type { PracticeSetting, CareerStage } from "@/lib/v2/onboarding-options";
import { buildCareerDirectionAnnualGreeting, careerAlignmentFromHealth } from "@/lib/mak-chatbot-states";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { initAnnualMakSession } from "@/lib/annual-mak-client";

type ProfileMeta = {
  career_track?: string | null;
  career_objective?: string | null;
  career_stage?: CareerStage | null;
  practice_setting?: PracticeSetting | null;
};

export function SubjectiveWorkspace() {
  const { startMakFlow, displayName } = useAppShell();
  const [health, setHealth] = useState<CareerHealthView | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [profile, setProfile] = useState<ProfileMeta>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [analyticsRes, profileRes] = await Promise.all([
        fetch("/api/v1/analytics/dashboard"),
        fetch("/api/v1/onboarding/touchpoint1"),
      ]);
      const analytics = await analyticsRes.json();
      const profileData = await profileRes.json();
      setHealth(analytics.career_health ?? null);
      setAnalytics(analytics as AnalyticsDashboard);
      setProfile(profileData.profile ?? {});
      setLastUpdate(profileData.profile?.updated_at ?? null);
    } catch {
      setHealth(null);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fulfillment = health?.wellbeing_metrics.find((m) => m.id === "professional_fulfillment");
  const strain = health?.wellbeing_metrics.find((m) => m.id === "burnout_risk");
  const taskBurden = health?.wellbeing_metrics.find((m) => m.id === "task_burden");
  const unrecognized = health?.wellbeing_metrics.find((m) => m.id === "unrecognized_work");
  const alignment = health ? careerAlignmentFromHealth(health) : null;

  if (loading) {
    return <p className="text-sm text-fiscmak-muted">Loading career perspective…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AcademicSoapSectionGate intent="discuss" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title">{SOAP_TAB.subjective.title}</h1>
          <p className="mt-1 text-sm text-fiscmak-muted">
            {SOAP_TAB.subjective.description}
            {lastUpdate && (
              <> · Last updated {new Date(lastUpdate).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            const name = displayName ?? "there";
            if (analytics?.annual_refresh?.due) {
              void initAnnualMakSession().then(({ prompt, error: sessionError }) => {
                if (sessionError) console.error(sessionError);
                startMakFlow(
                  "discuss",
                  undefined,
                  prompt ?? buildCareerDirectionAnnualGreeting(name),
                  true,
                );
              });
            } else {
              startMakFlow("discuss");
            }
          }}
        >
          {analytics?.annual_refresh?.due ? "Begin annual refresh" : "Begin quarterly assessment"}
        </Button>
      </div>

      <Card>
        <p className="text-sm text-fiscmak-muted">
          {SOAP_TAB.subjective.chatEntry} The following brief assessment takes
          approximately 5 minutes and covers professional satisfaction, task alignment, and
          career direction.
        </p>
      </Card>

      <div className="space-y-3">
        <MetricRow
          label="Career direction"
          summary={
            profile.career_objective
              ? `Primary career track: ${profile.career_track ?? "Not set"}. Stated 3-year objective: ${profile.career_objective}`
              : `Primary career track: ${profile.career_track ?? "Set with Coach Mak"}. Stated objective: pending quarterly check-in`
          }
          status="developing"
        />

        <MetricRow
          label="Professional fulfillment"
          summary={
            fulfillment?.summary ??
            "Complete your Career Perspective assessment with Coach Mak to populate this metric."
          }
          status={fulfillment?.status}
          trend={fulfillment ? "Updated from validated professional fulfillment instrument" : undefined}
        />

        <MetricRow
          label="Work-related strain"
          summary={
            strain?.summary ??
            "Work-related strain indicators appear after your first validated check-in."
          }
          status={strain?.status}
        />

        <MetricRow
          label="Task alignment"
          summary={
            taskBurden?.summary ??
            "Task alignment data identifies work time aligned with core professional role versus tasks outside primary responsibilities."
          }
          status={taskBurden?.status ?? "developing"}
        />

        <MetricRow
          label="Work engagement"
          summary="Work engagement is measured annually using validated instruments. Complete the full Career Perspective assessment with Coach Mak."
          status="stable"
        />

        <MetricRow
          label="Unrecognized work"
          summary={
            unrecognized?.summary ??
            `${dominantInvisibleWorkByLevel(profile.career_stage ?? null)} Estimate hours by category during your quarterly check-in.`
          }
          status={unrecognized?.status ?? "developing"}
        />

        <MetricRow
          label="Career alignment"
          summary={
            alignment != null
              ? `Career Alignment: ${alignment}% — Current professional activities are ${alignment >= 70 ? "well" : alignment >= 50 ? "moderately" : "partially"} aligned with stated career objectives`
              : "Career alignment is computed from aspirations versus your Career Map — complete Assessment to populate."
          }
          status={alignment != null ? (alignment >= 70 ? "strong" : alignment >= 50 ? "developing" : "needs_attention") : undefined}
          percentile={alignment}
        />
      </div>

      <Card>
        <p className="text-sm text-fiscmak-muted">
          Longitudinal trends for each metric appear after two or more quarterly updates.
        </p>
        <Link href="/app/plan" className="mt-3 inline-block text-sm font-medium text-fm-accent">
          View sustainability goals →
        </Link>
      </Card>
    </div>
  );
}
