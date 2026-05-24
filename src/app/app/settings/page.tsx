"use client";

import { Shield } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { PageShell } from "@/components/layout/PageShell";
import { PremiumUpgradePanel } from "@/components/settings/PremiumUpgradePanel";
import { SETTINGS_MAK } from "@/lib/card-mak-prompts";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Account"
      title="Settings"
      subtitle="Privacy and preferences"
      maxWidth="md"
    >
      <PremiumUpgradePanel />
      <CardSection
        eyebrow="Privacy"
        title="Institution data sharing"
        description="Your institution cannot see Mak conversations, energy signals, or private reflections. Only aggregate trends if you opt in (n≥5)."
        icon={Shield}
        mak={SETTINGS_MAK.privacy}
      >
        <p className="text-sm text-cx-forest-dark/80">Share my data with my institution?</p>
        <label className="mt-4 flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 rounded border-cx-forest-dark/30" />
          <span className="text-sm text-cx-forest-dark">No (default) — keep my data private</span>
        </label>
      </CardSection>
    </PageShell>
  );
}
