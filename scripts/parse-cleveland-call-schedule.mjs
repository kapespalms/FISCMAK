#!/usr/bin/env node
/**
 * Parse Cleveland_-_Psychiatry.xlsx call grid into a sanitized JSON seed.
 * Omits phone directory rows (PHI). Source xlsx is not committed.
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const SOURCE =
  process.argv[2] ??
  path.resolve("public/content/uh-psych/schedules/cleveland-psychiatry.xlsx");
const OUT = path.resolve("docs/seeds/uh_psych_call_schedule_cmc.json");

const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseMonthYear(label) {
  const m = String(label).trim().match(/^([A-Za-z]{3})-(\d{2})$/);
  if (!m) return null;
  const month = MONTHS[m[1]];
  if (month === undefined) return null;
  const year = 2000 + Number(m[2]);
  return { month, year };
}

function toIso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseAssignment(cell) {
  const raw = String(cell ?? "").trim();
  if (!raw) return null;
  const m = raw.match(/^([A-Za-z-]+)\s+(.+)$/);
  if (!m) return { assignee_abbr: raw, shift: null };
  return { assignee_abbr: m[1], shift: m[2] };
}

const wb = XLSX.readFile(SOURCE);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

const title = String(rows[0]?.[0] ?? "Cleveland - Psychiatry");
const printed = String(rows[1]?.[0] ?? "").replace(/^Printed:\s*/i, "");

const monthRow = rows[3] ?? [];
const dayRow = rows[4] ?? [];
const dowRow = rows[5] ?? [];

const columns = [];
let currentMonth = null;
for (let col = 1; col < dayRow.length; col++) {
  const monthLabel = String(monthRow[col] ?? "").trim();
  if (monthLabel) {
    const parsed = parseMonthYear(monthLabel);
    if (parsed) currentMonth = parsed;
  }
  const dayNum = Number(dayRow[col]);
  if (!currentMonth || !dayNum) continue;
  columns.push({
    col,
    date: toIso(currentMonth.year, currentMonth.month, dayNum),
    day_of_week: String(dowRow[col] ?? "").trim() || undefined,
  });
}

const ROLE_ROWS = [6, 7, 8, 9, 10];
const roles = [];
for (const rowIdx of ROLE_ROWS) {
  const row = rows[rowIdx];
  if (!row?.[0]) continue;
  const role = String(row[0]).trim();
  const assignments = [];
  for (const colMeta of columns) {
    const parsed = parseAssignment(row[colMeta.col]);
    if (!parsed) continue;
    assignments.push({
      date: colMeta.date,
      day_of_week: colMeta.day_of_week,
      ...parsed,
    });
  }
  if (assignments.length > 0) {
    roles.push({ role, assignments });
  }
}

const dateRange =
  columns.length > 0
    ? { start: columns[0].date, end: columns[columns.length - 1].date }
    : null;

const seed = {
  program: {
    name: title,
    site: "University Hospitals Cleveland Medical Center",
    schedule_type: "call_coverage",
    source_file: "Cleveland_-_Psychiatry.xlsx",
    printed_at: printed || undefined,
    date_range: dateRange,
    privacy_note:
      "Sanitized export: call grid only (role, date, initials, shift). Phone directory omitted.",
    qgenda_note: "Resident call switches and live assignments are managed in QGenda.",
  },
  roles,
  stats: {
    role_count: roles.length,
    day_columns: columns.length,
    assignment_count: roles.reduce((n, r) => n + r.assignments.length, 0),
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(seed, null, 2) + "\n");

console.log(JSON.stringify(seed.stats, null, 2));
console.log(`Wrote ${OUT}`);
