import { PageShell } from "@/components/layout/PageShell";
import { UhProgramGate } from "@/components/uh-psych/UhProgramGate";
import { EducationHubWorkspace } from "@/components/workspace/EducationHubWorkspace";

export default function EducationHubPage() {
  return (
    <PageShell title="" maxWidth="xl" className="[&_header]:hidden">
      <UhProgramGate title="UH Psychiatry education hub">
        <EducationHubWorkspace />
      </UhProgramGate>
    </PageShell>
  );
}
