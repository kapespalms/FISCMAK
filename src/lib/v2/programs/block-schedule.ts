import scheduleData from "../../../../docs/seeds/psychiatry_uh_2026_2027_block_schedule.json";
import catalogData from "../../../../docs/seeds/psychiatry_uh_va_2025_2026_block_schedule.json";
import { rotationLabel, UH_PSYCH_CMC_PROGRAM } from "@/lib/v2/programs/registry";

export type BlockScheduleLegendEntry = {
  code: string;
  label: string;
  description?: string;
};

type RotationCatalogRow = {
  code: string;
  display_name: string;
  suffix_marker?: string;
  fiscmak_note?: string;
};

export type BlockAssignment = {
  trainee_initials: string;
  pgy_level: string;
  block_id: string;
  rotation_code: string;
  start_date: string;
  end_date: string;
  access_clinic_slots?: string;
};

export type CurrentBlockResult = {
  matched: boolean;
  trainee_initials: string;
  roster_pgy_level?: string;
  block_id?: string;
  rotation_code?: string;
  rotation_label?: string;
  pgy_level?: string;
  start_date?: string;
  end_date?: string;
  days_remaining?: number;
  academic_year?: string;
};

const assignments = (scheduleData as { trainee_block_assignments: BlockAssignment[] })
  .trainee_block_assignments;

const roster = (scheduleData as { trainee_roster: Array<{ initials: string; pgy_level: string }> })
  .trainee_roster;

const programMeta = (scheduleData as { program: { academic_year: string } }).program;

function parseUsDate(value: string): Date {
  const [month, day, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function rosterPgyForInitials(initials: string): string | null {
  const upper = initials.trim().toUpperCase();
  if (!upper) return null;
  return roster.find((r) => r.initials.toUpperCase() === upper)?.pgy_level ?? null;
}

export function resolveCurrentBlock(input: {
  trainee_initials: string;
  as_of?: Date;
}): CurrentBlockResult {
  const upper = input.trainee_initials.trim().toUpperCase();
  const asOf = input.as_of ?? new Date();

  if (!upper) {
    return { matched: false, trainee_initials: "" };
  }

  const rosterPgy = rosterPgyForInitials(upper);
  const traineeBlocks = assignments.filter(
    (a) => a.trainee_initials.toUpperCase() === upper,
  );

  for (const block of traineeBlocks) {
    const start = parseUsDate(block.start_date);
    const end = endOfDay(parseUsDate(block.end_date));
    if (asOf >= start && asOf <= end) {
      const label = rotationLabel(UH_PSYCH_CMC_PROGRAM, block.rotation_code);
      return {
        matched: true,
        trainee_initials: upper,
        roster_pgy_level: rosterPgy ?? undefined,
        block_id: block.block_id,
        rotation_code: block.rotation_code,
        rotation_label: label,
        pgy_level: block.pgy_level,
        start_date: block.start_date,
        end_date: block.end_date,
        days_remaining: Math.max(0, daysBetween(asOf, end)),
        academic_year: programMeta.academic_year,
      };
    }
  }

  return {
    matched: false,
    trainee_initials: upper,
    roster_pgy_level: rosterPgy ?? undefined,
    academic_year: programMeta.academic_year,
  };
}

export function resolveNextBlock(input: {
  trainee_initials: string;
  as_of?: Date;
}): CurrentBlockResult {
  const upper = input.trainee_initials.trim().toUpperCase();
  const asOf = input.as_of ?? new Date();
  if (!upper) return { matched: false, trainee_initials: "" };

  const rosterPgy = rosterPgyForInitials(upper);
  const traineeBlocks = assignments
    .filter((a) => a.trainee_initials.toUpperCase() === upper)
    .map((block) => ({
      block,
      start: parseUsDate(block.start_date),
      end: endOfDay(parseUsDate(block.end_date)),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const upcoming = traineeBlocks.find(({ start }) => start > asOf);
  if (!upcoming) {
    return {
      matched: false,
      trainee_initials: upper,
      roster_pgy_level: rosterPgy ?? undefined,
      academic_year: programMeta.academic_year,
    };
  }

  const { block, start, end } = upcoming;
  const label = rotationLabel(UH_PSYCH_CMC_PROGRAM, block.rotation_code);
  return {
    matched: true,
    trainee_initials: upper,
    roster_pgy_level: rosterPgy ?? undefined,
    block_id: block.block_id,
    rotation_code: block.rotation_code,
    rotation_label: label,
    pgy_level: block.pgy_level,
    start_date: block.start_date,
    end_date: block.end_date,
    days_remaining: Math.max(0, daysBetween(asOf, start)),
    academic_year: programMeta.academic_year,
  };
}

/** Map roster PGY label to onboarding PGY picker value */
export function normalizePgyForOnboarding(pgy: string | null | undefined): string | null {
  if (!pgy) return null;
  if (pgy.startsWith("PGY-1")) return "PGY-1";
  if (pgy.startsWith("PGY-2")) return "PGY-2";
  if (pgy.startsWith("PGY-3")) return "PGY-3";
  if (pgy.startsWith("PGY-4")) return "PGY-4";
  if (pgy.startsWith("PGY-5") || pgy.startsWith("PPP")) return "PGY-5+";
  return null;
}

export function toIsoDateFromUs(value: string): string {
  const [month, day, year] = value.split("/").map(Number);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const SPECIAL_BLOCK_CODES = new Set(["leave", "bhi_access", "vacation", "nf", "elective"]);

/** Legend for non-rotation block codes residents see on the schedule. */
export function blockScheduleLegend(): BlockScheduleLegendEntry[] {
  const catalog =
    (catalogData as { rotation_catalog?: RotationCatalogRow[] }).rotation_catalog ?? [];
  const programNotes = (catalogData as { program?: { notes?: string[] } }).program?.notes ?? [];

  const entries: BlockScheduleLegendEntry[] = catalog
    .filter((row) => SPECIAL_BLOCK_CODES.has(row.code))
    .map((row) => ({
      code: row.code,
      label: row.display_name,
      description: row.fiscmak_note ?? undefined,
    }));

  const usedCodes = new Set(catalog.map((row) => row.code));
  const usedInAssignments = new Set(
    assignments.map((a) => a.rotation_code).filter((code) => SPECIAL_BLOCK_CODES.has(code)),
  );

  for (const code of usedInAssignments) {
    if (usedCodes.has(code)) continue;
    const label = rotationLabel(UH_PSYCH_CMC_PROGRAM, code);
    entries.push({ code, label });
  }

  const noteEntries = programNotes
    .filter((note) => /#|BHI|Access|NF|Night Float|leave/i.test(note))
    .map((note, index) => ({
      code: `note-${index}`,
      label: note,
    }));

  return [...entries, ...noteEntries];
}

export function listBlocksForTrainee(trainee_initials: string) {
  const upper = trainee_initials.trim().toUpperCase();
  if (!upper) return [];
  return assignments
    .filter((a) => a.trainee_initials.toUpperCase() === upper)
    .map((block) => {
      const label = rotationLabel(UH_PSYCH_CMC_PROGRAM, block.rotation_code);
      return {
        block_id: block.block_id,
        rotation_code: block.rotation_code,
        rotation_label: label,
        start_date: toIsoDateFromUs(block.start_date),
        end_date: toIsoDateFromUs(block.end_date),
        pgy_level: block.pgy_level,
      };
    });
}
