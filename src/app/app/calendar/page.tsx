import { PageShell } from "@/components/layout/PageShell";
import { ScheduleCalendarWorkspace } from "@/components/workspace/ScheduleCalendarWorkspace";

export default function CalendarPage() {
  return (
    <PageShell eyebrow="Schedule" title="Calendar" maxWidth="lg">
      <ScheduleCalendarWorkspace />
    </PageShell>
  );
}
