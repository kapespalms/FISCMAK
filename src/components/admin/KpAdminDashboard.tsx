"use client";

import { useEffect, useState } from "react";
import { InstitutionalOnboardingWelcome } from "@/components/onboarding/InstitutionalOnboardingWelcome";
import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { AssessmentInsightsCompositePanel } from "@/components/workspace/retired/AssessmentInsightsCompositePanel";
import { Card } from "@/components/ui/Card";
import { UH_PSYCH_CMC_PROGRAM } from "@/lib/v2/programs/registry";
import { KpAdminProgramInvitesPanel } from "@/components/admin/KpAdminProgramInvitesPanel";
import { RETIRED_METRICS_DEMO } from "@/lib/v2/user-facing-analytics";
import type { KpAdminTrackingSnapshot } from "@/lib/v2/kp-admin-tracking";
import type { MakCoachingHint } from "@/lib/v2/mak-coaching-prompts";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";

const DEMO_HEALTH_HEADER: DashboardHeaderModel = {
  displayName: "Dr. Preview",
  degree: "MD",
  profileLine: "Psychiatry · Academic · Resident",
  careerHealthScore: RETIRED_METRICS_DEMO.careerHealthScore,
  previousScore: RETIRED_METRICS_DEMO.previousScore,
  scoreStatus: RETIRED_METRICS_DEMO.scoreStatus,
  trend: RETIRED_METRICS_DEMO.trend,
  lastUpdated: "2026-05-21",
  nextCheckIn: "2026-07-01",
  quarterlyPulseDue: false,
  annualRefreshDue: false,
  pulseStreak: 2,
};

type TrackingResponse = {
  cv_uploaded: boolean;
  tracking: KpAdminTrackingSnapshot;
  mak_coaching: {
    escalation_level: number;
    hints: MakCoachingHint[];
    context_block: string;
  };
};

function KpAdminInternalCoachingPanel() {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/kp-admin/tracking")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Could not load internal coaching signals."));
  }, []);

  const tracking = data?.tracking;
  const mak = data?.mak_coaching;

  return (
    <Card>
      <p className="text-cx-label uppercase">Internal · Mak input only</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">
        Invisible workload signals (never user-facing)
      </h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        S-Index and related CV-regex inputs improve Mak coaching quality silently. Physicians
        never see these metrics — doing so would risk invisibility work (hiding effort from
        tracking). KP Admin mirrors what Mak receives server-side.
      </p>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {!data && !error && (
        <p className="mt-3 text-sm text-cx-forest-dark/70">Loading…</p>
      )}

      {tracking && (
        <div className="mt-4 space-y-4">
          <p className="rounded-lg bg-cx-forest-dark/[0.04] px-3 py-2 font-futura-book tracking-wide text-xs text-cx-forest-dark/80">
            {tracking.metric.formula_summary}
          </p>

          {!tracking.available ? (
            <p className="text-sm text-cx-forest-dark/70">Upload a CV to compute internal signals.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
                  <p className="text-xs uppercase text-cx-forest-dark/60">S-Index (dev)</p>
                  <p className="text-xl font-semibold">{tracking.s_index}</p>
                </div>
                <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
                  <p className="text-xs uppercase text-cx-forest-dark/60">Footprint band</p>
                  <p className="text-sm font-semibold capitalize">{tracking.service_footprint_band}</p>
                </div>
                <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
                  <p className="text-xs uppercase text-cx-forest-dark/60">Recognition gap</p>
                  <p className="text-sm font-semibold capitalize">{tracking.workload_recognition_gap}</p>
                </div>
                <div className="rounded-xl border border-cx-forest-dark/10 px-3 py-3">
                  <p className="text-xs uppercase text-cx-forest-dark/60">Mak escalation</p>
                  <p className="text-xl font-semibold">{mak?.escalation_level ?? "—"}/4</p>
                </div>
              </div>

              {mak?.hints?.length ? (
                <div>
                  <p className="text-sm font-semibold text-cx-forest-dark">Mak coaching hints (paraphrase only)</p>
                  <ul className="mt-2 space-y-2 text-sm text-cx-forest-dark/80">
                    {mak.hints.map((h) => (
                      <li key={`${h.technique}-${h.hint.slice(0, 24)}`} className="rounded-lg border border-cx-forest-dark/10 px-3 py-2">
                        <span className="text-xs uppercase text-cx-forest-dark/55">{h.technique}</span>
                        <p className="mt-1">{h.hint}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function RetiredSurfacePreview({ componentId }: { componentId: string }) {
  if (componentId === "institutional_onboarding_welcome") {
    return (
      <div className="pointer-events-none select-none opacity-95">
        <InstitutionalOnboardingWelcome program={UH_PSYCH_CMC_PROGRAM} onBegin={() => {}} />
      </div>
    );
  }

  if (componentId === "health_score_card") {
    return (
      <div className="pointer-events-none max-w-xs select-none opacity-95">
        <HealthScoreCard header={DEMO_HEALTH_HEADER} />
      </div>
    );
  }

  if (componentId === "assessment_composite_metrics") {
    return (
      <div className="pointer-events-none select-none opacity-95">
        <AssessmentInsightsCompositePanel
          insights={{
            coherence_score: RETIRED_METRICS_DEMO.coherence_score,
            coherence_label: RETIRED_METRICS_DEMO.coherence_label,
            s_index: RETIRED_METRICS_DEMO.s_index,
            service_citizenship_summary: RETIRED_METRICS_DEMO.service_citizenship_summary,
            unrecognized_work_summary: RETIRED_METRICS_DEMO.unrecognized_work_summary,
            recognition_gaps: RETIRED_METRICS_DEMO.recognition_gaps,
          }}
        />
      </div>
    );
  }

  return (
    <p className="text-sm text-cx-forest-dark/70">Preview not wired for this component.</p>
  );
}

export function KpAdminDashboard() {
  return (
    <div className="space-y-8">
      <Card>
        <p className="text-cx-label uppercase">KP Admin</p>
        <h2 className="mt-1 text-lg font-semibold text-cx-forest-dark">Founder tools</h2>
        <p className="mt-2 text-sm text-cx-forest-dark/75">
          Internal Mak inputs and retired surfaces — not linked in user onboarding or navigation.
        </p>
      </Card>

      <KpAdminProgramInvitesPanel />

      <KpAdminInternalCoachingPanel />

      <Card>
        <h3 className="text-lg font-semibold text-cx-forest-dark">Retired surfaces</h3>
        <p className="mt-2 text-sm text-cx-forest-dark/75">
          Historical UI removed from user flows per evidence review.
        </p>
      </Card>

      {RETIRED_SURFACES.map((surface) => (
        <section key={surface.id} className="space-y-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Retired · {surface.retiredAt}
            </p>
            <h3 className="mt-1 font-semibold text-cx-forest-dark">{surface.title}</h3>
            <p className="mt-1 text-sm text-cx-forest-dark/75">{surface.reason}</p>
          </div>
          <RetiredSurfacePreview componentId={surface.component} />
        </section>
      ))}
    </div>
  );
}
