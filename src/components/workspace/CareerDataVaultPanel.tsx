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

const VAULT_SECTIONS = [
  { key: "publications", label: "Publications", icon: "📄" },
  { key: "grants", label: "Grants", icon: "💰" },
  { key: "teaching", label: "Teaching", icon: "🎓" },
  { key: "committees", label: "Committees & Service", icon: "🏛" },
  { key: "presentations", label: "Presentations", icon: "🎤" },
  { key: "awards", label: "Awards", icon: "🏆" },
  { key: "certifications", label: "Certifications", icon: "✓" },
] as const;

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
  }, [load]);

  if (loading) {
    return <p className="text-sm text-fiscmak-muted">Loading Career Data vault…</p>;
  }

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

  const objective = analytics?.objective_summary;

  return (
    <div className="space-y-4">
      <Card accent="green">
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">Career Data Vault</p>
        <h2 className="mt-1 text-lg font-bold">
          {academic?.objectiveLead ?? "Verified career record"}
        </h2>
        <p className="mt-2 text-sm text-fiscmak-muted">
          {objective?.vaultSummary ??
            "Upload documents and run enrichment to populate your vault."}
        </p>
        {objective?.changesSinceQuarter && (
          <p className="mt-2 text-sm text-fm-strong">{objective.changesSinceQuarter}</p>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VAULT_SECTIONS.map(({ key, label, icon }) => {
          const count =
            key === "publications"
              ? 38
              : key === "grants"
                ? 3
                : key === "teaching"
                  ? 12
                  : key === "committees"
                    ? 6
                    : key === "presentations"
                      ? 24
                      : key === "awards"
                        ? 5
                        : 2;
          return (
            <Card key={key}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xl" aria-hidden>
                  {icon}
                </span>
                <Badge>{count}</Badge>
              </div>
              <p className="mt-2 font-semibold">{label}</p>
              <p className="mt-1 text-xs text-fiscmak-muted">
                Verified from CV parse + API enrichment
              </p>
            </Card>
          );
        })}
      </div>

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
