"use client";

import { DashboardDueNow, type DashboardDueItem } from "@/components/dashboard/DashboardDueNow";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { DashboardGoalsGrid } from "@/components/dashboard/DashboardGoalsGrid";
import { DashboardMakButton } from "@/components/dashboard/DashboardMakButton";
import { ProfileSummaryCard } from "@/components/dashboard/ProfileSummaryCard";
import { TouchpointProgressStrip } from "@/components/dashboard/TouchpointProgressStrip";
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
}: DashboardWelcomeProps) {
  const salutation = timeOfDayGreeting();

  return (
    <header className="rounded-2xl bg-cx-forest-dark p-5 shadow-sm md:p-6">
      <h1 className="text-[28px] font-bold leading-snug text-[#5FD65F] md:text-[32px]">
        {salutation}, {displayName}.
      </h1>
      {profileLine && (
        <p className="mt-1 text-base font-medium text-white md:text-lg">{profileLine}</p>
      )}

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
