"use client";

import { useCallback, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";

type PreCccSummaryPanelProps = {
  programSlug: string;
  userId: string;
  title?: string;
  description?: string;
};

export function PreCccSummaryPanel({
  programSlug,
  userId,
  title = "Pre-CCC summary",
  description = "Imported MedHub rotation evaluations synthesized for semiannual review prep.",
}: PreCccSummaryPanelProps) {
  const [summary, setSummary] = useState<PreCccSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/programs/${encodeURIComponent(programSlug)}/residents/${encodeURIComponent(userId)}/pre-ccc?period=current`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load pre-CCC summary.");
      setSummary(data.summary ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pre-CCC summary.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [programSlug, userId]);

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · CCC prep</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">{title}</h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">{description}</p>

      <Button className="mt-4" variant="secondary" onClick={() => void load()} disabled={loading}>
        {loading ? "Loading…" : summary ? "Refresh summary" : "Load summary"}
      </Button>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {summary && (
        <div className="mt-4 space-y-4 text-sm text-cx-forest-dark/85">
          <div className="rounded-xl border border-cx-forest-dark/10 px-4 py-3">
            <p className="font-semibold text-cx-forest-dark">Data sufficiency</p>
            <p className="mt-1">{summary.data_sufficiency.note}</p>
            <p className="mt-1 text-xs text-cx-forest-dark/60">
              {summary.evaluations.length} evaluation(s) · milestone avg{" "}
              {summary.milestone_overview.average_across_evals ?? "—"}
            </p>
          </div>

          {summary.narrative_themes.length > 0 && (
            <div>
              <p className="font-semibold text-cx-forest-dark">Narrative themes</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {summary.narrative_themes.map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.evaluations.length > 0 && (
            <div>
              <p className="font-semibold text-cx-forest-dark">Rotation evaluations</p>
              <ul className="mt-2 space-y-3">
                {summary.evaluations.map((ev) => (
                  <li
                    key={`${ev.rotation_name}-${ev.eval_date}-${ev.supervisor_name}`}
                    className="rounded-lg border border-cx-forest-dark/10 px-3 py-2"
                  >
                    <p className="font-medium text-cx-forest-dark">
                      {ev.rotation_name ?? "Rotation"} · {ev.supervisor_name ?? "Supervisor"}
                    </p>
                    <p className="text-xs text-cx-forest-dark/60">
                      {ev.eval_date ?? "Date unknown"}
                      {ev.milestone_average != null ? ` · avg ${ev.milestone_average}` : ""}
                      {ev.milestone_lowest
                        ? ` · lowest ${ev.milestone_lowest.key.replace(/^milestone_\d+_/, "").replace(/_/g, " ")} (${ev.milestone_lowest.value})`
                        : ""}
                    </p>
                    {ev.narrative_excerpt && (
                      <p className="mt-1 text-xs leading-relaxed text-cx-forest-dark/70">
                        {ev.narrative_excerpt}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs italic text-cx-forest-dark/55">{summary.disclaimer}</p>
        </div>
      )}
    </Card>
  );
}
