#!/usr/bin/env node
/**
 * ACGME Milestones 2.0 ingest — catalog, download, parse, index.
 * Usage:
 *   node scripts/ingest-acgme-milestones.mjs --index
 *   node scripts/ingest-acgme-milestones.mjs --download [--slug=x] [--limit=N]
 *   node scripts/ingest-acgme-milestones.mjs --parse [--slug=x] [--limit=N]
 *   node scripts/ingest-acgme-milestones.mjs --all [--limit=N]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SEEDS = path.join(ROOT, "docs/seeds/acgme");
const PROGRAMS_DIR = path.join(SEEDS, "programs");
const CACHE_DIR = path.join(SEEDS, "_cache/pdfs");
const CATALOG_SRC = path.join(SEEDS, "acgme_specialties_complete.json");
const CATALOG_OUT = path.join(SEEDS, "milestone_catalog.json");
const FRAMEWORKS_OUT = path.join(SEEDS, "milestone_frameworks.json");
const BUNDLE_OUT = path.join(SEEDS, "all_program_milestones.json");
const REPORT_OUT = path.join(SEEDS, "_cache/ingest_report.json");
const APPENDIX_B = path.join(SEEDS, "appendix_b_2024_2025.json");
const PSYCH_SEED = path.join(SEEDS, "psychiatry_milestones_v2.json");
const PSYCH_SOURCES = path.join(SEEDS, "psychiatry_official_sources.json");

const SKIP_PARSE_PRIMARY_SLUGS = new Set(["psychiatry"]);

const COMPETENCY_DOMAINS = [
  { label: "Patient Care", key: "pc" },
  { label: "Medical Knowledge", key: "mk" },
  { label: "Systems-Based Practice", key: "sbp" },
  { label: "Practice-Based Learning and Improvement", key: "pbli" },
  { label: "Professionalism", key: "prof" },
  { label: "Interpersonal and Communication Skills", key: "ics" },
];

const DOMAIN_ALT = COMPETENCY_DOMAINS.map((d) => d.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
const SUBCOMPETENCY_RE = new RegExp(
  `(?:^|\\n)\\s*(${DOMAIN_ALT})\\s+(\\d+):\\s*(.+?)(?=\\n\\s*(?:${DOMAIN_ALT})\\s+\\d+:|\\nComments:|$)`,
  "gs",
);

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function parseArgs(argv) {
  const flags = {
    index: false,
    download: false,
    parse: false,
    all: false,
    slug: null,
    limit: Infinity,
  };
  for (const arg of argv) {
    if (arg === "--index") flags.index = true;
    else if (arg === "--download") flags.download = true;
    else if (arg === "--parse") flags.parse = true;
    else if (arg === "--all") flags.all = true;
    else if (arg.startsWith("--slug=")) flags.slug = arg.slice("--slug=".length);
    else if (arg.startsWith("--limit=")) flags.limit = Number(arg.slice("--limit=".length));
  }
  if (flags.all) {
    flags.index = true;
    flags.download = true;
    flags.parse = true;
  }
  if (!flags.index && !flags.download && !flags.parse) flags.index = true;
  return flags;
}

function buildProgramList(catalogSrc) {
  const programs = [];
  for (const primary of catalogSrc.specialties) {
    programs.push({
      slug: primary.slug,
      name: primary.name,
      program_type: "primary",
      primary_slug: primary.slug,
      primary_name: primary.name,
      milestones_page_url: primary.milestones_page_url ?? null,
      milestone_pdf_url: primary.milestone_pdf_url ?? null,
      supplemental_guide_url: primary.supplemental_guide_url ?? null,
    });
    for (const sub of primary.subspecialties) {
      const subSlug = `${primary.slug}--${slugify(sub.name)}`;
      programs.push({
        slug: subSlug,
        name: sub.name,
        program_type: "subspecialty",
        primary_slug: primary.slug,
        primary_name: primary.name,
        milestones_page_url: primary.milestones_page_url ?? null,
        milestone_pdf_url: sub.milestone_pdf_url ?? null,
        supplemental_guide_url: sub.supplemental_guide_url ?? null,
      });
    }
  }
  return programs;
}

function buildCatalog(catalogSrc, programs) {
  return {
    generated_at: new Date().toISOString().slice(0, 10),
    source: catalogSrc.source,
    total_programs: programs.length,
    programs: programs.map((p) => ({
      ...p,
      parse_status: "pending",
      subcompetency_count: 0,
      seed_file: null,
    })),
    global_supplemental_refs: readJson(PSYCH_SOURCES).milestones_and_pbl ?? [],
  };
}

function mergeParseStatus(catalog, report) {
  for (const program of catalog.programs) {
    const row = report.by_slug[program.slug];
    if (!row) continue;
    program.parse_status = row.parse_status;
    program.subcompetency_count = row.subcompetency_count ?? 0;
    program.seed_file = row.seed_file ?? null;
    program.download_errors = row.download_errors ?? [];
    program.parse_error = row.parse_error ?? null;
  }
  return catalog;
}

function competencyKeyFromLabel(label) {
  const found = COMPETENCY_DOMAINS.find((d) => d.label === label.trim());
  return found?.key ?? "pc";
}

function cleanLevelText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "")
    .trim();
}

function parseLevels(block) {
  const levels = { level_1: [], level_2: [], level_3: [], level_4: [], level_5: [] };
  const headerIdx = block.search(/Level\s+1\s+Level\s+2\s+Level\s+3\s+Level\s+4\s+Level\s+5/i);
  if (headerIdx < 0) return levels;

  let body = block.slice(headerIdx).replace(/Level\s+1\s+Level\s+2\s+Level\s+3\s+Level\s+4\s+Level\s+5/i, "");
  const stopIdx = body.search(/\nComments:|Not Yet Assessable|Version \d|©\d{4} Accreditation/i);
  if (stopIdx >= 0) body = body.slice(0, stopIdx);

  const chunks = body
    .split(/\n+/)
    .map((l) => cleanLevelText(l))
    .filter(Boolean)
    .filter((l) => !/^Level [1-5]$/.test(l));

  if (chunks.length === 0) return levels;

  const perLevel = Math.max(1, Math.ceil(chunks.length / 5));
  for (let i = 0; i < chunks.length; i++) {
    const level = Math.min(5, Math.floor(i / perLevel) + 1);
    levels[`level_${level}`].push(chunks[i]);
  }
  return levels;
}

function parseMilestoneText(text, frameworkKey, programName) {
  const subcompetencies = [];
  let match;
  SUBCOMPETENCY_RE.lastIndex = 0;
  while ((match = SUBCOMPETENCY_RE.exec(text)) !== null) {
    const domainLabel = match[1].trim();
    const number = Number(match[2]);
    const nameLine = match[3].split("\n")[0].trim();
    const block = match[0];
    const key = competencyKeyFromLabel(domainLabel);
    const id = `${frameworkKey.replace(/-/g, "_")}_${key}${number}`;
    subcompetencies.push({
      id,
      number: subcompetencies.length + 1,
      domain_number: number,
      name: nameLine,
      acgme_competency_key: key,
      levels: parseLevels(block),
    });
  }

  return {
    framework_key: frameworkKey,
    specialty: programName,
    version: "2.0",
    source: `ACGME ${programName} Milestones 2.0`,
    subcompetencies,
  };
}

async function extractPdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  await parser.load();
  const result = await parser.getText();
  return result.text ?? String(result);
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return dest;
}

function pdfUrlCandidates(url) {
  if (!url) return [];
  const candidates = [url];
  const variants = [
    url.replace(/fimmunology/i, "immunology"),
    url.replace(/milestonesannotated/i, "milestones"),
    url.replace(/milestonesmilestones/i, "milestones"),
    url.replace(/milestonesa\.pdf/i, "milestones.pdf"),
    url.replace(/milestones\.pdf/i, "milestones2.0.pdf"),
    url.replace(/milestones2\.0\.pdf/i, "milestones.pdf"),
  ];
  for (const v of variants) {
    if (v && !candidates.includes(v)) candidates.push(v);
  }
  return candidates;
}

function seedPathFor(slug) {
  return path.join(PROGRAMS_DIR, `${slug}_milestones_v2.json`);
}

function loadExistingSeed(slug) {
  const file = seedPathFor(slug);
  if (!fs.existsSync(file)) return null;
  return readJson(file);
}

async function downloadProgram(program, report) {
  const row = { slug: program.slug, download_errors: [] };
  const dir = path.join(CACHE_DIR, program.slug);
  fs.mkdirSync(dir, { recursive: true });

  for (const [kind, url] of [
    ["milestone", program.milestone_pdf_url],
    ["supplemental", program.supplemental_guide_url],
  ]) {
    if (!url) continue;
    const ext = url.toLowerCase().includes(".doc") ? "docx" : "pdf";
    const dest = path.join(dir, `${kind}.${ext}`);
    try {
      if (fs.existsSync(dest)) {
        row[`${kind}_file`] = dest;
        continue;
      }
      const candidates = kind === "milestone" ? pdfUrlCandidates(url) : [url];
      let lastError;
      for (const candidate of candidates) {
        try {
          await downloadFile(candidate, dest);
          row[`${kind}_file`] = dest;
          if (candidate !== url) row[`${kind}_resolved_url`] = candidate;
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (lastError) throw lastError;
    } catch (err) {
      row.download_errors.push({ kind, url, error: String(err.message ?? err) });
    }
  }
  report.by_slug[program.slug] = { ...report.by_slug[program.slug], ...row };
}

async function parseProgram(program, report) {
  if (
    program.program_type === "primary" &&
    SKIP_PARSE_PRIMARY_SLUGS.has(program.slug)
  ) {
    const psych = readJson(PSYCH_SEED);
    writeJson(seedPathFor(program.slug), {
      ...psych,
      program_type: "primary",
      sources: {
        milestone_pdf_url: program.milestone_pdf_url,
        supplemental_guide_url: program.supplemental_guide_url,
      },
    });
    report.by_slug[program.slug] = {
      ...report.by_slug[program.slug],
      parse_status: "seeded_manual",
      subcompetency_count: psych.subcompetencies.length,
      seed_file: `programs/${program.slug}_milestones_v2.json`,
    };
    return;
  }

  const cached = report.by_slug[program.slug];
  const milestoneFile = cached?.milestone_file;
  if (!milestoneFile || !fs.existsSync(milestoneFile)) {
    report.by_slug[program.slug] = {
      ...report.by_slug[program.slug],
      parse_status: program.milestone_pdf_url ? "download_missing" : "no_milestone_url",
      subcompetency_count: 0,
    };
    return;
  }

  try {
    const text = await extractPdfText(milestoneFile);
    const parsed = parseMilestoneText(text, program.slug, program.name);
    if (parsed.subcompetencies.length === 0) {
      throw new Error("No subcompetencies extracted");
    }
    const seed = {
      ...parsed,
      program_type: program.program_type,
      primary_slug: program.primary_slug,
      primary_name: program.primary_name,
      sources: {
        milestone_pdf_url: program.milestone_pdf_url,
        supplemental_guide_url: program.supplemental_guide_url,
      },
    };
    writeJson(seedPathFor(program.slug), seed);
    report.by_slug[program.slug] = {
      ...report.by_slug[program.slug],
      parse_status: "parsed",
      subcompetency_count: parsed.subcompetencies.length,
      seed_file: `programs/${program.slug}_milestones_v2.json`,
    };
  } catch (err) {
    report.by_slug[program.slug] = {
      ...report.by_slug[program.slug],
      parse_status: "parse_failed",
      parse_error: String(err.message ?? err),
      subcompetency_count: 0,
    };
  }
}

function buildFrameworks(catalog, appendixB) {
  const byPrimarySlug = new Map();
  for (const p of catalog.programs) {
    if (p.program_type !== "primary") continue;
    byPrimarySlug.set(p.slug, p);
  }

  const frameworks = {};
  for (const primary of appendixB.primary_specialties) {
    const cat = byPrimarySlug.get(primary.slug);
    const seedFile = catalog.programs.find(
      (p) => p.slug === primary.slug && p.seed_file,
    )?.seed_file;
    const parsed = catalog.programs.find((p) => p.slug === primary.slug);
    let status = "universal_only";
    if (seedFile || primary.slug === "psychiatry") status = "seeded";
    else if (cat?.milestone_pdf_url) status = "catalog_only";

    frameworks[primary.slug] = {
      primary_slug: primary.slug,
      primary_name: primary.name,
      status,
      milestone_version: cat?.milestone_pdf_url ? "2.0" : undefined,
      subcompetency_seed: seedFile ?? (primary.slug === "psychiatry" ? "psychiatry_milestones_v2.json" : undefined),
      citation: cat?.milestone_pdf_url ? `ACGME ${primary.name} Milestones 2.0` : undefined,
      citation_url: cat?.milestone_pdf_url ?? cat?.milestones_page_url ?? undefined,
      supplemental_guide_url: cat?.supplemental_guide_url ?? undefined,
      milestones_page_url: cat?.milestones_page_url ?? undefined,
    };
  }

  return {
    source_note:
      "Specialty-specific ACGME Milestones 2.0. Unlisted primaries use universal six only until seeded.",
    global_supplemental_refs: catalog.global_supplemental_refs,
    frameworks,
  };
}

function buildBundle(catalog) {
  const bundle = {};
  for (const program of catalog.programs) {
    if (!program.seed_file) continue;
    const file = path.join(SEEDS, program.seed_file);
    if (!fs.existsSync(file)) continue;
    const seed = readJson(file);
    bundle[program.slug] = {
      name: program.name,
      program_type: program.program_type,
      primary_slug: program.primary_slug,
      subcompetency_count: seed.subcompetencies?.length ?? 0,
      sources: seed.sources ?? {},
      subcompetencies: seed.subcompetencies ?? [],
    };
  }
  return {
    generated_at: new Date().toISOString(),
    program_count: Object.keys(bundle).length,
    programs: bundle,
  };
}

function filterPrograms(programs, flags) {
  let list = programs.filter((p) => p.milestone_pdf_url || p.program_type === "primary");
  if (flags.slug) list = list.filter((p) => p.slug === flags.slug || p.slug.startsWith(`${flags.slug}--`));
  if (Number.isFinite(flags.limit)) list = list.slice(0, flags.limit);
  return list;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const catalogSrc = readJson(CATALOG_SRC);
  const programs = buildProgramList(catalogSrc);
  let catalog = buildCatalog(catalogSrc, programs);

  const report = {
    started_at: new Date().toISOString(),
    flags,
    by_slug: {},
    summary: {},
  };

  fs.mkdirSync(PROGRAMS_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const selected = filterPrograms(programs, flags);

  if (flags.index) {
    writeJson(CATALOG_OUT, catalog);
    console.log(`Wrote catalog: ${catalog.total_programs} programs → ${CATALOG_OUT}`);
  }

  if (flags.download) {
    console.log(`Downloading ${selected.length} program PDFs…`);
    for (const program of selected) {
      await downloadProgram(program, report);
      const row = report.by_slug[program.slug];
      const ok = row?.milestone_file ? "✓" : row?.download_errors?.length ? "✗" : "–";
      console.log(`  ${ok} ${program.slug}`);
    }
  }

  if (flags.parse) {
    console.log(`Parsing ${selected.length} milestone PDFs…`);
    for (const program of selected) {
      await parseProgram(program, report);
      const row = report.by_slug[program.slug];
      console.log(
        `  ${row?.parse_status ?? "?"} ${program.slug} (${row?.subcompetency_count ?? 0} subcompetencies)`,
      );
    }
  }

  catalog = mergeParseStatus(catalog, report);
  writeJson(CATALOG_OUT, catalog);
  writeJson(FRAMEWORKS_OUT, buildFrameworks(catalog, readJson(APPENDIX_B)));
  writeJson(BUNDLE_OUT, buildBundle(catalog));

  const statuses = {};
  for (const p of catalog.programs) {
    statuses[p.parse_status] = (statuses[p.parse_status] ?? 0) + 1;
  }
  report.summary = {
    total_programs: catalog.total_programs,
    with_milestone_url: catalog.programs.filter((p) => p.milestone_pdf_url).length,
    with_supplemental_url: catalog.programs.filter((p) => p.supplemental_guide_url).length,
    parse_status_counts: statuses,
    download_failures: Object.values(report.by_slug).filter((r) => r.download_errors?.length).length,
  };
  report.finished_at = new Date().toISOString();
  writeJson(REPORT_OUT, report);

  console.log("\nSummary:", JSON.stringify(report.summary, null, 2));
  console.log(`Report: ${REPORT_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
