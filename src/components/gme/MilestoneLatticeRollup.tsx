"use client";

import { useEffect, useState } from "react";
import type { MilestoneRollupResult } from "@/app/api/v1/trainee/milestones/rollup/route";
import { MilestoneSelfRatingPanel } from "@/components/gme/MilestoneSelfRatingPanel";

// ---------------------------------------------------------------------------
// Level badge — slate pill, visually distinct from density fill + energy glyph
// ---------------------------------------------------------------------------

function LevelBadge({ level }: { level: number | null }) {
  if (level == null) {
    return <span className="text-xs text-cx-text/35">—</span>;
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
      {level.toFixed(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MilestoneLatticeRollup() {
  const [data, setData]     = useState<MilestoneRollupResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/v1/trainee/milestones/rollup?period=current")
      .then((r) => r.json() as Promise<MilestoneRollupResult>)
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-cx-text/50">Loading CCC prep…</p>;
  }

  // Non-trainee: no framework means no subcompetencies seeded for this user
  if (!data || data.total_subcompetencies === 0) {
    return (
      <div className="rounded-xl border border-cx-forest-dark/10 bg-white/80 px-5 py-6 text-center">
        <p className="text-sm font-medium text-cx-text">
          Milestone tracking is for residents and fellows
        </p>
        <p className="mt-1 text-xs text-cx-text/60">
          Update your training stage and specialty in profile settings to enable ACGME
          milestone self-assessment.
        </p>
      </div>
    );
  }

  const hasRatings = data.total_rated > 0;

  return (
    <div className="space-y-8">

      {/* ── Rollup table ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/55">
          Milestone rollup — avg self-level by competency domain
        </p>
        <p className="mt-1 text-xs text-cx-text/60">
          Each row averages your self-ratings for all subcompetencies in that ACGME
          domain. Separate channel from evidence density — not shown on the main
          lattice heatmap.
        </p>

        {!hasRatings && (
          <p className="mt-3 rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] px-4 py-2.5 text-sm text-cx-text/70">
            No milestone self-ratings yet — rate your subcompetencies below before
            your next CCC or semi-annual review.
          </p>
        )}

        <div className="mt-3 divide-y divide-cx-forest-dark/8 overflow-hidden rounded-xl border border-cx-forest-dark/10 bg-white/90">
          {data.skills.map((skill) => {
            const pct =
              skill.total_count > 0
                ? Math.round((skill.rated_count / skill.total_count) * 100)
                : 0;

            return (
              <div
                key={skill.skill_index}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                {/* Skill name */}
                <span className="w-52 shrink-0 text-sm text-cx-text">
                  {skill.skill_name}
                </span>

                {/* Level badge — muted slate pill (not density fill, not energy glyph) */}
                <LevelBadge level={skill.avg_level} />

                {/* Rated progress within this skill */}
                {skill.total_count > 0 && (
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cx-forest-dark/8">
                      <div
                        className="h-full rounded-full bg-slate-400/60 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[10px] text-cx-text/45">
                      {skill.rated_count}/{skill.total_count}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-cx-text/50">
          {data.total_rated} of {data.total_subcompetencies} subcompetencies rated ·
          Current reporting period
        </p>
      </div>

      {/* ── Self-rating entry — reuses existing panel ─────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/55">
          Rate your subcompetencies
        </p>
        <div className="mt-2">
          {/* MilestoneSelfRatingPanel handles its own loading, save, and ILP draft.
              Returns null if no subcompetencies resolved (non-trainee). */}
          <MilestoneSelfRatingPanel />
        </div>
      </div>

    </div>
  );
}
