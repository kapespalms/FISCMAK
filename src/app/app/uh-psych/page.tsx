import { PageShell } from "@/components/layout/PageShell";
import { UhPsychHubWorkspace } from "@/components/workspace/UhPsychHubWorkspace";

export default function UhPsychHubPage() {
  return (
    <PageShell title="" maxWidth="xl" className="[&_header]:hidden">
      <UhPsychHubWorkspace />
    </PageShell>
  );
}
