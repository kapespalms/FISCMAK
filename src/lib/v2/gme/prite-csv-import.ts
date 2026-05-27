export type ParsedPriteRow = {
  trainee_initials: string;
  exam_type: string;
  exam_year: number;
  overall_percentile: number | null;
  domain_scores: Record<string, number>;
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
}

export function parsePriteCsv(csvText: string): {
  rows: ParsedPriteRow[];
  quality: { warnings: string[]; row_count: number };
} {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  const warnings: string[] = [];
  if (lines.length < 2) {
    return { rows: [], quality: { warnings: ["No data rows found."], row_count: 0 } };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idxInitials = headers.indexOf("trainee_initials");
  const idxYear = headers.indexOf("exam_year");
  const idxPercentile = headers.indexOf("overall_percentile");
  const idxType = headers.indexOf("exam_type");

  if (idxInitials < 0 || idxYear < 0) {
    warnings.push("Expected columns: trainee_initials, exam_year, overall_percentile.");
    return { rows: [], quality: { warnings, row_count: 0 } };
  }

  const rows: ParsedPriteRow[] = [];
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const initials = cols[idxInitials]?.trim().toUpperCase();
    const year = Number(cols[idxYear]);
    if (!initials || !Number.isFinite(year)) continue;

    const domain_scores: Record<string, number> = {};
    for (let i = 0; i < headers.length; i += 1) {
      if (headers[i].startsWith("domain_")) {
        const val = Number(cols[i]);
        if (Number.isFinite(val)) domain_scores[headers[i]] = val;
      }
    }

    rows.push({
      trainee_initials: initials,
      exam_type: idxType >= 0 ? cols[idxType]?.trim() || "PRITE" : "PRITE",
      exam_year: year,
      overall_percentile:
        idxPercentile >= 0 && cols[idxPercentile] ? Number(cols[idxPercentile]) : null,
      domain_scores,
    });
  }

  if (!rows.length) warnings.push("No valid PRITE rows parsed.");
  return { rows, quality: { warnings, row_count: rows.length } };
}
