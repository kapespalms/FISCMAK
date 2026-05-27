"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PreCccSummaryPanel } from "@/components/gme/PreCccSummaryPanel";

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

export function KpAdminGmePanel() {
  const programSlug = "uh-psych-cmc";
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("medhub.csv");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [traineeUserId, setTraineeUserId] = useState("");
  const [meUserId, setMeUserId] = useState<string | null>(null);

  const refreshImports = useCallback(async () => {
    const res = await fetch(`/api/v1/programs/${programSlug}/imports`);
    if (!res.ok) return;
    const data = await res.json();
    setImports(data.imports ?? []);
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

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-cx-label uppercase">GME pilot</p>
        <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">MedHub CSV import</h3>
        <p className="mt-2 text-sm text-cx-forest-dark/75">
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
          {importResult && <p className="text-sm text-cx-forest-dark/80">{importResult}</p>}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-cx-forest-dark">Import history</h3>
        {imports.length === 0 ? (
          <p className="mt-2 text-sm text-cx-forest-dark/70">No imports yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {imports.map((row) => (
              <li key={row.import_id} className="rounded-lg border border-cx-forest-dark/10 px-3 py-2">
                <p className="font-medium text-cx-forest-dark">
                  {row.file_name ?? "import.csv"} · {row.row_count ?? 0} rows
                </p>
                <p className="text-xs text-cx-forest-dark/60">
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
        <h3 className="text-lg font-semibold text-cx-forest-dark">Pre-CCC preview</h3>
        <p className="mt-2 text-sm text-cx-forest-dark/75">
          Enter a trainee user ID (defaults to your account for self-test).
        </p>
        <input
          value={traineeUserId}
          onChange={(e) => setTraineeUserId(e.target.value)}
          placeholder={meUserId ?? "user uuid"}
          className="cx-field mt-3 w-full max-w-md font-mono text-xs"
        />
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
