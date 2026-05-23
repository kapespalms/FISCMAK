"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Fingerprint, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CardSection } from "@/components/ui/CardSection";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { resolveAcademicProfile, isAcademicContext } from "@/lib/v2/academic-profiles";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";
import { OBJECTIVE_MAK, makDiscuss } from "@/lib/card-mak-prompts";

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
    window.addEventListener("fiscmak:activity-logged", onUpdate);
    return () => {
      window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
      window.removeEventListener("fiscmak:activity-logged", onUpdate);
    };
  }, [load]);

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading Career Data vault…</p>;
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
      <CardSection
        eyebrow="Career Data"
        title="Vault empty"
        description="Upload a CV and run enrichment to populate your Career Data vault from OpenAlex, NIH RePORTER, and CV parse."
        icon={Database}
        mak={OBJECTIVE_MAK.documents}
      />
    );
  }

  return (
    <div className="space-y-4">
      <CardSection
        accent={vault.pending_review > 0 ? "amber" : "green"}
        eyebrow="Career Data Vault"
        title={academic?.objectiveLead ?? "Verified career record"}
        description={vault.summary}
        icon={Database}
        mak={OBJECTIVE_MAK.vault}
      >
        {vault.changes_since_quarter && (
          <p className="text-sm font-medium text-cx-forest-dark">{vault.changes_since_quarter}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-cx-forest-dark/70">
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
          <p className="cx-alert-banner mt-3 px-4 py-2 text-sm">
            {vault.pending_review} item{vault.pending_review > 1 ? "s" : ""} pending review in
            Reconcile tab
          </p>
        )}
      </CardSection>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vault.sections.map(({ id, label, count }) => (
          <CardSection
            key={id}
            compact
            title={label}
            description="Verified from enrichment + CV parse"
            action={<Badge>{count}</Badge>}
            mak={OBJECTIVE_MAK.vaultSection(label)}
          />
        ))}
      </div>

      {(vault.npi_verified || vault.orcid) && (
        <CardSection
          eyebrow="Verified IDs"
          title="Professional identifiers"
          icon={Fingerprint}
          mak={makDiscuss(
            "review",
            "Help me verify my professional identifiers — NPI, ORCID, and what's linked correctly.",
          )}
        >
          <ul className="space-y-1 text-sm text-cx-forest-dark/80">
            {vault.npi_verified && <li>NPI verified via NPPES</li>}
            {vault.orcid && <li>ORCID: {vault.orcid}</li>}
          </ul>
        </CardSection>
      )}

      {academic && (
        <CardSection
          eyebrow="Academic context"
          title="Academic focus"
          description={academic.promotionFocus}
          icon={GraduationCap}
          mak={makDiscuss(
            "review",
            "Discuss my academic profile focus and which output templates fit my promotion path.",
          )}
          footer={
            <p className="text-xs text-cx-forest-dark/70">
              Primary output templates: {academic.outputTemplates.join(" · ")}
            </p>
          }
        />
      )}
    </div>
  );
}
