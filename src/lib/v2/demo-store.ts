import type {
  AppUser,
  CareerAssessment,
  ChatMessage,
  DocumentRecord,
  Job,
  MemPalaceExport,
  NarrativeProgress,
  PromotionDossier,
} from "@/lib/v2/types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { touchpointsEligible } from "@/lib/v2/touchpoint-eligibility";

const KEY = "fiscmak_v2_demo";

type DemoState = {
  user: AppUser;
  assessments: CareerAssessment[];
  documents: DocumentRecord[];
  chatMessages: ChatMessage[];
  mempalace: MemPalaceExport | null;
  jobMatches: { job_id: string; match_score: number; viewed_at?: string; saved_at?: string }[];
  dossiers: PromotionDossier[];
  narrativeProgress: NarrativeProgress[];
};

function defaultUser(): AppUser {
  const now = new Date().toISOString();
  return {
    user_id: "demo-user",
    email: "demo@fiscmak.app",
    name: "Demo Physician",
    specialty: null,
    career_stage: null,
    institution: null,
    cv_uploaded: false,
    mempalace_id: null,
    tier1_complete: false,
    tier2_complete: false,
    tier3_complete: false,
    practice_setting: null,
    academic_rank: null,
    primary_career_track: null,
    onboarding_metadata: null,
    preferred_location: null,
    salary_min: null,
    salary_max: null,
    created_at: now,
    last_active: now,
  };
}

function load(): DemoState {
  const empty = (): DemoState => ({
    user: defaultUser(),
    assessments: [],
    documents: [],
    chatMessages: [],
    mempalace: null,
    jobMatches: [],
    dossiers: [],
    narrativeProgress: [],
  });
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoState>;
      return { ...empty(), ...parsed, narrativeProgress: parsed.narrativeProgress ?? [] };
    }
  } catch {
    /* ignore */
  }
  return empty();
}

function save(state: DemoState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export const demoStore = {
  getUser(): AppUser {
    return load().user;
  },
  setUser(patch: Partial<AppUser>): AppUser {
    const s = load();
    s.user = { ...s.user, ...patch, last_active: new Date().toISOString() };
    save(s);
    return s.user;
  },
  getAssessments(): CareerAssessment[] {
    return load().assessments;
  },
  saveAssessment(a: CareerAssessment) {
    const s = load();
    const i = s.assessments.findIndex((x) => x.assessment_id === a.assessment_id);
    if (i >= 0) s.assessments[i] = a;
    else s.assessments.push(a);
    save(s);
  },
  getDocuments(): DocumentRecord[] {
    return load().documents;
  },
  addDocument(d: DocumentRecord) {
    const s = load();
    s.documents.unshift(d);
    save(s);
  },
  getChat(): ChatMessage[] {
    return load().chatMessages;
  },
  addChat(m: ChatMessage) {
    const s = load();
    s.chatMessages.push(m);
    save(s);
  },
  getMemPalace(): MemPalaceExport | null {
    return load().mempalace;
  },
  setMemPalace(m: MemPalaceExport) {
    const s = load();
    s.mempalace = m;
    save(s);
  },
  getJobMatches() {
    return load().jobMatches;
  },
  setJobMatch(job_id: string, match_score: number, saved?: boolean) {
    const s = load();
    const i = s.jobMatches.findIndex((j) => j.job_id === job_id);
    const row = {
      job_id,
      match_score,
      viewed_at: new Date().toISOString(),
      saved_at: saved ? new Date().toISOString() : undefined,
    };
    if (i >= 0) s.jobMatches[i] = { ...s.jobMatches[i], ...row };
    else s.jobMatches.push(row);
    save(s);
  },
  getDossiers(): PromotionDossier[] {
    return load().dossiers;
  },
  addDossier(d: PromotionDossier) {
    const s = load();
    s.dossiers.push(d);
    save(s);
  },
};

/** Server-side in-memory demo for API routes without Supabase */
const serverDemo = new Map<string, DemoState>();

function dashboardReadyDemoUser(userId: string): AppUser {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    email: "demo@fiscmak.app",
    name: "Demo Physician",
    specialty: "Internal Medicine",
    career_stage: "Early Career (0–7 yr)",
    institution: "Demo Academic Medical Center",
    cv_uploaded: true,
    mempalace_id: null,
    tier1_complete: true,
    tier2_complete: true,
    tier3_complete: true,
    practice_setting: "Academic",
    academic_rank: "Assistant Professor",
    primary_career_track: "Educator",
    onboarding_metadata: {
      computed_at: now,
      career_objective: "Program Director within 3 years",
      goals_confirmed: true,
      goals_confirmed_at: now,
      enrichment_snapshot: {
        run_id: "demo-enrichment",
        completed_at: now,
        trigger: "onboarding",
        status: "completed",
        sources: ["CV parse", "OpenAlex", "NIH RePORTER"],
        publications_detected: 38,
        citations_total: 412,
        grants_detected: 3,
        peer_reviews_detected: 12,
        presentations_detected: 24,
        committees_detected: 6,
        courses_detected: 12,
        awards_detected: 5,
        changes_summary: "+2 publications, +1 grant since last quarter",
        reconciliation_items: [],
        npi_verified: true,
        orcid: "0000-0002-1825-0097",
        orcid_works_count: 38,
      },
    },
    preferred_location: null,
    salary_min: null,
    salary_max: null,
    created_at: now,
    last_active: now,
  };
}

function ensureDemoTouchpointReady(state: DemoState): DemoState {
  const meta = getOnboardingMetadata(state.user);
  if (touchpointsEligible(state.user, meta)) return state;

  const ready = dashboardReadyDemoUser(state.user.user_id);
  state.user = {
    ...ready,
    ...state.user,
    tier1_complete: true,
    tier2_complete: true,
    tier3_complete: state.user.tier3_complete || true,
    onboarding_metadata: {
      ...(ready.onboarding_metadata as Record<string, unknown>),
      ...((state.user.onboarding_metadata as Record<string, unknown> | null) ?? {}),
      computed_at:
        meta.computed_at ??
        (ready.onboarding_metadata as { computed_at?: string })?.computed_at,
    },
  };
  return state;
}

export function getServerDemo(userId: string): DemoState {
  if (!serverDemo.has(userId)) {
    serverDemo.set(userId, {
      user: dashboardReadyDemoUser(userId),
      assessments: [],
      documents: [],
      chatMessages: [],
      mempalace: null,
      jobMatches: [],
      dossiers: [],
      narrativeProgress: [],
    });
  }
  const state = ensureDemoTouchpointReady(serverDemo.get(userId)!);
  serverDemo.set(userId, state);
  return state;
}
