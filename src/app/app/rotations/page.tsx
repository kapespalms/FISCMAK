import { PageShell } from "@/components/layout/PageShell";
import { RotationsCatalogWorkspace } from "@/components/workspace/RotationsCatalogWorkspace";

export default function RotationsPage() {
  return (
    <PageShell eyebrow="Program" title="Rotations" maxWidth="lg">
      <RotationsCatalogWorkspace programSlug="uh-psych-cmc" />
    </PageShell>
  );
}
