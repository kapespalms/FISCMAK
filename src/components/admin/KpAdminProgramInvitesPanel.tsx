"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

type ProgramRow = {
  slug: string;
  display_title: string;
  content_tier: string;
  invite_slot_capacity: number;
};

type TokenRow = {
  slot_number: number;
  token: string;
  join_url: string;
  label: string | null;
  trainee_initials: string | null;
  used: boolean;
};

export function KpAdminProgramInvitesPanel() {
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [selected, setSelected] = useState("uh-psych-cmc");
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [summary, setSummary] = useState<{ total: number; used: number; available: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/program-invites")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load programs");
        return r.json();
      })
      .then((data) => {
        setPrograms(data.programs ?? []);
      })
      .catch(() => setError("Could not load programs."));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setError(null);
    fetch(`/api/v1/admin/program-invites?program=${encodeURIComponent(selected)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load tokens");
        return r.json();
      })
      .then((data) => {
        setTokens(data.tokens ?? []);
        setSummary({ total: data.total, used: data.used, available: data.available });
      })
      .catch(() => setError("Could not load invite tokens. Run npm run db:invite-tokens first."));
  }, [selected]);

  return (
    <Card>
      <p className="text-cx-label uppercase">Program invites</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">Resident join links</h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        One invite token per resident slot. UH Psychiatry uses full rotation seeds; blank pathways
        ship without institution-specific documents until you add them.
      </p>

      <div className="mt-4">
        <label htmlFor="invite-program" className="cx-field-label">
          Program
        </label>
        <select
          id="invite-program"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="cx-field mt-2 w-full max-w-md"
        >
          {programs.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.display_title} ({p.content_tier})
            </option>
          ))}
        </select>
      </div>

      {summary && (
        <p className="mt-3 text-sm text-cx-forest-dark/80">
          {summary.available} available · {summary.used} used · {summary.total} total slots
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {tokens.length > 0 && (
        <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-cx-forest-dark/10">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-cx-surface/95 text-xs uppercase text-cx-forest-dark/60">
              <tr>
                <th className="px-3 py-2">Slot</th>
                <th className="px-3 py-2">Initials</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Join link</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.token} className="border-t border-cx-forest-dark/10">
                  <td className="px-3 py-2">{t.slot_number}</td>
                  <td className="px-3 py-2 font-futura-book tracking-wide">{t.trainee_initials ?? "—"}</td>
                  <td className="px-3 py-2">{t.used ? "Used" : "Available"}</td>
                  <td className="px-3 py-2">
                    <a
                      href={t.join_url}
                      className="break-all text-cx-teal underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.join_url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-cx-forest-dark/60">
        Generate or refresh tokens: <code className="font-futura-book tracking-wide">npm run db:invite-tokens -- --all</code>
      </p>
    </Card>
  );
}
