import type {
  AcademicRank,
  CareerStage,
  PracticeSetting,
  PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";

export type { CareerStage };

export type AppUser = {
  user_id: string;
  email: string;
  name: string | null;
  specialty: string | null;
  career_stage: CareerStage | null;
  practice_setting: PracticeSetting | null;
  academic_rank: AcademicRank | null;
  primary_career_track: PrimaryCareerTrack | null;
  institution: string | null;
  cv_uploaded: boolean;
  mempalace_id: string | null;
  tier1_complete: boolean;
  tier2_complete: boolean;
  tier3_complete: boolean;
  onboarding_metadata: Record<string, unknown> | null;
  preferred_location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  last_active: string;
};

export type AssessmentAnswer = {
  q_id: string;
  question: string;
  answer: string | number;
  timestamp?: string;
};

export type CareerAssessment = {
  assessment_id: string;
  user_id: string;
  touchpoint_number: number;
  question_category: string;
  questions_answered: AssessmentAnswer[];
  score: number | null;
  completed_at: string | null;
  created_at: string;
};

export type DocumentRecord = {
  document_id: string;
  user_id: string;
  document_type: string;
  file_url: string | null;
  file_name: string | null;
  extracted_text: string | null;
  metadata: Record<string, unknown>;
  extraction_status: string;
  uploaded_at: string;
};

export type Pathway = {
  pathway_id: string;
  specialty: string;
  pathway_type: string;
  description: string | null;
  salary_range: string | null;
  job_market_demand: string | null;
  milestones: unknown[];
};

export type Job = {
  job_id: string;
  source: string | null;
  title: string;
  institution: string | null;
  location: string | null;
  salary: number | null;
  specialties: string[];
  description: string | null;
  growth_potential: string | null;
  posted_date: string;
  match_score?: number;
  is_saved?: boolean;
};

export type ChatMessage = {
  message_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  section?: string;
  suggested_actions?: SuggestedAction[];
  created_at: string;
};

export type SuggestedAction = {
  action: string;
  url: string;
};

export type MemPalaceExport = {
  export_id: string;
  user_id: string;
  coaching_summary: string | null;
  key_facts: Record<string, unknown>;
  preferences: Record<string, unknown>;
  career_evolution: Record<string, unknown>;
  created_at: string;
};

export type PromotionDossier = {
  dossier_id: string;
  user_id: string;
  target_rank: string | null;
  target_track: string | null;
  target_date: string | null;
  narrative_draft: string | null;
  domain_scores: Record<string, number>;
  gaps_identified: unknown[];
  action_items: unknown[];
  created_at: string;
  last_updated: string;
};

export type NarrativeProgress = {
  progress_id: string;
  dossier_id: string;
  section: string;
  content: string | null;
  completion_percentage: number;
  mak_feedback: string | null;
  created_at: string;
  last_edited: string;
};

export type QuestionDef = {
  q_id: string;
  touchpoint_number: number;
  question_category: string;
  question: string;
  question_type: "text" | "likert" | "choice";
  options?: string[];
  required?: boolean;
};

export type AnalyticsDashboard = {
  career_readiness_index: number;
  onboarding_progress: {
    tier1_complete: boolean;
    tier2_complete: boolean;
    tier3_complete: boolean;
  };
  assessment_progress: {
    completed_touchpoints: number;
    total_touchpoints: number;
    completion_percentage: number;
  };
  burnout_trend: {
    current_score: number | null;
    previous_score: number | null;
    trend: "improving" | "declining" | "stable" | "unknown";
  };
  job_engagement: {
    jobs_viewed: number;
    jobs_saved: number;
    average_match_score: number | null;
  };
  next_touchpoint: {
    number: number;
    category: string;
    due_date: string | null;
    days_until_due: number | null;
  } | null;
  cv_metrics: {
    available: boolean;
    s_index: number | null;
    iwq: number | null;
    promotion_aligned_pct: number | null;
    bits_score: number | null;
    domain_scores: {
      teaching: number;
      scholarship: number;
      clinical: number;
      service: number;
    } | null;
    invisible_work_signals: string[];
    interpretation: {
      s_index: string | null;
      iwq: string | null;
    };
  };
};
