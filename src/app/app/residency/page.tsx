import { PageShell } from "@/components/layout/PageShell";
import { UhProgramGate } from "@/components/uh-psych/UhProgramGate";
import { ResidencyHubWorkspace } from "@/components/workspace/ResidencyHubWorkspace";

export default function ResidencyHubPage() {
  return (
    <PageShell title="" maxWidth="xl" className="[&_header]:hidden">
      <UhProgramGate title="UH Psychiatry residency hub">
        <ResidencyHubWorkspace />
      </UhProgramGate>
    </PageShell>
  );
}
