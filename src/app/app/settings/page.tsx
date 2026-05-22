import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-fiscmak-muted">Privacy & preferences</p>
      </div>

      <Card>
        <h2 className="font-semibold">Privacy</h2>
        <p className="mt-2 text-sm text-fiscmak-muted">
          Share my data with my institution?
        </p>
        <label className="mt-4 flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 rounded border-fiscmak-border" />
          <span className="text-sm">No (default) — keep my data private</span>
        </label>
        <p className="mt-4 text-xs text-fiscmak-muted">
          Your institution cannot see Mak conversations, energy signals, or
          private reflections. Only aggregate trends if you opt in (n≥5).
        </p>
      </Card>
    </div>
  );
}
