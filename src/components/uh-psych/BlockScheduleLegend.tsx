import { blockScheduleLegend } from "@/lib/v2/programs/block-schedule";

export function BlockScheduleLegend() {
  const entries = blockScheduleLegend();
  if (entries.length === 0) return null;

  return (
    <section className="rounded-xl border border-cx-forest-dark/12 bg-cx-forest-dark/[0.02] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/55">
        Block code legend
      </p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.code} className="text-sm">
            <dt className="font-medium text-cx-text">{entry.label}</dt>
            {entry.description && (
              <dd className="text-xs text-cx-text/65">{entry.description}</dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
