#!/usr/bin/env node
/**
 * seed-acgme-taxonomy.mjs
 *
 * Loads the ACGME milestone taxonomy into the DB after migration 20260556 is applied.
 *
 * What it seeds:
 *   acgme_frameworks         — all programs from program_milestones_index.json
 *   acgme_subcompetencies    — all parsed/seeded programs (individual programs/*.json files)
 *   medhub_milestone_crosswalk — psychiatry (14 rows); scaffold for future specialties
 *   milestone_self_ratings.lattice_skill_index — backfill from subcompetency join
 *
 * Idempotent: uses ON CONFLICT DO UPDATE throughout.
 *
 * Run: node scripts/seed-acgme-taxonomy.mjs
 * Needs: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * ⚠ Run as service role. Never commit credentials.
 */

import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT  = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEEDS = path.join(ROOT, "docs/seeds/acgme");

// ── env ────────────────────────────────────────────────────────────────────

function loadEnv() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v   = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

// ── output helpers ──────────────────────────────────────────────────────────

const ok   = (msg) => console.log(`  ✓ ${msg}`);
const warn = (msg) => console.log(`  ⚠ ${msg}`);
const fail = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1; };
const sec  = (t)   => console.log(`\n── ${t} ${"─".repeat(Math.max(0, 56 - t.length))}`);

// ── lattice skill index mapping ─────────────────────────────────────────────
//
// 6 ACGME core competencies → 8 FISCMAK SKILLS (row axis):
//   pc=0  mk=1  pbli=2  ics=3(comm)/6(collab)  prof=4(ethics)/7(ppd)  sbp=5
//
// Refinement (flag 3 approval):
//   ICS subcompetencies with team/interprofessional focus → skill 6 (Collaboration)
//   Prof subcompetencies with well-being/growth focus    → skill 7 (Personal & Prof Dev)

const ICS_COLLAB_RE  = /interprofessional|team\b|teamwork|interdisciplin|collaborative/i;
const PROF_PPD_RE    = /well[\s-]being|wellness|self[\s-]care|resilience|burnout|personal growth|professional identity|professional development|reflective practice|personal.+growth/i;

function latticeSkillIndex(competencyKey, subcompetencyName) {
  switch (competencyKey) {
    case "pc":   return 0;
    case "mk":   return 1;
    case "pbli": return 2;
    case "ics":
      return ICS_COLLAB_RE.test(subcompetencyName) ? 6 : 3;
    case "prof":
      return PROF_PPD_RE.test(subcompetencyName) ? 7 : 4;
    case "sbp":  return 5;
    default:     return 3;
  }
}

// ── load seed files ─────────────────────────────────────────────────────────

function loadJson(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) throw new Error(`Seed file not found: ${relPath}`);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function loadProgramFile(slug) {
  const p = path.join(SEEDS, "programs", `${slug}_milestones_v2.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// ── step 1: build framework rows ────────────────────────────────────────────

function buildFrameworkRows(programIndex, frameworksMeta) {
  const metaBySlug = frameworksMeta.frameworks ?? {};

  const rows = [];
  const failed = [];

  for (const [slug, prog] of Object.entries(programIndex.programs)) {
    const parseStatus = prog.parse_status ?? "unknown";
    const metaEntry   = metaBySlug[slug] ?? {};

    // Derive DB status from parse_status + frameworks meta
    let status;
    if (metaEntry.status === "seeded" || parseStatus === "parsed" || parseStatus === "cached" || parseStatus === "hand_seed") {
      status = "seeded";
    } else if (parseStatus === "download_failed" || parseStatus === "parse_failed") {
      status = "catalog_only";
      failed.push({ slug, name: prog.name, reason: parseStatus });
    } else {
      status = "catalog_only";
    }

    rows.push({
      slug,
      name:                   prog.name,
      program_type:           prog.program_type ?? "primary",
      parent_slug:            prog.parent_slug !== slug ? (prog.parent_slug ?? null) : null,
      status,
      milestone_version:      status === "seeded" ? "2.0" : null,
      citation_url:           metaEntry.citation_url ?? null,
      supplemental_guide_url: metaEntry.supplemental_guide_url ?? null,
    });
  }

  // Add any milestone_frameworks entries that aren't in the program index
  for (const [slug, meta] of Object.entries(metaBySlug)) {
    if (!programIndex.programs[slug]) {
      rows.push({
        slug,
        name:                   meta.primary_name ?? slug,
        program_type:           "primary",
        parent_slug:            null,
        status:                 meta.status,
        milestone_version:      meta.milestone_version ?? null,
        citation_url:           meta.citation_url ?? null,
        supplemental_guide_url: meta.supplemental_guide_url ?? null,
      });
    }
  }

  return { rows, failed };
}

// ── step 2: build subcompetency rows ────────────────────────────────────────

function buildSubcompetencyRows(programIndex, psychiatryHandSeed) {
  const rows    = [];
  const skipped = [];

  for (const [slug, prog] of Object.entries(programIndex.programs)) {
    const parseStatus = prog.parse_status ?? "unknown";
    if (!["parsed", "cached", "hand_seed"].includes(parseStatus)) continue;

    // Psychiatry primary: use hand-seed (has medhub_form_flag; parser output in programs/ lacks it)
    if (slug === "psychiatry") {
      for (const sub of psychiatryHandSeed.subcompetencies) {
        rows.push({
          subcompetency_id:     sub.id,
          framework_slug:       "psychiatry",
          number:               sub.number,
          name:                 sub.name,
          acgme_competency_key: sub.acgme_competency_key,
          lattice_skill_index:  latticeSkillIndex(sub.acgme_competency_key, sub.name),
          level_anchors:        sub.levels ?? null,
          medhub_form_flag:     sub.medhub_outpatient_form ?? false,
        });
      }
      continue;
    }

    const data = loadProgramFile(slug);
    if (!data) {
      skipped.push(slug);
      continue;
    }

    const subs = data.subcompetencies ?? [];
    if (!subs.length) continue;

    for (const sub of subs) {
      if (!sub.id || !sub.acgme_competency_key) continue;
      rows.push({
        subcompetency_id:     sub.id,
        framework_slug:       slug,
        number:               sub.number ?? 0,
        name:                 sub.name ?? "",
        acgme_competency_key: sub.acgme_competency_key,
        lattice_skill_index:  latticeSkillIndex(sub.acgme_competency_key, sub.name ?? ""),
        level_anchors:        sub.levels ?? null,
        medhub_form_flag:     sub.medhub_outpatient_form ?? false,
      });
    }
  }

  return { rows, skipped };
}

// ── step 3: build MedHub crosswalk rows ─────────────────────────────────────

function buildCrosswalkRows(psychiatryHandSeed) {
  const crosswalk = psychiatryHandSeed.medhub_form_crosswalk ?? {};
  return Object.entries(crosswalk).map(([medhubKey, subcompetencyId]) => ({
    framework_slug:    "psychiatry",
    medhub_column_key: medhubKey,
    subcompetency_id:  subcompetencyId,
  }));
}

// ── upsert helpers ──────────────────────────────────────────────────────────

async function upsertFrameworks(supabase, rows) {
  sec("Step 2 — upsert acgme_frameworks");

  // Chunk to avoid request size limits
  const CHUNK = 100;
  let total = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("acgme_frameworks")
      .upsert(chunk, { onConflict: "slug" });
    if (error) { fail(`frameworks upsert chunk ${i}: ${error.message}`); return false; }
    total += chunk.length;
  }
  ok(`${total} framework rows upserted`);
  return true;
}

async function upsertSubcompetencies(supabase, rows) {
  sec("Step 3 — upsert acgme_subcompetencies");

  const CHUNK = 200;
  let total = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("acgme_subcompetencies")
      .upsert(chunk, { onConflict: "subcompetency_id" });
    if (error) { fail(`subcompetencies upsert chunk ${i}: ${error.message}`); return false; }
    total += chunk.length;
  }
  ok(`${total} subcompetency rows upserted`);
  return true;
}

async function upsertCrosswalk(supabase, rows) {
  sec("Step 4 — upsert medhub_milestone_crosswalk");
  const { error } = await supabase
    .from("medhub_milestone_crosswalk")
    .upsert(rows, { onConflict: "framework_slug,medhub_column_key" });
  if (error) { fail(`crosswalk upsert: ${error.message}`); return false; }
  ok(`${rows.length} crosswalk rows upserted (psychiatry)`);
  return true;
}

async function backfillLatticeSkillIndex(supabase) {
  sec("Step 5 — backfill milestone_self_ratings.lattice_skill_index");

  // Use a raw RPC or just check if any rows exist; service role can run this
  const { data: unset, error: countErr } = await supabase
    .from("milestone_self_ratings")
    .select("rating_id, subcompetency_id", { count: "exact" })
    .is("lattice_skill_index", null)
    .limit(1);

  if (countErr) {
    warn(`Could not check milestone_self_ratings: ${countErr.message}`);
    return;
  }

  if (!unset?.length) {
    ok("No unbackfilled rows in milestone_self_ratings (table empty or already backfilled)");
    return;
  }

  // Load all subcompetencies to build an in-memory map (avoids complex DB JOIN via JS client)
  const { data: subs, error: subErr } = await supabase
    .from("acgme_subcompetencies")
    .select("subcompetency_id, lattice_skill_index");

  if (subErr || !subs?.length) {
    warn("Could not load subcompetencies for backfill — run manually after seed.");
    return;
  }

  const skillMap = new Map(subs.map((s) => [s.subcompetency_id, s.lattice_skill_index]));

  const { data: allRatings, error: ratErr } = await supabase
    .from("milestone_self_ratings")
    .select("rating_id, subcompetency_id")
    .is("lattice_skill_index", null);

  if (ratErr || !allRatings?.length) {
    ok("No rows to backfill.");
    return;
  }

  let updated = 0;
  for (const row of allRatings) {
    const skill = skillMap.get(row.subcompetency_id);
    if (skill == null) continue;
    await supabase
      .from("milestone_self_ratings")
      .update({ lattice_skill_index: skill })
      .eq("rating_id", row.rating_id);
    updated++;
  }

  ok(`Backfilled lattice_skill_index on ${updated} milestone_self_ratings rows`);
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svcKey) {
    fail("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, svcKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  sec("Step 1 — load seed files");

  const programIndex     = loadJson("docs/seeds/acgme/program_milestones_index.json");
  const frameworksMeta   = loadJson("docs/seeds/acgme/milestone_frameworks.json");
  const psychiatryHand   = loadJson("docs/seeds/acgme/psychiatry_milestones_v2.json");

  ok(`program_milestones_index: ${Object.keys(programIndex.programs).length} programs`);
  ok(`milestone_frameworks: ${Object.keys(frameworksMeta.frameworks ?? {}).length} entries`);
  ok(`psychiatry hand-seed: ${psychiatryHand.subcompetencies.length} subcompetencies`);

  // Build rows
  const { rows: frameworkRows, failed: failedPrograms } =
    buildFrameworkRows(programIndex, frameworksMeta);

  const { rows: subcompRows, skipped: skippedSlugs } =
    buildSubcompetencyRows(programIndex, psychiatryHand);

  const crosswalkRows = buildCrosswalkRows(psychiatryHand);

  // Upsert in dependency order
  const fw  = await upsertFrameworks(supabase, frameworkRows);
  if (!fw) { fail("Framework upsert failed — stopping."); process.exit(1); }

  const sub = await upsertSubcompetencies(supabase, subcompRows);
  if (!sub) { fail("Subcompetency upsert failed — stopping."); process.exit(1); }

  await upsertCrosswalk(supabase, crosswalkRows);
  await backfillLatticeSkillIndex(supabase);

  // ── summary ────────────────────────────────────────────────────────────────
  sec("Summary");

  // Status breakdown
  const statusCounts = {};
  for (const r of frameworkRows) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;

  ok(`Frameworks: ${frameworkRows.length} total`);
  for (const [s, c] of Object.entries(statusCounts)) ok(`  ${s}: ${c}`);
  ok(`Subcompetencies: ${subcompRows.length} total`);
  ok(`MedHub crosswalk: ${crosswalkRows.length} rows (psychiatry)`);

  // Lattice skill distribution
  const skillDist = {};
  for (const r of subcompRows) {
    skillDist[r.lattice_skill_index] = (skillDist[r.lattice_skill_index] ?? 0) + 1;
  }
  const SKILL_NAMES = [
    "Clinical Expertise","Medical Knowledge","Practice-Based Learning",
    "Communication","Professionalism & Ethics","Systems Thinking",
    "Collaboration & Teamwork","Personal & Professional Development",
  ];
  console.log("\n  Subcompetencies by lattice skill:");
  for (const [i, name] of SKILL_NAMES.entries()) {
    const n = skillDist[i] ?? 0;
    if (n > 0) console.log(`    skill ${i} (${name}): ${n}`);
  }

  // Download-failed manifest
  if (failedPrograms.length > 0) {
    console.log(`\n  ⚠ ${failedPrograms.length} programs with no subcompetency data (framework row only):`);
    for (const { slug, name, reason } of failedPrograms)
      console.log(`    ${slug} — ${name} (${reason})`);
    console.log(`  → These need PDF re-download from ACGME. Backfill separately.`);
  }

  if (skippedSlugs.length > 0) {
    console.log(`\n  ⚠ ${skippedSlugs.length} parsed programs missing local JSON (file not found):`);
    for (const s of skippedSlugs) console.log(`    ${s}`);
  }

  // Psychiatry family check
  const psychFamily = ["psychiatry","child-and-adolescent-psychiatry","forensic-psychiatry","geriatric-psychiatry","addiction-psychiatry"];
  const psychSubs = subcompRows.filter((r) => psychFamily.includes(r.framework_slug));
  console.log(`\n  Psychiatry family: ${psychSubs.length} subcompetencies across ${psychFamily.length} frameworks`);
  for (const slug of psychFamily) {
    const n = subcompRows.filter((r) => r.framework_slug === slug).length;
    console.log(`    ${slug}: ${n}`);
  }

  console.log("\nDone. Migration 20260556 + this seed are complete.\n");
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
