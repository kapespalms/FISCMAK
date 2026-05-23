"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SoapDashboardBands } from "@/components/dashboard/SoapDashboardBands";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooterBar } from "@/components/dashboard/DashboardFooterBar";
import { AnnualRefreshPanel } from "@/components/workspace/AnnualRefreshPanel";
import { QuarterlyPulsePanel } from "@/components/workspace/QuarterlyPulsePanel";
import { useAppShell } from "@/components/layout/AppShell";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { buildSoapDashboardBands } from "@/lib/v2/dashboard-snapshot";
import {
  buildContextualQuickActions,
  buildDashboardHeader,
  type DashboardQuickAction,
} from "@/lib/v2/dashboard-architecture";
import { findGlowCell } from "@/lib/v2/dashboard-data";
import { loadSubjectiveCheckIn } from "@/lib/subjective-storage";
import { fetchGoals, saveOnboardingGoalsFromProposal, type CareerGoal } from "@/lib/goals";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";
import { DashboardRevealOverlay } from "@/components/onboarding/DashboardRevealOverlay";
import {
  GoalSettingPanel,
  defaultProposedGoals,
  type ProposedGoal,
} from "@/components/onboarding/GoalSettingPanel";
import {
  buildCareerDirectionAnnualGreeting,
  buildAnnualPlanResetGreeting,
} from "@/lib/mak-chatbot-states";
import { DashboardNotificationsBar } from "@/components/dashboard/DashboardNotificationsBar";
import { initAnnualMakSession } from "@/lib/annual-mak-client";
import { initQuarterlyMakSession } from "@/lib/quarterly-mak-client";
import { fetchDashboardWithTouchpoints } from "@/lib/v2/touchpoint-fetch";

type ProfileState = {
  name?: string | null;
  specialty?: string | null;
  career_stage?: CareerStage | null;
  practice_setting?: PracticeSetting | null;
  primary_career_track?: string | null;
  academic_rank?: AcademicRank | null;
  tier3_complete?: boolean;
};

export function DashboardWorkspace() {
  const { startMakFlow, openMakWithMessage, displayName } = useAppShell();
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [onboardingPhase, setOnboardingPhase] = useState<"reveal" | "goals" | null>(null);
  const [proposedGoals, setProposedGoals] = useState<ProposedGoal[]>([]);
  const [touchpointError, setTouchpointError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await fetchDashboardWithTouchpoints();
    setAnalytics(result.analytics);
    setTouchpointError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchGoals().then(setGoals);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/onboarding/status").then((r) => r.json()),
      fetch("/api/v1/users/me").then((r) => r.json()),
    ])
      .then(([status, me]) => {
        setProfile({
          ...status,
          academic_rank: me.academic_rank ?? null,
          name: me.name ?? status.name,
        });
        if (
          status.tier3_complete &&
          typeof window !== "undefined" &&
          !localStorage.getItem("fiscmak_goals_onboarding_complete")
        ) {
          setProposedGoals(
            defaultProposedGoals({
              primaryTrack: status.primary_career_track,
              careerObjective: status.career_objective,
            }),
          );
          setOnboardingPhase("reveal");
        }
        if (welcome && status.tier1_complete && !status.tier3_complete) {
          startMakFlow("onboarding");
        }
      })
      .catch(() => {
        if (welcome) startMakFlow("onboarding");
      });
  }, [welcome, startMakFlow]);

  useEffect(() => {
    const onTouchpointComplete = () => {
      void load();
    };
    window.addEventListener("fiscmak:touchpoint-complete", onTouchpointComplete);
    return () => window.removeEventListener("fiscmak:touchpoint-complete", onTouchpointComplete);
  }, [load]);

  function handleBandOpen(intent: "discuss" | "review" | "assess" | "plan" | "create", href: string) {
    startMakFlow(intent, href);
  }

  function beginAnnualMak(href?: string) {
    const name = displayName ?? "there";
    void initAnnualMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) {
        console.error(sessionError);
      }
      startMakFlow(
        "discuss",
        href,
        prompt ?? buildCareerDirectionAnnualGreeting(name),
        "annual",
      );
      if (href) router.push(href);
    });
  }

  function beginQuarterlyMak() {
    void initQuarterlyMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) {
        console.error(sessionError);
      }
      startMakFlow(
        "discuss",
        "/app/subjective",
        prompt ?? "Let's begin your quarterly check-in. How has your well-being been this quarter?",
        "quarterly",
      );
    });
  }

  function handleQuickAction(action: DashboardQuickAction) {
    if (action.label === "Begin annual refresh") {
      beginAnnualMak(action.href);
      return;
    }
    if (action.label === "Begin quarterly check-in") {
      beginQuarterlyMak();
      router.push(action.href);
      return;
    }
    if (action.label === "Review goals" && analytics?.annual_refresh?.due) {
      startMakFlow(
        "plan",
        action.href,
        buildAnnualPlanResetGreeting({ goals, analytics }),
      );
    } else {
      startMakFlow(action.intent, action.href);
    }
    router.push(action.href);
  }

  function handleFooterMessage(message: string) {
    openMakWithMessage(message);
  }

  const subjective = loadSubjectiveCheckIn();
  const soapBands = useMemo(() => {
    if (!analytics) return [];
    return buildSoapDashboardBands({
      analytics,
      subjective,
      goals,
      specialty: profile?.specialty ?? null,
      setting: profile?.practice_setting ?? null,
      level: profile?.career_stage ?? null,
      aspiration: profile?.primary_career_track ?? null,
      careerTrack: profile?.primary_career_track ?? null,
      rank: profile?.academic_rank ?? null,
    });
  }, [analytics, subjective, goals, profile]);

  const headerModel = useMemo(() => {
    if (!analytics) return null;
    return buildDashboardHeader({
      name: profile?.name,
      specialty: profile?.specialty,
      setting: profile?.practice_setting ?? null,
      rank: profile?.academic_rank ?? null,
      level: profile?.career_stage ?? null,
      track: profile?.primary_career_track ?? null,
      analytics,
      quarterlyPulse: analytics.quarterly_pulse,
    });
  }, [analytics, profile]);

  const glowCell = useMemo(() => {
    if (!analytics?.dashboard_lattice.length) return null;
    return findGlowCell(analytics.dashboard_lattice);
  }, [analytics]);

  const quickActions = useMemo(() => {
    if (!analytics) return [];
    const cvNeedsUpdate = soapBands.some((b) =>
      b.documentCards?.some((d) => d.actionLabel === "Update Now"),
    );
    const goalMilestoneDue = goals.some((g) =>
      g.recommended_actions?.some((a) => !a.includes("COMPLETED")),
    );
    return buildContextualQuickActions({
      quarterlyPulseDue: analytics.quarterly_pulse?.due ?? false,
      annualRefreshDue: analytics.annual_refresh?.due ?? false,
      cvNeedsUpdate,
      goalMilestoneDue,
      tier2Complete: analytics.onboarding_progress.tier2_complete,
    });
  }, [analytics, goals, soapBands]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col gap-4 pb-4">
      {onboardingPhase === "reveal" && (
        <DashboardRevealOverlay onComplete={() => setOnboardingPhase("goals")} />
      )}
      {onboardingPhase === "goals" && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-fm-background/95 p-6">
          <GoalSettingPanel
            goals={proposedGoals}
            onModifyWithMak={() =>
              startMakFlow("plan", "/app/plan", "I would like to modify one of my proposed goals.")
            }
            onConfirm={(confirmed) => {
              const saved = saveOnboardingGoalsFromProposal(
                confirmed.map((g) => ({
                  type: g.type,
                  title: g.title,
                  rationale: g.rationale,
                  milestones: g.milestones,
                })),
              );
              setGoals(saved);
              setOnboardingPhase(null);
            }}
          />
        </div>
      )}

      {loading || !analytics || !headerModel ? (
        <p className="text-sm text-fiscmak-muted">Loading career snapshot…</p>
      ) : (
        <>
          {touchpointError && (
            <div className="rounded-lg border border-fiscmak-amber bg-amber-50 px-4 py-3 text-sm text-fiscmak-ink">
              {touchpointError}
            </div>
          )}
          <DashboardHeader model={headerModel} />
          <DashboardNotificationsBar
            notifications={analytics.engagement_notifications ?? []}
          />
          {analytics.annual_refresh?.due && (
            <AnnualRefreshPanel
              status={analytics.annual_refresh}
              onComplete={() => void load()}
              onBeginWithMak={() => beginAnnualMak("/app/subjective")}
            />
          )}
          {!analytics.annual_refresh?.due && analytics.quarterly_pulse && (
            <QuarterlyPulsePanel
              status={analytics.quarterly_pulse}
              onComplete={() => void load()}
              onBeginWithMak={beginQuarterlyMak}
            />
          )}
          <SoapDashboardBands
            bands={soapBands}
            latticeCells={analytics.dashboard_lattice}
            glowCell={glowCell}
            onOpenBand={handleBandOpen}
          />
          <DashboardFooterBar
            quickActions={quickActions}
            onQuickAction={handleQuickAction}
            onSendMessage={handleFooterMessage}
            onOpenChat={() => openMakWithMessage()}
          />
        </>
      )}
    </div>
  );
}
