/**
 * Shared types and constants for goal_records (Phase 2b).
 * Importable from both server routes and client components.
 */

export type GoalHorizon  = "3mo" | "1yr" | "5yr" | "10yr";
export type GoalFramework = "SMART" | "SMART_II" | "WOOP" | "legacy";

export type GoalRecord = {
  id:          string;
  user_id:     string;
  horizon:     GoalHorizon;
  framework:   GoalFramework;
  domain_index: number | null;
  title:       string;
  description: string | null;
  // SMART / SMART_II
  specific:    string | null;
  measurable:  string | null;
  achievable:  string | null;
  relevant:    string | null;
  time_bound:  string | null;
  implementation_intention: string | null;
  // WOOP
  wish:        string | null;
  outcome:     string | null;
  obstacle:    string | null;
  plan:        string | null;
  created_at:  string;
  updated_at:  string;
};

export type GoalsByHorizon = {
  "3mo":  GoalRecord[];
  "1yr":  GoalRecord[];
  "5yr":  GoalRecord[];
  "10yr": GoalRecord[];
};

export const HORIZON_FRAMEWORK: Record<GoalHorizon, GoalFramework> = {
  "3mo":  "SMART",
  "1yr":  "SMART_II",
  "5yr":  "WOOP",
  "10yr": "legacy",
};

export const HORIZON_LABELS: Record<GoalHorizon, string> = {
  "3mo":  "3-Month",
  "1yr":  "1-Year",
  "5yr":  "5-Year",
  "10yr": "10-Year",
};

export const HORIZON_ORDER: GoalHorizon[] = ["3mo", "1yr", "5yr", "10yr"];
