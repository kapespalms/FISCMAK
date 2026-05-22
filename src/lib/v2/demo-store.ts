import type {
  AppUser,
  CareerAssessment,
  ChatMessage,
  DocumentRecord,
  Job,
  MemPalaceExport,
  PromotionDossier,
} from "@/lib/v2/types";

const KEY = "fiscmak_v2_demo";

type DemoState = {
  user: AppUser;
  assessments: CareerAssessment[];
  documents: DocumentRecord[];
  chatMessages: ChatMessage[];
  mempalace: MemPalaceExport | null;
  jobMatches: { job_id: string; match_score: number; viewed_at?: string; saved_at?: string }[];
  dossiers: PromotionDossier[];
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
    preferred_location: null,
    salary_min: null,
    salary_max: null,
    created_at: now,
    last_active: now,
  };
}

function load(): DemoState {
  if (typeof window === "undefined") {
    return {
      user: defaultUser(),
      assessments: [],
      documents: [],
      chatMessages: [],
      mempalace: null,
      jobMatches: [],
      dossiers: [],
    };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
    /* ignore */
  }
  return {
    user: defaultUser(),
    assessments: [],
    documents: [],
    chatMessages: [],
    mempalace: null,
    jobMatches: [],
    dossiers: [],
  };
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

export function getServerDemo(userId: string): DemoState {
  if (!serverDemo.has(userId)) {
    serverDemo.set(userId, {
      user: { ...defaultUser(), user_id: userId },
      assessments: [],
      documents: [],
      chatMessages: [],
      mempalace: null,
      jobMatches: [],
      dossiers: [],
    });
  }
  return serverDemo.get(userId)!;
}
