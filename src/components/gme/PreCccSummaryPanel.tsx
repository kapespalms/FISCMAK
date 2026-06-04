"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";
import { exportPreCccPdf } from "@/lib/v2/gme/pre-ccc-export";
import { listReportingPeriods } from "@/lib/v2/gme/reporting-periods";
import { downloadBlob } from "@/lib/studio-export";

type PreCccSummaryPanelProps = {
  title?: string;
  description?: string;
} & (
  | { self: true; programSlug?: never; userId?: never }
  | { self?: false; programSlug: string; userId: string }
);

export function PreCccSummaryPanel(props: PreCccSummaryPanelProps) {
  const {
    title = "Pre-CCC summary",
    description = "Imported MedHub rotation evaluations synthesized for semiannual review prep.",
  } = props;
  const self = props.self === true;
  const programSlug = !self ? props.programSlug : undefined;
  const userId = !self ? props.userId : undefined;
  const [summary, setSummary] = useState<PreCccSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("current");
  const reportingPeriods = listReportingPeriods();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period });
      const res = await fetch(
        self
          ? `/api/v1/self/pre-ccc-summary?${params}`
          : `/api/v1/programs/${encodeURIComponent(programSlug!)}/residents/${encodeURIComponent(userId!)}/pre-ccc?${params}`,
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
  }, [self, programSlug, userId, period]);

  useEffect(() => {
    if (self) void load();
  }, [self, load]);

  const exportPdf = useCallback(async () => {
    if (!summary) return;
    setExporting(true);
    try {
      const blob = await exportPreCccPdf(summary);
      const initials = summary.trainee_initials ?? "trainee";
      downloadBlob(blob, `pre-ccc-${initials}-${summary.reporting_period}.pdf`);
    } finally {
      setExporting(false);
    }
  }, [summary]);

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · CCC prep</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-text">{title}</h3>
      <p className="mt-2 text-sm text-cx-text/75">{description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {reportingPeriods.map((p) => (
          <Button
            key={p.id}
            variant={period === p.id ? "primary" : "secondary"}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <Button className="mt-4" variant="secondary" onClick={() => void load()} disabled={loading}>
        {loading ? "Loading…" : summary ? "Refresh summary" : "Load summary"}
      </Button>

      {summary && (
        <Button
          className="mt-4 ml-2"
          variant="secondary"
          onClick={() => void exportPdf()}
          disabled={exporting}
        >
          {exporting ? "Exporting…" : "Export PDF"}
        </Button>
      )}

      {error && <p className="mt-3 text-sm text-[#C28D6C]">{error}</p>}

      {summary && (
        <div className="mt-4 space-y-4 text-sm text-cx-text/85">
          <div className="rounded-xl border border-cx-forest-dark/10 px-4 py-3">
            <p className="font-semibold text-cx-text">Data sufficiency</p>
            <p className="mt-1">{summary.data_sufficiency.note}</p>
            <p className="mt-1 text-xs text-cx-text/60">
              {summary.evaluations.length} evaluation(s) · milestone avg{" "}
              {summary.milestone_overview.average_across_evals ?? "—"}
            </p>
          </div>

          {summary.narrative_synthesis.strengths.length > 0 && (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-cx-text">Narrative synthesis · strengths</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                    summary.narrative_synthesis.ai_generated
                      ? "bg-cx-forest-dark/10 text-cx-text"
                      : "bg-[#E7DEC9]/60 text-[#20201D]"
                  }`}
                >
                  {summary.narrative_synthesis.ai_generated ? "AI-enhanced" : "Rule-based"}
                </span>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {summary.narrative_synthesis.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.narrative_synthesis.areas_for_growth.length > 0 && (
            <div>
              <p className="font-semibold text-cx-text">Areas for growth</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {summary.narrative_synthesis.areas_for_growth.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.narrative_synthesis.quotes.length > 0 && (
            <div>
              <p className="font-semibold text-cx-text">Faculty quotes</p>
              <ul className="mt-2 space-y-2">
                {summary.narrative_synthesis.quotes.map((quote) => (
                  <li
                    key={`${quote.eval_id}-${quote.text.slice(0, 40)}`}
                    className="rounded-lg border border-cx-forest-dark/10 px-3 py-2 text-xs italic"
                  >
                    &ldquo;{quote.text}&rdquo;
                    <span className="mt-1 block not-italic text-cx-text/55">
                      {quote.supervisor_name ?? "Faculty"}
                      {quote.rotation_name ? ` · ${quote.rotation_name}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-cx-forest-dark/10 px-4 py-3">
            <p className="font-semibold text-cx-text">PRITE / in-training exams</p>
            <p className="mt-1">{summary.prite_scores.note}</p>
            {summary.prite_scores.exams.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-cx-text/70">
                {summary.prite_scores.exams.map((exam) => (
                  <li key={`${exam.exam_type}-${exam.exam_year}`}>
                    {exam.exam_type} {exam.exam_year}: {exam.overall_percentile ?? "—"}th percentile
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-cx-forest-dark/10 px-4 py-3">
            <p className="font-semibold text-cx-text">ILP status</p>
            <p className="mt-1">{summary.ilp_status.note}</p>
          </div>

          {summary.narrative_themes.length > 0 && (
            <div>
              <p className="font-semibold text-cx-text">Narrative themes</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {summary.narrative_themes.map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.evaluations.length > 0 && (
            <div>
              <p className="font-semibold text-cx-text">Rotation evaluations</p>
              <ul className="mt-2 space-y-3">
                {summary.evaluations.map((ev) => (
                  <li
                    key={`${ev.rotation_name}-${ev.eval_date}-${ev.supervisor_name}`}
                    className="rounded-lg border border-cx-forest-dark/10 px-3 py-2"
                  >
                    <p className="font-medium text-cx-text">
                      {ev.rotation_name ?? "Rotation"} · {ev.supervisor_name ?? "Supervisor"}
                    </p>
                    <p className="text-xs text-cx-text/60">
                      {ev.eval_date ?? "Date unknown"}
                      {ev.milestone_average != null ? ` · avg ${ev.milestone_average}` : ""}
                      {ev.milestone_lowest
                        ? ` · lowest ${ev.milestone_lowest.key.replace(/^milestone_\d+_/, "").replace(/_/g, " ")} (${ev.milestone_lowest.value})`
                        : ""}
                    </p>
                    {ev.narrative_excerpt && (
                      <p className="mt-1 text-xs leading-relaxed text-cx-text/70">
                        {ev.narrative_excerpt}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs italic text-cx-text/55">{summary.disclaimer}</p>
        </div>
      )}
    </Card>
  );
}
