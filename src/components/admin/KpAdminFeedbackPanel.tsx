"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { MakFeedbackGlobalAnalytics } from "@/lib/v2/chat-feedback-admin";

export function KpAdminFeedbackPanel() {
  const [analytics, setAnalytics] = useState<MakFeedbackGlobalAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/kp-admin/feedback")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data: { analytics: MakFeedbackGlobalAnalytics | null }) => {
        setAnalytics(data.analytics);
      })
      .catch(() => setError("Could not load Mak feedback analytics."));
  }, []);

  return (
    <Card>
      <p className="text-cx-label uppercase">Internal · Mak feedback</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">Chat feedback analytics</h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        Platform-wide thumbs up/down on Mak messages (last 500 ratings).
      </p>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {!analytics && !error && (
        <p className="mt-3 text-sm text-cx-forest-dark/70">Loading…</p>
      )}

      {analytics && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
              <p className="text-xs uppercase text-cx-forest-dark/60">Thumbs up</p>
              <p className="text-xl font-semibold text-cx-forest-dark">{analytics.thumbs_up}</p>
            </div>
            <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
              <p className="text-xs uppercase text-cx-forest-dark/60">Thumbs down</p>
              <p className="text-xl font-semibold text-cx-forest-dark">{analytics.thumbs_down}</p>
            </div>
            <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
              <p className="text-xs uppercase text-cx-forest-dark/60">Total sampled</p>
              <p className="text-xl font-semibold text-cx-forest-dark">{analytics.total}</p>
            </div>
            <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
              <p className="text-xs uppercase text-cx-forest-dark/60">Unique users</p>
              <p className="text-xl font-semibold text-cx-forest-dark">{analytics.unique_users}</p>
            </div>
          </div>

          {analytics.recent.length > 0 ? (
            <ul className="space-y-2 text-xs text-cx-forest-dark/70">
              {analytics.recent.map((row, i) => (
                <li
                  key={`${row.created_at}-${row.user_id}-${i}`}
                  className="rounded-md bg-cx-forest-dark/[0.04] px-2 py-1.5"
                >
                  <span className="font-medium">
                    {row.rating === "up" ? "Up" : "Down"}
                    {row.section ? ` · ${row.section}` : ""}
                  </span>
                  <span className="text-cx-forest-dark/50"> · {row.user_id.slice(0, 8)}…</span>
                  {row.preview ? <p className="mt-0.5 line-clamp-2">{row.preview}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cx-forest-dark/60">No ratings yet.</p>
          )}
        </div>
      )}

      {!analytics && !error && (
        <p className="mt-3 text-xs text-cx-forest-dark/60">
          Requires chat_feedback migration and service role.
        </p>
      )}
    </Card>
  );
}
