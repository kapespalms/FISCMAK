"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { TouchpointStatusBar } from "@/components/dashboard/TouchpointStatusBar";
import { DashboardHeroMetrics } from "@/components/dashboard/DashboardHeroMetrics";
import { DashboardProfileSection } from "@/components/dashboard/DashboardProfileSection";
import { DashboardGoalsGrid } from "@/components/dashboard/DashboardGoalsGrid";
import { DashboardNextActions } from "@/components/dashboard/DashboardNextActions";
import { DashboardDeepDiveTabs } from "@/components/dashboard/DashboardDeepDiveTabs";
import { DashboardActiveTouchpoint } from "@/components/dashboard/DashboardActiveTouchpoint";
import { useAppShell } from "@/components/layout/AppShell";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { buildSoapDashboardBands } from "@/lib/v2/dashboard-snapshot";
import type { DashboardQuickAction } from "@/lib/v2/dashboard-architecture";
import {
  buildContextualQuickActions,
  buildDashboardHeader,
} from "@/lib/v2/dashboard-architecture";
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
import { initAnnualMakSession } from "@/lib/annual-mak-client";
import { initQuarterlyMakSession } from "@/lib/quarterly-mak-client";
import { fetchDashboardWithTouchpoints } from "@/lib/v2/touchpoint-fetch";
import {
  buildActiveTouchpointView,
  buildGoalCards,
  buildHealthStatusRow,
  buildNextActions,
  buildProfileRows,
  buildProgressStatus,
  touchpointBarStates,
  DASHBOARD_MAK_ACTIONS,
  makActionGreeting,
  type ActiveTouchpointView,
  type DashboardMakAction,
} from "@/lib/v2/dashboard-redesign";
type ProfileState = {
  name?: string | null;
  specialty?: string | null;
  career_stage?: CareerStage | null;
  practice_setting?: PracticeSetting | null;
  primary_career_track?: string | null;
  academic_rank?: AcademicRank | null;
  tier3_complete?: boolean;
  career_objective?: string | null;
};

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 rounded-xl bg-cx-border" />
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-xl bg-cx-border" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-cx-border" />
    </div>
  );
}

export function DashboardWorkspace() {
  const { startMakFlow, openMak, focusMakInput, displayName } = useAppShell();
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
    const onRefresh = () => {
      void load();
    };
    window.addEventListener("fiscmak:touchpoint-complete", onRefresh);
    window.addEventListener("fiscmak:activity-logged", onRefresh);
    return () => {
      window.removeEventListener("fiscmak:touchpoint-complete", onRefresh);
      window.removeEventListener("fiscmak:activity-logged", onRefresh);
    };
  }, [load]);

  useEffect(() => {
    if (loading || onboardingPhase || !profile?.tier3_complete) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem("fiscmak_dashboard_mak_intro")) return;
    localStorage.setItem("fiscmak_dashboard_mak_intro", "1");
    openMak();
  }, [loading, onboardingPhase, profile?.tier3_complete, openMak]);

  function beginAnnualMak(href?: string) {
    const name = displayName ?? "there";
    void initAnnualMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) console.error(sessionError);
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
      if (sessionError) console.error(sessionError);
      startMakFlow(
        "discuss",
        "/app/subjective",
        prompt ?? "Let's begin your quarterly check-in. How has your well-being been this quarter?",
        "quarterly",
      );
    });
  }

  function handleQuickAction(action: DashboardQuickAction) {
    if (action.label === "Annual refresh") {
      beginAnnualMak(action.href);
      return;
    }
    if (action.label === "Quarterly check-in") {
      beginQuarterlyMak();
      router.push(action.href);
      return;
    }
    if (action.intent === "capture") {
      const captureAction = DASHBOARD_MAK_ACTIONS.find((a) => a.id === "capture");
      if (captureAction) {
        startMakFlow("capture", action.href, makActionGreeting(captureAction));
        focusMakInput();
      }
      return;
    }
    if (action.label === "Review goals" && analytics?.annual_refresh?.due) {
      startMakFlow("plan", action.href, buildAnnualPlanResetGreeting({ goals, analytics }));
    } else {
      startMakFlow(action.intent, action.href);
    }
    router.push(action.href);
  }

  function handleMakAction(action: DashboardMakAction) {
    if (action.id === "discuss-energy" && analytics?.quarterly_pulse?.due) {
      beginQuarterlyMak();
      return;
    }
    startMakFlow(action.intent, action.href, makActionGreeting(action));
    if (action.intent === "capture") {
      focusMakInput();
      return;
    }
    if (action.href !== "/app/dashboard") {
      router.push(action.href);
    }
  }

  function handleTouchpointContinue(tp: ActiveTouchpointView) {
    if (tp.kind === "annual") {
      beginAnnualMak("/app/subjective");
      return;
    }
    if (tp.kind === "quarterly") {
      beginQuarterlyMak();
      return;
    }
    startMakFlow("assess", "/app/assessment");
    router.push("/app/assessment");
  }

  function handleGoalStart(goalId: string) {
    const goal = goals.find((g) => g.id === goalId);
    startMakFlow(
      "plan",
      "/app/plan",
      goal ? `I want to work on my goal: ${goal.goal_title}` : undefined,
    );
    router.push("/app/plan");
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
      careerObjective: profile?.career_objective ?? null,
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

  const subjectiveBand = soapBands.find((b) => b.id === "subjective");
  const profileRows = useMemo(() => {
    if (!analytics || !headerModel) return [];
    const base = buildProfileRows(subjectiveBand?.metrics ?? []);
    return [...base, buildProgressStatus(analytics), buildHealthStatusRow(headerModel)];
  }, [analytics, headerModel, subjectiveBand]);

  const goalCards = useMemo(
    () => buildGoalCards(goals, analytics?.goal_milestone_history ?? []),
    [goals, analytics],
  );

  const touchpointViews = useMemo(
    () => (analytics ? buildActiveTouchpointView(analytics) : { active: null, upcoming: null }),
    [analytics],
  );

  const nextActions = useMemo(
    () =>
      analytics
        ? buildNextActions({
            analytics,
            notifications: analytics.engagement_notifications ?? [],
            quickActions,
            jobSearchActive: analytics.job_search_active,
          })
        : [],
    [analytics, quickActions],
  );

  const tpStates = useMemo(
    () => touchpointBarStates(analytics?.assessment_progress.completed_touchpoints ?? 0),
    [analytics],
  );

  const nextMilestone = useMemo(() => {
    for (const g of goals) {
      const pending = g.recommended_actions?.find((a) => !/COMPLETED/i.test(a));
      if (pending) return pending.replace(/^Q\d+ \d{4}:\s*/, "");
    }
    return analytics?.next_touchpoint?.category ?? null;
  }, [goals, analytics]);

  return (
    <>
      {onboardingPhase === "reveal" && (
        <DashboardRevealOverlay onComplete={() => setOnboardingPhase("goals")} />
      )}
      {onboardingPhase === "goals" && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cx-cream/95 p-6">
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

      <div className="mx-auto max-w-[1200px] space-y-8">
        {loading || !analytics || !headerModel ? (
          <DashboardSkeleton />
        ) : (
          <>
            {touchpointError && (
              <div className="rounded-xl border border-cx-attention bg-amber-50 px-4 py-3 text-sm text-cx-text">
                {touchpointError}
              </div>
            )}

            <TouchpointStatusBar states={tpStates} />

            <DashboardWelcome
              displayName={headerModel.displayName}
              lastUpdated={headerModel.lastUpdated}
            />

            <div className="cx-section-surface space-y-8">
              <DashboardHeroMetrics
                header={headerModel}
                track={profile?.primary_career_track ?? null}
                nextMilestone={nextMilestone}
              />
            </div>

            <div className="cx-section-surface space-y-8">
              <DashboardProfileSection
                displayName={headerModel.displayName}
                rows={profileRows}
                onMakAction={handleMakAction}
              />
            </div>

            {(touchpointViews.active || touchpointViews.upcoming) && (
              <DashboardActiveTouchpoint
                active={touchpointViews.active}
                upcoming={touchpointViews.upcoming}
                onContinue={handleTouchpointContinue}
                onViewHistory={() => router.push("/app/assessment")}
              />
            )}

            <DashboardGoalsGrid
              goals={goalCards}
              onStart={handleGoalStart}
              onDetails={() => router.push("/app/plan")}
            />

            <DashboardNextActions
              actions={nextActions}
              onAction={(a) => {
                if (!a.href) return;
                handleQuickAction({
                  label: a.label,
                  intent: a.intent ?? "discuss",
                  href: a.href,
                });
              }}
            />

            <div className="cx-section-surface">
              <DashboardDeepDiveTabs
                bands={soapBands}
                jobEngagement={analytics.job_engagement}
                onDiscuss={(href) => startMakFlow("discuss", href)}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
