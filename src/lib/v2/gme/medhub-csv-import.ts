export type MedhubCsvQualityReport = {
  row_count: number;
  parsed_count: number;
  skipped_count: number;
  warnings: string[];
  milestone_columns_found: number;
  forms: string[];
};

export type ParsedMedhubEvalRow = {
  eval_id: string | null;
  form_name: string | null;
  form_version: string | null;
  trainee_initials: string | null;
  pgy_level: string | null;
  supervisor_name: string | null;
  rotation_name: string | null;
  eval_date: string | null;
  narrative_text: string | null;
  numeric_scores: Record<string, number>;
  raw_row: Record<string, string>;
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((v) => v.trim());
}

function parseDate(value: string | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function buildNarrative(row: Record<string, string>): string | null {
  const parts = [
    row.narrative_strength_1,
    row.narrative_strength_2,
    row.narrative_strength_3,
    row.narrative_improvement_1,
    row.narrative_improvement_2,
    row.narrative_additional_comments,
  ]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.length ? parts.join("\n") : null;
}

function extractMilestoneScores(row: Record<string, string>): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const [key, value] of Object.entries(row)) {
    if (!key.startsWith("milestone_")) continue;
    const num = Number(value);
    if (Number.isFinite(num)) scores[key] = num;
  }
  return scores;
}

export function parseMedhubCsv(csvText: string): {
  rows: ParsedMedhubEvalRow[];
  quality: MedhubCsvQualityReport;
} {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      quality: {
        row_count: 0,
        parsed_count: 0,
        skipped_count: 0,
        warnings: ["CSV must include a header row and at least one data row."],
        milestone_columns_found: 0,
        forms: [],
      },
    };
  }

  const headers = parseCsvLine(lines[0]);
  const headerSet = new Set(headers);
  const milestoneColumns = headers.filter((h) => h.startsWith("milestone_"));
  const warnings: string[] = [];
  const forms = new Set<string>();
  const rows: ParsedMedhubEvalRow[] = [];
  let skipped = 0;

  if (!headerSet.has("trainee_initials")) {
    warnings.push("Missing trainee_initials column — rows will not link to roster users.");
  }

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => !v)) {
      skipped++;
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });

    const formName = row.form_name?.trim() || null;
    if (formName) forms.add(formName);

    rows.push({
      eval_id: row.eval_id?.trim() || null,
      form_name: formName,
      form_version: row.form_version?.trim() || null,
      trainee_initials: row.trainee_initials?.trim().toUpperCase() || null,
      pgy_level: row.pgy_level?.trim() || null,
      supervisor_name: row.evaluator_name?.trim() || row.supervisor_name?.trim() || null,
      rotation_name: row.service_name?.trim() || row.rotation_name?.trim() || null,
      eval_date:
        parseDate(row.completed_date) ??
        parseDate(row.issue_date) ??
        parseDate(row.rotation_end),
      narrative_text: buildNarrative(row),
      numeric_scores: extractMilestoneScores(row),
      raw_row: row,
    });
  }

  if (milestoneColumns.length === 0) {
    warnings.push("No milestone_* columns detected — import will store metadata only.");
  }

  return {
    rows,
    quality: {
      row_count: lines.length - 1,
      parsed_count: rows.length,
      skipped_count: skipped,
      warnings,
      milestone_columns_found: milestoneColumns.length,
      forms: [...forms],
    },
  };
}
