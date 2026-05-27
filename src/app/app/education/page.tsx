import { PageShell } from "@/components/layout/PageShell";
import { EducationHubWorkspace } from "@/components/workspace/EducationHubWorkspace";

export default function EducationHubPage() {
  return (
    <PageShell title="" maxWidth="xl" className="[&_header]:hidden">
      <EducationHubWorkspace />
    </PageShell>
  );
}
