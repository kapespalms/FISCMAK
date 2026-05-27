/** Semiannual CCC reporting periods for pilot longitudinal heatmaps. */
export type ReportingPeriod = {
  id: string;
  label: string;
  sort_order: number;
};

export const PILOT_REPORTING_PERIODS: ReportingPeriod[] = [
  { id: "current", label: "Current CCC period", sort_order: 3 },
  { id: "2025-fall", label: "Fall 2025", sort_order: 2 },
  { id: "2025-spring", label: "Spring 2025", sort_order: 1 },
];

export function listReportingPeriods(): ReportingPeriod[] {
  return [...PILOT_REPORTING_PERIODS].sort((a, b) => b.sort_order - a.sort_order);
}
