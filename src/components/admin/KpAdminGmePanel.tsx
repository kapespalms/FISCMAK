"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PreCccSummaryPanel } from "@/components/gme/PreCccSummaryPanel";
import { CohortHeatmapPanel } from "@/components/gme/CohortHeatmapPanel";
import type { PreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";
import { exportPreCccBatchPdf } from "@/lib/v2/gme/pre-ccc-export";
import { downloadBlob } from "@/lib/studio-export";

type ImportRow = {
  import_id: string;
  file_name: string | null;
  row_count: number | null;
  imported_at: string;
  quality_report?: {
    warnings?: string[];
    forms?: string[];
  };
};

type IlpGoal = {
  goal_id: string;
  subcompetency_id: string | null;
  goal_text: string;
  status: string;
  source: string | null;
};

export function KpAdminGmePanel() {
  const programSlug = "uh-psych-cmc";
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("medhub.csv");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [traineeUserId, setTraineeUserId] = useState("");
  const [meUserId, setMeUserId] = useState<string | null>(null);
  const [ilpGoals, setIlpGoals] = useState<IlpGoal[]>([]);
  const [ilpLoading, setIlpLoading] = useState(false);
  const [ilpMessage, setIlpMessage] = useState<string | null>(null);
  const [batchSummaries, setBatchSummaries] = useState<PreCccSummary[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchExporting, setBatchExporting] = useState(false);
  const [surveyManual, setSurveyManual] = useState("45");
  const [surveyFiscmak, setSurveyFiscmak] = useState("15");
  const [surveySaved, setSurveySaved] = useState("");
  const [surveyNotes, setSurveyNotes] = useState("");
  const [surveyRecommend, setSurveyRecommend] = useState(true);
  const [priteCsv, setPriteCsv] = useState("");
  const [priteResult, setPriteResult] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const refreshImports = useCallback(async () => {
    const res = await fetch(`/api/v1/programs/${programSlug}/imports`);
    if (!res.ok) return;
    const data = await res.json();
    setImports(data.imports ?? []);
  }, []);

  const loadIlpGoals = useCallback(async (userId: string) => {
    if (!userId.trim()) return;
    setIlpLoading(true);
    setIlpMessage(null);
    try {
      const res = await fetch(
        `/api/v1/programs/${programSlug}/residents/${encodeURIComponent(userId.trim())}/ilp?period=current`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load ILP goals.");
      setIlpGoals(data.goals ?? []);
    } catch (err) {
      setIlpMessage(err instanceof Error ? err.message : "Could not load ILP goals.");
      setIlpGoals([]);
    } finally {
      setIlpLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshImports();
    void fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user_id) {
          setMeUserId(data.user_id);
          setTraineeUserId((prev) => prev || data.user_id);
        }
      })
      .catch(() => undefined);
  }, [refreshImports]);

  useEffect(() => {
    if (traineeUserId.trim()) void loadIlpGoals(traineeUserId);
  }, [traineeUserId, loadIlpGoals]);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    setCsvText(await file.text());
  }

  async function submitImport() {
    if (!csvText.trim()) {
      setImportResult("Paste or upload a MedHub CSV first.");
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch(`/api/v1/programs/${programSlug}/imports/csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_text: csvText, file_name: fileName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Import failed.");
      if (data.demo) {
        setImportResult(`Demo mode: parsed ${data.preview?.length ?? 0} row preview — configure Supabase to persist.`);
      } else {
        setImportResult(
          `Imported ${data.row_count} rows (${data.linked_trainee_rows} linked to users, ${data.unlinked_trainee_rows} unlinked).`,
        );
      }
      await refreshImports();
    } catch (err) {
      setImportResult(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  async function approveGoal(goalId: string) {
    if (!traineeUserId.trim()) return;
    setIlpMessage(null);
    try {
      const res = await fetch(
        `/api/v1/programs/${programSlug}/ilp/${encodeURIComponent(goalId)}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trainee_user_id: traineeUserId.trim(), period: "current" }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not approve goal.");
      setIlpMessage("Goal approved and activated.");
      await loadIlpGoals(traineeUserId);
    } catch (err) {
      setIlpMessage(err instanceof Error ? err.message : "Could not approve goal.");
    }
  }

  async function loadBatchPreCcc() {
    setBatchLoading(true);
    try {
      const res = await fetch(`/api/v1/programs/${programSlug}/pre-ccc-cohort?period=current`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load batch summaries.");
      setBatchSummaries(data.summaries ?? []);
    } catch {
      setBatchSummaries([]);
    } finally {
      setBatchLoading(false);
    }
  }

  async function exportBatchPreCccPdf() {
    if (!batchSummaries.length) return;
    setBatchExporting(true);
    try {
      const blob = await exportPreCccBatchPdf(batchSummaries);
      downloadBlob(blob, `pre-ccc-cohort-${programSlug}-current.pdf`);
    } finally {
      setBatchExporting(false);
    }
  }

  async function triggerMedhubSync() {
    setSyncResult(null);
    const res = await fetch(`/api/v1/programs/${programSlug}/imports/medhub/sync`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      setSyncResult(data.message ?? "Sync request failed.");
      return;
    }
    const last = data.recent_runs?.[0] as
      | { status?: string; started_at?: string }
      | undefined;
    const history =
      data.recent_runs?.length > 1
        ? ` · ${data.recent_runs.length} run(s) logged`
        : "";
    setSyncResult(
      `${data.message ?? `Status: ${data.status}`}${last?.started_at ? ` · last check ${new Date(last.started_at).toLocaleString()}` : ""}${history}`,
    );
  }

  async function submitPriteImport() {
    if (!priteCsv.trim()) {
      setPriteResult("Paste PRITE CSV first.");
      return;
    }
    setPriteResult(null);
    const res = await fetch(`/api/v1/programs/${programSlug}/exams/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv_text: priteCsv }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPriteResult(data.message ?? "PRITE import failed.");
      return;
    }
    setPriteResult(
      data.demo
        ? `Demo: parsed ${data.preview?.length ?? 0} row(s).`
        : `Imported ${data.row_count} PRITE row(s).`,
    );
  }

  async function submitSurvey() {
    const manual = Number(surveyManual);
    const fiscmak = Number(surveyFiscmak);
    const saved =
      manual > 0 ? Math.round(((manual - fiscmak) / manual) * 100) : Number(surveySaved) || 0;

    const res = await fetch(`/api/v1/programs/${programSlug}/pilot-survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prep_minutes_manual: manual,
        prep_minutes_fiscmak: fiscmak,
        percent_time_saved: Math.max(0, Math.min(100, saved)),
        would_recommend: surveyRecommend,
        notes: surveyNotes,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSurveySaved(`Error: ${data.message ?? "Could not submit survey."}`);
      return;
    }
    setSurveySaved(
      data.demo
        ? "Demo mode — survey not persisted."
        : `Submitted — ${saved}% prep time reduction reported.`,
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-cx-label uppercase">GME pilot</p>
        <h3 className="mt-1 text-lg font-semibold text-cx-text">MedHub CSV import</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Upload outpatient or rotation eval exports. Example format:{" "}
          <code className="text-xs">docs/seeds/examples/uh_medhub_outpatient_eval_wide.csv</code>
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="file"
            accept=".csv,text/csv"
            className="block w-full max-w-md text-sm"
            onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
          />
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Or paste CSV text here…"
            rows={6}
            className="cx-field w-full font-mono text-xs"
          />
          <Button onClick={() => void submitImport()} disabled={importing}>
            {importing ? "Importing…" : "Import CSV"}
          </Button>
          {importResult && <p className="text-sm text-cx-text/80">{importResult}</p>}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cx-text">Import history</h3>
        {imports.length === 0 ? (
          <p className="mt-2 text-sm text-cx-text/70">No imports yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {imports.map((row) => (
              <li key={row.import_id} className="rounded-lg border border-cx-forest-dark/10 px-3 py-2">
                <p className="font-medium text-cx-text">
                  {row.file_name ?? "import.csv"} · {row.row_count ?? 0} rows
                </p>
                <p className="text-xs text-cx-text/60">
                  {new Date(row.imported_at).toLocaleString()}
                  {row.quality_report?.forms?.length
                    ? ` · ${row.quality_report.forms.join(", ")}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cx-text">MedHub live sync</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Pilot uses CSV import by default. Live sync requires{" "}
          <code className="text-xs">MEDHUB_API_URL</code> +{" "}
          <code className="text-xs">MEDHUB_API_KEY</code> env vars.
        </p>
        <Button className="mt-3" variant="secondary" onClick={() => void triggerMedhubSync()}>
          Check sync status
        </Button>
        {syncResult && <p className="mt-2 text-sm text-cx-text/80">{syncResult}</p>}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cx-text">PRITE scores import</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Example:{" "}
          <code className="text-xs">docs/seeds/examples/uh_prite_scores_wide.csv</code>
        </p>
        <textarea
          value={priteCsv}
          onChange={(e) => setPriteCsv(e.target.value)}
          placeholder="Paste PRITE CSV…"
          rows={4}
          className="cx-field mt-3 w-full font-mono text-xs"
        />
        <Button className="mt-3" variant="secondary" onClick={() => void submitPriteImport()}>
          Import PRITE CSV
        </Button>
        {priteResult && <p className="mt-2 text-sm text-cx-text/80">{priteResult}</p>}
      </Card>

      <CohortHeatmapPanel programSlug={programSlug} />

      <Card>
        <h3 className="text-lg font-semibold text-cx-text">Batch pre-CCC (cohort)</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Load pre-CCC snapshots for all trainees linked to the program or import.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void loadBatchPreCcc()} disabled={batchLoading}>
            {batchLoading ? "Loading…" : "Load cohort summaries"}
          </Button>
          {batchSummaries.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => void exportBatchPreCccPdf()}
              disabled={batchExporting}
            >
              {batchExporting ? "Exporting…" : "Export cohort PDF"}
            </Button>
          )}
        </div>
        {batchSummaries.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {batchSummaries.map((s) => (
              <li key={s.trainee_user_id ?? s.trainee_initials} className="rounded-lg border border-cx-forest-dark/10 px-3 py-2">
                <p className="font-medium text-cx-text">
                  {s.trainee_initials ?? "—"} · PGY {s.pgy_level ?? "—"}
                </p>
                <p className="text-xs text-cx-text/60">
                  {s.evaluations.length} eval(s) · avg {s.milestone_overview.average_across_evals ?? "—"} ·{" "}
                  {s.prite_scores.exams.length ? `PRITE ${s.prite_scores.exams[0]?.overall_percentile ?? "—"}th` : "no PRITE"} ·{" "}
                  {s.ilp_status.active_count} active ILP goal(s)
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cx-text">ILP review (PD)</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Approve trainee draft goals after CCC co-production.
        </p>
        <input
          value={traineeUserId}
          onChange={(e) => setTraineeUserId(e.target.value)}
          placeholder={meUserId ?? "trainee uuid"}
          className="cx-field mt-3 w-full max-w-md font-mono text-xs"
        />
        {ilpLoading ? (
          <p className="mt-3 text-sm text-cx-text/70">Loading ILP goals…</p>
        ) : ilpGoals.length === 0 ? (
          <p className="mt-3 text-sm text-cx-text/70">No ILP goals for this trainee.</p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {ilpGoals.map((goal) => (
              <li key={goal.goal_id} className="rounded-lg border border-cx-forest-dark/10 px-3 py-2">
                <p className="font-medium text-cx-text">{goal.goal_text}</p>
                <p className="mt-1 text-xs text-cx-text/60">
                  {goal.status} · {goal.source ?? "unknown source"}
                </p>
                {goal.status === "draft" && (
                  <Button
                    className="mt-2"
                    variant="secondary"
                    onClick={() => void approveGoal(goal.goal_id)}
                  >
                    Approve goal
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {ilpMessage && <p className="mt-3 text-sm text-cx-text/80">{ilpMessage}</p>}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cx-text">Coordinator prep-time survey</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Pilot metric: compare manual CCC prep minutes vs FISCMAK-assisted prep.
        </p>
        <div className="mt-4 grid max-w-md gap-3 text-sm">
          <label className="block">
            Manual prep (minutes)
            <input
              type="number"
              min={0}
              value={surveyManual}
              onChange={(e) => setSurveyManual(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block">
            FISCMAK-assisted prep (minutes)
            <input
              type="number"
              min={0}
              value={surveyFiscmak}
              onChange={(e) => setSurveyFiscmak(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={surveyRecommend}
              onChange={(e) => setSurveyRecommend(e.target.checked)}
            />
            Would recommend for CCC prep
          </label>
          <textarea
            value={surveyNotes}
            onChange={(e) => setSurveyNotes(e.target.value)}
            placeholder="Optional notes…"
            rows={3}
            className="cx-field w-full text-sm"
          />
          <Button variant="secondary" onClick={() => void submitSurvey()}>
            Submit survey
          </Button>
          {surveySaved && <p className="text-cx-text/80">{surveySaved}</p>}
        </div>
      </Card>

      {traineeUserId.trim() && (
        <PreCccSummaryPanel
          programSlug={programSlug}
          userId={traineeUserId.trim()}
          title="Pre-CCC summary (PD view)"
        />
      )}
    </div>
  );
}
