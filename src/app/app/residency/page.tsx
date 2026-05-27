import { PageShell } from "@/components/layout/PageShell";
import { ResidencyHubWorkspace } from "@/components/workspace/ResidencyHubWorkspace";

export default function ResidencyHubPage() {
  return (
    <PageShell title="" maxWidth="xl" className="[&_header]:hidden">
      <ResidencyHubWorkspace />
    </PageShell>
  );
}
