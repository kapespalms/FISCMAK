"use client";

import Link from "next/link";
import { DashboardDueNow, type DashboardDueItem } from "@/components/dashboard/DashboardDueNow";
import { CoachingCadencePanel } from "@/components/dashboard/CoachingCadencePanel";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { DashboardGoalsGrid } from "@/components/dashboard/DashboardGoalsGrid";
import { DashboardMakButton } from "@/components/dashboard/DashboardMakButton";
import { ProfileSummaryCard } from "@/components/dashboard/ProfileSummaryCard";
import { TouchpointProgressStrip } from "@/components/dashboard/TouchpointProgressStrip";
import type { UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";
import {
  ResidentScheduleCalendar,
  type ScheduleBlock,
} from "@/components/dashboard/ResidentScheduleCalendar";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import type { DashboardLatticeCell } from "@/lib/v2/dashboard-data";
import type { DashboardDueNowItem, GoalCardModel, ProfileRow, TouchpointBarState } from "@/lib/v2/dashboard-redesign";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";
import { timeOfDayGreeting } from "@/lib/mak-greeting";

type DashboardWelcomeProps = {
  displayName: string;
  tracks?: string[] | null;
  profileLine?: string | null;
  profileRows?: ProfileRow[];
  header: DashboardHeaderModel;
  nextMilestone: string | null;
  goals: GoalCardModel[];
  touchpointStates: TouchpointBarState[];
  latticeCells?: DashboardLatticeCell[];
  dueNow?: DashboardDueItem | null;
  secondaryAlerts?: EngagementNotification[];
  onDueNowContinue?: () => void;
  institutionalProgramSlug?: string | null;
  scheduleBlocks?: ScheduleBlock[];
  scheduleUserEvents?: UserScheduleEvent[];
  scheduleProgramLabel?: string | null;
  scheduleCalendarEnabled?: boolean;
};

export function DashboardWelcome({
  displayName,
  tracks,
  profileLine,
  profileRows = [],
  header,
  nextMilestone,
  goals,
  touchpointStates,
  latticeCells = [],
  dueNow,
  secondaryAlerts = [],
  onDueNowContinue,
  institutionalProgramSlug,
  scheduleBlocks = [],
  scheduleUserEvents = [],
  scheduleProgramLabel,
  scheduleCalendarEnabled = false,
}: DashboardWelcomeProps) {
  const salutation = timeOfDayGreeting();

  return (
    <header className="cx-dashboard-hero rounded-2xl bg-cx-forest-dark p-5 shadow-sm md:p-6">
      <h1 className="text-[28px] font-bold leading-snug text-[#AC8636] md:text-[32px]">
        {salutation}, {displayName}.
      </h1>
      {profileLine && (
        <p className="mt-1 text-base font-medium text-white md:text-lg">{profileLine}</p>
      )}

      {institutionalProgramSlug === "uh-psych-cmc" && (
        <div className="mt-4">
          <Link
            href="/app/uh-psych"
            className="inline-flex w-full items-center justify-between rounded-xl border border-[#AC8636]/35 bg-[#AC8636]/10 px-4 py-3.5 transition hover:border-[#AC8636]/55 hover:bg-[#AC8636]/15 sm:w-auto sm:min-w-[280px]"
          >
            <span>
              <span className="block text-base font-semibold text-white">UH Psych Hub</span>
              <span className="mt-0.5 block text-xs text-white/75">
                Rotations, schedule, readings, semi-annual prep
              </span>
            </span>
            <span className="text-lg text-[#AC8636]" aria-hidden>
              →
            </span>
          </Link>
        </div>
      )}

      {scheduleCalendarEnabled && (
        <div className="mt-4">
          <ResidentScheduleCalendar
            blocks={scheduleBlocks}
            userEvents={scheduleUserEvents}
            programLabel={scheduleProgramLabel ?? undefined}
          />
        </div>
      )}

      <CoachingCadencePanel />

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <ProfileSummaryCard
          rows={profileRows}
          tracks={tracks}
          header={header}
          nextMilestone={nextMilestone}
          latticeCells={latticeCells}
        />
        <DashboardGoalsGrid goals={goals} variant="inline" />
      </div>

      {dueNow && onDueNowContinue && (
        <div className="mt-4">
          <DashboardDueNow item={dueNow} onContinue={onDueNowContinue} />
        </div>
      )}

      <DashboardAlerts items={secondaryAlerts} />

      <div className="mt-4 border-t border-white/10 pt-4">
        <TouchpointProgressStrip
          states={touchpointStates}
          href={
            dueNow?.kind === "annual" || dueNow?.kind === "quarterly"
              ? "/app/subjective"
              : "/app/assessment"
          }
        />
      </div>

      <DashboardMakButton className="mt-4" />
    </header>
  );
}
