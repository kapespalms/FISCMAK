"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { CheckCircle2, ChevronLeft, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAREER_LEVELS,
  PGY_LEVELS,
  PRACTICE_SETTINGS,
  ACADEMIC_RANKS,
  requiresAcademicRank,
  isTraineeCareerLevel,
  requiresGmePlacementFields,
  allowsSubspecialtyInterests,
  type AcademicRank,
  type CareerLevel,
  type PgyLevel,
  type PracticeSetting,
} from "@/lib/v2/onboarding-options";
import { buildSpecialtyOriginQuestion } from "@/lib/v2/trainee-origin";
import { combineName, splitTrustedName, type TrustedName } from "@/lib/auth/trusted-name";
import type { OnboardingPath } from "@/lib/v2/onboarding-path";
import type { ProgramRotation } from "@/lib/v2/programs/registry";
import { getProgramBySlug } from "@/lib/v2/programs/registry";
import { OnboardingPathSelect } from "@/components/onboarding/OnboardingPathSelect";
import {
  defaultTrainingComplete,
  isValidBaseSpecialty,
  migrateLegacySpecialty,
} from "@/lib/v2/specialty-hierarchy";
import { SpecialtyIntakeFields } from "@/components/onboarding/SpecialtyIntakeFields";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { ProgramJoinHeadline } from "@/components/onboarding/ProgramJoinHeadline";
import { OnboardingDocumentsStep } from "@/components/onboarding/OnboardingDocumentsStep";
import { ReconciliationItemCard } from "@/components/onboarding/ReconciliationItemCard";
import {
  CareerTrackRankingFields,
  buildDefaultCareerTrackRankings,
  hydrateCareerTrackRankings,
  primaryTrackFromRankings,
  type CareerTrackRanking,
} from "@/components/onboarding/CareerTrackRankingFields";
import { RotationSelectFields } from "@/components/onboarding/RotationSelectFields";
import {
  OnboardingProfileSection,
  OnboardingProfileHint,
  OnboardingFieldLabel,
  OnboardingChoiceButton,
} from "@/components/onboarding/OnboardingProfileSection";
import { OnboardingInterestsBlock } from "@/components/onboarding/OnboardingInterestsBlock";
import { isNpiReconcileItem } from "@/lib/v2/npi-registry";
import type { NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";

type OnboardingStep = "path" | "welcome" | "profile" | "documents" | "reconcile" | "instruments";

type OnboardingProgramConfig = {
  slug: string;
  display_title: string;
  institution_name: string;
  program_name: string;
  base_specialty: string;
  specialty_locked: boolean;
  default_career_stage: CareerLevel;
  default_practice_setting: PracticeSetting;
  career_stages_allowed: CareerLevel[];
  academic_year: string;
  rotations: ProgramRotation[];
};

const STEPS_AFTER_PATH: { id: Exclude<OnboardingStep, "path">; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents" },
  { id: "reconcile", label: "Confirm data" },
  { id: "instruments", label: "Self-assessment" },
];

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "path", label: "Path" },
  ...STEPS_AFTER_PATH,
];

type BlockLookupHint = {
  matched: boolean;
  block_id?: string;
  rotation_label?: string;
  days_remaining?: number;
  message?: string;
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

const ONBOARDING_NEXT_KEY = "fiscmak_onboarding_next";

function rememberOnboardingEntry(search: string) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search);
  if (params.get("token") || params.get("program") || params.get("path") === "public") {
    sessionStorage.setItem(ONBOARDING_NEXT_KEY, `/app/onboarding${search}`);
  }
}

function readStoredOnboardingEntry(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ONBOARDING_NEXT_KEY);
}

function clearStoredOnboardingEntry() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ONBOARDING_NEXT_KEY);
}

export function Touchpoint1Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<OnboardingStep>("path");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onboardingPath, setOnboardingPath] = useState<OnboardingPath | null>(null);
  const [pathChosen, setPathChosen] = useState(false);
  const [programConfig, setProgramConfig] = useState<OnboardingProgramConfig | null>(null);
  const [traineeInitials, setTraineeInitials] = useState("");
  const [blockHint, setBlockHint] = useState<BlockLookupHint | null>(null);
  const [blockLookupLoading, setBlockLookupLoading] = useState(false);
  const [inviteProgramSlug, setInviteProgramSlug] = useState<string | null>(null);
  const [bootstrappingPath, setBootstrappingPath] = useState(false);
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(
    () => searchParams.get("token"),
  );
  const [inviteTokenFromMeta, setInviteTokenFromMeta] = useState<string | null>(null);

  const isInstitutional = onboardingPath === "institutional" && Boolean(programConfig);
  const visibleSteps = pathChosen ? STEPS_AFTER_PATH : STEPS;

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [namePrefilled, setNamePrefilled] = useState(false);
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
  const [careerTrackRankings, setCareerTrackRankings] = useState<CareerTrackRanking[]>(
    buildDefaultCareerTrackRankings(),
  );
  const [subspecialtyInterests, setSubspecialtyInterests] = useState<string[]>([]);
  const [uhPsychEnrichmentTracks, setUhPsychEnrichmentTracks] = useState<string[]>([]);
  const [pgyLevel, setPgyLevel] = useState<PgyLevel | "">("");
  const [currentRotation, setCurrentRotation] = useState("");
  const [specialtyOrigin, setSpecialtyOrigin] = useState("");

  const showGmeFields = requiresGmePlacementFields(careerLevel);
  const showOriginField = isTraineeCareerLevel(careerLevel);
  const showSubspecialtyInterests = allowsSubspecialtyInterests(careerLevel);
  const careerLevelOptions = isInstitutional
    ? (programConfig?.career_stages_allowed ?? (["Resident", "Fellow"] as CareerLevel[]))
    : CAREER_LEVELS;
  const institutionalCareerStageLocked =
    isInstitutional && careerLevelOptions.length === 1;
  const originPrompt =
    baseSpecialty && showOriginField
      ? buildSpecialtyOriginQuestion(baseSpecialty, subspecialty || null, careerLevel)
      : "What drew you to your specialty? Even one sentence.";

  function applyTrustedName(trusted: TrustedName | null | undefined) {
    if (!trusted?.first) return;
    setFirstName(trusted.first);
    setLastName(trusted.last);
    setNamePrefilled(true);
  }

  function applyInstitutionalDefaults(program: OnboardingProgramConfig) {
    setBaseSpecialty(program.base_specialty);
    setBaseQuery(program.base_specialty);
    const stage =
      program.career_stages_allowed?.length === 1
        ? program.career_stages_allowed[0]!
        : program.default_career_stage;
    setCareerLevel(stage);
    setPracticeSetting(program.default_practice_setting);
  }

  async function lookupBlockSchedule(programSlug?: string, token?: string | null) {
    const slug = programSlug ?? programConfig?.slug;
    if (!slug) {
      setBlockHint(null);
      return;
    }

    const tokenParam = token ?? inviteTokenFromMeta ?? pendingInviteToken;
    const query = tokenParam
      ? `token=${encodeURIComponent(tokenParam)}`
      : traineeInitials.trim()
        ? `initials=${encodeURIComponent(traineeInitials.trim().toUpperCase())}`
        : "";
    if (!query) {
      setBlockHint(null);
      return;
    }

    setBlockLookupLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/onboarding/block-lookup?${query}&program=${encodeURIComponent(slug)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setBlockHint({ matched: false, message: data.message ?? "Could not load rotation suggestion." });
        return;
      }
      if (data.matched) {
        if (data.suggested_pgy) setPgyLevel(data.suggested_pgy as PgyLevel);
        if (data.rotation_label) setCurrentRotation(data.rotation_label);
        setBlockHint({
          matched: true,
          block_id: data.block_id,
          rotation_label: data.rotation_label,
          days_remaining: data.days_remaining,
        });
      } else {
        if (data.suggested_pgy) setPgyLevel(data.suggested_pgy as PgyLevel);
        setBlockHint(null);
      }
    } catch {
      setBlockHint(null);
    } finally {
      setBlockLookupLoading(false);
    }
  }

  async function saveOnboardingPath(input: {
    onboarding_path: OnboardingPath;
    program_slug?: string;
    trainee_initials?: string;
  }) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save onboarding path");
      setLoading(false);
      return false;
    }
    setOnboardingPath(data.onboarding_path);
    setPathChosen(true);
    if (data.trainee_initials) setTraineeInitials(data.trainee_initials);
    setLoading(false);
    return true;
  }

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
      path_chosen?: boolean;
    }, options?: { pathResolved?: boolean }) => {
      if (u.tier3_complete) {
        router.replace("/app/dashboard");
        return;
      }
      const param = searchParams.get("step") as OnboardingStep | null;
      if (param && STEPS.some((s) => s.id === param)) {
        setStep(param);
        return;
      }
      if (!u.tier1_complete) {
        if (!u.path_chosen && !options?.pathResolved) {
          setStep("path");
          return;
        }
        setStep("welcome");
        return;
      }
      if (u.cv_uploaded && (u.pending_reconcile_count ?? 0) > 0 && !u.tier2_complete) {
        setStep("reconcile");
      } else if (!u.tier2_complete) setStep("documents");
      else setStep("instruments");
    },
    [router, searchParams],
  );

  async function redeemInviteFromUrl(token: string) {
    setPendingInviteToken(token);
    const res = await fetch(`/api/v1/join/${encodeURIComponent(token)}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not redeem program invite.");
      const previewRes = await fetch(`/api/v1/join/${encodeURIComponent(token)}`);
      const preview = await previewRes.json();
      if (preview.program_slug) setInviteProgramSlug(preview.program_slug);
      return false;
    }
    setOnboardingPath("institutional");
    setPathChosen(true);
    if (data.trainee_initials) setTraineeInitials(data.trainee_initials);
    if (data.program_slug) setInviteProgramSlug(data.program_slug);
    clearStoredOnboardingEntry();
    setStep("welcome");
    router.replace("/app/onboarding?step=welcome");
    return true;
  }

  async function bootstrapOnboardingFromUrl(input?: {
    program?: string | null;
    path?: string | null;
  }) {
    const programParam = input?.program ?? searchParams.get("program");
    const pathParam = input?.path ?? searchParams.get("path");
    if (programParam) {
      return saveOnboardingPath({
        onboarding_path: "institutional",
        program_slug: programParam,
      });
    }
    if (pathParam === "public") {
      return saveOnboardingPath({ onboarding_path: "public" });
    }
    return false;
  }

  useEffect(() => {
    void (async () => {
      rememberOnboardingEntry(window.location.search);

      const stored = readStoredOnboardingEntry();
      const storedParams = stored ? new URL(stored, window.location.origin).searchParams : null;

      const tokenParam = searchParams.get("token") ?? storedParams?.get("token");
      const urlProgram = searchParams.get("program") ?? storedParams?.get("program");
      const urlPath = searchParams.get("path") ?? storedParams?.get("path");

      if (tokenParam) setPendingInviteToken(tokenParam);

      let pathResolved = false;
      if (tokenParam || urlProgram || urlPath === "public") {
        setBootstrappingPath(true);
      }

      if (tokenParam) {
        pathResolved = await redeemInviteFromUrl(tokenParam);
      } else if (urlProgram || urlPath === "public") {
        pathResolved = await bootstrapOnboardingFromUrl({
          program: urlProgram,
          path: urlPath,
        });
        if (pathResolved) {
          setOnboardingPath(urlPath === "public" ? "public" : "institutional");
          setPathChosen(true);
          if (urlProgram) setInviteProgramSlug(urlProgram);
          clearStoredOnboardingEntry();
          router.replace("/app/onboarding?step=welcome");
        }
      }

      const res = await fetch("/api/v1/onboarding/touchpoint1");
      const data = await res.json();
      if (data.profile?.trusted_name) {
        applyTrustedName(data.profile.trusted_name);
      } else if (data.profile?.name && data.tier1_complete) {
        const { first, last } = splitTrustedName(data.profile.name);
        if (first) applyTrustedName({ first, last, source: "profile" });
      }
      if (data.profile) {
        applyProfileSpecialty(data.profile);
      }
      if (data.profile?.career_stage) setCareerLevel(data.profile.career_stage);
      if (data.profile?.practice_setting) setPracticeSetting(data.profile.practice_setting);
      if (data.profile?.academic_rank) setAcademicRank(data.profile.academic_rank);
      if (data.profile?.primary_career_track || data.onboarding_metadata?.career_track_rankings) {
        setCareerTrackRankings(
          hydrateCareerTrackRankings(
            data.onboarding_metadata?.career_track_rankings ?? undefined,
            data.profile?.primary_career_track ?? null,
          ),
        );
      }
      if (data.onboarding_metadata?.subspecialty_interests) {
        setSubspecialtyInterests(data.onboarding_metadata.subspecialty_interests);
      }
      if (data.onboarding_metadata?.uh_psych_enrichment_tracks) {
        setUhPsychEnrichmentTracks(data.onboarding_metadata.uh_psych_enrichment_tracks);
      }
      if (data.profile?.pgy_level) setPgyLevel(data.profile.pgy_level as PgyLevel);
      if (data.profile?.current_rotation) setCurrentRotation(data.profile.current_rotation);
      if (data.profile?.specialty_origin) setSpecialtyOrigin(data.profile.specialty_origin);
      if (data.onboarding?.path) setOnboardingPath(data.onboarding.path);
      if (data.onboarding?.path_chosen) setPathChosen(true);
      if (data.onboarding?.trainee_initials) {
        setTraineeInitials(data.onboarding.trainee_initials);
      }
      if (data.onboarding_metadata?.invite_token) {
        setInviteTokenFromMeta(data.onboarding_metadata.invite_token);
      }
      if (data.onboarding?.program) {
        const program = data.onboarding.program as OnboardingProgramConfig;
        setProgramConfig(program);
        if (!data.profile?.base_specialty) {
          applyInstitutionalDefaults(program);
        }
        if (data.onboarding.path === "institutional") {
          void lookupBlockSchedule(
            program.slug,
            data.onboarding_metadata?.invite_token ?? pendingInviteToken,
          );
        }
      }
      if (data.instruments) setInstruments(data.instruments);
      const pathChosenFromServer = Boolean(data.onboarding?.path_chosen);
      if (pathChosenFromServer || pathResolved) {
        setPathChosen(true);
        clearStoredOnboardingEntry();
      }
      resolveStep(
        {
          ...data,
          path_chosen: pathChosenFromServer || pathResolved,
        },
        { pathResolved: pathResolved || pathChosenFromServer },
      );
      setBootstrappingPath(false);
    })().catch(() => {
      setBootstrappingPath(false);
    });
  }, [resolveStep, searchParams]);

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
    const fullName = combineName(firstName, lastName);
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Enter your first and last name.");
      return;
    }
    if (!baseSpecialty || !isValidBaseSpecialty(baseSpecialty)) {
      setError("Select a base specialty from the list.");
      return;
    }
    if (requiresGmePlacementFields(careerLevel)) {
      if (!pgyLevel) {
        setError("Select your PGY level.");
        return;
      }
      if (!currentRotation.trim()) {
        setError("Enter your current rotation.");
        return;
      }
    }
    if (isTraineeCareerLevel(careerLevel) && !specialtyOrigin.trim()) {
      setError("Share what drew you to your specialty — even one sentence.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName.trim(),
        base_specialty: baseSpecialty,
        subspecialty: subspecialty || null,
        subspecialty_training_complete: subspecialty ? trainingComplete : false,
        career_stage: careerLevel,
        practice_setting: practiceSetting,
        academic_rank: requiresAcademicRank(practiceSetting) ? academicRank : null,
        primary_career_track: primaryTrackFromRankings(careerTrackRankings),
        career_track_rankings: careerTrackRankings,
        subspecialty_interests: showSubspecialtyInterests ? subspecialtyInterests : [],
        uh_psych_enrichment_tracks:
          isInstitutional && programConfig?.slug === "uh-psych-cmc"
            ? uhPsychEnrichmentTracks
            : [],
        pgy_level: showGmeFields ? pgyLevel : null,
        current_rotation: showGmeFields ? currentRotation.trim() : null,
        specialty_origin: showOriginField ? specialtyOrigin.trim() : null,
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
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/onboarding/compute", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not finish setup");
        return;
      }
      router.replace(data.redirect ?? "/app/dashboard?welcome=1");
      router.refresh();
    } catch {
      setError("Could not finish setup");
    } finally {
      setLoading(false);
    }
  }

  function pickBaseSpecialty(value: string) {
    setBaseSpecialty(value);
    setBaseQuery(value);
    setBaseListOpen(false);
    setSubspecialty("");
    setSubspecialtyQuery("");
    setTrainingComplete(false);
    setSpecialtyOrigin("");
    setError("");
  }

  function pickSubspecialty(value: string) {
    setSubspecialty(value);
    setSubspecialtyQuery(value);
    setSubspecialtyListOpen(false);
    setTrainingComplete(defaultTrainingComplete(careerLevel, value || null));
    setSpecialtyOrigin("");
    setError("");
  }

  function handleCareerLevelChange(next: CareerLevel) {
    setCareerLevel(next);
    if (next !== "Fellow" && subspecialty) {
      setSubspecialty("");
      setSubspecialtyQuery("");
      setTrainingComplete(false);
    }
    if (!isTraineeCareerLevel(next)) {
      setSpecialtyOrigin("");
    } else if (next !== "Fellow") {
      setSpecialtyOrigin("");
    }
    if (subspecialty) {
      setTrainingComplete(defaultTrainingComplete(next, subspecialty));
    }
  }

  const stepIndex = visibleSteps.findIndex((s) => s.id === step);

  function navigateToStep(target: OnboardingStep) {
    const targetIdx = visibleSteps.findIndex((s) => s.id === target);
    if (targetIdx < 0 || targetIdx >= stepIndex) return;
    setError("");
    setStep(target);
    router.replace(`/app/onboarding?step=${target}`);
  }

  function goBackOneStep() {
    if (stepIndex <= 0) return;
    navigateToStep(visibleSteps[stepIndex - 1]!.id);
  }

  async function handleSelectPublicPath() {
    const ok = await saveOnboardingPath({ onboarding_path: "public" });
    if (ok) {
      setStep("welcome");
      router.replace("/app/onboarding?step=welcome");
    }
  }

  return (
    <PageShell
      title="Onboarding"
      maxWidth="md"
      className="py-4"
    >
      <div className="mb-6 flex gap-1 overflow-x-auto">
        {visibleSteps.map((s, i) => {
          const completed = i < stepIndex;
          const current = i === stepIndex;
          const pillClass = cn(
            "cx-nav-pill flex shrink-0 items-center gap-1.5 text-xs",
            current
              ? "cx-nav-pill-active"
              : completed
                ? "cx-nav-pill-inactive bg-cx-forest-dark/10"
                : "cx-nav-pill-inactive opacity-60",
          );

          if (completed) {
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => navigateToStep(s.id)}
                className={cn(pillClass, "cursor-pointer hover:opacity-90")}
              >
                <CheckCircle2 size={14} />
                {s.label}
              </button>
            );
          }

          return (
            <div key={s.id} className={pillClass}>
              {completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {s.label}
            </div>
          );
        })}
      </div>

      {step === "path" && bootstrappingPath && (
        <Card>
          <p className="text-sm text-cx-forest-dark/70">
            {pendingInviteToken
              ? "Activating your program invite…"
              : "Setting up your program on FISCMAK…"}
          </p>
        </Card>
      )}

      {step === "path" && !bootstrappingPath && pendingInviteToken && !pathChosen && (
        <Card>
          <h2 className="text-lg font-semibold text-cx-forest-dark">Invite link required</h2>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            {error ||
              "We could not activate your program invite. Sign in, then open your personal invite link again."}
          </p>
          <Link
            href={`/join/${encodeURIComponent(pendingInviteToken)}`}
            className="font-futura-medium mt-4 inline-flex min-h-11 items-center justify-center rounded-none bg-cx-forest-dark px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-cx-forest-dark/90"
          >
            Open my invite link
          </Link>
        </Card>
      )}

      {step === "path" && !bootstrappingPath && !pendingInviteToken && !pathChosen && (
        <>
          <OnboardingPathSelect loading={loading} onSelectPublic={handleSelectPublicPath} />
          {error && (
            <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">{error}</p>
          )}
        </>
      )}

      {step === "welcome" && (
        <>
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
        <OnboardingWelcome
          variant={
            isInstitutional
              ? "institutional"
              : onboardingPath === "public"
                ? "public"
                : "default"
          }
          program={
            isInstitutional && programConfig
              ? getProgramBySlug(programConfig.slug) ?? undefined
              : undefined
          }
          onBegin={() => {
            setStep("profile");
            router.replace("/app/onboarding?step=profile");
          }}
        />
        </>
      )}

      {step === "profile" && (
        <Card className="font-futura-book">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {isInstitutional && programConfig && (
            <ProgramJoinHeadline
              program={programConfig}
              variant="onboarding"
              className="mb-2 text-2xl"
            />
          )}
          <h1 className="text-page-title">
            {isInstitutional ? "Resident profile" : "Your profile"}
          </h1>
          {!isInstitutional && (
            <p className="font-futura-book mt-2 text-base text-black">
              Career level and specialty drive benchmarks and document requirements.
            </p>
          )}

          <div className="mt-6 space-y-6">
            <OnboardingProfileSection
              step="Section 1"
              title="About you"
              description="How your name appears across FISCMAK."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <OnboardingFieldLabel htmlFor="onboarding-first-name">First name</OnboardingFieldLabel>
                  <input
                    id="onboarding-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="cx-field mt-2 text-base text-black"
                    autoComplete="given-name"
                    readOnly={namePrefilled}
                  />
                </div>
                <div>
                  <OnboardingFieldLabel htmlFor="onboarding-last-name">Last name</OnboardingFieldLabel>
                  <input
                    id="onboarding-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="cx-field mt-2 text-base text-black"
                    autoComplete="family-name"
                    readOnly={namePrefilled}
                  />
                </div>
              </div>
              <OnboardingProfileHint>
                {namePrefilled
                  ? "Pre-filled from your sign-in or program invite. Contact your program admin to change."
                  : "Enter your name as you would like it displayed."}
              </OnboardingProfileHint>
            </OnboardingProfileSection>

            <OnboardingProfileSection
              step="Section 2"
              title="Specialty & placement"
              description={
                isInstitutional
                  ? "Your program, training year, and current rotation."
                  : "Specialty, career stage, and where you are in training."
              }
            >
              {isInstitutional && programConfig?.specialty_locked ? (
                <div className="rounded-xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] px-4 py-4">
                  <p className="font-futura-medium text-base text-cx-forest-dark">Specialty</p>
                  <p className="font-futura-book mt-1 text-base text-black">{programConfig.base_specialty}</p>
                  {careerLevel === "Fellow" && (
                    <OnboardingProfileHint>Select your fellowship subspecialty below.</OnboardingProfileHint>
                  )}
                  <div className="mt-4">
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
                      hideBaseSpecialtyPicker
                    />
                  </div>
                </div>
              ) : (
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
              )}

              {institutionalCareerStageLocked ? (
                <div className="rounded-xl border border-cx-forest-dark/10 px-4 py-3">
                  <p className="font-futura-book text-base text-black">
                    <span className="font-futura-medium text-cx-forest-dark">Career level:</span>{" "}
                    {careerLevel}
                  </p>
                  <OnboardingProfileHint>Set by your program affiliation.</OnboardingProfileHint>
                </div>
              ) : (
                <div>
                  <OnboardingFieldLabel>Career level</OnboardingFieldLabel>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {careerLevelOptions.map((s) => (
                      <OnboardingChoiceButton
                        key={s}
                        active={careerLevel === s}
                        onClick={() => handleCareerLevelChange(s)}
                      >
                        {s}
                      </OnboardingChoiceButton>
                    ))}
                  </div>
                </div>
              )}

              {showGmeFields && (
                <>
                  <div>
                    <OnboardingFieldLabel>PGY level</OnboardingFieldLabel>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {PGY_LEVELS.map((level) => (
                        <OnboardingChoiceButton
                          key={level}
                          active={pgyLevel === level}
                          onClick={() => setPgyLevel(level)}
                          className="text-center"
                        >
                          {level}
                        </OnboardingChoiceButton>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isInstitutional && programConfig?.rotations?.length ? (
                      <RotationSelectFields
                        rotations={programConfig.rotations}
                        pgyLevel={pgyLevel || ""}
                        value={currentRotation}
                        onChange={setCurrentRotation}
                        blockHint={blockHint}
                        lookupLoading={blockLookupLoading}
                      />
                    ) : (
                      <>
                        <OnboardingFieldLabel htmlFor="current-rotation">
                          Current rotation
                        </OnboardingFieldLabel>
                        <input
                          id="current-rotation"
                          type="text"
                          value={currentRotation}
                          onChange={(e) => setCurrentRotation(e.target.value)}
                          placeholder="e.g., Inpatient Psychiatry, VA CT6, Consult-Liaison"
                          className="cx-field mt-2 text-base text-black"
                          autoComplete="off"
                        />
                      </>
                    )}
                  </div>

                  {isInstitutional && blockHint?.matched && currentRotation && (
                    <OnboardingProfileHint>
                      We suggested your current rotation — change it below if it&apos;s not right.
                    </OnboardingProfileHint>
                  )}
                </>
              )}

              {!isInstitutional ? (
                <div>
                  <OnboardingFieldLabel>Practice setting</OnboardingFieldLabel>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {PRACTICE_SETTINGS.map((s) => (
                      <OnboardingChoiceButton
                        key={s}
                        active={practiceSetting === s}
                        onClick={() => setPracticeSetting(s)}
                      >
                        {s}
                      </OnboardingChoiceButton>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-cx-forest-dark/10 px-4 py-3">
                  <p className="font-futura-book text-base text-black">
                    <span className="font-futura-medium text-cx-forest-dark">Practice setting:</span>{" "}
                    {programConfig?.default_practice_setting ?? practiceSetting}
                  </p>
                  <OnboardingProfileHint>Set by your program affiliation.</OnboardingProfileHint>
                </div>
              )}

              {!isInstitutional && requiresAcademicRank(practiceSetting) && (
                <div>
                  <OnboardingFieldLabel>Academic rank</OnboardingFieldLabel>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {ACADEMIC_RANKS.map((r) => (
                      <OnboardingChoiceButton
                        key={r}
                        active={academicRank === r}
                        onClick={() => setAcademicRank(r)}
                      >
                        {r}
                      </OnboardingChoiceButton>
                    ))}
                  </div>
                </div>
              )}

              {isInstitutional && (
                <div className="rounded-xl border border-dashed border-cx-forest-dark/20 px-4 py-3">
                  <p className="font-futura-medium text-base text-cx-forest-dark">Call schedule</p>
                  <OnboardingProfileHint>
                    Coming soon — your program call schedule is not uploaded yet.
                  </OnboardingProfileHint>
                </div>
              )}
            </OnboardingProfileSection>

            {showOriginField && baseSpecialty && (
              <OnboardingProfileSection
                step="Section 3"
                title="Your story"
                description="One sentence is enough — this anchors your training narrative with Mak."
              >
                <div>
                  <OnboardingFieldLabel htmlFor="specialty-origin">{originPrompt}</OnboardingFieldLabel>
                  <textarea
                    id="specialty-origin"
                    value={specialtyOrigin}
                    onChange={(e) => setSpecialtyOrigin(e.target.value)}
                    placeholder="Even one sentence is enough — this becomes part of your training narrative."
                    className="cx-field mt-2 min-h-[96px] resize-y text-base text-black"
                    rows={3}
                  />
                </div>
              </OnboardingProfileSection>
            )}

            {showSubspecialtyInterests && baseSpecialty && (
              <OnboardingProfileSection
                step={showOriginField ? "Section 4" : "Section 3"}
                title="Interests"
                description="Optional — what you want to explore beyond your current rotation."
              >
                <OnboardingInterestsBlock
                  baseSpecialty={baseSpecialty}
                  subspecialtyInterests={subspecialtyInterests}
                  onSubspecialtyInterestsChange={setSubspecialtyInterests}
                  showUhPsychTracks={
                    isInstitutional && programConfig?.slug === "uh-psych-cmc"
                  }
                  uhPsychTracks={uhPsychEnrichmentTracks}
                  onUhPsychTracksChange={setUhPsychEnrichmentTracks}
                />
              </OnboardingProfileSection>
            )}

            <OnboardingProfileSection
              step={
                showSubspecialtyInterests && baseSpecialty
                  ? showOriginField
                    ? "Section 5"
                    : "Section 4"
                  : showOriginField
                    ? "Section 4"
                    : "Section 3"
              }
              title="Career direction"
              description="Rank the eight FISCMAK career tracks — Mak uses this for goals and your lattice."
            >
              <CareerTrackRankingFields
                careerLevel={careerLevel}
                value={careerTrackRankings}
                onChange={setCareerTrackRankings}
              />
            </OnboardingProfileSection>

            <Button className="w-full" onClick={submitProfile} disabled={loading}>
              {loading ? "Saving…" : "Continue to documents"}
            </Button>
          </div>
          {error && (
            <p className="cx-alert-banner mt-3 px-4 py-3 text-base">{error}</p>
          )}
        </Card>
      )}

      {step === "documents" && (
        <>
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <OnboardingDocumentsStep onContinue={goToReconcile} continueDisabled={loading} />
        </>
      )}

      {step === "reconcile" && (
        <Card>
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <h1 className="text-page-title">Confirm your career data</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            We found these items in your documents. Confirm what looks right.
          </p>

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

          <div className="mt-6">
            <Button
              className="w-full"
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
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <h1 className="text-page-title">Self-assessment</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            Finish setup now. Complete these instruments from Coach Mak on your dashboard when you are
            ready.
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

          <Button className="mt-6 w-full" onClick={startMakConversation} disabled={loading}>
            {loading ? "Finishing…" : "Go to dashboard"}
          </Button>
        </Card>
      )}
    </PageShell>
  );
}
