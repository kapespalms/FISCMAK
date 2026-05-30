import { PageShell } from "@/components/layout/PageShell";
import { ResidencyScheduleWorkspace } from "@/components/workspace/ResidencyScheduleWorkspace";

export default function SchedulePage() {
  return (
    <PageShell title="" maxWidth="lg" className="[&_header]:hidden">
      <ResidencyScheduleWorkspace />
    </PageShell>
  );
}
