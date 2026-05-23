import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Account"
      title="Settings"
      subtitle="Privacy and preferences"
      maxWidth="md"
    >
      <Card>
        <p className="text-cx-label uppercase">Privacy</p>
        <h2 className="mt-2 text-cx-h3">Institution data sharing</h2>
        <p className="mt-2 text-cx-body">Share my data with my institution?</p>
        <label className="mt-4 flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 rounded border-cx-border" />
          <span className="text-sm text-cx-text">No (default) — keep my data private</span>
        </label>
        <p className="mt-4 text-cx-label">
          Your institution cannot see Mak conversations, energy signals, or
          private reflections. Only aggregate trends if you opt in (n≥5).
        </p>
      </Card>
    </PageShell>
  );
}
