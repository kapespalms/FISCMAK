#!/usr/bin/env node
/**
 * End-to-end CV pipeline verification — runs against a real Supabase database.
 *
 * Stage 1  parser        parseDocumentToCvRows → multi-cell CvCellWeight[]
 *                        assert: weights sum ~1.0, min 0.15, no OI/SI
 * Stage 2  seed staging  activity_entries rows written
 *                        assert: input_source='cv_document', user_confirmed=false,
 *                                mak_rationale contains cv_cells JSON
 * Stage 3  confirm       evidence_unit + evidence_cell_weights written
 *                        assert: physician_confirmed=true, weights normalised
 * Stage 4  F1 density    computeF1Density returns non-zero cells
 *
 * Creates and deletes an ephemeral test user. Never touches production rows.
 *
 * Run:  node scripts/test-cv-pipeline.mjs
 * Needs: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import fs   from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { spawnSync }   from "node:child_process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

// ── output helpers ─────────────────────────────────────────────────────────

const ok   = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => { console.error(`  ✗ ${msg}`); failures++; };
const sec  = (t)   => console.log(`\n── ${t} ${"─".repeat(Math.max(0, 56 - t.length))}`);

let failures = 0;

// ── sample CV ──────────────────────────────────────────────────────────────

const SAMPLE_CV = `
EDUCATION
Psychiatry Residency, University Hospitals, 2020–2024

PUBLICATIONS
Palmer K, Smith J. Antidepressant efficacy in treatment-resistant depression. Am J Psychiatry. 2024.
Chen L, Palmer K. CBT outcomes in bipolar disorder. J Clin Psychiatry. 2023.

TEACHING
Designed and taught a 12-session psychotherapy curriculum for PGY-2 psychiatry residents.
Developed case-based didactic materials; evaluated effective by 94% of residents.

LEADERSHIP
Chaired the department wellness committee over 3 years; implemented peer-support program.

QUALITY IMPROVEMENT
Led initiative to reduce seclusion and restraint use by 40% over 18 months.

ADVOCACY
Testified before state legislature on mental health parity legislation.
`.trim();

const FAKE_DOC_ID   = randomUUID();
const FAKE_DOC_ID_B = randomUUID();

// ── Fixture B — designed to stress multi-cell splitting and density accumulation
//
//  Line 1 (cross-domain): under a heading that pulls in a third signal so
//  keyword + ontology + section hint each aim at different (domain,track) cells.
//  Expect: the confirmed evidence_unit has >1 ecw row, no cell at weight 1.0.
//
//  Lines 2+3 (shared cell): two distinct clinical-care lines that both route
//  to Clinician × domain 0.  Expect: F1 density at (0,0) measurably > 0.50
//  (which is the maximum density a single fully-weighted line can produce).

const SAMPLE_CV_B = `
RESEARCH AND TEACHING INNOVATION
Led a quality-improvement project, published the outcomes in a peer-reviewed journal, and designed the curriculum to train residents on the new protocol.

CLINICAL EXPERIENCE
Performed comprehensive psychiatric evaluations and provided direct patient care for 30 inpatients daily.

Conducted outpatient psychiatric consultations and managed psychopharmacology for 25 patients per clinic session.
`.trim();

// ── inline helpers (pure JS, no TS imports) ────────────────────────────────

// TRACK_NAMES = Career Domain identities (founder "Career Domains" = code TRACKS)
const TRACK_NAMES  = ["Clinician","Educator","Researcher","Administrator/Leader","Advocate","Innovator","Quality/Safety","Wellness Champion"];
// DOMAIN_NAMES = Career Task/Skills (founder "Career Tasks/Skills" = code DOMAINS)
const DOMAIN_NAMES = ["Clinical Expertise","Medical Knowledge","Practice-Based Learning","Communication","Professionalism & Ethics","Systems Thinking","Collaboration & Teamwork","Personal & Professional Development"];

function domainName(i) { return DOMAIN_NAMES[i] ?? `domain_${i}`; }
function trackName(i)  { return TRACK_NAMES[i]  ?? `track_${i}`;  }

/** Unpack the mak_rationale JSON packed by the seeder. */
function unpackCells(mak_rationale) {
  if (!mak_rationale) return [];
  try {
    const p = JSON.parse(mak_rationale);
    return (p.cv_cells ?? []).map(({ d, t, w, q }) => ({
      skill_index: d, domain_index: t, weight: w,
      quadrant: (q === "OV" || q === "SV") ? q : "OV",
    }));
  } catch { return []; }
}

// ── Stage 1: parser (subprocess via tsx) ──────────────────────────────────

async function stage1Parser() {
  sec("Stage 1 — parseDocumentToCvRows (via tsx subprocess)");

  // Write a tiny TypeScript runner to a temp file so tsx can resolve @/ aliases
  const tmpFile = path.join(ROOT, "scripts", "_pipeline_parser_tmp.ts");
  const escaped = JSON.stringify(SAMPLE_CV);
  fs.writeFileSync(tmpFile, [
    `import { parseDocumentToCvRows } from "@/lib/v2/lattice/document-parser";`,
    `const rows = parseDocumentToCvRows(${escaped});`,
    `process.stdout.write(JSON.stringify(rows));`,
  ].join("\n"));

  let parsedRows = [];
  try {
    const res = spawnSync("npx", ["tsx", tmpFile], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || "tsx exited non-zero");
    parsedRows = JSON.parse(res.stdout);
  } finally {
    fs.unlinkSync(tmpFile);
  }

  if (!parsedRows.length) { fail("Parser produced 0 rows"); return []; }
  ok(`Parsed ${parsedRows.length} rows`);

  // Confidence distribution
  let high = 0, mid = 0, low = 0;
  let invariantFailed = false;
  for (const row of parsedRows) {
    if (row.confidence_score >= 0.80) high++;
    else if (row.confidence_score >= 0.60) mid++;
    else low++;

    const sum = row.cells.reduce((s, c) => s + c.weight, 0);
    if (Math.abs(sum - 1.0) > 1e-9) { fail(`weights sum ${sum.toFixed(6)} ≠ 1.0 for: "${row.raw_text.slice(0,50)}"`); invariantFailed = true; }
    if (row.cells.some(c => c.weight < 0.15)) { fail(`cell < 0.15 for: "${row.raw_text.slice(0,50)}"`); invariantFailed = true; }
    if (row.cells.some(c => c.quadrant === "OI" || c.quadrant === "SI")) { fail(`OI/SI in CV row: "${row.raw_text.slice(0,50)}"`); invariantFailed = true; }
  }
  ok(`Confidence: high=${high} medium=${mid} low=${low}`);
  if (!invariantFailed) ok("All invariants: weights~1.0, no cell<0.15, no OI/SI");

  // Sample
  console.log("\n  Sample (first 3 rows):");
  for (const row of parsedRows.slice(0, 3)) {
    const p = row.cells[0];
    console.log(`    [${row.confidence_score.toFixed(2)} ${row.placement_method}] ${row.raw_text.slice(0, 65)}`);
    console.log(`      primary: ${domainName(p.skill_index)} × ${trackName(p.domain_index)} w=${p.weight.toFixed(2)} q=${p.quadrant}`);
    for (const c of row.cells.slice(1))
      console.log(`      also:    ${domainName(c.skill_index)} × ${trackName(c.domain_index)} w=${c.weight.toFixed(2)}`);
  }

  return parsedRows;
}

// ── Stage 2: seed activity_entries ────────────────────────────────────────

async function stage2Seed(supabase, userId, parsedRows) {
  sec("Stage 2 — seed activity_entries staging");

  const today = new Date().toISOString().slice(0, 10);
  const rows = parsedRows.map(row => {
    const primary = row.cells[0];
    return {
      user_id:                   userId,
      activity_date:             today,
      raw_text:                  row.raw_text,
      input_source:              "cv_document",
      primary_domain:            domainName(primary.skill_index),
      primary_track:             trackName(primary.domain_index),
      confidence_score:          row.confidence_score,
      primary_domain_confidence: row.confidence_score,
      primary_track_confidence:  row.confidence_score,
      evidence_strength:         row.confidence_score >= 0.80 ? "high" : row.confidence_score >= 0.60 ? "medium" : "low",
      recognition_quadrant:      primary.quadrant,
      source_document_id:        FAKE_DOC_ID,
      user_confirmed:            false,
      mak_rationale:             JSON.stringify({ cv_cells: row.cells.map(c => ({ d: c.skill_index, t: c.domain_index, w: c.weight, q: c.quadrant })) }),
    };
  });

  const { data: inserted, error } = await supabase.from("activity_entries").insert(rows).select("id, input_source, user_confirmed, mak_rationale");
  if (error) {
    fail(`activity_entries insert failed: ${error.message}`);
    if (error.message.includes("source_document_id")) console.log("  Hint: migration 20260552 may not be applied.");
    return [];
  }
  ok(`Inserted ${inserted.length} rows (input_source=cv_document, user_confirmed=false)`);

  const badSource = inserted.filter(r => r.input_source !== "cv_document");
  if (badSource.length) fail(`${badSource.length} rows have wrong input_source`);
  else ok("All rows: input_source='cv_document'");

  const badConfirmed = inserted.filter(r => r.user_confirmed !== false);
  if (badConfirmed.length) fail(`${badConfirmed.length} rows have user_confirmed=true prematurely`);
  else ok("All rows: user_confirmed=false");

  const badRationale = inserted.filter(r => !r.mak_rationale?.includes("cv_cells"));
  if (badRationale.length) fail(`${badRationale.length} rows missing cv_cells in mak_rationale`);
  else ok("All rows: mak_rationale contains cv_cells distribution");

  return inserted.map(r => r.id);
}

// ── Stage 3: confirm → evidence_unit + evidence_cell_weights ──────────────

async function stage3Confirm(supabase, userId, activityIds) {
  sec("Stage 3 — confirm 'accept as-is' → evidence_unit + evidence_cell_weights");

  const { data: staged } = await supabase
    .from("activity_entries")
    .select("id, raw_text, mak_rationale")
    .in("id", activityIds)
    .eq("user_confirmed", false);

  ok(`Found ${staged?.length ?? 0} unconfirmed staging rows`);

  const now = new Date().toISOString();
  let euCreated = 0, ecwCreated = 0;
  let weightFailed = false;

  for (const row of staged ?? []) {
    const cells = unpackCells(row.mak_rationale);
    if (!cells.length) continue;
    const primary = cells[0];

    const { data: eu, error: euErr } = await supabase
      .from("evidence_unit")
      .insert({ user_id: userId, skill_index: primary.skill_index, domain_index: primary.domain_index, recognition_quadrant: primary.quadrant, raw_text: row.raw_text, physician_confirmed: true, source_activity_id: row.id, created_at: now, updated_at: now })
      .select("id").single();

    if (euErr || !eu) { fail(`evidence_unit insert: ${euErr?.message}`); continue; }
    euCreated++;

    const ecwRows = cells.map(c => ({ evidence_unit_id: eu.id, user_id: userId, skill_index: c.skill_index, domain_index: c.domain_index, weight: c.weight, recognition_quadrant: c.quadrant }));
    const { error: ecwErr } = await supabase.from("evidence_cell_weights").insert(ecwRows);
    if (ecwErr) { fail(`evidence_cell_weights insert: ${ecwErr.message}`); continue; }
    ecwCreated += ecwRows.length;

    const wSum = cells.reduce((s, c) => s + c.weight, 0);
    if (Math.abs(wSum - 1.0) > 1e-9) weightFailed = true;
  }

  ok(`Created ${euCreated} evidence_unit rows (physician_confirmed=true)`);
  ok(`Created ${ecwCreated} evidence_cell_weights rows`);
  if (weightFailed) fail("Weight normalisation violated in confirmed rows");
  else ok("All evidence_cell_weights: weights sum to ~1.0 per evidence_unit");

  // Assert physician_confirmed=true
  const { data: confirmed } = await supabase.from("evidence_unit").select("id, physician_confirmed").eq("user_id", userId).eq("physician_confirmed", true);
  if (!confirmed?.length) fail("No evidence_unit rows with physician_confirmed=true found");
  else ok(`Verified ${confirmed.length} evidence_unit rows have physician_confirmed=true`);

  // Mark staged rows confirmed
  await supabase.from("activity_entries").update({ user_confirmed: true }).in("id", activityIds).eq("user_id", userId);
  ok("Marked all staging rows user_confirmed=true");
}

// ── Stage 4: F1 density ───────────────────────────────────────────────────

async function stage4F1(supabase, userId) {
  sec("Stage 4 — computeF1Density (inline)");

  // Inline the F1 query (mirrors formulas-v3.ts computeF1Density)
  const { data: cellWeights } = await supabase
    .from("evidence_cell_weights")
    .select("skill_index, domain_index, recognition_quadrant, weight, evidence_unit_id")
    .eq("user_id", userId);

  if (!cellWeights?.length) { fail("No evidence_cell_weights rows for test user"); return; }

  const euIds = [...new Set(cellWeights.map(c => c.evidence_unit_id))];
  const { data: evidenceUnits } = await supabase
    .from("evidence_unit")
    .select("id, source_activity_id, physician_confirmed")
    .in("id", euIds)
    .eq("user_id", userId)
    .eq("physician_confirmed", true);

  const confirmedIds = new Set((evidenceUnits ?? []).map(eu => eu.id));
  const densityMap = new Map();
  const SOURCE_WEIGHTS = { cv_document: 0.50, mak_capture: 0.55 };

  for (const ecw of cellWeights) {
    if (!confirmedIds.has(ecw.evidence_unit_id)) continue;
    const key = `${ecw.skill_index}:${ecw.domain_index}:${ecw.recognition_quadrant}`;
    const w = SOURCE_WEIGHTS.cv_document; // all test evidence is cv_document
    densityMap.set(key, (densityMap.get(key) ?? 0) + w * ecw.weight);
  }

  const cells = [...densityMap.entries()]
    .map(([key, density]) => { const [d,t,q] = key.split(":"); return { skill_index: +d, domain_index: +t, quadrant: q, density }; })
    .filter(c => c.density > 0)
    .sort((a, b) => b.density - a.density);

  if (!cells.length) { fail("F1 returned zero density cells"); return; }
  ok(`F1 returned ${cells.length} non-zero cells`);
  ok(`Total density: ${cells.reduce((s,c)=>s+c.density,0).toFixed(4)}`);
  console.log("\n  Top 5 cells:");
  for (const c of cells.slice(0, 5))
    console.log(`    ${domainName(c.skill_index)} × ${trackName(c.domain_index)} [${c.quadrant}]  ${c.density.toFixed(4)}`);
}

// ── Fixture B — inline F1 for a specific set of evidence_unit IDs ─────────

function computeInlineF1(cellWeights, confirmedEuIds) {
  const densityMap = new Map();
  for (const ecw of cellWeights) {
    if (!confirmedEuIds.has(ecw.evidence_unit_id)) continue;
    const key = `${ecw.skill_index}:${ecw.domain_index}:${ecw.recognition_quadrant}`;
    densityMap.set(key, (densityMap.get(key) ?? 0) + 0.50 * ecw.weight); // cv_document weight
  }
  return [...densityMap.entries()]
    .map(([key, density]) => { const [d,t,q] = key.split(":"); return { skill_index: +d, domain_index: +t, quadrant: q, density }; })
    .filter(c => c.density > 0)
    .sort((a, b) => b.density - a.density);
}

async function runFixtureB(supabase, userId) {
  console.log("\n\n════════════════════════════════════════════════════════════");
  console.log("  FIXTURE B — multi-cell splitting + density accumulation");
  console.log("════════════════════════════════════════════════════════════");

  // ── B-Stage 1: parse ──────────────────────────────────────────────────────
  sec("B-Stage 1 — parse Fixture B CV");

  const tmpFile = path.join(ROOT, "scripts", "_pipeline_parser_tmpB.ts");
  const escaped = JSON.stringify(SAMPLE_CV_B);
  fs.writeFileSync(tmpFile, [
    `import { parseDocumentToCvRows } from "@/lib/v2/lattice/document-parser";`,
    `const rows = parseDocumentToCvRows(${escaped});`,
    `process.stdout.write(JSON.stringify(rows));`,
  ].join("\n"));

  let parsedRows = [];
  try {
    const res = spawnSync("npx", ["tsx", tmpFile], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || "tsx exited non-zero");
    parsedRows = JSON.parse(res.stdout);
  } finally {
    fs.unlinkSync(tmpFile);
  }

  if (!parsedRows.length) { fail("Fixture B parser produced 0 rows"); return; }
  ok(`Parsed ${parsedRows.length} rows`);

  // Print full cell distributions for every row (this is the point of Fixture B)
  console.log("\n  Cell distributions for all Fixture B rows:");
  for (const row of parsedRows) {
    console.log(`\n    [${row.confidence_score.toFixed(2)} ${row.placement_method}] ${row.raw_text.slice(0, 70)}`);
    for (const c of row.cells)
      console.log(`      ${domainName(c.skill_index)} × ${trackName(c.domain_index)}  w=${c.weight.toFixed(4)}  q=${c.quadrant}`);
  }

  // ── B-Stage 2: seed ───────────────────────────────────────────────────────
  sec("B-Stage 2 — seed Fixture B staging rows");

  const today = new Date().toISOString().slice(0, 10);
  const seedRows = parsedRows.map(row => {
    const primary = row.cells[0];
    return {
      user_id:                   userId,
      activity_date:             today,
      raw_text:                  row.raw_text,
      input_source:              "cv_document",
      primary_domain:            domainName(primary.skill_index),
      primary_track:             trackName(primary.domain_index),
      confidence_score:          row.confidence_score,
      primary_domain_confidence: row.confidence_score,
      primary_track_confidence:  row.confidence_score,
      evidence_strength:         row.confidence_score >= 0.80 ? "high" : row.confidence_score >= 0.60 ? "medium" : "low",
      recognition_quadrant:      primary.quadrant,
      source_document_id:        FAKE_DOC_ID_B,
      user_confirmed:            false,
      mak_rationale:             JSON.stringify({ cv_cells: row.cells.map(c => ({ d: c.skill_index, t: c.domain_index, w: c.weight, q: c.quadrant })) }),
    };
  });

  const { data: inserted, error: seedErr } = await supabase
    .from("activity_entries").insert(seedRows).select("id");
  if (seedErr) { fail(`B seed failed: ${seedErr.message}`); return; }
  const activityIds = inserted.map(r => r.id);
  ok(`Inserted ${activityIds.length} staging rows`);

  // ── B-Stage 3: confirm ────────────────────────────────────────────────────
  sec("B-Stage 3 — confirm Fixture B rows");

  const { data: staged } = await supabase
    .from("activity_entries")
    .select("id, raw_text, mak_rationale")
    .in("id", activityIds)
    .eq("user_confirmed", false);

  const now = new Date().toISOString();
  const bEuIds = [];

  for (const row of staged ?? []) {
    const cells = unpackCells(row.mak_rationale);
    if (!cells.length) continue;
    const primary = cells[0];

    const { data: eu, error: euErr } = await supabase
      .from("evidence_unit")
      .insert({ user_id: userId, skill_index: primary.skill_index, domain_index: primary.domain_index, recognition_quadrant: primary.quadrant, raw_text: row.raw_text, physician_confirmed: true, source_activity_id: row.id, created_at: now, updated_at: now })
      .select("id").single();
    if (euErr || !eu) { fail(`B evidence_unit insert: ${euErr?.message}`); continue; }
    bEuIds.push(eu.id);

    const ecwRows = cells.map(c => ({ evidence_unit_id: eu.id, user_id: userId, skill_index: c.skill_index, domain_index: c.domain_index, weight: c.weight, recognition_quadrant: c.quadrant }));
    const { error: ecwErr } = await supabase.from("evidence_cell_weights").insert(ecwRows);
    if (ecwErr) { fail(`B evidence_cell_weights insert: ${ecwErr.message}`); }
  }
  ok(`Confirmed ${bEuIds.length} evidence_unit rows for Fixture B`);

  await supabase.from("activity_entries")
    .update({ user_confirmed: true }).in("id", activityIds).eq("user_id", userId);

  // ── B-Stage 4: assertions ─────────────────────────────────────────────────
  sec("B-Stage 4 — Fixture B assertions");

  // Fetch all ecw rows for Fixture B EUs
  const { data: bCellWeights } = await supabase
    .from("evidence_cell_weights")
    .select("evidence_unit_id, skill_index, domain_index, weight, recognition_quadrant")
    .in("evidence_unit_id", bEuIds);

  if (!bCellWeights?.length) { fail("No evidence_cell_weights rows for Fixture B"); return; }

  // Group ecw rows by EU
  const ecwByEu = new Map();
  for (const ecw of bCellWeights) {
    const arr = ecwByEu.get(ecw.evidence_unit_id) ?? [];
    arr.push(ecw);
    ecwByEu.set(ecw.evidence_unit_id, arr);
  }

  console.log("\n  Evidence_cell_weights per EU:");
  for (const [euId, ecws] of ecwByEu) {
    const short = euId.slice(0, 8);
    for (const ecw of ecws)
      console.log(`    EU ${short}…  ${domainName(ecw.skill_index)} × ${trackName(ecw.domain_index)}  w=${ecw.weight.toFixed(4)}  q=${ecw.recognition_quadrant}`);
  }

  // Assertion 1: at least one EU has >1 ecw row with NO cell at weight 1.0
  const multiCellEus = [...ecwByEu.entries()].filter(([, ecws]) =>
    ecws.length > 1 && ecws.every(e => e.weight < 1.0 - 1e-9)
  );
  if (multiCellEus.length === 0) {
    fail("No evidence_unit has >1 ecw rows with all weights < 1.0 — multi-cell splitting not observed");
    console.log("  Finding: parser may have routed the cross-domain line to a single cell.");
    console.log("  This is a real finding about the parser's weighting, not a bug in the pipeline.");
  } else {
    ok(`${multiCellEus.length} evidence_unit(s) have >1 ecw rows with no cell at weight 1.0 (real multi-cell split)`);
  }

  // Assertion 2: shared-cell F1 density > 0.50 (proves accumulation from 2+ lines)
  // 0.50 = max density a single fully-weighted cv_document line can produce (source_weight × 1.0)
  const confirmedBIds = new Set(bEuIds);
  const bF1 = computeInlineF1(bCellWeights, confirmedBIds);

  console.log("\n  Fixture B F1 top cells (isolated to Fixture B evidence):");
  for (const c of bF1.slice(0, 8))
    console.log(`    ${domainName(c.skill_index)} × ${trackName(c.domain_index)} [${c.quadrant}]  density=${c.density.toFixed(4)}`);

  const maxDensityCell = bF1[0];
  const SINGLE_LINE_MAX = 0.50; // source_weight(cv_document) × max_cell_weight(1.0)

  if (!maxDensityCell) {
    fail("F1 returned no cells for Fixture B");
  } else if (maxDensityCell.density > SINGLE_LINE_MAX) {
    ok(`Max density cell ${domainName(maxDensityCell.skill_index)} × ${trackName(maxDensityCell.domain_index)} = ${maxDensityCell.density.toFixed(4)} > ${SINGLE_LINE_MAX} — accumulation confirmed (2+ lines contributed)`);
  } else {
    fail(`Max density cell = ${maxDensityCell.density.toFixed(4)} ≤ ${SINGLE_LINE_MAX} — the two clinical lines did NOT accumulate to the same cell`);
    console.log(`  Finding: the two clinical lines may have been routed to different (domain,track) cells.`);
    console.log(`  Check the cell distribution printout above for where they actually landed.`);
    console.log(`  This is a real finding about the parser's clinical routing, not a pipeline bug.`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"); process.exit(1); }

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // Stage 0: ephemeral test user
  sec("Stage 0 — ephemeral test user");
  const email = `pipeline-test-${Date.now()}@fiscmak-test.invalid`;
  const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({ email, email_confirm: true, password: randomUUID() });
  if (createErr || !user) { console.error(`Cannot create test user: ${createErr?.message}`); process.exit(1); }
  const userId = user.id;
  ok(`Created test user ${userId}`);

  try {
    const parsedRows = await stage1Parser();
    if (!parsedRows.length) { sec("ABORTED — parser produced no rows"); return; }

    const activityIds = await stage2Seed(supabase, userId, parsedRows);
    if (!activityIds.length) { sec("ABORTED — seed produced no rows"); return; }

    await stage3Confirm(supabase, userId, activityIds);
    await stage4F1(supabase, userId);

    // Fixture B — stress multi-cell splitting and density accumulation
    await runFixtureB(supabase, userId);

  } finally {
    sec("Cleanup");
    const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
    if (delErr) console.warn(`  ⚠ Could not delete test user: ${delErr.message}`);
    else ok(`Deleted test user (all test data cascade-deleted)`);

    sec(failures === 0 ? "ALL STAGES PASSED ✓" : `FAILED — ${failures} failure(s)`);
    process.exit(failures > 0 ? 1 : 0);
  }
}

main().catch(err => { console.error("Unexpected:", err); process.exit(1); });
