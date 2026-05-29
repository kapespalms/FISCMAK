import type { ActivityEntry } from "@/lib/types/database";
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

const KEY = "fiscmak_v2_demo";

type DemoState = {
  user: AppUser;
  assessments: CareerAssessment[];
  documents: DocumentRecord[];
  activities: ActivityEntry[];
  chatMessages: ChatMessage[];
  mempalace: MemPalaceExport | null;
  jobMatches: { job_id: string; match_score: number; viewed_at?: string; saved_at?: string }[];
  dossiers: PromotionDossier[];
  narrativeProgress: NarrativeProgress[];
};

function freshUser(userId: string, email = ""): AppUser {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    email: email || "demo@fiscmak.app",
    name: null,
    specialty: null,
    base_specialty: null,
    subspecialty: null,
    subspecialty_training_complete: false,
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
    pgy_level: null,
    current_rotation: null,
    specialty_origin: null,
    content_pack: null,
    primary_program_id: null,
    onboarding_metadata: null,
    preferred_location: null,
    salary_min: null,
    salary_max: null,
    created_at: now,
    last_active: now,
  };
}

function emptyState(userId: string, email?: string): DemoState {
  return {
    user: freshUser(userId, email),
    assessments: [],
    documents: [],
    activities: [],
    chatMessages: [],
    mempalace: null,
    jobMatches: [],
    dossiers: [],
    narrativeProgress: [],
  };
}

function load(): DemoState {
  if (typeof window === "undefined") return emptyState("demo-user");
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoState>;
      const base = emptyState(parsed.user?.user_id ?? "demo-user", parsed.user?.email);
      return {
        ...base,
        ...parsed,
        user: { ...base.user, ...parsed.user },
        activities: parsed.activities ?? [],
        narrativeProgress: parsed.narrativeProgress ?? [],
      };
    }
  } catch {
    /* ignore */
  }
  return emptyState("demo-user");
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

/** Server-side in-memory store for local dev without Supabase — starts empty like a new account. */
const serverDemo = new Map<string, DemoState>();

export function getServerDemo(userId: string): DemoState {
  if (!serverDemo.has(userId)) {
    serverDemo.set(userId, emptyState(userId));
  }
  return serverDemo.get(userId)!;
}

export function addServerDemoActivity(userId: string, entry: ActivityEntry) {
  const state = getServerDemo(userId);
  state.activities = [entry, ...state.activities];
  serverDemo.set(userId, state);
}

export function updateServerDemoActivity(
  userId: string,
  activityId: string,
  patch: Partial<ActivityEntry>,
): ActivityEntry | null {
  const state = getServerDemo(userId);
  const index = state.activities.findIndex((a) => a.id === activityId);
  if (index < 0) return null;
  const updated = { ...state.activities[index]!, ...patch };
  state.activities = [
    ...state.activities.slice(0, index),
    updated,
    ...state.activities.slice(index + 1),
  ];
  serverDemo.set(userId, state);
  return updated;
}
