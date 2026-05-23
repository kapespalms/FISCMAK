"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { Upload, CheckCircle2, Circle } from "lucide-react";
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
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";

import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { useAppShell } from "@/components/layout/AppShell";
import { buildReconcileGreeting } from "@/lib/v2/reconcile-mak-helpers";

type OnboardingStep = "welcome" | "profile" | "documents" | "reconcile" | "instruments";

type DocSpec = {
  type: string;
  label: string;
  requirement: "required" | "optional" | "skip";
};

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
  const [docSpecs, setDocSpecs] = useState<DocSpec[]>([]);
  const [instruments, setInstruments] = useState<InstrumentSpec[]>([]);
  const [uploadedTypes, setUploadedTypes] = useState<Set<string>>(new Set());
  const [reconcileItems, setReconcileItems] = useState<ReconcileItem[]>([]);
  const [pasteText, setPasteText] = useState("");

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
        if (data.documents) setDocSpecs(data.documents);
        if (data.instruments) setInstruments(data.instruments);
        resolveStep(data);
      })
      .catch(() => {});

    fetch("/api/v1/documents")
      .then((r) => r.json())
      .then((d) => {
        const types = new Set<string>(
          (d.documents ?? []).map((doc: { document_type: string }) => doc.document_type),
        );
        setUploadedTypes(types);
      })
      .catch(() => {});
  }, [resolveStep]);

  useEffect(() => {
    if (step === "reconcile") {
      fetch("/api/v1/onboarding/reconciliation")
        .then((r) => r.json())
        .then((d) => setReconcileItems(d.items ?? []))
        .catch(() => {});
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

  async function uploadDocument(file: File, documentType: string) {
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", documentType);
      const res = await fetch("/api/v1/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");
      setUploadedTypes((prev) => new Set([...prev, documentType]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function onCvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAcceptedCvFileName(file.name)) {
      setError(`Upload ${ACCEPTED_CV_LABEL}, or paste text below.`);
      return;
    }
    await uploadDocument(file, "CV");
    e.target.value = "";
  }

  async function onPasteCv(e: React.FormEvent) {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const blob = new Blob([pasteText.trim()], { type: "text/plain" });
    await uploadDocument(new File([blob], "pasted-cv.txt", { type: "text/plain" }), "CV");
  }

  function canProceedFromDocuments(): boolean {
    const required = docSpecs.filter((d) => d.requirement === "required");
    if (required.length === 0) return true;
    return required.every((d) => uploadedTypes.has(d.type === "CV" ? "CV" : d.type));
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

  function toggleReconcile(id: string, status: "confirmed" | "rejected") {
    setReconcileItems((items) =>
      items.map((i) => (i.id === id ? { ...i, status } : i)),
    );
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
        <Card>
          <p className="text-cx-label uppercase">
            Touchpoint 1 · Step 2 · ~5 minutes
          </p>
          <h1 className="mt-1 text-page-title">Upload your documents</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            Requirements vary by career level and setting. AI parsing and API enrichment run
            automatically after upload.
          </p>

          <ul className="mt-4 space-y-2">
            {docSpecs.map((d) => (
              <li
                key={d.type}
                className="flex items-center justify-between rounded-md border border-cx-forest-dark/15 px-3 py-2 text-sm"
              >
                <span>
                  {d.label}{" "}
                  <span
                    className={
                      d.requirement === "required"
                        ? "text-cx-attention"
                        : "text-cx-forest-dark/70"
                    }
                  >
                    ({d.requirement})
                  </span>
                </span>
                {uploadedTypes.has(d.type === "CV" ? "CV" : d.type) ? (
                  <CheckCircle2 size={16} className="text-cx-success" />
                ) : (
                  <Circle size={16} className="text-cx-forest-dark/70" />
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4">
            <label
              htmlFor="tp1-cv-upload"
              className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-cx-forest-dark/25 bg-cx-forest-dark/[0.03] px-6 py-8 transition-colors hover:border-cx-forest-dark/40 hover:bg-cx-forest-dark/5"
            >
              <Upload className="text-cx-forest-dark" size={24} />
              <p className="mt-2 font-semibold">Upload CV / Resume</p>
              <p className="text-sm text-cx-forest-dark/80">{ACCEPTED_CV_LABEL}</p>
              <input
                id="tp1-cv-upload"
                type="file"
                accept={ACCEPTED_CV_ACCEPT}
                className="hidden"
                onChange={onCvFile}
                disabled={loading}
              />
            </label>

            <form onSubmit={onPasteCv} className="space-y-2">
              <label htmlFor="tp1-paste" className="text-sm font-semibold">
                Or paste CV text
              </label>
              <textarea
                id="tp1-paste"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-cx-forest-dark/15 p-3 text-sm"
                placeholder="Paste CV content…"
              />
              <Button type="submit" variant="secondary" disabled={loading || !pasteText.trim()}>
                Upload pasted text
              </Button>
            </form>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1"
              onClick={goToReconcile}
              disabled={loading || !canProceedFromDocuments()}
            >
              Continue to reconciliation
            </Button>
            {docSpecs.some((d) => d.requirement === "optional") && canProceedFromDocuments() && (
              <Button variant="secondary" className="flex-1" onClick={goToReconcile} disabled={loading}>
                Skip optional docs
              </Button>
            )}
          </div>
          {error && (
            <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
              {error}
            </p>
          )}
        </Card>
      )}

      {step === "reconcile" && (
        <Card>
          <p className="text-cx-label uppercase">
            Touchpoint 1 · Step 3 · ~2–3 minutes
          </p>
          <h1 className="mt-1 text-page-title">Confirm discovered items</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            Review API-discovered items not explicitly on your CV. Confirm or reject each match.
          </p>

          <p className="mt-2 text-sm text-cx-forest-dark/80">
            {reconcileItems.length} items to review — estimated 2 minutes. Swipe through each card.
          </p>

          <ul className="mt-6 space-y-4">
            {reconcileItems.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-cx-forest-dark/15 bg-white p-5 shadow-sm"
              >
                <p className="text-cx-label uppercase">{item.source}</p>
                <p className="mt-2 text-cx-h3">{item.label}</p>
                <p className="mt-2 text-sm text-cx-forest-dark/80">{item.detail}</p>
                <div className="mt-4 flex gap-3">
                  <Button
                    variant={item.status === "confirmed" ? "primary" : "secondary"}
                    className="min-h-[44px] flex-1"
                    onClick={() => toggleReconcile(item.id, "confirmed")}
                  >
                    Mine
                  </Button>
                  <Button
                    variant={item.status === "rejected" ? "primary" : "secondary"}
                    className="min-h-[44px] flex-1"
                    onClick={() => toggleReconcile(item.id, "rejected")}
                  >
                    Not mine
                  </Button>
                </div>
              </li>
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
            <Button className="flex-1" variant="secondary" onClick={submitReconciliation} disabled={loading}>
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
