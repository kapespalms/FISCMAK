"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { resolveAcademicProfile, isAcademicContext } from "@/lib/v2/academic-profiles";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";

type ProfileMeta = {
  practice_setting?: PracticeSetting | null;
  career_stage?: CareerStage | null;
  academic_rank?: AcademicRank | null;
  primary_career_track?: string | null;
};

export function CareerDataVaultPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [profile, setProfile] = useState<ProfileMeta>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [analyticsRes, profileRes] = await Promise.all([
        fetch("/api/v1/analytics/dashboard"),
        fetch("/api/v1/onboarding/touchpoint1"),
      ]);
      setAnalytics(await analyticsRes.json());
      setProfile(await profileRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onUpdate = () => void load();
    window.addEventListener("fiscmak:touchpoint-complete", onUpdate);
    return () => window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
  }, [load]);

  if (loading) {
    return <p className="text-sm text-fiscmak-muted">Loading Career Data vault…</p>;
  }

  const vault = analytics?.career_vault;
  const academic = isAcademicContext({
    setting: profile.practice_setting,
    level: profile.career_stage,
  })
    ? resolveAcademicProfile({
        setting: profile.practice_setting,
        level: profile.career_stage,
        rank: profile.academic_rank,
        track: profile.primary_career_track,
      })
    : null;

  if (!vault?.sections.length) {
    return (
      <Card>
        <p className="text-sm text-fiscmak-muted">
          Upload a CV and run enrichment to populate your Career Data vault from OpenAlex, NIH
          RePORTER, and CV parse.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card accent="green">
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">Career Data Vault</p>
        <h2 className="mt-1 text-lg font-bold">
          {academic?.objectiveLead ?? "Verified career record"}
        </h2>
        <p className="mt-2 text-sm font-medium text-fiscmak-ink">{vault.summary}</p>
        {vault.changes_since_quarter && (
          <p className="mt-2 text-sm text-fm-strong">{vault.changes_since_quarter}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-fiscmak-muted">
          {vault.sources.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
          {vault.last_enrichment_at && (
            <span>Last enriched {new Date(vault.last_enrichment_at).toLocaleDateString()}</span>
          )}
          {vault.citations_total != null && (
            <span>{vault.citations_total.toLocaleString()} citations indexed</span>
          )}
        </div>
        {vault.pending_review > 0 && (
          <p className="mt-2 text-sm text-fm-developing">
            {vault.pending_review} item{vault.pending_review > 1 ? "s" : ""} pending review in
            Reconcile tab
          </p>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vault.sections.map(({ id, label, count }) => (
          <Card key={id}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{label}</p>
              <Badge>{count}</Badge>
            </div>
            <p className="mt-1 text-xs text-fiscmak-muted">Verified from enrichment + CV parse</p>
          </Card>
        ))}
      </div>

      {(vault.npi_verified || vault.orcid) && (
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">Identifiers</p>
          <ul className="mt-2 space-y-1 text-sm">
            {vault.npi_verified && <li>NPI verified via NPPES</li>}
            {vault.orcid && <li>ORCID: {vault.orcid}</li>}
          </ul>
        </Card>
      )}

      {academic && (
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">Academic focus</p>
          <p className="mt-2 text-sm">{academic.promotionFocus}</p>
          <p className="mt-2 text-xs text-fiscmak-muted">
            Primary output templates: {academic.outputTemplates.join(" · ")}
          </p>
        </Card>
      )}
    </div>
  );
}
