#!/usr/bin/env node
/**
 * Ingest ACGME Milestones 2.0 PDFs for all specialties and subspecialties.
 *
 * Usage:
 *   node scripts/ingest-acgme-milestones.mjs --all
 *   node scripts/ingest-acgme-milestones.mjs --download --parse --index
 *   node scripts/ingest-acgme-milestones.mjs --slug=anesthesiology --parse
 *   node scripts/ingest-acgme-milestones.mjs --limit=5 --all
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SEEDS_DIR = path.join(ROOT, "docs/seeds/acgme");
const CACHE_DIR = path.join(SEEDS_DIR, "_cache/pdfs");
const PROGRAMS_DIR = path.join(SEEDS_DIR, "programs");
const REPORT_PATH = path.join(SEEDS_DIR, "_cache/ingest_report.json");

const PSYCHIATRY_PRIMARY_SLUG = "psychiatry";
const SKIP_PARSE_PRIMARY_SLUGS = new Set([PSYCHIATRY_PRIMARY_SLUG]);

const DOMAIN_PATTERNS = [
  { regex: /^Patient Care\s+(\d+):\s*(.+)$/i, key: "pc" },
  { regex: /^Medical Knowledge\s+(\d+):\s*(.+)$/i, key: "mk" },
  { regex: /^Systems-Based Practice\s+(\d+):\s*(.+)$/i, key: "sbp" },
  { regex: /^System-Based Practice\s+(\d+):\s*(.+)$/i, key: "sbp" },
  {
    regex: /^Practice-Based Learning and Improvement\s+(\d+):\s*(.+)$/i,
    key: "pbli",
  },
  { regex: /^Professionalism\s+(\d+):\s*(.+)$/i, key: "prof" },
  {
    regex: /^Interpersonal and Communication Skills\s+(\d+):\s*(.+)$/i,
    key: "ics",
  },
];

/** Appendix B slug → website catalog slug */
const SLUG_ALIASES = {
  "pathology-anatomic-and-clinical": "pathology",
  "public-health-and-general-preventive-medicine": "preventive-medicine",
  "radiology-diagnostic": "radiology",
  "otolaryngology-head-and-neck-surgery": "otolaryngology---head-and-neck-surgery",
};

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(SEEDS_DIR, relPath), "utf8"));
}

function writeJson(relPath, data) {
  const full = path.join(SEEDS_DIR, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseArgs(argv) {
  const flags = {
    download: false,
    parse: false,
    index: false,
    all: false,
    slug: null,
    limit: null,
  };
  for (const arg of argv) {
    if (arg === "--download") flags.download = true;
    else if (arg === "--parse") flags.parse = true;
    else if (arg === "--index") flags.index = true;
    else if (arg === "--all") flags.all = true;
    else if (arg.startsWith("--slug=")) flags.slug = arg.slice("--slug=".length);
    else if (arg.startsWith("--limit=")) flags.limit = Number(arg.slice("--limit=".length));
  }
  if (flags.all) {
    flags.download = true;
    flags.parse = true;
    flags.index = true;
  }
  return flags;
}

function buildProgramList(specialtiesData) {
  const programs = [];
  for (const primary of specialtiesData.specialties) {
    programs.push({
      slug: primary.slug,
      name: primary.name,
      program_type: "primary",
      parent_slug: primary.slug,
      parent_name: primary.name,
      milestone_pdf_url: primary.milestone_pdf_url,
      supplemental_guide_url: primary.supplemental_guide_url,
      milestones_page_url: primary.milestones_page_url ?? null,
    });
    for (const sub of primary.subspecialties) {
      programs.push({
        slug: slugify(sub.name),
        name: sub.name,
        program_type: "subspecialty",
        parent_slug: primary.slug,
        parent_name: primary.name,
        milestone_pdf_url: sub.milestone_pdf_url,
        supplemental_guide_url: sub.supplemental_guide_url,
        milestones_page_url: null,
      });
    }
  }
  return programs;
}

function pdfFilenameFromUrl(url) {
  try {
    return path.basename(new URL(url).pathname);
  } catch {
    return "document.pdf";
  }
}

async function ensurePdfParse() {
  const { PDFParse } = await import("pdf-parse");
  const req = createRequire(import.meta.url);
  try {
    const workerPath = req.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
    PDFParse.setWorker(pathToFileURL(workerPath).href);
  } catch {
    // dev fallback
  }
  return PDFParse;
}

async function downloadPdf(url, destPath) {
  const res = await fetch(url, {
    headers: { "User-Agent": "fiscmak-acgme-ingest/1.0" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  if (!contentType.includes("pdf") && !buf.subarray(0, 4).toString("ascii").startsWith("%PDF")) {
    throw new Error(`Not a PDF (${contentType || "unknown"}) for ${url}`);
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  return buf;
}

async function extractPdfText(buffer, PDFParse) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text ?? "";
}

function mergeLinesIntoCells(lines) {
  const cells = [];
  let current = "";
  for (const line of lines) {
    if (!current) {
      current = line;
      continue;
    }
    const continues =
      /[,-]$/.test(current.trim()) ||
      /^[a-z(]/.test(line) ||
      /^with /.test(line) ||
      /^and /.test(line) ||
      /^or /.test(line);
    if (continues) {
      current += ` ${line}`;
    } else {
      cells.push(current.trim());
      current = line;
    }
  }
  if (current) cells.push(current.trim());
  return cells;
}

function parseLevelDescriptions(body) {
  const lines = body
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const cells = mergeLinesIntoCells(lines);
  const levels = {
    level_1: [],
    level_2: [],
    level_3: [],
    level_4: [],
    level_5: [],
  };
  for (let i = 0; i < cells.length; i++) {
    const col = i % 5;
    levels[`level_${col + 1}`].push(cells[i]);
  }
  return levels;
}

function normalizePdfText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function findDomainHeader(line) {
  for (const pattern of DOMAIN_PATTERNS) {
    const match = line.trim().match(pattern.regex);
    if (match) {
      return {
        number: Number(match[1]),
        name: match[2].trim(),
        acgme_competency_key: pattern.key,
      };
    }
  }
  return null;
}

function parseMilestonePdfText(text, slug) {
  const normalized = normalizePdfText(text);
  const lines = normalized.split("\n");
  const subcompetencies = [];
  let i = 0;
  let globalNumber = 0;

  while (i < lines.length) {
    const header = findDomainHeader(lines[i]);
    if (!header) {
      i++;
      continue;
    }

    const blockStart = i;
    i++;
    const blockLines = [lines[blockStart]];

    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (findDomainHeader(trimmed)) break;
      if (/^Comments:\s*$/i.test(trimmed)) {
        blockLines.push(lines[i]);
        i++;
        break;
      }
      blockLines.push(lines[i]);
      i++;
    }

    const block = blockLines.join("\n");
    const levelHeaderMatch = block.match(/Level 1[\s\t]+Level 2[\s\t]+Level 3[\s\t]+Level 4[\s\t]+Level 5/i);
    if (!levelHeaderMatch) continue;

    const headerEnd = block.indexOf(levelHeaderMatch[0]) + levelHeaderMatch[0].length;
    let body = block.slice(headerEnd);
    body = body.replace(/\nComments:\s*[\s\S]*$/i, "").trim();
    if (!body) continue;

    globalNumber++;
    const idPrefix = slug.replace(/-/g, "_").slice(0, 40);
    subcompetencies.push({
      id: `${idPrefix}_${header.acgme_competency_key}${header.number}`,
      number: globalNumber,
      name: header.name,
      acgme_competency_key: header.acgme_competency_key,
      levels: parseLevelDescriptions(body),
    });
  }

  return subcompetencies;
}

function loadPsychiatryHandSeed() {
  const seed = readJson("psychiatry_milestones_v2.json");
  return {
    framework_key: seed.framework_key,
    specialty: seed.specialty,
    version: seed.version ?? "2.0",
    source: seed.source,
    program_type: "primary",
    subcompetencies: seed.subcompetencies,
    sources: {
      milestone_pdf_url:
        "https://www.acgme.org/globalassets/pdfs/milestones/psychiatrymilestones.pdf",
      supplemental_guide_url:
        "https://www.acgme.org/globalassets/pdfs/milestones/psychiatrysupplementalguide.pdf",
    },
  };
}

function buildProgramSeed(program, subcompetencies, sources) {
  return {
    framework_key: program.slug,
    specialty: program.name,
    version: "2.0",
    source: `ACGME ${program.name} Milestones 2.0`,
    program_type: program.program_type,
    parent_slug: program.parent_slug,
    parent_name: program.parent_name,
    subcompetencies,
    sources,
  };
}

async function processProgram(program, flags, PDFParse, report) {
  const entry = {
    slug: program.slug,
    name: program.name,
    program_type: program.program_type,
    parent_slug: program.parent_slug,
    milestone_pdf_url: program.milestone_pdf_url,
    supplemental_guide_url: program.supplemental_guide_url,
    parse_status: "pending",
    subcompetency_count: 0,
    download_errors: [],
    parse_errors: [],
  };

  const cacheDir = path.join(CACHE_DIR, program.slug);
  const milestonePdfPath = path.join(
    cacheDir,
    pdfFilenameFromUrl(program.milestone_pdf_url),
  );
  const supplementalPdfPath = path.join(
    cacheDir,
    pdfFilenameFromUrl(program.supplemental_guide_url),
  );
  const programSeedPath = path.join(PROGRAMS_DIR, `${program.slug}_milestones_v2.json`);

  if (program.slug === PSYCHIATRY_PRIMARY_SLUG && program.program_type === "primary") {
    const handSeed = loadPsychiatryHandSeed();
    if (flags.index || flags.parse) {
      fs.mkdirSync(PROGRAMS_DIR, { recursive: true });
      fs.writeFileSync(programSeedPath, `${JSON.stringify(handSeed, null, 2)}\n`);
    }
    entry.parse_status = "hand_seed";
    entry.subcompetency_count = handSeed.subcompetencies.length;
    report.programs.push(entry);
    return handSeed;
  }

  if (SKIP_PARSE_PRIMARY_SLUGS.has(program.slug) && program.program_type === "primary") {
    entry.parse_status = "skipped";
    report.programs.push(entry);
    return null;
  }

  let milestoneBuffer = null;

  if (flags.download) {
    for (const [label, url, dest] of [
      ["milestone", program.milestone_pdf_url, milestonePdfPath],
      ["supplemental", program.supplemental_guide_url, supplementalPdfPath],
    ]) {
      try {
        await downloadPdf(url, dest);
      } catch (err) {
        entry.download_errors.push({
          type: label,
          url,
          error: err instanceof Error ? err.message : String(err),
        });
        report.download_failures.push({
          slug: program.slug,
          type: label,
          url,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  if (fs.existsSync(milestonePdfPath)) {
    milestoneBuffer = fs.readFileSync(milestonePdfPath);
  }

  if (flags.parse && milestoneBuffer) {
    try {
      const text = await extractPdfText(milestoneBuffer, PDFParse);
      const subcompetencies = parseMilestonePdfText(text, program.slug);
      if (subcompetencies.length === 0) {
        throw new Error("No subcompetencies extracted from milestone PDF");
      }
      const seed = buildProgramSeed(program, subcompetencies, {
        milestone_pdf_url: program.milestone_pdf_url,
        supplemental_guide_url: program.supplemental_guide_url,
      });
      fs.mkdirSync(PROGRAMS_DIR, { recursive: true });
      fs.writeFileSync(programSeedPath, `${JSON.stringify(seed, null, 2)}\n`);
      entry.parse_status = "parsed";
      entry.subcompetency_count = subcompetencies.length;
      report.programs.push(entry);
      return seed;
    } catch (err) {
      entry.parse_status = "parse_failed";
      entry.parse_errors.push(err instanceof Error ? err.message : String(err));
      report.parse_failures.push({
        slug: program.slug,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  } else if (fs.existsSync(programSeedPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(programSeedPath, "utf8"));
      entry.parse_status = "cached";
      entry.subcompetency_count = existing.subcompetencies?.length ?? 0;
    } catch {
      entry.parse_status = "url_only";
    }
  } else if (entry.download_errors.some((e) => e.type === "milestone")) {
    entry.parse_status = "download_failed";
  } else {
    entry.parse_status = milestoneBuffer ? "not_parsed" : "url_only";
  }

  report.programs.push(entry);
  return null;
}

function catalogSlugForAppendixPrimary(appendixSlug, catalogBySlug) {
  const direct = catalogBySlug.get(appendixSlug);
  if (direct) return appendixSlug;
  const alias = SLUG_ALIASES[appendixSlug];
  if (alias && catalogBySlug.has(alias)) return alias;
  return null;
}

function generateCatalog(programs, report) {
  const catalog = {
    generated_at: new Date().toISOString().slice(0, 10),
    source: "docs/seeds/acgme/acgme_specialties_complete.json",
    total_programs: programs.length,
    programs: report.programs.map((p) => ({
      slug: p.slug,
      name: p.name,
      program_type: p.program_type,
      parent_slug: p.parent_slug,
      milestone_pdf_url: p.milestone_pdf_url,
      supplemental_guide_url: p.supplemental_guide_url,
      parse_status: p.parse_status,
      subcompetency_count: p.subcompetency_count,
      download_errors: p.download_errors,
      parse_errors: p.parse_errors,
    })),
  };
  writeJson("milestone_catalog.json", catalog);
  return catalog;
}

function generateProgramIndex(report) {
  const index = {
    generated_at: new Date().toISOString().slice(0, 10),
    programs: {},
  };
  for (const p of report.programs) {
    index.programs[p.slug] = {
      name: p.name,
      program_type: p.program_type,
      parent_slug: p.parent_slug,
      seed_file:
        p.parse_status === "hand_seed" || p.parse_status === "parsed" || p.parse_status === "cached"
          ? `${p.slug}_milestones_v2.json`
          : null,
      subcompetency_count: p.subcompetency_count,
      parse_status: p.parse_status,
    };
  }
  writeJson("program_milestones_index.json", index);
}

function generateAllProgramMilestonesBundle() {
  const bundle = { generated_at: new Date().toISOString().slice(0, 10), programs: {} };
  if (!fs.existsSync(PROGRAMS_DIR)) return bundle;

  for (const file of fs.readdirSync(PROGRAMS_DIR).sort()) {
    if (!file.endsWith("_milestones_v2.json")) continue;
    const slug = file.replace(/_milestones_v2\.json$/, "");
    const data = JSON.parse(fs.readFileSync(path.join(PROGRAMS_DIR, file), "utf8"));
    bundle.programs[slug] = {
      subcompetencies: data.subcompetencies ?? [],
      sources: data.sources ?? {},
      program_type: data.program_type ?? "primary",
      parent_slug: data.parent_slug ?? slug,
      specialty: data.specialty ?? slug,
      version: data.version ?? "2.0",
    };
  }

  writeJson("all_program_milestones.json", bundle);
  return bundle;
}

function generateMilestoneFrameworks(catalog, appendixB, officialSources) {
  const catalogBySlug = new Map(catalog.programs.map((p) => [p.slug, p]));
  const primaryCatalogEntries = catalog.programs.filter((p) => p.program_type === "primary");
  const primaryBySlug = new Map(primaryCatalogEntries.map((p) => [p.slug, p]));

  const frameworks = {};
  for (const primary of appendixB.primary_specialties) {
    const catalogSlug = catalogSlugForAppendixPrimary(primary.slug, primaryBySlug);
    const catalogEntry = catalogSlug ? catalogBySlug.get(catalogSlug) : null;
    const parsedEntry = catalogSlug ? primaryBySlug.get(catalogSlug) : null;

    let status = "universal_only";
    if (parsedEntry?.parse_status === "hand_seed" || parsedEntry?.parse_status === "parsed") {
      status = "seeded";
    } else if (catalogEntry || parsedEntry) {
      status = "catalog_only";
    }

    const citationUrl =
      catalogEntry?.milestone_pdf_url ??
      parsedEntry?.milestone_pdf_url ??
      (catalogSlug ? primaryBySlug.get(catalogSlug)?.milestone_pdf_url : null);

    frameworks[primary.slug] = {
      primary_slug: primary.slug,
      primary_name: primary.name,
      status,
      milestone_version: status === "seeded" ? "2.0" : undefined,
      subcompetency_seed:
        status === "seeded" && catalogSlug
          ? `${catalogSlug}_milestones_v2.json`
          : undefined,
      catalog_slug: catalogSlug ?? undefined,
      citation: citationUrl ? `ACGME ${primary.name} Milestones 2.0` : undefined,
      citation_url: citationUrl ?? undefined,
      supplemental_guide_url:
        catalogEntry?.supplemental_guide_url ?? parsedEntry?.supplemental_guide_url ?? undefined,
    };
  }

  const payload = {
    source_note:
      "Specialty-specific ACGME Milestones 2.0 seeds. Unlisted primaries use universal six only until seeded.",
    global_supplemental_references: officialSources.milestones_and_pbl ?? [],
    frameworks,
  };
  writeJson("milestone_frameworks.json", payload);
  return payload;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (!flags.download && !flags.parse && !flags.index) {
    console.error(
      "Usage: node scripts/ingest-acgme-milestones.mjs [--download] [--parse] [--index] [--all] [--slug=slug] [--limit=N]",
    );
    process.exit(1);
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.mkdirSync(PROGRAMS_DIR, { recursive: true });

  const specialtiesData = readJson("acgme_specialties_complete.json");
  const appendixB = readJson("appendix_b_2024_2025.json");
  const officialSources = readJson("psychiatry_official_sources.json");

  let programs = buildProgramList(specialtiesData);
  if (flags.slug) {
    programs = programs.filter(
      (p) => p.slug === flags.slug || p.parent_slug === flags.slug,
    );
  }
  if (flags.limit != null && Number.isFinite(flags.limit)) {
    programs = programs.slice(0, flags.limit);
  }

  const PDFParse = flags.parse ? await ensurePdfParse() : null;
  const report = {
    started_at: new Date().toISOString(),
    flags,
    total_programs: programs.length,
    programs: [],
    download_failures: [],
    parse_failures: [],
  };

  console.log(`Processing ${programs.length} ACGME programs...`);

  for (const program of programs) {
    process.stdout.write(`  ${program.slug} (${program.program_type})...`);
    await processProgram(program, flags, PDFParse, report);
    console.log(" done");
  }

  if (flags.index) {
    const catalog = generateCatalog(programs, report);
    generateProgramIndex(report);
    const bundle = generateAllProgramMilestonesBundle();
    generateMilestoneFrameworks(catalog, appendixB, officialSources);

    report.finished_at = new Date().toISOString();
    report.summary = {
      total_programs: catalog.total_programs,
      parsed: report.programs.filter((p) => p.parse_status === "parsed").length,
      hand_seed: report.programs.filter((p) => p.parse_status === "hand_seed").length,
      cached: report.programs.filter((p) => p.parse_status === "cached").length,
      url_only: report.programs.filter((p) =>
        ["url_only", "not_parsed", "pending"].includes(p.parse_status),
      ).length,
      download_failed: report.programs.filter((p) => p.parse_status === "download_failed").length,
      parse_failed: report.programs.filter((p) => p.parse_status === "parse_failed").length,
      bundled_programs: Object.keys(bundle.programs).length,
      download_failure_events: report.download_failures.length,
    };

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

    console.log("\nIngest summary:");
    console.log(JSON.stringify(report.summary, null, 2));
    console.log(`\nWrote milestone_catalog.json (${catalog.total_programs} programs)`);
    console.log(`Wrote all_program_milestones.json (${report.summary.bundled_programs} bundled)`);
    console.log(`Report: ${path.relative(ROOT, REPORT_PATH)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
