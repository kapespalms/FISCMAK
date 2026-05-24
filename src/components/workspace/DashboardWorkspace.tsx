"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { useAppShell } from "@/components/layout/AppShell";
import { useAnalytics } from "@/components/layout/AnalyticsProvider";
import { buildSoapDashboardBands } from "@/lib/v2/dashboard-snapshot";
import { buildDashboardHeader } from "@/lib/v2/dashboard-architecture";
import { loadSubjectiveCheckIn } from "@/lib/subjective-storage";
import { GOAL_MODIFY_PROMPT } from "@/lib/v2/goal-framework";
import { buildGoalSettingIntro } from "@/lib/v2/goal-setting-mak-flow";
import { fetchGoals, saveOnboardingGoalsFromProposal, type CareerGoal } from "@/lib/goals";
import { GOAL_FRAMEWORK_LABELS } from "@/lib/v2/soap-tab-spec";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";
import { DashboardRevealOverlay } from "@/components/onboarding/DashboardRevealOverlay";
import {
  GoalSettingPanel,
  defaultProposedGoals,
  type ProposedGoal,
} from "@/components/onboarding/GoalSettingPanel";
import { buildCareerDirectionAnnualGreeting } from "@/lib/mak-chatbot-states";
import { initAnnualMakSession } from "@/lib/annual-mak-client";
import { initQuarterlyMakSession } from "@/lib/quarterly-mak-client";
import {
  buildActiveTouchpointView,
  buildDashboardDueNow,
  buildDashboardSecondaryAlerts,
  buildGoalCards,
  buildHealthStatusRow,
  buildProfileRows,
  buildProgressStatus,
  buildRecognitionGapRow,
  touchpointBarStates,
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
    <div className="animate-pulse rounded-2xl bg-cx-forest-dark/20 p-6">
      <div className="h-8 w-2/3 rounded-lg bg-cx-forest-dark/30" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-xl bg-white/40" />
        <div className="h-48 rounded-xl bg-white/40" />
      </div>
    </div>
  );
}

export function DashboardWorkspace() {
  const { startMakFlow, openMak, displayName } = useAppShell();
  const { analytics, loading, error: touchpointError } = useAnalytics();
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [onboardingPhase, setOnboardingPhase] = useState<"reveal" | "goals" | null>(null);
  const [proposedGoals, setProposedGoals] = useState<ProposedGoal[]>([]);

  useEffect(() => {
    void fetchGoals().then(setGoals);
    const onGoalsUpdated = () => void fetchGoals().then(setGoals);
    window.addEventListener("fiscmak:goals-updated", onGoalsUpdated);
    return () => window.removeEventListener("fiscmak:goals-updated", onGoalsUpdated);
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

  function handleTouchpointContinue(tp: ActiveTouchpointView) {
    if (tp.kind === "annual") {
      beginAnnualMak("/app/subjective");
      return;
    }
    if (tp.kind === "quarterly") {
      beginQuarterlyMak();
      router.push("/app/subjective");
      return;
    }
    startMakFlow("assess", "/app/assessment");
    router.push("/app/assessment");
  }

  const subjective = loadSubjectiveCheckIn();
  const subjectiveMetrics = useMemo(() => {
    if (!analytics) return [];
    const bands = buildSoapDashboardBands({
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
    return bands.find((b) => b.id === "subjective")?.metrics ?? [];
  }, [analytics, subjective, goals, profile]);

  const headerModel = useMemo(() => {
    if (!analytics) return null;
    return buildDashboardHeader({
      name: profile?.name,
      specialty: profile?.specialty,
      setting: profile?.practice_setting ?? null,
      rank: profile?.academic_rank ?? null,
      level: profile?.career_stage ?? null,
      analytics,
      quarterlyPulse: analytics.quarterly_pulse,
    });
  }, [analytics, profile]);

  const profileRows = useMemo(() => {
    if (!analytics || !headerModel) return [];
    const gapRow = buildRecognitionGapRow(analytics);
    return [
      ...buildProfileRows(subjectiveMetrics),
      ...(gapRow ? [gapRow] : []),
      buildProgressStatus(analytics),
      buildHealthStatusRow(headerModel),
    ];
  }, [analytics, headerModel, subjectiveMetrics]);

  const goalCards = useMemo(
    () => buildGoalCards(goals, analytics?.goal_milestone_history ?? []),
    [goals, analytics],
  );

  const touchpointViews = useMemo(
    () => (analytics ? buildActiveTouchpointView(analytics) : { active: null, upcoming: null }),
    [analytics],
  );

  const dueNow = useMemo(
    () => (analytics ? buildDashboardDueNow(analytics, touchpointViews) : null),
    [analytics, touchpointViews],
  );

  const secondaryAlerts = useMemo(
    () =>
      analytics
        ? buildDashboardSecondaryAlerts(analytics.engagement_notifications, dueNow)
        : [],
    [analytics, dueNow],
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

  function handleDueNowContinue() {
    if (!dueNow) return;
    if (dueNow.kind === "annual") {
      beginAnnualMak("/app/subjective");
      return;
    }
    if (dueNow.kind === "quarterly") {
      beginQuarterlyMak();
      router.push("/app/subjective");
      return;
    }
    const active = touchpointViews.active;
    if (active) handleTouchpointContinue(active);
  }

  return (
    <>
      {onboardingPhase === "reveal" && (
        <DashboardRevealOverlay onComplete={() => setOnboardingPhase("goals")} />
      )}
      {onboardingPhase === "goals" && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cx-page-muted/95 p-6">
          <GoalSettingPanel
            goals={proposedGoals}
            onWalkthroughWithMak={() =>
              startMakFlow("plan", "/app/plan", buildGoalSettingIntro(), undefined, "set")
            }
            onModifyWithMak={(goalType) =>
              startMakFlow(
                "plan",
                "/app/plan",
                `Let's refine your ${GOAL_FRAMEWORK_LABELS[goalType].label}.\n\n${GOAL_MODIFY_PROMPT}\n\nOr confirm goals in the template and use **Edit in template** for direct field updates.`,
                undefined,
                "set",
              )
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

      <div className="mx-auto max-w-[1200px]">
        {loading ? (
          <DashboardSkeleton />
        ) : !analytics || !headerModel ? (
          <div className="cx-alert-banner px-4 py-3 text-sm">
            {touchpointError ?? "Could not load dashboard. Refresh the page or finish onboarding first."}
          </div>
        ) : (
          <>
            {touchpointError && (
              <div className="cx-alert-banner mb-4 px-4 py-3 text-sm">{touchpointError}</div>
            )}
            <DashboardWelcome
              displayName={headerModel.displayName}
              tracks={
                profile?.primary_career_track ? [profile.primary_career_track] : null
              }
              profileLine={headerModel.profileLine}
              profileRows={profileRows}
              header={headerModel}
              nextMilestone={nextMilestone}
              goals={goalCards}
              touchpointStates={tpStates}
              latticeCells={analytics.dashboard_lattice}
              dueNow={dueNow}
              secondaryAlerts={secondaryAlerts}
              onDueNowContinue={handleDueNowContinue}
            />
          </>
        )}
      </div>
    </>
  );
}
