"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAREER_LEVELS,
  PGY_LEVELS,
  PRACTICE_SETTINGS,
  ACADEMIC_RANKS,
  ACADEMIC_RANK_SPECIAL,
  ACADEMIC_RANK_HELPER,
  requiresAcademicRank,
  isTraineeCareerLevel,
  isMedicalStudent,
  isAttendingCareerLevel,
  requiresGmePlacementFields,
  allowsSubspecialtyInterests,
  type AcademicRank,
  type CareerLevel,
  type PgyLevel,
  type PracticeSetting,
} from "@/lib/v2/onboarding-options";
import { buildNarrativePrompt, NARRATIVE_HELPER, showNarrativeField } from "@/lib/v2/narrative-prompts";
import { CLINICAL_SETTINGS, type ClinicalSetting } from "@/lib/v2/setting-naics-map";
import { DOMAIN_IDENTITIES } from "@/lib/v2/domains";
import {
  MEDICAL_STUDENT_YEARS,
  CURRENT_GOAL_OPTIONS,
  type AdditionalDegreeEntry,
  type CurrentGoal,
  type MedicalStudentYear,
} from "@/lib/v2/onboarding-profile-fields";
import { combineName, splitTrustedName, type TrustedName } from "@/lib/auth/trusted-name";
import type { OnboardingPath } from "@/lib/v2/onboarding-path";
import type { ProgramRotation } from "@/lib/v2/programs/registry";
import { getProgramBySlug } from "@/lib/v2/programs/registry";
import type { InstitutionalTokenPrefill } from "@/lib/v2/programs/institutional-onboarding-tokens";
import { OnboardingPathSelect } from "@/components/onboarding/OnboardingPathSelect";
import {
  defaultTrainingComplete,
  isValidBaseSpecialty,
  migrateLegacySpecialty,
} from "@/lib/v2/specialty-hierarchy";
import { SpecialtyIntakeFields } from "@/components/onboarding/SpecialtyIntakeFields";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingMilestoneTimeline } from "@/components/onboarding/OnboardingMilestoneTimeline";
import { OnboardingResumeBanner } from "@/components/onboarding/OnboardingResumeBanner";
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
import { OnboardingInterestsBlock } from "@/components/onboarding/OnboardingInterestsBlock";
import { AdditionalDegreesFields } from "@/components/onboarding/AdditionalDegreesFields";
import {
  OnboardingProfileCarousel,
  type ProfileCarouselCard,
} from "@/components/onboarding/OnboardingProfileCarousel";
import { OnboardingTermsAcceptanceCard } from "@/components/onboarding/OnboardingTermsAcceptanceCard";
import { ACCEPTANCE_CARD_COPY } from "@/lib/onboarding/acceptance-card-copy";
import {
  LuxuryWorkspace,
  LuxuryCardHeader,
  LuxuryBlock,
  LuxuryChoiceButton,
  LuxuryTextInput,
  LuxuryTextarea,
  LuxuryHint,
  LuxuryInfoPanel,
  LuxuryDivider,
} from "@/components/onboarding/OnboardingLuxuryUi";
import { FISCMAK_TERMS_VERSION } from "@/lib/legal/terms-content";
import { MAK_DISPLAY_NAME } from "@/lib/brand-assets";
import { milestoneIndexForStep } from "@/lib/v2/onboarding-milestones";
import { isNpiReconcileItem } from "@/lib/v2/npi-registry";
import type { NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import {
  resolveOnboardingWizardStep,
} from "@/lib/v2/onboarding-progress";
import type { AppUser } from "@/lib/v2/types";

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
  { id: "profile", label: "Demographics" },
  { id: "documents", label: "Documents" },
  { id: "reconcile", label: "Confirm data" },
  { id: "instruments", label: "Self-assessment" },
];

const INSTITUTIONAL_STEPS_AFTER_PATH: { id: Exclude<OnboardingStep, "path">; label: string }[] =
  [
    { id: "welcome", label: "Welcome" },
    { id: "profile", label: "Identity" },
    { id: "documents", label: "Evidence" },
    { id: "reconcile", label: "Confirm data" },
    { id: "instruments", label: "Inventory" },
  ];

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "path", label: "Path" },
  ...STEPS_AFTER_PATH,
];

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

function resolveInitialStep(searchParams: URLSearchParams): OnboardingStep {
  const param = searchParams.get("step");
  if (param && STEPS.some((s) => s.id === param)) return param as OnboardingStep;
  return "welcome";
}

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
  const [step, setStep] = useState<OnboardingStep>(() => resolveInitialStep(searchParams));
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onboardingPath, setOnboardingPath] = useState<OnboardingPath | null>(null);
  const [pathChosen, setPathChosen] = useState(false);
  const [programConfig, setProgramConfig] = useState<OnboardingProgramConfig | null>(null);
  const [traineeInitials, setTraineeInitials] = useState("");
  const [inviteProgramSlug, setInviteProgramSlug] = useState<string | null>(null);
  const [bootstrappingPath, setBootstrappingPath] = useState(false);
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(
    () => searchParams.get("token"),
  );
  const [inviteTokenFromMeta, setInviteTokenFromMeta] = useState<string | null>(null);
  const [welcomeToken, setWelcomeToken] = useState("");
  const [welcomeTokenLabel, setWelcomeTokenLabel] = useState<string | null>(null);
  const [welcomeTokenError, setWelcomeTokenError] = useState<string | null>(null);
  const [welcomeTokenLoading, setWelcomeTokenLoading] = useState(false);
  const [resumeProfileStep, setResumeProfileStep] = useState(false);
  const [resumeDocumentsStep, setResumeDocumentsStep] = useState(false);
  const [resumeInstrumentsStep, setResumeInstrumentsStep] = useState(false);
  const [documentsProcessing, setDocumentsProcessing] = useState(false);
  const [coachMakConversationId, setCoachMakConversationId] = useState<string | null>(null);

  const isInstitutional = onboardingPath === "institutional" && Boolean(programConfig);
  const stepsAfterPath = isInstitutional ? INSTITUTIONAL_STEPS_AFTER_PATH : STEPS_AFTER_PATH;
  const visibleSteps = pathChosen ? stepsAfterPath : STEPS;

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [namePrefilled, setNamePrefilled] = useState(false);
  const [baseSpecialty, setBaseSpecialty] = useState("");
  const [subspecialty, setSubspecialty] = useState("");
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [careerLevel, setCareerLevel] = useState<CareerLevel>("Fellow");
  const [practiceSetting, setPracticeSetting] = useState<PracticeSetting>("Academic");
  const [clinicalSetting, setClinicalSetting] = useState<ClinicalSetting | "">("");
  const [clinicalPct, setClinicalPct] = useState("");
  const [teachingPct, setTeachingPct] = useState("");
  const [researchPct, setResearchPct] = useState("");
  const [adminPct, setAdminPct] = useState("");
  const [yearsInPractice, setYearsInPractice] = useState("");
  const [energyRankings, setEnergyRankings] = useState<Record<number, number>>({});
  const [academicRank, setAcademicRank] = useState<AcademicRank | "">("");
  const [academicRankOther, setAcademicRankOther] = useState("");
  const [medicalStudentYear, setMedicalStudentYear] = useState<MedicalStudentYear | "">("");
  const [medicalStudentYearOther, setMedicalStudentYearOther] = useState("");
  const [specialtyInterests, setSpecialtyInterests] = useState<string[]>([]);
  const [additionalDegrees, setAdditionalDegrees] = useState<AdditionalDegreeEntry[]>([]);
  const [currentGoal, setCurrentGoal] = useState<CurrentGoal | "">("");
  const [otherIndustries, setOtherIndustries] = useState<string[]>([]);
  const [extracurricularInterests, setExtracurricularInterests] = useState<string[]>([]);
  const [careerTrackRankings, setCareerTrackRankings] = useState<CareerTrackRanking[]>(
    buildDefaultCareerTrackRankings(),
  );
  const [subspecialtyInterests, setSubspecialtyInterests] = useState<string[]>([]);
  const [uhPsychEnrichmentTracks, setUhPsychEnrichmentTracks] = useState<string[]>([]);
  const [pgyLevel, setPgyLevel] = useState<PgyLevel | "">("");
  const [specialtyOrigin, setSpecialtyOrigin] = useState("");
  const [profileCardIndex, setProfileCardIndex] = useState(0);
  const [termsChatConfidential, setTermsChatConfidential] = useState(false);
  const [termsSummativeReports, setTermsSummativeReports] = useState(false);
  const [termsDocumentOwnership, setTermsDocumentOwnership] = useState(false);

  const profileCarouselCards = useMemo((): ProfileCarouselCard[] => {
    const cards: ProfileCarouselCard[] = [
      {
        id: "about",
        label: "Name",
        sectionLabel: "",
        title: "Name",
      },
      {
        id: "specialty",
        label: "Clinical profile",
        sectionLabel: "",
        title: "Clinical Profile",
      },
      {
        id: "career",
        label: "Career direction",
        sectionLabel: "",
        title: "Career Direction",
        description:
          "Rank the career tracks from most energizing to least energizing. Estimate the number of hours you spend in each every week.",
      },
      {
        id: "acceptance",
        label: "Account initialization",
        sectionLabel: "",
        title: ACCEPTANCE_CARD_COPY.title,
      },
    ];
    return cards;
  }, []);

  const activeProfileCardId = profileCarouselCards[profileCardIndex]?.id ?? "about";
  const showGmeFields = requiresGmePlacementFields(careerLevel);
  const showMedStudentFields = isMedicalStudent(careerLevel);
  const showNarrative = showNarrativeField(careerLevel);
  const showSubspecialtyInterests = allowsSubspecialtyInterests(careerLevel);
  const showPracticeSetting = !isInstitutional && !showMedStudentFields;
  const showAcademicRankField =
    !isInstitutional && requiresAcademicRank(practiceSetting, careerLevel);
  const narrativePrompt = buildNarrativePrompt(
    careerLevel,
    showMedStudentFields ? specialtyInterests[0] : baseSpecialty,
    subspecialty || null,
  );
  const careerLevelOptions = isInstitutional
    ? (programConfig?.career_stages_allowed ?? (["Resident", "Fellow"] as CareerLevel[]))
    : CAREER_LEVELS;
  const institutionalCareerStageLocked =
    isInstitutional && careerLevelOptions.length === 1;

  function applyTrustedName(trusted: TrustedName | null | undefined) {
    if (!trusted?.first) return;
    setFirstName(trusted.first);
    setLastName(trusted.last);
    setNamePrefilled(true);
  }

  function applyInstitutionalPrefill(prefill: InstitutionalTokenPrefill | null | undefined) {
    if (!prefill) return;
    if (prefill.first_name?.trim()) {
      setFirstName(prefill.first_name.trim());
      setNamePrefilled(false);
    }
    if (prefill.last_name?.trim()) setLastName(prefill.last_name.trim());
    if (prefill.career_stage) setCareerLevel(prefill.career_stage);
    if (prefill.base_specialty) {
      setBaseSpecialty(prefill.base_specialty);
    }
    if (prefill.subspecialty) {
      setSubspecialty(prefill.subspecialty);
      setTrainingComplete(defaultTrainingComplete(prefill.career_stage ?? careerLevel, prefill.subspecialty));
    }
    if (prefill.practice_setting) setPracticeSetting(prefill.practice_setting);
    if (prefill.pgy_level) setPgyLevel(prefill.pgy_level as PgyLevel);
  }

  async function reloadOnboardingProgram() {
    const res = await fetch("/api/v1/onboarding/touchpoint1");
    const data = await res.json();
    if (data.onboarding?.path) setOnboardingPath(data.onboarding.path);
    if (data.onboarding?.path_chosen) setPathChosen(true);
    if (data.onboarding?.program) {
      const program = data.onboarding.program as OnboardingProgramConfig;
      setProgramConfig(program);
      if (data.onboarding.path === "institutional" && !data.profile?.base_specialty) {
        applyInstitutionalDefaults(program);
      }
    }
  }

  async function handleApplyInstitutionalToken() {
    const token = welcomeToken.trim();
    if (!token) return;
    setWelcomeTokenLoading(true);
    setWelcomeTokenError(null);
    setWelcomeTokenLabel(null);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/onboarding/institutional-token?token=${encodeURIComponent(token)}`,
      );
      const preview = await res.json();
      if (!preview.valid) {
        setWelcomeTokenError(preview.message ?? "Token not recognized.");
        return;
      }

      if (preview.roster_redeem) {
        const ok = await redeemInviteFromUrl(token);
        if (!ok) {
          setWelcomeTokenError("Could not activate this roster invite.");
          return;
        }
        setWelcomeTokenLabel(preview.program_title ?? preview.label ?? "Program linked.");
        await reloadOnboardingProgram();
        return;
      }

      const ok = await saveOnboardingPath({
        onboarding_path: "institutional",
        program_slug: preview.program_slug ?? undefined,
      });
      if (!ok) return;

      applyInstitutionalPrefill(preview.prefill);
      const program = preview.program_slug ? getProgramBySlug(preview.program_slug) : null;
      if (program && !preview.prefill?.base_specialty) {
        applyInstitutionalDefaults({
          slug: program.slug,
          display_title: program.display_title,
          institution_name: program.institution_name,
          program_name: program.program_name,
          base_specialty: program.base_specialty,
          specialty_locked: program.specialty_locked,
          default_career_stage: program.default_career_stage,
          career_stages_allowed: program.career_stages_allowed,
          default_practice_setting: program.default_practice_setting,
          academic_year: program.academic_year,
          rotations: program.rotations,
        });
      }
      await reloadOnboardingProgram();
      setWelcomeTokenLabel(preview.label ?? preview.program_title ?? "Institutional program linked.");
    } catch {
      setWelcomeTokenError("Could not verify token. Try again.");
    } finally {
      setWelcomeTokenLoading(false);
    }
  }

  function applyInstitutionalDefaults(program: OnboardingProgramConfig) {
    setBaseSpecialty(program.base_specialty);
    const stage =
      program.career_stages_allowed?.length === 1
        ? program.career_stages_allowed[0]!
        : program.default_career_stage;
    setCareerLevel(stage);
    setPracticeSetting(program.default_practice_setting);
  }

  async function lookupBlockSchedule(programSlug?: string, token?: string | null) {
    const slug = programSlug ?? programConfig?.slug;
    if (!slug) return;

    const tokenParam = token ?? inviteTokenFromMeta ?? pendingInviteToken;
    const query = tokenParam
      ? `token=${encodeURIComponent(tokenParam)}`
      : traineeInitials.trim()
        ? `initials=${encodeURIComponent(traineeInitials.trim().toUpperCase())}`
        : "";
    if (!query) return;

    try {
      const res = await fetch(
        `/api/v1/onboarding/block-lookup?${query}&program=${encodeURIComponent(slug)}`,
      );
      const data = await res.json();
      if (res.ok && data.suggested_pgy) {
        setPgyLevel(data.suggested_pgy as PgyLevel);
      }
    } catch {
      /* optional PGY prefill */
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
    }
    if (normalized.subspecialty) {
      setSubspecialty(normalized.subspecialty);
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

  async function saveOnboardingProgress(input: {
    current_onboarding_step?: number | null;
    coach_mak_conversation_id?: string | null;
    profile_draft?: Record<string, unknown>;
  }) {
    try {
      await fetch("/api/v1/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    } catch {
      /* best-effort autosave */
    }
  }

  async function saveProfileDraft() {
    await saveOnboardingProgress({
      current_onboarding_step: 1,
      profile_draft: {
        firstName,
        lastName,
        baseSpecialty,
        subspecialty,
        careerLevel,
        practiceSetting,
        pgyLevel,
        specialtyOrigin,
      },
    });
  }

  async function beginOnboarding() {
    await saveOnboardingProgress({ current_onboarding_step: 1 });
    setStep("profile");
    router.replace("/app/onboarding?step=profile");
  }

  const resolveStep = useCallback(
    (
      u: {
        tier1_complete?: boolean;
        tier2_complete?: boolean;
        tier3_complete?: boolean;
        cv_uploaded?: boolean;
        pending_reconcile_count?: number;
        path_chosen?: boolean;
        onboarding_status?: string;
        current_onboarding_step?: number | null;
        coach_mak_conversation_id?: string | null;
        enrichment_pending?: boolean;
        profile_name?: string | null;
        profile_base_specialty?: string | null;
      },
      options?: { pathResolved?: boolean },
    ) => {
      if (u.coach_mak_conversation_id) setCoachMakConversationId(u.coach_mak_conversation_id);
      setDocumentsProcessing(Boolean(u.enrichment_pending));

      if (u.tier3_complete || u.onboarding_status === "FULLY_ONBOARDED") {
        router.replace("/app/dashboard");
        return;
      }

      const param = searchParams.get("step") as OnboardingStep | null;
      if (param && STEPS.some((s) => s.id === param)) {
        setStep(param);
        setResumeProfileStep(
          param === "profile" &&
            !u.tier1_complete &&
            (u.current_onboarding_step === 1 || u.onboarding_status !== "NOT_STARTED"),
        );
        setResumeDocumentsStep(param === "documents");
        setResumeInstrumentsStep(param === "instruments");
        return;
      }

      if (!u.path_chosen && !options?.pathResolved) {
        setStep("path");
        return;
      }

      const resolved = resolveOnboardingWizardStep(
        {
          tier1_complete: Boolean(u.tier1_complete),
          tier2_complete: Boolean(u.tier2_complete),
          tier3_complete: Boolean(u.tier3_complete),
          onboarding_status: u.onboarding_status as AppUser["onboarding_status"],
          current_onboarding_step: u.current_onboarding_step ?? null,
          cv_uploaded: Boolean(u.cv_uploaded),
          name: u.profile_name ?? null,
          base_specialty: u.profile_base_specialty ?? null,
        },
        u.pending_reconcile_count ?? 0,
      );
      setStep(resolved);
      setResumeProfileStep(
        resolved === "profile" &&
          !u.tier1_complete &&
          (u.current_onboarding_step === 1 || u.onboarding_status !== "NOT_STARTED"),
      );
      setResumeDocumentsStep(resolved === "documents");
      setResumeInstrumentsStep(resolved === "instruments");
      router.replace(`/app/onboarding?step=${resolved}`);
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
      if (data.profile?.academic_rank) {
        const rank = data.profile.academic_rank as AcademicRank;
        setAcademicRank(rank);
      } else if (data.onboarding_metadata?.academic_rank_selection) {
        setAcademicRank(data.onboarding_metadata.academic_rank_selection as AcademicRank);
      }
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
      if (data.onboarding_metadata?.specialty_interests) {
        setSpecialtyInterests(data.onboarding_metadata.specialty_interests);
      }
      if (data.onboarding_metadata?.medical_student_year) {
        const year = data.onboarding_metadata.medical_student_year as string;
        if ((MEDICAL_STUDENT_YEARS as readonly string[]).includes(year)) {
          setMedicalStudentYear(year as MedicalStudentYear);
        } else {
          setMedicalStudentYear("Other");
          setMedicalStudentYearOther(year);
        }
      }
      if (data.onboarding_metadata?.additional_degrees) {
        setAdditionalDegrees(data.onboarding_metadata.additional_degrees);
      }
      if (data.onboarding_metadata?.current_goal) {
        setCurrentGoal(data.onboarding_metadata.current_goal as CurrentGoal);
      }
      if (data.onboarding_metadata?.other_industries) {
        setOtherIndustries(data.onboarding_metadata.other_industries);
      }
      if (data.onboarding_metadata?.extracurricular_interests) {
        setExtracurricularInterests(data.onboarding_metadata.extracurricular_interests);
      }
      if (data.onboarding_metadata?.academic_rank_other) {
        setAcademicRankOther(data.onboarding_metadata.academic_rank_other);
      }
      if (data.onboarding_metadata?.uh_psych_enrichment_tracks) {
        setUhPsychEnrichmentTracks(data.onboarding_metadata.uh_psych_enrichment_tracks);
      }
      if (data.profile?.pgy_level) setPgyLevel(data.profile.pgy_level as PgyLevel);
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
          onboarding_status: data.onboarding_status,
          current_onboarding_step: data.current_onboarding_step,
          coach_mak_conversation_id: data.coach_mak_conversation_id,
          profile_name: data.profile?.name ?? null,
          profile_base_specialty: data.profile?.base_specialty ?? null,
          enrichment_pending: Boolean(
            data.cv_uploaded &&
              !data.tier2_complete &&
              (data.reconciliation ?? []).some(
                (r: { status?: string }) => r.status === "pending",
              ) &&
              !data.onboarding_metadata?.enrichment_snapshot,
          ),
        },
        { pathResolved: pathResolved || pathChosenFromServer },
      );
      setBootstrappingPath(false);
      setBootstrapped(true);
    })().catch(() => {
      setBootstrappingPath(false);
      setBootstrapped(true);
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

  async function validateProfileCard(cardId: string): Promise<boolean> {
    setError("");
    const fullName = combineName(firstName, lastName);
    if (cardId === "about") {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setError("Enter your first and last name.");
        return false;
      }
      return true;
    }
    if (cardId === "specialty") {
      const resolvedBase = showMedStudentFields
        ? specialtyInterests[0] ?? baseSpecialty
        : baseSpecialty;
      if (!showMedStudentFields && (!resolvedBase || !isValidBaseSpecialty(resolvedBase))) {
        setError("Select a base specialty from the list.");
        return false;
      }
      if (showMedStudentFields && specialtyInterests.length === 0) {
        setError("Add at least one specialty of interest.");
        return false;
      }
      if (showMedStudentFields && !medicalStudentYear) {
        setError("Select your medical school year.");
        return false;
      }
      if (requiresGmePlacementFields(careerLevel) && !pgyLevel) {
        setError("Select your PGY level.");
        return false;
      }
      return true;
    }
    return true;
  }

  async function goToNextProfileCard() {
    const cardId = profileCarouselCards[profileCardIndex]?.id;
    if (!cardId) return;
    const ok = await validateProfileCard(cardId);
    if (!ok) return;
    setProfileCardIndex((i) => Math.min(i + 1, profileCarouselCards.length - 1));
  }

  function goToPrevProfileCard() {
    setError("");
    setProfileCardIndex((i) => Math.max(i - 1, 0));
  }

  async function submitProfile() {
    const acceptanceCardId = profileCarouselCards[profileCarouselCards.length - 1]?.id;
    if (acceptanceCardId === "acceptance") {
      for (const card of profileCarouselCards) {
        if (card.id === "acceptance") break;
        const ok = await validateProfileCard(card.id);
        if (!ok) {
          setProfileCardIndex(profileCarouselCards.findIndex((c) => c.id === card.id));
          return;
        }
      }
    }
    if (!termsChatConfidential || !termsSummativeReports || !termsDocumentOwnership) {
      setError("Please confirm all privacy and ownership items before continuing.");
      setProfileCardIndex(profileCarouselCards.findIndex((c) => c.id === "acceptance"));
      return;
    }
    const fullName = combineName(firstName, lastName);
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Enter your first and last name.");
      return;
    }
    const resolvedBase = showMedStudentFields
      ? specialtyInterests[0] ?? baseSpecialty
      : baseSpecialty;
    if (!showMedStudentFields && (!resolvedBase || !isValidBaseSpecialty(resolvedBase))) {
      setError("Select a base specialty from the list.");
      return;
    }
    if (showMedStudentFields && !medicalStudentYear) {
      setError("Select your medical school year.");
      return;
    }
    if (requiresGmePlacementFields(careerLevel) && !pgyLevel) {
      setError("Select your PGY level.");
      return;
    }
    setLoading(true);
    setError("");

    const resolvedAcademicRank =
      academicRank === "Other" ? "Other" : academicRank || null;

    const resolvedMsYear =
      medicalStudentYear === "Other"
        ? medicalStudentYearOther.trim() || "Other"
        : medicalStudentYear || null;

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 90_000);

      const res = await fetch("/api/v1/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: fullName.trim(),
          base_specialty: resolvedBase || null,
          subspecialty: showMedStudentFields ? null : subspecialty || null,
          subspecialty_training_complete: subspecialty ? trainingComplete : false,
          career_stage: careerLevel,
          practice_setting: showMedStudentFields ? null : practiceSetting,
          clinical_setting: showPracticeSetting ? clinicalSetting || null : null,
          fte_expected:
            isAttendingCareerLevel(careerLevel) &&
            (clinicalPct || teachingPct || researchPct || adminPct)
              ? {
                  clinical: parseFloat(clinicalPct) / 100 || 0,
                  teaching: parseFloat(teachingPct) / 100 || 0,
                  research: parseFloat(researchPct) / 100 || 0,
                  admin:    parseFloat(adminPct)    / 100 || 0,
                }
              : null,
          years_in_practice:
            isAttendingCareerLevel(careerLevel) && yearsInPractice
              ? parseInt(yearsInPractice, 10) || null
              : null,
          academic_rank: showAcademicRankField ? resolvedAcademicRank : null,
          academic_rank_other: academicRank === "Other" ? academicRankOther.trim() : null,
          primary_career_track: primaryTrackFromRankings(careerTrackRankings),
          career_track_rankings: careerTrackRankings,
          subspecialty_interests: showSubspecialtyInterests ? subspecialtyInterests : [],
          specialty_interests: showMedStudentFields ? specialtyInterests : [],
          medical_student_year: showMedStudentFields ? resolvedMsYear : null,
          additional_degrees: additionalDegrees,
          current_goal: currentGoal || null,
          other_industries: otherIndustries,
          extracurricular_interests: extracurricularInterests,
          uh_psych_enrichment_tracks:
            isInstitutional && programConfig?.slug === "uh-psych-cmc"
              ? uhPsychEnrichmentTracks
              : [],
          pgy_level: showGmeFields ? pgyLevel : null,
          specialty_origin: specialtyOrigin.trim() || null,
          terms_accepted: true,
          terms_version: FISCMAK_TERMS_VERSION,
        }),
      });

      window.clearTimeout(timeoutId);

      let data: { message?: string; error?: string };
      try {
        data = (await res.json()) as { message?: string; error?: string };
      } catch {
        setError("Server error — refresh the page and try again.");
        return;
      }

      if (!res.ok) {
        setError(data.message ?? "Could not save profile");
        return;
      }

      const ratedDomains = Object.entries(energyRankings);
      if (ratedDomains.length > 0) {
        fetch("/api/v1/onboarding/energy-ranking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rankings: ratedDomains.map(([idx, rank]) => ({
              domain_index: Number(idx),
              rank,
            })),
          }),
        }).catch(console.error);
      }

      setStep("documents");
      router.replace("/app/onboarding?step=documents");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Could not save profile. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
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
      const conversationId = coachMakConversationId ?? crypto.randomUUID();
      if (!coachMakConversationId) {
        await saveOnboardingProgress({
          current_onboarding_step: 3,
          coach_mak_conversation_id: conversationId,
        });
        setCoachMakConversationId(conversationId);
      }

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
    setSubspecialty("");
    setTrainingComplete(false);
    setSpecialtyOrigin("");
    setError("");
  }

  function pickSubspecialty(value: string) {
    setSubspecialty(value);
    setTrainingComplete(defaultTrainingComplete(careerLevel, value || null));
    setSpecialtyOrigin("");
    setError("");
  }

  function handleCareerLevelChange(next: CareerLevel) {
    setCareerLevel(next);
    if (next !== "Fellow" && subspecialty) {
      setSubspecialty("");
      setTrainingComplete(false);
    }
    if (isMedicalStudent(next)) {
      setBaseSpecialty("");
      setSubspecialty("");
    }
    if (subspecialty) {
      setTrainingComplete(defaultTrainingComplete(next, subspecialty));
    }
  }

  const stepIndex = visibleSteps.findIndex((s) => s.id === step);

  function navigateToStep(target: OnboardingStep) {
    const targetIdx = visibleSteps.findIndex((s) => s.id === target);
    if (targetIdx < 0) return;

    const targetMilestone = milestoneIndexForStep(target);
    const currentMilestone = milestoneIndexForStep(step);
    if (targetIdx >= stepIndex && targetMilestone >= currentMilestone) return;

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

  const showProgressStepper = pathChosen && step !== "path";
  const timelineDark =
    step === "profile" ||
    step === "documents" ||
    step === "reconcile" ||
    step === "instruments";

  return (
    <>
      {!bootstrapped ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="font-futura-book text-gray-400">Loading onboarding…</p>
        </div>
      ) : showProgressStepper ? (
        <div
          className={cn(
            "-mx-4 -mt-4 flex min-h-[calc(100vh-2rem)] flex-col md:-mx-8 md:-mt-8",
            timelineDark ? "bg-[#0A0C10]" : "bg-slate-50/50",
          )}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6">
            <div
              className={cn(
                "sticky top-0 z-50 -mx-6 border-b px-6 pb-1 pt-2",
                timelineDark ? "border-white/10 bg-[#0A0C10]" : "border-slate-200/80 bg-white",
              )}
            >
              <OnboardingMilestoneTimeline
                currentStep={step}
                cardIndex={step === "profile" ? profileCardIndex : undefined}
                cardCount={step === "profile" ? profileCarouselCards.length : undefined}
                variant={timelineDark ? "dark" : "light"}
                onNavigate={(target) => navigateToStep(target as OnboardingStep)}
              />
            </div>
            <main className="flex-1 py-6">
              {renderOnboardingSteps()}
            </main>
          </div>
        </div>
      ) : (
        <PageShell title="Onboarding" maxWidth="md" className="py-4">
          {renderOnboardingSteps()}
        </PageShell>
      )}
    </>
  );

  function renderOnboardingSteps() {
    return (
      <>
      {step === "path" && bootstrappingPath && (
        <Card>
          <p className="text-sm text-cx-text/70">
            {pendingInviteToken
              ? "Activating your program invite…"
              : "Setting up your program on FISCMAK…"}
          </p>
        </Card>
      )}

      {step === "path" && !bootstrappingPath && pendingInviteToken && !pathChosen && (
        <Card>
          <h2 className="text-lg font-semibold text-cx-text">Invite link required</h2>
          <p className="mt-2 text-sm text-cx-text/80">
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
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cx-text/70 hover:text-cx-text"
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
          institutionalToken={welcomeToken}
          onInstitutionalTokenChange={setWelcomeToken}
          onApplyInstitutionalToken={handleApplyInstitutionalToken}
          tokenPreviewLabel={welcomeTokenLabel}
          tokenLoading={welcomeTokenLoading}
          tokenError={welcomeTokenError}
          onBegin={() => void beginOnboarding()}
        />
        </>
      )}

      {step === "profile" && (
        <div className="space-y-8 font-futura-book text-white">
          {resumeProfileStep ? (
            <OnboardingResumeBanner
              message="Welcome back. Finish your Core Profile."
              storageKey="fiscmak_onboarding_resume_profile"
            />
          ) : null}
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 font-futura-medium text-sm uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {isInstitutional && programConfig && (
            <ProgramJoinHeadline
              program={programConfig}
              variant="onboarding"
              className="mb-2 text-2xl !text-white [&_span]:!text-white"
            />
          )}

          <OnboardingProfileCarousel
            cards={profileCarouselCards}
            index={profileCardIndex}
            onIndexChange={(i) => {
              setError("");
              setProfileCardIndex(i);
            }}
            onNext={() => void goToNextProfileCard()}
            onPrev={goToPrevProfileCard}
            error={error}
            hideNav={activeProfileCardId === "acceptance"}
          >
            <LuxuryWorkspace>
              {activeProfileCardId === "about" && (
                <>
                  <LuxuryBlock label="Name">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <LuxuryTextInput
                        id="onboarding-first-name"
                        value={firstName}
                        onChange={setFirstName}
                        onBlur={() => void saveProfileDraft()}
                        placeholder="Jane"
                      />
                      <LuxuryTextInput
                        id="onboarding-last-name"
                        value={lastName}
                        onChange={setLastName}
                        onBlur={() => void saveProfileDraft()}
                        placeholder="Smith"
                      />
                    </div>
                  </LuxuryBlock>

                  {!isInstitutional && (
                    <>
                      <LuxuryDivider />
                      <LuxuryBlock label="Additional Degrees">
                        <LuxuryHint className="mb-4">
                          Optional — other degrees beyond your MD/DO.
                        </LuxuryHint>
                        <AdditionalDegreesFields
                          value={additionalDegrees}
                          onChange={setAdditionalDegrees}
                          variant="luxury"
                        />
                      </LuxuryBlock>
                    </>
                  )}
                </>
              )}

              {activeProfileCardId === "specialty" && (
                <>
                  {institutionalCareerStageLocked ? (
                    <LuxuryInfoPanel>
                      <span className="font-futura-medium text-[#D4AF37]">Career level:</span>{" "}
                      {careerLevel}
                      <LuxuryHint className="mt-2">
                        Set by your program affiliation.
                      </LuxuryHint>
                    </LuxuryInfoPanel>
                  ) : (
                    <LuxuryBlock label="Career Level">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {careerLevelOptions.map((s) => (
                          <LuxuryChoiceButton
                            key={s}
                            active={careerLevel === s}
                            onClick={() => handleCareerLevelChange(s)}
                          >
                            {s}
                          </LuxuryChoiceButton>
                        ))}
                      </div>
                    </LuxuryBlock>
                  )}

                  {showMedStudentFields && (
                    <LuxuryBlock label="Medical School Year">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {MEDICAL_STUDENT_YEARS.map((year) => (
                          <LuxuryChoiceButton
                            key={year}
                            active={medicalStudentYear === year}
                            onClick={() => setMedicalStudentYear(year)}
                          >
                            {year}
                          </LuxuryChoiceButton>
                        ))}
                      </div>
                      {medicalStudentYear === "Other" && (
                        <LuxuryTextInput
                          value={medicalStudentYearOther}
                          onChange={setMedicalStudentYearOther}
                          placeholder="Describe your year"
                          className="mt-3"
                        />
                      )}
                    </LuxuryBlock>
                  )}

                  {showGmeFields && (
                    <LuxuryBlock label="PGY Level">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {PGY_LEVELS.map((level) => (
                          <LuxuryChoiceButton
                            key={level}
                            active={pgyLevel === level}
                            onClick={() => setPgyLevel(level)}
                            className="text-center"
                            mono
                          >
                            {level}
                          </LuxuryChoiceButton>
                        ))}
                      </div>
                    </LuxuryBlock>
                  )}

                  {showPracticeSetting && (
                    <LuxuryBlock label="Practice Setting">
                      <div className="grid grid-cols-2 gap-2">
                        {PRACTICE_SETTINGS.map((s) => (
                          <LuxuryChoiceButton
                            key={s}
                            active={practiceSetting === s}
                            onClick={() => setPracticeSetting(s)}
                          >
                            {s}
                          </LuxuryChoiceButton>
                        ))}
                      </div>
                    </LuxuryBlock>
                  )}

                  {isInstitutional && (
                    <LuxuryInfoPanel>
                      <span className="font-futura-medium text-[#D4AF37]">Practice setting:</span>{" "}
                      {programConfig?.default_practice_setting ?? practiceSetting}
                      <LuxuryHint className="mt-2">
                        Set by your program affiliation.
                      </LuxuryHint>
                    </LuxuryInfoPanel>
                  )}

                  {showPracticeSetting && (
                    <LuxuryBlock label="Clinical Site (Optional)">
                      <LuxuryHint className="mb-3">
                        Where you primarily practice — helps calibrate your career lattice.
                      </LuxuryHint>
                      <div className="grid grid-cols-2 gap-2">
                        {CLINICAL_SETTINGS.map((s) => (
                          <LuxuryChoiceButton
                            key={s}
                            active={clinicalSetting === s}
                            onClick={() => setClinicalSetting(s)}
                          >
                            {s}
                          </LuxuryChoiceButton>
                        ))}
                      </div>
                    </LuxuryBlock>
                  )}

                  {isAttendingCareerLevel(careerLevel) && !isInstitutional && (
                    <LuxuryBlock label="Role Composition % (Optional)">
                      <LuxuryHint className="mb-3">
                        Approximate time in each area — helps calibrate your career lattice.
                      </LuxuryHint>
                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            ["Clinical",  clinicalPct,  setClinicalPct],
                            ["Teaching",  teachingPct,  setTeachingPct],
                            ["Research",  researchPct,  setResearchPct],
                            ["Admin",     adminPct,     setAdminPct],
                          ] as [string, string, (v: string) => void][]
                        ).map(([label, value, setter]) => (
                          <div key={label}>
                            <p className="mb-1 text-xs text-gray-500">{label}</p>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={value}
                              onChange={(e) => setter(e.target.value)}
                              placeholder="0"
                              className="w-full rounded-xl border border-white/5 bg-[#0A0C10] px-4 py-3 text-sm text-white transition-all placeholder:text-gray-600 focus:border-[#A3E635] focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      {[clinicalPct, teachingPct, researchPct, adminPct].some(Boolean) && (() => {
                        const total = [clinicalPct, teachingPct, researchPct, adminPct]
                          .map((v) => parseFloat(v) || 0)
                          .reduce((a, b) => a + b, 0);
                        return (
                          <p className="mt-2 text-xs text-gray-500">
                            Total:{" "}
                            <span className={Math.abs(total - 100) > 1 ? "text-[#C28D6C]" : "text-fis-gold"}>
                              {total}%
                            </span>
                            {" "}(should equal 100%)
                          </p>
                        );
                      })()}
                    </LuxuryBlock>
                  )}

                  {isAttendingCareerLevel(careerLevel) && !isInstitutional && (
                    <LuxuryBlock label="Years in Practice (Optional)">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={yearsInPractice}
                        onChange={(e) => setYearsInPractice(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full rounded-xl border border-white/5 bg-[#0A0C10] px-5 py-4 text-sm text-white transition-all placeholder:text-gray-600 focus:border-[#A3E635] focus:outline-none"
                      />
                    </LuxuryBlock>
                  )}

                  {!showMedStudentFields && (
                    <LuxuryBlock label="Domain Energy (Optional)">
                      <LuxuryHint className="mb-3">
                        Rate each area: 1 = very draining · 5 = very energizing. Skip any you&apos;re unsure about.
                      </LuxuryHint>
                      <div className="space-y-3">
                        {DOMAIN_IDENTITIES.map((domain) => (
                          <div key={domain.index} className="flex items-center gap-3">
                            <span className="w-36 shrink-0 text-sm text-gray-300">
                              {domain.name}
                            </span>
                            <div className="flex gap-1.5">
                              {([1, 2, 3, 4, 5] as const).map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() =>
                                    setEnergyRankings((prev) => ({
                                      ...prev,
                                      [domain.index]: prev[domain.index] === n ? 0 : n,
                                    }))
                                  }
                                  className={cn(
                                    "h-8 w-8 rounded-lg border text-xs font-medium transition-all",
                                    energyRankings[domain.index] === n
                                      ? "border-[#A3E635] bg-[#A3E635]/10 text-fis-gold"
                                      : "border-white/10 bg-[#0A0C10] text-gray-500 hover:border-white/20",
                                  )}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </LuxuryBlock>
                  )}

                  {showAcademicRankField && (
                    <LuxuryBlock label="Academic Rank (Optional)">
                      <LuxuryHint className="mb-4">{ACADEMIC_RANK_HELPER}</LuxuryHint>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <LuxuryChoiceButton
                          active={!academicRank}
                          onClick={() => setAcademicRank("")}
                        >
                          No rank selected
                        </LuxuryChoiceButton>
                        {ACADEMIC_RANKS.map((r) => (
                          <LuxuryChoiceButton
                            key={r}
                            active={academicRank === r}
                            onClick={() => setAcademicRank(r)}
                          >
                            {r}
                          </LuxuryChoiceButton>
                        ))}
                        {ACADEMIC_RANK_SPECIAL.map((r) => (
                          <LuxuryChoiceButton
                            key={r}
                            active={academicRank === r}
                            onClick={() => setAcademicRank(r)}
                          >
                            {r}
                          </LuxuryChoiceButton>
                        ))}
                      </div>
                      {academicRank === "Other" && (
                        <LuxuryTextInput
                          value={academicRankOther}
                          onChange={setAcademicRankOther}
                          placeholder="Describe your academic title"
                          className="mt-3"
                        />
                      )}
                    </LuxuryBlock>
                  )}

                  {isInstitutional && programConfig?.specialty_locked ? (
                    <LuxuryBlock label="Specialty">
                      <p className="mb-4 text-base text-white">{programConfig.base_specialty}</p>
                      <SpecialtyIntakeFields
                        baseSpecialty={baseSpecialty}
                        onPickBase={pickBaseSpecialty}
                        subspecialty={subspecialty}
                        onPickSubspecialty={pickSubspecialty}
                        trainingComplete={trainingComplete}
                        onTrainingCompleteChange={setTrainingComplete}
                        careerStage={careerLevel}
                        hideBaseSpecialtyPicker
                        variant="luxury"
                      />
                    </LuxuryBlock>
                  ) : (
                    <SpecialtyIntakeFields
                      baseSpecialty={baseSpecialty}
                      onPickBase={pickBaseSpecialty}
                      subspecialty={subspecialty}
                      onPickSubspecialty={pickSubspecialty}
                      trainingComplete={trainingComplete}
                      onTrainingCompleteChange={setTrainingComplete}
                      careerStage={careerLevel}
                      specialtyInterests={specialtyInterests}
                      onSpecialtyInterestsChange={setSpecialtyInterests}
                      variant="luxury"
                    />
                  )}

                  {showSubspecialtyInterests &&
                    (showMedStudentFields ? specialtyInterests.length > 0 : Boolean(baseSpecialty)) && (
                      <OnboardingInterestsBlock
                        baseSpecialty={
                          showMedStudentFields ? specialtyInterests[0]! : baseSpecialty
                        }
                        baseSpecialties={showMedStudentFields ? specialtyInterests : undefined}
                        careerStage={careerLevel}
                        subspecialtyInterests={subspecialtyInterests}
                        onSubspecialtyInterestsChange={setSubspecialtyInterests}
                        showUhPsychTracks={
                          isInstitutional && programConfig?.slug === "uh-psych-cmc"
                        }
                        uhPsychTracks={uhPsychEnrichmentTracks}
                        onUhPsychTracksChange={setUhPsychEnrichmentTracks}
                        variant="luxury"
                      />
                    )}

                  {showNarrative && (
                    <>
                      <LuxuryDivider />
                      <LuxuryBlock label={narrativePrompt}>
                        <LuxuryTextarea
                          id="specialty-origin"
                          value={specialtyOrigin}
                          onChange={setSpecialtyOrigin}
                          placeholder="Optional — one sentence is enough."
                        />
                        <LuxuryHint className="mt-3">{NARRATIVE_HELPER}</LuxuryHint>
                      </LuxuryBlock>
                    </>
                  )}

                  {isInstitutional && (
                    <LuxuryBlock label="Call Schedule">
                      <LuxuryHint>
                        CMC call coverage is seeded in FISCMAK (initials + shift). Use QGenda for live
                        assignments and switch rules.
                      </LuxuryHint>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <Link
                          href="/app/contacts#staff-directory"
                          className="font-medium text-fis-gold underline-offset-2 hover:underline"
                        >
                          Program contacts
                        </Link>
                        <Link
                          href="/app/schedule?tab=blocks"
                          className="font-medium text-fis-gold underline-offset-2 hover:underline"
                        >
                          Block schedule
                        </Link>
                      </div>
                    </LuxuryBlock>
                  )}
                </>
              )}

              {activeProfileCardId === "career" && (
                <>
                  <CareerTrackRankingFields
                    careerLevel={careerLevel}
                    value={careerTrackRankings}
                    onChange={setCareerTrackRankings}
                    variant="luxury"
                  />

                  {!isInstitutional && (
                    <>
                      <LuxuryDivider />
                      <LuxuryBlock label="Current Goal">
                        <LuxuryHint className="mb-4">
                          What do you most want FISCMAK to help with right now?
                        </LuxuryHint>
                        <div className="grid gap-2">
                          {CURRENT_GOAL_OPTIONS.map((option) => (
                            <LuxuryChoiceButton
                              key={option}
                              active={currentGoal === option}
                              onClick={() => setCurrentGoal(option)}
                            >
                              {option}
                            </LuxuryChoiceButton>
                          ))}
                        </div>
                      </LuxuryBlock>
                    </>
                  )}
                </>
              )}

              {activeProfileCardId === "acceptance" && (
                <OnboardingTermsAcceptanceCard
                  chatConfidential={termsChatConfidential}
                  summativeReports={termsSummativeReports}
                  documentOwnership={termsDocumentOwnership}
                  onChatConfidentialChange={setTermsChatConfidential}
                  onSummativeReportsChange={setTermsSummativeReports}
                  onDocumentOwnershipChange={setTermsDocumentOwnership}
                  onAccept={() => void submitProfile()}
                  loading={loading}
                  error={error}
                />
              )}
            </LuxuryWorkspace>
          </OnboardingProfileCarousel>
        </div>
      )}

      {step === "documents" && (
        <div className="space-y-8 font-futura-book text-white">
          {resumeDocumentsStep ? (
            <OnboardingResumeBanner
              message={
                documentsProcessing
                  ? "Resuming file processing... Your secure evidence dossier is updating."
                  : "Welcome back. Continue your Evidence Vault."
              }
              storageKey="fiscmak_onboarding_resume_documents"
            />
          ) : null}
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 font-futura-medium text-sm uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <OnboardingDocumentsStep variant="luxury" onContinue={goToReconcile} continueDisabled={loading} />
        </div>
      )}

      {step === "reconcile" && (
        <div className="space-y-8 font-futura-book text-white">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 font-futura-medium text-sm uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <LuxuryWorkspace>
            <LuxuryCardHeader
              title="Evidence Vault"
              description="Confirm parsed data from your uploaded artifacts."
            />

            <ul className="space-y-4">
              {reconcileItems.map((item) => (
                <ReconciliationItemCard
                  key={item.id}
                  item={item}
                  variant="luxury"
                  initialNpi={savedNpi}
                  npiStatus={isNpiReconcileItem(item) ? npiStatus : null}
                  onToggle={toggleReconcile}
                  onNpiVerified={handleNpiVerified}
                  onNpiSkipped={handleNpiSkipped}
                />
              ))}
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={submitReconciliation}
                disabled={loading || !canContinueReconcile()}
                className="w-full rounded-xl bg-white px-10 py-4 font-futura-bold text-sm uppercase tracking-[0.2em] text-[#0A0C10] shadow-[0_4px_20px_rgba(255,255,255,0.05)] transition-all hover:bg-gray-200 disabled:opacity-40"
              >
                {loading ? "Saving…" : "Continue to Career Chat"}
              </button>
            </div>
            {error && (
              <p className="rounded-xl border border-[#C28D6C]/30 bg-[#C28D6C]/10 px-4 py-3 text-sm text-[#C28D6C]">
                {error}
              </p>
            )}
          </LuxuryWorkspace>
        </div>
      )}

      {step === "instruments" && (
        <div className="space-y-8 font-futura-book text-white">
          {resumeInstrumentsStep && coachMakConversationId ? (
            <OnboardingResumeBanner
              message={`Welcome back. Resume your Career Chat with ${MAK_DISPLAY_NAME}.`}
              storageKey="fiscmak_onboarding_resume_instruments"
            />
          ) : null}
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBackOneStep}
              className="mb-4 inline-flex items-center gap-1.5 font-futura-medium text-sm uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <LuxuryWorkspace>
            <LuxuryCardHeader
              title="Career Chat"
              description={`Initiate an intake chat for career exploration and empowerment with ${MAK_DISPLAY_NAME}.`}
            />

            <ul className="space-y-2">
              {instruments.map((inst) => (
                <li
                  key={inst.id}
                  className="rounded-xl border border-white/5 bg-[#0A0C10] px-4 py-3 text-sm text-gray-300"
                >
                  <span className="font-futura-bold text-white">{inst.name}</span>
                  <span className="text-gray-500">
                    {" "}
                    · {inst.items} items · ~{inst.minutes} min — {inst.description}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={startMakConversation}
              disabled={loading}
              className="w-full rounded-xl bg-white px-10 py-4 font-futura-bold text-sm uppercase tracking-[0.2em] text-[#0A0C10] shadow-[0_4px_20px_rgba(255,255,255,0.05)] transition-all hover:bg-gray-200 disabled:opacity-40"
            >
              {loading ? "Finishing…" : "Go to dashboard"}
            </button>
          </LuxuryWorkspace>
        </div>
      )}
      </>
    );
  }
}
