export type ActivityEntry = {
  id: string;
  user_id: string;
  created_at: string;
  activity_date: string | null;
  raw_text: string | null;
  input_source: string | null;
  energy_valence: string | null;
  primary_domain: string | null;
  primary_track: string | null;
  primary_domain_confidence: number | null;
  primary_track_confidence: number | null;
  confidence_score: number | null;
  scope: string | null;
  evidence_strength: string | null;
};

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  specialty: string | null;
  career_phase: string | null;
  institution_name: string | null;
  department_name: string | null;
  goals: string | null;
};

export type ClassificationResult = {
  primary_domain: string;
  primary_track: string;
  primary_domain_confidence: number;
  primary_track_confidence: number;
  scope: string;
  evidence_strength: string;
  confidence_score: number;
  rationale: string;
};
