"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { RotationEntryRow } from "@/lib/v2/gme/trainee-gme-data";

type RotationLogPanelProps = {
  title?: string;
  description?: string;
};

export function RotationLogPanel({
  title = "Rotation log",
  description = "Record where you are in training — feeds your activity timeline and CCC prep context.",
}: RotationLogPanelProps) {
  const [entries, setEntries] = useState<RotationEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rotationName, setRotationName] = useState("");
  const [pgyLevel, setPgyLevel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [site, setSite] = useState("");
  const [notes, setNotes] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/rotation-entries");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load rotation entries.");
      setEntries(data.entries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load rotation entries.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    void fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.pgy_level) {
          setPgyLevel((prev) => prev || String(data.pgy_level));
        }
      })
      .catch(() => undefined);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rotationName.trim()) {
      setError("Rotation name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/rotation-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rotation_name: rotationName.trim(),
          pgy_level: pgyLevel.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          site: site.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not log rotation.");

      setRotationName("");
      setStartDate("");
      setEndDate("");
      setSite("");
      setNotes("");
      setMessage(`Logged ${data.entry?.rotation_name ?? "rotation"}.`);
      await loadEntries();
      window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log rotation.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDateRange(entry: RotationEntryRow): string {
    if (entry.start_date && entry.end_date) {
      return `${entry.start_date} → ${entry.end_date}`;
    }
    return entry.start_date ?? entry.end_date ?? "Dates not set";
  }

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · Training</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">{title}</h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">{description}</p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="text-cx-forest-dark/70">Rotation name *</span>
          <input
            className="cx-field mt-1 w-full"
            value={rotationName}
            onChange={(e) => setRotationName(e.target.value)}
            placeholder="e.g. Inpatient Psychiatry — CMC"
            list="rotation-name-suggestions"
            required
          />
          <datalist id="rotation-name-suggestions">
            <option value="Inpatient Psychiatry" />
            <option value="Outpatient Psychiatry" />
            <option value="Consultation-Liaison" />
            <option value="Emergency Psychiatry" />
            <option value="Child & Adolescent Psychiatry" />
            <option value="Addiction Psychiatry" />
            <option value="Neurology" />
            <option value="Night Float" />
          </datalist>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-cx-forest-dark/70">PGY level</span>
            <input
              className="cx-field mt-1 w-full"
              value={pgyLevel}
              onChange={(e) => setPgyLevel(e.target.value)}
              placeholder="PGY-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-cx-forest-dark/70">Site</span>
            <input
              className="cx-field mt-1 w-full"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="UH Cleveland Medical Center"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-cx-forest-dark/70">Start date</span>
            <input
              type="date"
              className="cx-field mt-1 w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-cx-forest-dark/70">End date</span>
            <input
              type="date"
              className="cx-field mt-1 w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-cx-forest-dark/70">Notes (optional)</span>
          <textarea
            className="cx-field mt-1 min-h-[72px] w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Supervisor, learning goals, or block context"
          />
        </label>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Log rotation"}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-800">{message}</p>}

      <div className="mt-6 border-t border-cx-forest-dark/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
          Your log
        </p>
        {loading ? (
          <p className="mt-2 text-sm text-cx-forest-dark/60">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="mt-2 text-sm text-cx-forest-dark/60">
            No rotations logged yet — add your current or upcoming block above.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.entry_id}
                className="rounded-lg border border-cx-forest-dark/10 px-3 py-2 text-sm"
              >
                <p className="font-medium text-cx-forest-dark">{entry.rotation_name}</p>
                <p className="mt-0.5 text-xs text-cx-forest-dark/60">
                  {[entry.pgy_level, formatDateRange(entry), entry.site]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {entry.notes && (
                  <p className="mt-1 text-xs leading-relaxed text-cx-forest-dark/70">
                    {entry.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
