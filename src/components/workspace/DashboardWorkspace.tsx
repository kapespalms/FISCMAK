"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardGoalsGrid } from "@/components/dashboard/DashboardGoalsGrid";
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
import { MakObservationCard }    from "@/components/dashboard/MakObservationCard";
import { WellbeingReadingCard }  from "@/components/dashboard/WellbeingReadingCard";
import { RecentCapturesLedger }  from "@/components/dashboard/RecentCapturesLedger";
import { AgendaCard }            from "@/components/dashboard/AgendaCard";
import { MiniLattice }           from "@/components/dashboard/MiniLattice";
import type { RecentCapturesResult } from "@/app/api/v1/dashboard/recent-captures/route";
import {
  GoalSettingPanel,
  defaultProposedGoals,
  type ProposedGoal,
} from "@/components/onboarding/GoalSettingPanel";
import { buildCareerDirectionAnnualGreeting } from "@/lib/mak-chatbot-states";
import { timeOfDayGreeting } from "@/lib/mak-greeting";
import { SELF_ASSESSMENT_MAK_INTRO_KEY } from "@/lib/v2/onboarding-flow";
import { initAnnualMakSession } from "@/lib/annual-mak-client";
import { initQuarterlyMakSession } from "@/lib/quarterly-mak-client";
import {
  buildActiveTouchpointView,
  buildDashboardDueNow,
  buildDashboardSecondaryAlerts,
  buildGoalCards,
  buildProfileRows,
  buildProgressStatus,
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
  const [institutionalProgramSlug, setInstitutionalProgramSlug] = useState<string | null>(null);
  const [scheduleBlocks, setScheduleBlocks] = useState<
    import("@/components/dashboard/ResidentScheduleCalendar").ScheduleBlock[]
  >([]);
  const [scheduleUserEvents, setScheduleUserEvents] = useState<
    import("@/lib/v2/schedule-calendar/types").UserScheduleEvent[]
  >([]);
  const [scheduleProgramLabel, setScheduleProgramLabel] = useState<string | null>(null);
  const [scheduleCalendarEnabled, setScheduleCalendarEnabled] = useState(false);

  // You / Your Week — additional data
  const [recentCaptures, setRecentCaptures] = useState<RecentCapturesResult>({
    recent: [], this_week_count: 0, pending_count: 0,
  });
  const [capturesLoading, setCapturesLoading] = useState(true);
  const [pulseDue,    setPulseDue]    = useState(false);
  const [fcwiDue,     setFcwiDue]     = useState(false);
  const [pulseMdt,    setPulseMdt]    = useState<number | null>(null);
  const [pulseDate,   setPulseDate]   = useState<string | null>(null);
  const [wellbeingLoading, setWellbeingLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/dashboard/recent-captures").then((r) => r.json()),
      fetch("/api/v1/wellbeing/pulse").then((r) => r.json()),
      fetch("/api/v1/wellbeing/fcwi").then((r) => r.json()),
    ]).then(([captures, pulse, fcwi]) => {
      setRecentCaptures(captures as RecentCapturesResult);
      setCapturesLoading(false);
      setPulseDue(Boolean(pulse?.due));
      setPulseMdt(typeof pulse?.latest?.mdt === "number" ? pulse.latest.mdt : null);
      setPulseDate(pulse?.latest?.recorded_at ?? null);
      setFcwiDue(Boolean(fcwi?.due));
      setWellbeingLoading(false);
    }).catch(() => {
      setCapturesLoading(false);
      setWellbeingLoading(false);
    });
  }, []);

  function refreshSchedule() {
    return fetch("/api/v1/onboarding/schedule")
      .then((r) => r.json())
      .then((schedule) => {
        if (schedule.enabled) {
          setScheduleBlocks(schedule.blocks ?? []);
          setScheduleUserEvents(schedule.user_events ?? []);
          setScheduleProgramLabel(schedule.program_label ?? null);
          setScheduleCalendarEnabled(true);
        }
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    void fetchGoals().then(setGoals);
    const onGoalsUpdated = () => void fetchGoals().then(setGoals);
    window.addEventListener("fiscmak:goals-updated", onGoalsUpdated);
    return () => window.removeEventListener("fiscmak:goals-updated", onGoalsUpdated);
  }, []);

  useEffect(() => {
    const onScheduleUpdated = () => void refreshSchedule();
    window.addEventListener("fiscmak:schedule-updated", onScheduleUpdated);
    return () => window.removeEventListener("fiscmak:schedule-updated", onScheduleUpdated);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/onboarding/status").then((r) => r.json()),
      fetch("/api/v1/users/me").then((r) => r.json()),
      fetch("/api/v1/onboarding/touchpoint1").then((r) => r.json()),
      fetch("/api/v1/onboarding/schedule").then((r) => r.json()),
    ])
      .then(([status, me, touchpoint, schedule]) => {
        setProfile({
          ...status,
          academic_rank: me.academic_rank ?? null,
          name: me.name ?? status.name,
        });
        setInstitutionalProgramSlug(touchpoint.onboarding?.program_slug ?? null);
        if (schedule.enabled) {
          setScheduleBlocks(schedule.blocks ?? []);
          setScheduleUserEvents(schedule.user_events ?? []);
          setScheduleProgramLabel(schedule.program_label ?? null);
          setScheduleCalendarEnabled(true);
        }
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
      })
      .catch(() => undefined);
  }, [welcome]);

  useEffect(() => {
    if (loading || onboardingPhase || !profile?.tier3_complete) return;
    if (typeof window === "undefined") return;

    if (welcome && !localStorage.getItem(SELF_ASSESSMENT_MAK_INTRO_KEY)) {
      localStorage.setItem(SELF_ASSESSMENT_MAK_INTRO_KEY, "1");
      localStorage.setItem("fiscmak_dashboard_mak_intro", "1");
      startMakFlow("assess", undefined, "__self_assessment_intro__");
      router.replace("/app/dashboard");
      return;
    }

    if (localStorage.getItem("fiscmak_dashboard_mak_intro")) return;
    localStorage.setItem("fiscmak_dashboard_mak_intro", "1");
    openMak();
  }, [loading, onboardingPhase, profile?.tier3_complete, welcome, startMakFlow, openMak, router]);

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
    return [...buildProfileRows(subjectiveMetrics), buildProgressStatus(analytics)];
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

      <div className="mx-auto max-w-[1280px]">
        {loading ? (
          <DashboardSkeleton />
        ) : !analytics || !headerModel ? (
          <div className="cx-alert-banner px-4 py-3 text-sm">
            {touchpointError ?? "Could not load dashboard. Refresh or finish onboarding first."}
          </div>
        ) : (
          <>
            {touchpointError && (
              <div className="cx-alert-banner mb-4 px-4 py-3 text-sm">{touchpointError}</div>
            )}

            {/* Greeting */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-cx-forest-dark">
                Good {timeOfDayGreeting()}, {displayName ?? headerModel.displayName}
              </h1>
              {headerModel.profileLine && (
                <p className="mt-0.5 text-sm text-cx-forest-dark/60">{headerModel.profileLine}</p>
              )}
            </div>

            {/* You / Your Week — two-column layout */}
            <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

              {/* ── LEFT: You ─────────────────────────────────────────── */}
              <div className="space-y-5">
                {/* Mak observation + quick-capture */}
                <MakObservationCard
                  weekCount={recentCaptures.this_week_count}
                  pendingCount={recentCaptures.pending_count}
                />

                {/* Mini-lattice */}
                <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
                      Career lattice
                    </span>
                  </div>
                  {analytics.dashboard_lattice.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-cx-forest-dark/15 py-8 text-center">
                      <p className="mb-2 text-xs text-cx-forest-dark/50">Your lattice is empty</p>
                      <button
                        type="button"
                        onClick={() => startMakFlow("capture")}
                        className="text-xs font-medium text-fis-gold hover:opacity-80"
                      >
                        Upload a career doc →
                      </button>
                    </div>
                  ) : (
                    <MiniLattice cells={analytics.dashboard_lattice} showHeader={false} />
                  )}
                </div>

                {/* Well-being reading */}
                <WellbeingReadingCard
                  pulseDue={pulseDue}
                  fcwiDue={fcwiDue}
                  pulseMdt={pulseMdt}
                  pulseDate={pulseDate}
                  loading={wellbeingLoading}
                />

                {/* Active goals */}
                <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
                      Active goals
                    </span>
                  </div>
                  {goalCards.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-cx-forest-dark/15 py-6 text-center">
                      <p className="mb-2 text-xs text-cx-forest-dark/50">No goals set yet</p>
                      <button
                        type="button"
                        onClick={() => startMakFlow("plan", "/app/goals", undefined, undefined, "set")}
                        className="text-xs font-medium text-fis-gold hover:opacity-80"
                      >
                        Set goals with Mak →
                      </button>
                    </div>
                  ) : (
                    <DashboardGoalsGrid
                      goals={goalCards}
                      onDetails={(id) =>
                        startMakFlow("plan", "/app/goals", undefined, undefined, "modify", id)
                      }
                    />
                  )}
                </div>
              </div>

              {/* ── RIGHT: Your Week ──────────────────────────────────── */}
              <div className="space-y-5">
                {/* Agenda (due items + calendar stub) */}
                <AgendaCard
                  dueItem={dueNow}
                  onContinue={dueNow ? handleDueNowContinue : undefined}
                  loading={loading}
                />

                {/* Recent captures ledger */}
                <RecentCapturesLedger
                  items={recentCaptures.recent}
                  loading={capturesLoading}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
