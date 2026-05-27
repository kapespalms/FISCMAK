"use client";

import Link from "next/link";

function DashboardProgramLink({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 transition hover:border-[#5FD65F]/40 hover:bg-white/15"
    >
      <span className="block text-sm font-semibold text-white">{title}</span>
      <span className="mt-0.5 block text-xs text-white/70">{detail}</span>
    </Link>
  );
}
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
      <h1 className="text-[28px] font-bold leading-snug text-[#5FD65F] md:text-[32px]">
        {salutation}, {displayName}.
      </h1>
      {profileLine && (
        <p className="mt-1 text-base font-medium text-white md:text-lg">{profileLine}</p>
      )}

      {institutionalProgramSlug === "uh-psych-cmc" && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardProgramLink href="/app/residency/contacts-calendars" title="Call & contacts" detail="QGenda + CMC call grid" />
          <DashboardProgramLink href="/app/education" title="Education hub" detail="Articles, pharm, handouts" />
          <DashboardProgramLink href="/app/calendar" title="Block schedule" detail="Full calendar view" />
          <DashboardProgramLink href="/app/rotations" title="Rotation catalog" detail="All rotation codes" />
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
