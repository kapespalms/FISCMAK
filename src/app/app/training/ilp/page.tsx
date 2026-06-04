import { PageShell } from "@/components/layout/PageShell";
import { IlpForm } from "@/components/gme/IlpForm";

export default function IlpPage() {
  return (
    <PageShell
      eyebrow="Training · ILP"
      title="Individual Learning Plan"
      subtitle="Mid-year ILP — career goals, milestone self-assessment, and SMART goals for CCC review."
      maxWidth="xl"
    >
      <IlpForm />
    </PageShell>
  );
}
