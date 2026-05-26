"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Compass, TrendingUp } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { MetricRow } from "@/components/ui/MetricRow";
import { PageShell } from "@/components/layout/PageShell";
import { useAppShell } from "@/components/layout/AppShell";
import { useAnalytics } from "@/components/layout/AnalyticsProvider";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { dominantInvisibleWorkByLevel } from "@/lib/v2/invisible-work-taxonomy";
import type { PracticeSetting, CareerStage } from "@/lib/v2/onboarding-options";
import { buildCareerDirectionAnnualGreeting } from "@/lib/mak-chatbot-states";
import { initAnnualMakSession } from "@/lib/annual-mak-client";
import { initQuarterlyMakSession } from "@/lib/quarterly-mak-client";
import { AnnualRefreshPanel } from "@/components/workspace/AnnualRefreshPanel";
import { QuarterlyPulsePanel } from "@/components/workspace/QuarterlyPulsePanel";
import { WellnessResourcesSection } from "@/components/layout/WellnessResourcesSection";
import { SUBJECTIVE_MAK } from "@/lib/card-mak-prompts";

type ProfileMeta = {
  career_track?: string | null;
  career_objective?: string | null;
  career_stage?: CareerStage | null;
  practice_setting?: PracticeSetting | null;
};

export function SubjectiveWorkspace() {
  const { startMakFlow, displayName } = useAppShell();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const [profile, setProfile] = useState<ProfileMeta>({});
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/v1/onboarding/touchpoint1");
      const profileData = await profileRes.json();
      setProfile(profileData.profile ?? {});
      setProgramSlug(profileData.onboarding?.program_slug ?? null);
      setLastUpdate(profileData.profile?.updated_at ?? null);
    } catch {
      setProfile({});
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    const onUpdate = () => void loadProfile();
    window.addEventListener("fiscmak:touchpoint-complete", onUpdate);
    return () => window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
  }, [loadProfile]);

  function handleTouchpointComplete() {
    void loadProfile();
    window.dispatchEvent(new CustomEvent("fiscmak:touchpoint-complete"));
  }

  const health = analytics?.career_health ?? null;
  const loading = analyticsLoading || profileLoading;

  function beginAnnualMak() {
    const name = displayName ?? "there";
    void initAnnualMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) console.error(sessionError);
      startMakFlow(
        "discuss",
        undefined,
        prompt ?? buildCareerDirectionAnnualGreeting(name),
        "annual",
      );
    });
  }

  function beginQuarterlyMak() {
    void initQuarterlyMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) console.error(sessionError);
      startMakFlow(
        "discuss",
        undefined,
        prompt ?? "Let's begin your quarterly check-in. How has your well-being been this quarter?",
        "quarterly",
      );
    });
  }

  const fulfillment = health?.wellbeing_metrics.find((m) => m.id === "professional_fulfillment");
  const strain = health?.wellbeing_metrics.find((m) => m.id === "burnout_risk");
  const taskBurden = health?.wellbeing_metrics.find((m) => m.id === "task_burden");
  const unrecognized = health?.wellbeing_metrics.find((m) => m.id === "unrecognized_work");

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading career perspective…</p>;
  }

  const subtitle = [
    SOAP_TAB.subjective.description,
    lastUpdate ? `Last updated ${new Date(lastUpdate).toLocaleDateString()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const touchpointDue = analytics?.annual_refresh?.due || analytics?.quarterly_pulse?.due;

  return (
    <PageShell
      eyebrow={SOAP_TAB.subjective.nav}
      title={SOAP_TAB.subjective.title}
      subtitle={subtitle}
      maxWidth="lg"
    >
      <AcademicSoapSectionGate intent="discuss" />

      {analytics?.annual_refresh?.due && (
        <div className="mb-6">
          <AnnualRefreshPanel
            status={analytics.annual_refresh}
            onBeginWithMak={beginAnnualMak}
            onComplete={handleTouchpointComplete}
          />
        </div>
      )}

      {!analytics?.annual_refresh?.due && analytics?.quarterly_pulse?.due && (
        <div className="mb-6">
          <QuarterlyPulsePanel
            status={analytics.quarterly_pulse}
            onBeginWithMak={beginQuarterlyMak}
            onComplete={handleTouchpointComplete}
          />
        </div>
      )}

      {!touchpointDue && (
        <CardSection
          className="mb-6"
          eyebrow="Getting started"
          title={`${SOAP_TAB.subjective.title} assessment`}
          description={SOAP_TAB.subjective.chatEntry}
          icon={Compass}
          mak={SUBJECTIVE_MAK.intro}
        />
      )}

      <div className="cx-section-surface space-y-3">
        <MetricRow
          label="Career direction"
          summary={
            profile.career_objective
              ? `Primary career track: ${profile.career_track ?? "Not set"}. Stated 3-year objective: ${profile.career_objective}`
              : `Primary career track: ${profile.career_track ?? "Set with Coach Mak"}. Stated objective: pending quarterly check-in`
          }
          status="developing"
          mak={SUBJECTIVE_MAK.career_direction}
        />

        <MetricRow
          label="Professional fulfillment"
          summary={
            fulfillment?.summary ??
            "Complete your Perspective assessment with Coach Mak to populate this metric."
          }
          status={fulfillment?.status}
          trend={fulfillment ? "Updated from validated professional fulfillment instrument" : undefined}
          mak={SUBJECTIVE_MAK.professional_fulfillment}
        />

        <MetricRow
          label="Work-related strain"
          summary={
            strain?.summary ??
            "Work-related strain indicators appear after your first validated check-in."
          }
          status={strain?.status}
          mak={SUBJECTIVE_MAK.work_strain}
        />

        <MetricRow
          label="Task alignment"
          summary={
            taskBurden?.summary ??
            "Task alignment data identifies work time aligned with core professional role versus tasks outside primary responsibilities."
          }
          status={taskBurden?.status ?? "developing"}
          mak={SUBJECTIVE_MAK.task_alignment}
        />

        <MetricRow
          label="Work engagement"
          summary="Work engagement is measured annually using validated instruments. Complete the full Perspective assessment with Coach Mak."
          status="stable"
          mak={SUBJECTIVE_MAK.work_engagement}
        />

        <MetricRow
          label="Unrecognized work"
          summary={
            unrecognized?.summary ??
            `${dominantInvisibleWorkByLevel(profile.career_stage ?? null)} Estimate hours by category during your quarterly check-in.`
          }
          status={unrecognized?.status ?? "developing"}
          mak={SUBJECTIVE_MAK.unrecognized_work}
        />

      </div>

      <CardSection
        className="mt-6"
        eyebrow="Longitudinal view"
        title="Trends over time"
        description="Longitudinal trends for each metric appear after two or more quarterly updates."
        icon={TrendingUp}
        mak={SUBJECTIVE_MAK.trends}
        footer={
          <Link
            href="/app/plan"
            className="inline-flex items-center gap-1 text-sm font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
          >
            View sustainability goals
            <ChevronRight size={16} />
          </Link>
        }
      />

      <WellnessResourcesSection preferOhio={programSlug === "uh-psych-cmc"} />
    </PageShell>
  );
}
