export type LatticeTimeframe = "30d" | "90d" | "1y" | "all";

export type LatticeEvidenceSource =
  | "activity"
  | "document"
  | "schedule"
  | "rotation"
  | "profile"
  | "assessment"
  | "goal";

export type LatticeEvidence = {
  id: string;
  source: LatticeEvidenceSource;
  sourceLabel: string;
  rawText: string;
  date: string | null;
  energy: string | null;
  developmentLevel: number;
  fiscmak?: { domainIndex: number; trackIndex: number };
  acgme?: { competencyKey: string; levelIndex: number };
  documentId?: string;
};

export type LatticeCellMetrics = {
  rowIndex: number;
  colIndex: number;
  rowLabel: string;
  colLabel: string;
  count: number;
  relativeIntensity: number;
  energizingCount: number;
  drainingCount: number;
  neutralCount: number;
  maxDevelopmentLevel: number;
  evidence: LatticeEvidence[];
};

export type LatticeGridModel = {
  kind: "fiscmak" | "acgme";
  rowLabels: string[];
  colLabels: string[];
  cells: LatticeCellMetrics[];
};

export type LatticeDashboardResponse = {
  timeframe: LatticeTimeframe;
  is_trainee: boolean;
  fiscmak: LatticeGridModel;
  acgme: LatticeGridModel | null;
  evidence_total: number;
  /** Pre-dedup count — compare with evidence_total to validate cross-source dedup. */
  evidence_total_raw: number;
  evidence_dedup_removed: number;
  document_evidence_count: number;
  activity_evidence_count: number;
  schedule_evidence_count: number;
  rotation_evidence_count: number;
  profile_evidence_count: number;
  assessment_evidence_count: number;
  goal_evidence_count: number;
  parsed_at: string;
};
