import { PageShell } from "@/components/layout/PageShell";
import { UhProgramGate } from "@/components/uh-psych/UhProgramGate";
import { CallScheduleView } from "@/components/uh-psych/CallScheduleView";

export default function CallSchedulePage() {
  return (
    <PageShell title="" maxWidth="lg" className="[&_header]:hidden">
      <UhProgramGate title="UH Psychiatry call schedule">
        <CallScheduleView />
      </UhProgramGate>
    </PageShell>
  );
}
