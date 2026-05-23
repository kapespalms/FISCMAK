"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  buildContextualQuickActions,
  buildDashboardHeader,
  type DashboardQuickAction,
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
  PROFILE_QUICK_ACTIONS,
  type ActiveTouchpointView,
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
    if (action.label === "Review goals" && analytics?.annual_refresh?.due) {
      startMakFlow("plan", action.href, buildAnnualPlanResetGreeting({ goals, analytics }));
    } else {
      startMakFlow(action.intent, action.href);
    }
    router.push(action.href);
  }

  function handleProfileQuickAction(action: (typeof PROFILE_QUICK_ACTIONS)[number]) {
    if (action.label === "Discuss energy") {
      beginQuarterlyMak();
      return;
    }
    if (action.message) {
      startMakFlow(action.intent, action.href, action.message);
    } else {
      startMakFlow(action.intent, action.href);
    }
    router.push(action.href);
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
    <div className="-m-6 md:-m-8">
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

      <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
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

            <div className="space-y-8 rounded-2xl bg-cx-cream p-6 md:p-8">
              <DashboardHeroMetrics
                header={headerModel}
                track={profile?.primary_career_track ?? null}
                nextMilestone={nextMilestone}
              />
            </div>

            <div className="space-y-8 rounded-2xl bg-cx-light-blue p-6 md:p-8">
              <DashboardProfileSection
                displayName={headerModel.displayName}
                rows={profileRows}
                onQuickAction={handleProfileQuickAction}
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

            <DashboardNextActions actions={nextActions} onAction={(a) => a.href && handleQuickAction({
              label: a.label,
              intent: "discuss",
              href: a.href,
            })} />

            <div className="rounded-2xl bg-cx-cream p-6 md:p-8">
              <DashboardDeepDiveTabs
                bands={soapBands}
                jobEngagement={analytics.job_engagement}
                onDiscuss={(href) => startMakFlow("discuss", href)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
