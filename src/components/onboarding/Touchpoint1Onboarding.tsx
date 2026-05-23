"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Upload, CheckCircle2, Circle } from "lucide-react";
import {
  ACGME_SPECIALTIES,
  CAREER_LEVELS,
  PRACTICE_SETTINGS,
  ACADEMIC_RANKS,
  PRIMARY_CAREER_TRACKS,
  filterSpecialties,
  requiresAcademicRank,
  type AcademicRank,
  type CareerLevel,
  type PracticeSetting,
  type PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";

type OnboardingStep = "profile" | "documents" | "reconcile" | "instruments";

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
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents" },
  { id: "reconcile", label: "Reconcile" },
  { id: "instruments", label: "Coach Mak" },
];

export function Touchpoint1Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<OnboardingStep>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [careerLevel, setCareerLevel] = useState<CareerLevel>("Fellow");
  const [practiceSetting, setPracticeSetting] = useState<PracticeSetting>("Academic");
  const [academicRank, setAcademicRank] = useState<AcademicRank>("Assistant Professor");
  const [careerTrack, setCareerTrack] = useState<PrimaryCareerTrack>("Clinician");
  const [listOpen, setListOpen] = useState(false);

  // Plan data
  const [docSpecs, setDocSpecs] = useState<DocSpec[]>([]);
  const [instruments, setInstruments] = useState<InstrumentSpec[]>([]);
  const [uploadedTypes, setUploadedTypes] = useState<Set<string>>(new Set());
  const [reconcileItems, setReconcileItems] = useState<ReconcileItem[]>([]);
  const [pasteText, setPasteText] = useState("");

  const filteredSpecialties = useMemo(
    () => filterSpecialties(specialtyQuery),
    [specialtyQuery],
  );

  const resolveStep = useCallback(
    (u: {
      tier1_complete?: boolean;
      tier2_complete?: boolean;
      tier3_complete?: boolean;
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
      if (!u.tier1_complete) setStep("profile");
      else if (!u.tier2_complete) setStep("documents");
      else setStep("instruments");
    },
    [router, searchParams],
  );

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.name) setName(data.profile.name);
        if (data.profile?.specialty) {
          setSpecialty(data.profile.specialty);
          setSpecialtyQuery(data.profile.specialty);
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
    if (!specialty || !ACGME_SPECIALTIES.includes(specialty as (typeof ACGME_SPECIALTIES)[number])) {
      setError("Select a specialty from the list.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        specialty,
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

  function pickSpecialty(value: string) {
    setSpecialty(value);
    setSpecialtyQuery(value);
    setListOpen(false);
    setError("");
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const estimatedMinutes = instruments.reduce((s, i) => s + i.minutes, 0);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`flex flex-1 items-center gap-1 rounded-md px-2 py-1.5 text-xs ${
              i <= stepIndex ? "bg-fiscmak-green-light font-semibold" : "bg-fiscmak-subtle text-fiscmak-muted"
            }`}
          >
            {i < stepIndex ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            {s.label}
          </div>
        ))}
      </div>

      {step === "profile" && (
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">
            Touchpoint 1 · Step 1 · ~2 minutes
          </p>
          <h1 className="mt-1 text-2xl font-bold">Your five identity anchors</h1>
          <p className="mt-2 text-sm text-fiscmak-muted">
            These five fields determine your benchmarks, document requirements, questionnaire
            modules, and career lattice positioning.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="onboarding-name" className="text-sm font-semibold">
                Your name
              </label>
              <input
                id="onboarding-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4 text-base focus:border-fiscmak-green focus:outline-none"
                autoComplete="name"
              />
            </div>

            <div className="relative">
              <label htmlFor="specialty-search" className="text-sm font-semibold">
                Primary specialty
              </label>
              <input
                id="specialty-search"
                type="text"
                value={specialtyQuery}
                onChange={(e) => {
                  setSpecialtyQuery(e.target.value);
                  setSpecialty("");
                  setListOpen(true);
                }}
                onFocus={() => setListOpen(true)}
                placeholder="Start typing, e.g. Psychiatry…"
                className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4 text-base focus:border-fiscmak-green focus:outline-none"
                autoComplete="off"
              />
              {listOpen && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-fiscmak-border bg-white shadow-md">
                  {filteredSpecialties.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-fiscmak-muted">No matches</li>
                  ) : (
                    filteredSpecialties.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => pickSpecialty(s)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-fiscmak-subtle ${
                            specialty === s ? "bg-fiscmak-green-light font-semibold" : ""
                          }`}
                        >
                          {s}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Career level</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CAREER_LEVELS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCareerLevel(s)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      careerLevel === s
                        ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                        : "border-fiscmak-border hover:bg-fiscmak-subtle"
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
                        ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                        : "border-fiscmak-border hover:bg-fiscmak-subtle"
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
                          ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                          : "border-fiscmak-border hover:bg-fiscmak-subtle"
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
                        ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                        : "border-fiscmak-border hover:bg-fiscmak-subtle"
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
          {error && <p className="mt-3 text-sm text-fiscmak-red">{error}</p>}
        </Card>
      )}

      {step === "documents" && (
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">
            Touchpoint 1 · Step 2 · ~5 minutes
          </p>
          <h1 className="mt-1 text-2xl font-bold">Upload your documents</h1>
          <p className="mt-2 text-sm text-fiscmak-muted">
            Requirements vary by career level and setting. AI parsing and API enrichment run
            automatically after upload.
          </p>

          <ul className="mt-4 space-y-2">
            {docSpecs.map((d) => (
              <li
                key={d.type}
                className="flex items-center justify-between rounded-md border border-fiscmak-border px-3 py-2 text-sm"
              >
                <span>
                  {d.label}{" "}
                  <span
                    className={
                      d.requirement === "required"
                        ? "text-fiscmak-red"
                        : "text-fiscmak-muted"
                    }
                  >
                    ({d.requirement})
                  </span>
                </span>
                {uploadedTypes.has(d.type === "CV" ? "CV" : d.type) ? (
                  <CheckCircle2 size={16} className="text-fiscmak-green" />
                ) : (
                  <Circle size={16} className="text-fiscmak-muted" />
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4">
            <label
              htmlFor="tp1-cv-upload"
              className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-fiscmak-border bg-fiscmak-subtle px-6 py-8 transition-colors hover:border-fiscmak-green"
            >
              <Upload className="text-fiscmak-green" size={24} />
              <p className="mt-2 font-semibold">Upload CV / Resume</p>
              <p className="text-sm text-fiscmak-muted">{ACCEPTED_CV_LABEL}</p>
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
                className="w-full rounded-md border border-fiscmak-border p-3 text-sm"
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
          {error && <p className="mt-3 text-sm text-fiscmak-red">{error}</p>}
        </Card>
      )}

      {step === "reconcile" && (
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">
            Touchpoint 1 · Step 3 · ~2–3 minutes
          </p>
          <h1 className="mt-1 text-2xl font-bold">Confirm discovered items</h1>
          <p className="mt-2 text-sm text-fiscmak-muted">
            Review API-discovered items not explicitly on your CV. Confirm or reject each match.
          </p>

          <ul className="mt-6 space-y-3">
            {reconcileItems.map((item) => (
              <li key={item.id} className="rounded-lg border border-fiscmak-border p-4">
                <p className="text-xs font-semibold uppercase text-fiscmak-muted">{item.source}</p>
                <p className="mt-1 font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-fiscmak-muted">{item.detail}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant={item.status === "confirmed" ? "primary" : "secondary"}
                    onClick={() => toggleReconcile(item.id, "confirmed")}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant={item.status === "rejected" ? "primary" : "secondary"}
                    onClick={() => toggleReconcile(item.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" onClick={submitReconciliation} disabled={loading}>
            {loading ? "Saving…" : "Continue to self-assessment"}
          </Button>
          {error && <p className="mt-3 text-sm text-fiscmak-red">{error}</p>}
        </Card>
      )}

      {step === "instruments" && (
        <Card>
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">
            Touchpoint 1 · Step 4 · ~{estimatedMinutes || 15} minutes
          </p>
          <h1 className="mt-1 text-2xl font-bold">Self-assessment with Coach Mak</h1>
          <p className="mt-2 text-sm text-fiscmak-muted">
            No forms — Mak walks you through validated instruments conversationally. After
            completion, your dashboard generates automatically with CDI, wellbeing, and lattice
            positioning.
          </p>

          <ul className="mt-4 space-y-2">
            {instruments.map((inst) => (
              <li
                key={inst.id}
                className="rounded-md border border-fiscmak-border px-3 py-2 text-sm"
              >
                <span className="font-semibold">{inst.name}</span>
                <span className="text-fiscmak-muted">
                  {" "}
                  · {inst.items} items · ~{inst.minutes} min — {inst.description}
                </span>
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" onClick={startMakConversation}>
            Start conversation with Coach Mak
          </Button>
          <p className="mt-3 text-center text-xs text-fiscmak-muted">
            Step 5 (dashboard generation) runs automatically when Mak finishes your instrument
            battery.
          </p>
        </Card>
      )}
    </div>
  );
}
