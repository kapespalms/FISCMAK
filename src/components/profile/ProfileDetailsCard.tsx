"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdditionalDegreesFields } from "@/components/onboarding/AdditionalDegreesFields";
import { OnboardingBeyondPhysicianFields } from "@/components/onboarding/OnboardingBeyondPhysicianFields";
import { SubspecialtyInterestsFields } from "@/components/onboarding/SubspecialtyInterestsFields";
import type { AdditionalDegreeEntry } from "@/lib/v2/onboarding-profile-fields";

type FteMap = { clinical: string; teaching: string; research: string; admin: string };

type ProfileDetails = {
  additional_degrees: AdditionalDegreeEntry[];
  current_goal: string | null;
  other_industries: string[];
  extracurricular_interests: string[];
  subspecialty_interests: string[];
  years_in_practice: number | null;
  base_specialty: string | null;
  fte_actual: Record<string, number> | null;
  fte_expected: Record<string, number> | null;
};

const DISMISS_KEY = "fiscmak_profile_details_dismissed";

function fteFromRecord(r: Record<string, number> | null): FteMap {
  if (!r) return { clinical: "", teaching: "", research: "", admin: "" };
  const pct = (v: number | undefined) => (v != null && v > 0 ? String(Math.round(v * 100)) : "");
  return {
    clinical: pct(r.clinical),
    teaching: pct(r.teaching),
    research: pct(r.research),
    admin:    pct(r.admin),
  };
}

function fteToRecord(m: FteMap): Record<string, number> | null {
  const vals = {
    clinical: parseFloat(m.clinical) / 100,
    teaching: parseFloat(m.teaching) / 100,
    research: parseFloat(m.research) / 100,
    admin:    parseFloat(m.admin)    / 100,
  };
  const hasAny = Object.values(vals).some((v) => !isNaN(v) && v > 0);
  if (!hasAny) return null;
  return {
    clinical: isNaN(vals.clinical) ? 0 : vals.clinical,
    teaching: isNaN(vals.teaching) ? 0 : vals.teaching,
    research: isNaN(vals.research) ? 0 : vals.research,
    admin:    isNaN(vals.admin)    ? 0 : vals.admin,
  };
}

const FTE_ROLES: { key: keyof FteMap; label: string }[] = [
  { key: "clinical",  label: "Clinical" },
  { key: "teaching",  label: "Teaching" },
  { key: "research",  label: "Research" },
  { key: "admin",     label: "Admin" },
];

function FteInputRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-cx-text/55">{label}</p>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="cx-field w-16 text-base text-black"
        />
        <span className="text-sm text-cx-text/50">%</span>
      </div>
    </div>
  );
}

export function ProfileDetailsCard() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [additionalDegrees, setAdditionalDegrees] = useState<AdditionalDegreeEntry[]>([]);
  const [otherIndustries, setOtherIndustries] = useState<string[]>([]);
  const [extracurricularInterests, setExtracurricularInterests] = useState<string[]>([]);
  const [subspecialtyInterests, setSubspecialtyInterests] = useState<string[]>([]);
  const [yearsInPractice, setYearsInPractice] = useState("");
  const [baseSpecialty, setBaseSpecialty] = useState<string | null>(null);
  const [fteActual, setFteActual] = useState<FteMap>({ clinical: "", teaching: "", research: "", admin: "" });

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") {
      setDismissed(true);
      return;
    }
    fetch("/api/v1/onboarding/profile")
      .then((r) => r.json())
      .then((d: ProfileDetails) => {
        setAdditionalDegrees(d.additional_degrees ?? []);
        setOtherIndustries(d.other_industries ?? []);
        setExtracurricularInterests(d.extracurricular_interests ?? []);
        setSubspecialtyInterests(d.subspecialty_interests ?? []);
        setYearsInPractice(d.years_in_practice != null ? String(d.years_in_practice) : "");
        setBaseSpecialty(d.base_specialty ?? null);
        // Prefer fte_actual; fall back to fte_expected if actual not yet captured
        setFteActual(fteFromRecord(d.fte_actual ?? d.fte_expected));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const fteRecord = fteToRecord(fteActual);
      const res = await fetch("/api/v1/onboarding/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          additional_degrees: additionalDegrees,
          other_industries: otherIndustries,
          extracurricular_interests: extracurricularInterests,
          subspecialty_interests: subspecialtyInterests,
          years_in_practice: yearsInPractice !== "" ? Number(yearsInPractice) : null,
          // Write to both fte_actual (→F3) and fte_expected (→F4 baseline)
          fte_actual:   fteRecord,
          fte_expected: fteRecord,
        }),
      });
      if (!res.ok) {
        setError("Could not save — try again.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Could not save — check your connection.");
    } finally {
      setSaving(false);
    }
  }

  if (dismissed || loading) return null;

  const fteTotal = FTE_ROLES.reduce((sum, { key }) => sum + (parseFloat(fteActual[key]) || 0), 0);
  const fteMismatch = fteTotal > 0 && Math.abs(fteTotal - 100) > 1;

  return (
    <div className="rounded-2xl border border-cx-forest-dark/10 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-fis-gold/10">
            <span className="text-xs font-bold text-fis-gold">+</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-cx-text">Complete your profile</p>
            <p className="text-xs text-cx-text/55">
              Time allocation, additional degrees, and interests — optional, helps personalize your lattice.
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp size={16} className="shrink-0 text-cx-text/40" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-cx-text/40" />
        )}
      </button>

      {open && (
        <div className="space-y-8 border-t border-cx-forest-dark/8 px-6 pb-6 pt-5">

          {/* FTE composition — feeds F3 (structural discrepancy) */}
          <div>
            <p className="mb-1 text-sm font-semibold text-cx-text">How you actually spend your time</p>
            <p className="mb-3 text-xs text-cx-text/50">
              Approximate time per area. Feeds the structural discrepancy analysis — e.g., "you spend 40% on admin vs 12% expected for academic settings."
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FTE_ROLES.map(({ key, label }) => (
                <FteInputRow
                  key={key}
                  label={label}
                  value={fteActual[key]}
                  onChange={(v) => setFteActual((prev) => ({ ...prev, [key]: v }))}
                />
              ))}
            </div>
            {fteTotal > 0 && (
              <p className="mt-2 text-xs text-cx-text/50">
                Total:{" "}
                <span className={fteMismatch ? "text-[#C28D6C]" : "text-cx-forest-dark"}>
                  {fteTotal}%
                </span>
                {fteMismatch && " (should add up to 100%)"}
              </p>
            )}
          </div>

          {/* Additional degrees */}
          <div>
            <p className="mb-3 text-sm font-semibold text-cx-text">Additional degrees</p>
            <AdditionalDegreesFields
              value={additionalDegrees}
              onChange={setAdditionalDegrees}
            />
          </div>

          {/* Subspecialty interests (needs baseSpecialty to generate suggestions) */}
          {baseSpecialty && (
            <div>
              <p className="mb-3 text-sm font-semibold text-cx-text">Subspecialty interests</p>
              <SubspecialtyInterestsFields
                baseSpecialty={baseSpecialty}
                selected={subspecialtyInterests}
                onChange={setSubspecialtyInterests}
              />
            </div>
          )}

          {/* Years in practice */}
          <div>
            <p className="mb-3 text-sm font-semibold text-cx-text">Years in practice</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={60}
                value={yearsInPractice}
                onChange={(e) => setYearsInPractice(e.target.value)}
                placeholder="e.g. 12"
                className="cx-field w-24 text-base text-black"
              />
              <span className="text-sm text-cx-text/50">years</span>
            </div>
          </div>

          {/* Beyond physician — other industries + extracurriculars */}
          <OnboardingBeyondPhysicianFields
            otherIndustries={otherIndustries}
            onOtherIndustriesChange={setOtherIndustries}
            extracurricularInterests={extracurricularInterests}
            onExtracurricularInterestsChange={setExtracurricularInterests}
          />

          {error && <p className="text-sm text-[#C28D6C]">{error}</p>}
          {saved && !error && <p className="text-sm text-cx-forest-dark">Saved.</p>}

          <div className="flex items-center justify-between border-t border-cx-forest-dark/8 pt-4">
            <button
              type="button"
              onClick={dismiss}
              className="text-sm text-cx-text/45 underline-offset-2 hover:underline"
            >
              Hide this
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className={cn(
                "rounded-lg bg-fis-gold px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-fis-gold/90 disabled:opacity-50",
              )}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
