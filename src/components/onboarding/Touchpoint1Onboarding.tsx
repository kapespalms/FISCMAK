"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAREER_LEVELS,
  PRACTICE_SETTINGS,
  ACADEMIC_RANKS,
  PRIMARY_CAREER_TRACKS,
  requiresAcademicRank,
  type AcademicRank,
  type CareerLevel,
  type PracticeSetting,
  type PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import {
  defaultTrainingComplete,
  isValidBaseSpecialty,
  migrateLegacySpecialty,
} from "@/lib/v2/specialty-hierarchy";
import { SpecialtyIntakeFields } from "@/components/onboarding/SpecialtyIntakeFields";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingDocumentsStep } from "@/components/onboarding/OnboardingDocumentsStep";
import { ReconciliationItemCard } from "@/components/onboarding/ReconciliationItemCard";
import { isNpiReconcileItem } from "@/lib/v2/npi-registry";
import type { NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import { useAppShell } from "@/components/layout/AppShell";
import { buildReconcileGreeting } from "@/lib/v2/reconcile-mak-helpers";

type OnboardingStep = "welcome" | "profile" | "documents" | "reconcile" | "instruments";

type InstrumentSpec = {
  id: string;
  name: string;
  items: number;
  minutes: number;
  description: string;
};

type ReconcileItem = {
  id: string;
  source: string;
  label: string;
  detail: string;
  status: "pending" | "confirmed" | "rejected";
};

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents" },
  { id: "reconcile", label: "Reconcile" },
  { id: "instruments", label: "Coach Mak" },
];

export function Touchpoint1Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startMakFlow } = useAppShell();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [baseSpecialty, setBaseSpecialty] = useState("");
  const [baseQuery, setBaseQuery] = useState("");
  const [baseListOpen, setBaseListOpen] = useState(false);
  const [subspecialty, setSubspecialty] = useState("");
  const [subspecialtyQuery, setSubspecialtyQuery] = useState("");
  const [subspecialtyListOpen, setSubspecialtyListOpen] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [careerLevel, setCareerLevel] = useState<CareerLevel>("Fellow");
  const [practiceSetting, setPracticeSetting] = useState<PracticeSetting>("Academic");
  const [academicRank, setAcademicRank] = useState<AcademicRank>("Assistant Professor");
  const [careerTrack, setCareerTrack] = useState<PrimaryCareerTrack>("Clinician");

  function applyProfileSpecialty(profile: {
    base_specialty?: string | null;
    subspecialty?: string | null;
    specialty?: string | null;
    subspecialty_training_complete?: boolean;
    career_stage?: CareerLevel | null;
  }) {
    const normalized = profile.base_specialty
      ? {
          base_specialty: profile.base_specialty,
          subspecialty: profile.subspecialty ?? null,
          subspecialty_training_complete: Boolean(profile.subspecialty_training_complete),
        }
      : migrateLegacySpecialty(profile.specialty ?? null);

    if (normalized.base_specialty) {
      setBaseSpecialty(normalized.base_specialty);
      setBaseQuery(normalized.base_specialty);
    }
    if (normalized.subspecialty) {
      setSubspecialty(normalized.subspecialty);
      setSubspecialtyQuery(normalized.subspecialty);
      setTrainingComplete(
        profile.subspecialty_training_complete ??
          defaultTrainingComplete(profile.career_stage ?? careerLevel, normalized.subspecialty),
      );
    }
  }

  // Plan data
  const [instruments, setInstruments] = useState<InstrumentSpec[]>([]);
  const [reconcileItems, setReconcileItems] = useState<ReconcileItem[]>([]);
  const [savedNpi, setSavedNpi] = useState("");
  const [npiStatus, setNpiStatus] = useState<NpiRegistryStatus | null>(null);

  const resolveStep = useCallback(
    (u: {
      tier1_complete?: boolean;
      tier2_complete?: boolean;
      tier3_complete?: boolean;
      cv_uploaded?: boolean;
      pending_reconcile_count?: number;
    }) => {
      if (u.tier3_complete) {
        router.replace("/app/dashboard");
        return;
      }
      const param = searchParams.get("step") as OnboardingStep | null;
      if (param && STEPS.some((s) => s.id === param)) {
        setStep(param);
        return;
      }
      if (!u.tier1_complete) setStep("welcome");
      else if (u.cv_uploaded && (u.pending_reconcile_count ?? 0) > 0 && !u.tier2_complete) {
        setStep("reconcile");
      } else if (!u.tier2_complete) setStep("documents");
      else setStep("instruments");
    },
    [router, searchParams],
  );

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.name) setName(data.profile.name);
        if (data.profile) {
          applyProfileSpecialty(data.profile);
        }
        if (data.profile?.career_stage) setCareerLevel(data.profile.career_stage);
        if (data.profile?.practice_setting) setPracticeSetting(data.profile.practice_setting);
        if (data.profile?.academic_rank) setAcademicRank(data.profile.academic_rank);
        if (data.profile?.primary_career_track) setCareerTrack(data.profile.primary_career_track);
        if (data.instruments) setInstruments(data.instruments);
        resolveStep(data);
      })
      .catch(() => {});
  }, [resolveStep]);

  function refreshReconciliation() {
    fetch("/api/v1/onboarding/reconciliation")
      .then((r) => r.json())
      .then((d) => {
        setReconcileItems(d.items ?? []);
        if (typeof d.npi === "string") setSavedNpi(d.npi);
        setNpiStatus({
          npi: d.npi ?? null,
          npi_verified: Boolean(d.npi_verified),
          deferred: Boolean(d.npi_verification_deferred),
          provider_name: d.provider_name ?? null,
          credential: d.credential ?? null,
          organization: d.organization ?? null,
          registry_url: d.npi ? `https://npiregistry.cms.hhs.gov/provider-view/${d.npi}` : null,
        });
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (step === "reconcile") {
      refreshReconciliation();
    }
  }, [step]);

  async function submitProfile() {
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!baseSpecialty || !isValidBaseSpecialty(baseSpecialty)) {
      setError("Select a base specialty from the list.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        base_specialty: baseSpecialty,
        subspecialty: subspecialty || null,
        subspecialty_training_complete: subspecialty ? trainingComplete : false,
        career_stage: careerLevel,
        practice_setting: practiceSetting,
        academic_rank: requiresAcademicRank(practiceSetting) ? academicRank : null,
        primary_career_track: careerTrack,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save profile");
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep("documents");
    router.replace("/app/onboarding?step=documents");
  }

  function goToReconcile() {
    setStep("reconcile");
    router.replace("/app/onboarding?step=reconcile");
  }

  async function submitReconciliation() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: reconcileItems.map((i) => ({
          id: i.id,
          status: i.status === "rejected" ? "rejected" : "confirmed",
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save reconciliation");
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep("instruments");
    router.replace("/app/onboarding?step=instruments");
  }

  function canContinueReconcile(): boolean {
    return reconcileItems.every((item) => {
      if (item.status !== "pending") return true;
      return false;
    });
  }

  function handleNpiSkipped() {
    refreshReconciliation();
  }

  function toggleReconcile(id: string, status: "confirmed" | "rejected") {
    setReconcileItems((items) =>
      items.map((i) => (i.id === id ? { ...i, status } : i)),
    );
  }

  function handleNpiVerified(id: string, status: "confirmed" | "rejected") {
    toggleReconcile(id, status);
    refreshReconciliation();
  }

  async function startMakConversation() {
    router.replace("/app/dashboard?welcome=1&onboarding=instruments");
    router.refresh();
  }

  function pickBaseSpecialty(value: string) {
    setBaseSpecialty(value);
    setBaseQuery(value);
    setBaseListOpen(false);
    setSubspecialty("");
    setSubspecialtyQuery("");
    setTrainingComplete(false);
    setError("");
  }

  function pickSubspecialty(value: string) {
    setSubspecialty(value);
    setSubspecialtyQuery(value);
    setSubspecialtyListOpen(false);
    setTrainingComplete(defaultTrainingComplete(careerLevel, value || null));
    setError("");
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const estimatedMinutes = instruments.reduce((s, i) => s + i.minutes, 0);

  return (
    <PageShell
      eyebrow="Setup"
      title="Get started"
      subtitle="Complete each step to unlock your dashboard"
      maxWidth="md"
      className="py-4"
    >
      <div className="mb-6 flex gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "cx-nav-pill flex shrink-0 items-center gap-1.5 text-xs",
              i === stepIndex
                ? "cx-nav-pill-active"
                : i < stepIndex
                  ? "cx-nav-pill-inactive bg-cx-forest-dark/10"
                  : "cx-nav-pill-inactive opacity-60",
            )}
          >
            {i < stepIndex ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            {s.label}
          </div>
        ))}
      </div>

      {step === "welcome" && (
        <OnboardingWelcome onBegin={() => {
          setStep("profile");
          router.replace("/app/onboarding?step=profile");
        }} />
      )}

      {step === "profile" && (
        <Card>
          <p className="text-cx-label uppercase">
            Step 2 of 7 · Profile configuration · ~3 minutes
          </p>
          <h1 className="mt-1 text-page-title">Profile configuration</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            These fields determine benchmarks, document requirements, questionnaire modules, and
            Career Map positioning.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="onboarding-name" className="cx-field-label">
                Your name
              </label>
              <input
                id="onboarding-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="cx-field mt-2"
                autoComplete="name"
              />
            </div>

            <SpecialtyIntakeFields
              baseSpecialty={baseSpecialty}
              baseQuery={baseQuery}
              onBaseQueryChange={setBaseQuery}
              onPickBase={pickBaseSpecialty}
              baseListOpen={baseListOpen}
              onBaseListOpenChange={setBaseListOpen}
              subspecialty={subspecialty}
              subspecialtyQuery={subspecialtyQuery}
              onSubspecialtyQueryChange={setSubspecialtyQuery}
              onPickSubspecialty={pickSubspecialty}
              subspecialtyListOpen={subspecialtyListOpen}
              onSubspecialtyListOpenChange={setSubspecialtyListOpen}
              trainingComplete={trainingComplete}
              onTrainingCompleteChange={setTrainingComplete}
              careerStage={careerLevel}
            />

            <div>
              <p className="text-sm font-semibold">Career level</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CAREER_LEVELS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setCareerLevel(s);
                      if (subspecialty) {
                        setTrainingComplete(defaultTrainingComplete(s, subspecialty));
                      }
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      careerLevel === s
                        ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                        : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Practice setting</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PRACTICE_SETTINGS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPracticeSetting(s)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      practiceSetting === s
                        ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                        : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {requiresAcademicRank(practiceSetting) && (
              <div>
                <p className="text-sm font-semibold">Academic rank</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {ACADEMIC_RANKS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAcademicRank(r)}
                      className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                        academicRank === r
                          ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                          : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold">Primary career track</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {PRIMARY_CAREER_TRACKS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCareerTrack(t)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      careerTrack === t
                        ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                        : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={submitProfile} disabled={loading}>
              {loading ? "Saving…" : "Continue to documents"}
            </Button>
          </div>
          {error && (
            <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
              {error}
            </p>
          )}
        </Card>
      )}

      {step === "documents" && (
        <OnboardingDocumentsStep onContinue={goToReconcile} continueDisabled={loading} />
      )}

      {step === "reconcile" && (
        <Card>
          <h1 className="text-page-title">Confirm discovered items</h1>

          <ul className="mt-6 space-y-4">
            {reconcileItems.map((item) => (
              <ReconciliationItemCard
                key={item.id}
                item={item}
                initialNpi={savedNpi}
                npiStatus={isNpiReconcileItem(item) ? npiStatus : null}
                onToggle={toggleReconcile}
                onNpiVerified={handleNpiVerified}
                onNpiSkipped={handleNpiSkipped}
              />
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() =>
                startMakFlow(
                  "review",
                  "/app/objective?tab=reconcile",
                  buildReconcileGreeting({ reconciliation: reconcileItems.map((i) => ({ id: i.id, status: i.status })) }),
                )
              }
            >
              Review with Mak
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
              onClick={submitReconciliation}
              disabled={loading || !canContinueReconcile()}
            >
              {loading ? "Saving…" : "Continue to self-assessment"}
            </Button>
          </div>
          {error && (
            <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
              {error}
            </p>
          )}
        </Card>
      )}

      {step === "instruments" && (
        <Card>
          <p className="text-cx-label uppercase">
            Touchpoint 1 · Step 4 · ~{estimatedMinutes || 15} minutes
          </p>
          <h1 className="mt-1 text-page-title">Self-assessment with Coach Mak</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            Validated instruments are embedded in a guided conversation — not a survey form.
            After completion, your Career Profile and dashboard generate automatically.
          </p>

          <ul className="mt-4 space-y-2">
            {instruments.map((inst) => (
              <li
                key={inst.id}
                className="rounded-md border border-cx-forest-dark/15 px-3 py-2 text-sm"
              >
                <span className="font-semibold">{inst.name}</span>
                <span className="text-cx-forest-dark/70">
                  {" "}
                  · {inst.items} items · ~{inst.minutes} min — {inst.description}
                </span>
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" onClick={startMakConversation}>
            Start conversation with Coach Mak
          </Button>
          <p className="mt-3 text-center text-xs text-cx-forest-dark/70">
            Step 5 (dashboard generation) runs automatically when Mak finishes your instrument
            battery.
          </p>
        </Card>
      )}
    </PageShell>
  );
}
