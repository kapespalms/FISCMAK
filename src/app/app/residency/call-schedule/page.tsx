import { PageShell } from "@/components/layout/PageShell";
import { CallScheduleView } from "@/components/uh-psych/CallScheduleView";

export default function CallSchedulePage() {
  return (
    <PageShell title="" maxWidth="lg" className="[&_header]:hidden">
      <CallScheduleView />
    </PageShell>
  );
}
