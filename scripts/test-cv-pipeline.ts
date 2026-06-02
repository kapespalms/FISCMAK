#!/usr/bin/env npx tsx
/**
 * End-to-end CV pipeline verification script.
 *
 * Tests the full pipeline without the triage UI:
 *   Stage 1 — parser         : parseDocumentToCvRows (pure, no DB)
 *   Stage 2 — seed staging   : activity_entries with packed cell distribution
 *   Stage 3 — confirm        : evidence_unit + evidence_cell_weights
 *   Stage 4 — F1 density     : computeF1Density → assert non-zero cells
 *
 * Run:  npx tsx scripts/test-cv-pipeline.ts
 * Needs: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Creates and deletes an ephemeral test user; all data is cascade-deleted.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

// TypeScript modules from src/
import { parseDocumentToCvRows } from "@/lib/v2/lattice/document-parser";
import { unpackCells } from "@/lib/v2/document-activities";
import { computeF1Density } from "@/lib/v2/formulas-v3";
import { CAREER_DOMAINS } from "@/lib/v2/domains";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

function pass(msg: string) { console.log(`  ✓ ${msg}`); }
function fail(msg: string) { console.error(`  ✗ ${msg}`); }
function section(title: string) { console.log(`\n── ${title} ${"─".repeat(Math.max(0, 56 - title.length))}`); }

const TRACK_NAMES = [
  "Clinician", "Educator", "Researcher", "Leader",
  "Advocate", "Innovator", "Quality-Safety", "Wellness Champion",
] as const;

function domainName(i: number) { return CAREER_DOMAINS.find(d => d.index === i)?.name ?? `domain_${i}`; }
function trackName(i: number)  { return TRACK_NAMES[i] ?? `track_${i}`; }

// ---------------------------------------------------------------------------
// Sample CV text (representative attending psychiatric CV)
// ---------------------------------------------------------------------------

const SAMPLE_CV = `
EDUCATION
Psychiatry Residency, University Hospitals, 2020–2024

PUBLICATIONS
Palmer K, Smith J. Antidepressant efficacy in treatment-resistant depression. Am J Psychiatry. 2024.
Chen L, Palmer K. Cognitive-behavioral therapy outcomes in bipolar disorder. J Clin Psychiatry. 2023.

TEACHING
Designed and taught a 12-session psychotherapy curriculum for PGY-2 psychiatry residents.
Developed case-based didactic materials; evaluated as highly effective by 94% of residents.

LEADERSHIP
Chaired the department wellness committee over 3 years; implemented peer-support program.
Served on graduate medical education committee; led policy review subgroup.

QUALITY IMPROVEMENT
Led initiative to reduce seclusion and restraint use by 40% over 18 months.
Directed multidisciplinary quality-improvement team of 6 staff members.

ADVOCACY
Testified before state legislature on mental health parity legislation.
Organized community health fairs serving underserved populations.
`.trim();

const FAKE_DOCUMENT_ID = crypto.randomUUID();
const TEST_EMAIL = `pipeline-test-${Date.now()}@fiscmak-test.invalid`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  let testUserId: string | null = null;
  let failures = 0;

  // ── Stage 0: create ephemeral test user ──────────────────────────────────
  section("Stage 0 — ephemeral test user");
  const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    email_confirm: true,
    password: crypto.randomUUID(),
  });
  if (createErr || !user) {
    fail(`Could not create test user: ${createErr?.message ?? "unknown"}`);
    process.exit(1);
  }
  testUserId = user.id;
  pass(`Created test user ${testUserId}`);

  try {
    // ── Stage 1: parser (pure, no DB) ──────────────────────────────────────
    section("Stage 1 — parseDocumentToCvRows (pure)");
    const parsedRows = parseDocumentToCvRows(SAMPLE_CV);
    console.log(`  Parsed ${parsedRows.length} rows from sample CV`);

    if (parsedRows.length === 0) {
      fail("Parser produced zero rows");
      failures++;
    } else {
      pass(`Parser produced ${parsedRows.length} rows`);

      // Confidence distribution
      const tiers = { high: 0, medium: 0, low: 0 };
      for (const r of parsedRows) {
        if (r.confidence_score >= 0.80) tiers.high++;
        else if (r.confidence_score >= 0.60) tiers.medium++;
        else tiers.low++;
      }
      pass(`Confidence: high=${tiers.high} medium=${tiers.medium} low=${tiers.low}`);

      // Invariants
      let invariantsFailed = false;
      for (const row of parsedRows) {
        const sum = row.cells.reduce((s, c) => s + c.weight, 0);
        if (Math.abs(sum - 1.0) > 1e-9) { fail(`weights don't sum to 1.0 for: "${row.raw_text.slice(0, 60)}"`); invariantsFailed = true; }
        if (row.cells.some(c => c.weight < 0.15)) { fail(`cell below 0.15 for: "${row.raw_text.slice(0, 60)}"`); invariantsFailed = true; }
        // Cast to string: type system guarantees OV|SV, but assert as runtime safety check
        if (row.cells.some(c => (c.quadrant as string) === "OI" || (c.quadrant as string) === "SI")) { fail(`OI/SI quadrant in CV row: "${row.raw_text.slice(0, 60)}"`); invariantsFailed = true; }
      }
      if (invariantsFailed) failures++;
      else pass("All rows: weights sum to 1.0, no cell < 0.15, no OI/SI");

      // Sample
      console.log("\n  First 3 rows:");
      for (const row of parsedRows.slice(0, 3)) {
        const primary = row.cells[0]!;
        console.log(`    [${row.confidence_score.toFixed(2)} ${row.placement_method}] ${row.raw_text.slice(0, 70)}`);
        console.log(`      primary: ${domainName(primary.domain_index)} × ${trackName(primary.track_index)} (w=${primary.weight.toFixed(2)}, q=${primary.quadrant})`);
        if (row.cells.length > 1) {
          for (const c of row.cells.slice(1)) {
            console.log(`      also:    ${domainName(c.domain_index)} × ${trackName(c.track_index)} (w=${c.weight.toFixed(2)})`);
          }
        }
      }
    }

    // ── Stage 2: seed staging (activity_entries) ───────────────────────────
    section("Stage 2 — seed staging → activity_entries");
    const today = new Date().toISOString().slice(0, 10);

    const activityRows = parsedRows.map(row => {
      const primary = row.cells[0]!;
      return {
        user_id:                   testUserId!,
        activity_date:             today,
        raw_text:                  row.raw_text,
        input_source:              "cv_document",
        primary_domain:            domainName(primary.domain_index),
        primary_track:             trackName(primary.track_index),
        confidence_score:          row.confidence_score,
        primary_domain_confidence: row.confidence_score,
        primary_track_confidence:  row.confidence_score,
        evidence_strength:         row.confidence_score >= 0.80 ? "high" : row.confidence_score >= 0.60 ? "medium" : "low",
        recognition_quadrant:      primary.quadrant,
        source_document_id:        FAKE_DOCUMENT_ID,
        user_confirmed:            false,
        mak_rationale:             JSON.stringify({ cv_cells: row.cells.map(c => ({ d: c.domain_index, t: c.track_index, w: c.weight, q: c.quadrant })) }),
      };
    });

    const { data: inserted, error: seedErr } = await supabase
      .from("activity_entries")
      .insert(activityRows)
      .select("id, raw_text, confidence_score, user_confirmed");

    if (seedErr) {
      fail(`Seed failed: ${seedErr.message}`);
      failures++;
      console.log("  Hint: migration 20260552 (source_document_id + user_confirmed) may not be applied.");
    } else {
      pass(`Inserted ${inserted?.length ?? 0} activity_entries rows`);
      const unconfirmed = inserted?.filter(r => r.user_confirmed === false).length ?? 0;
      pass(`All ${unconfirmed} rows have user_confirmed = false`);
    }

    // ── Stage 3: confirm → evidence_unit + evidence_cell_weights ──────────
    section("Stage 3 — confirm → evidence_unit + evidence_cell_weights");

    const { data: staged, error: stageErr } = await supabase
      .from("activity_entries")
      .select("id, raw_text, mak_rationale")
      .eq("user_id", testUserId!)
      .eq("source_document_id", FAKE_DOCUMENT_ID)
      .eq("user_confirmed", false);

    if (stageErr || !staged?.length) {
      fail(`Could not read staged rows: ${stageErr?.message ?? "none found"}`);
      failures++;
    } else {
      pass(`Found ${staged.length} unconfirmed staged rows`);
      let euCreated = 0;
      let ecwCreated = 0;
      let weightInvariantFailed = false;
      const now = new Date().toISOString();

      for (const row of staged) {
        const cells = unpackCells(row.mak_rationale as string | null);
        if (cells.length === 0) continue;

        const primary = cells[0]!;

        const { data: eu, error: euErr } = await supabase
          .from("evidence_unit")
          .insert({
            user_id:              testUserId!,
            domain_index:         primary.domain_index,
            track_index:          primary.track_index,
            recognition_quadrant: primary.quadrant,
            raw_text:             row.raw_text,
            physician_confirmed:  true,
            source_activity_id:   row.id,
            created_at:           now,
            updated_at:           now,
          })
          .select("id")
          .single();

        if (euErr || !eu) { fail(`evidence_unit insert failed: ${euErr?.message}`); failures++; continue; }
        euCreated++;

        const weightRows = cells.map(c => ({
          evidence_unit_id:     eu.id,
          user_id:              testUserId!,
          domain_index:         c.domain_index,
          track_index:          c.track_index,
          weight:               c.weight,
          recognition_quadrant: c.quadrant,
        }));

        const { error: ecwErr } = await supabase.from("evidence_cell_weights").insert(weightRows);
        if (ecwErr) { fail(`evidence_cell_weights insert failed: ${ecwErr.message}`); failures++; continue; }
        ecwCreated += weightRows.length;

        // Assert weights normalize to 1.0
        const sum = cells.reduce((s, c) => s + c.weight, 0);
        if (Math.abs(sum - 1.0) > 1e-9) { weightInvariantFailed = true; }
      }

      pass(`Created ${euCreated} evidence_unit rows`);
      pass(`Created ${ecwCreated} evidence_cell_weights rows`);
      if (weightInvariantFailed) { fail("Weight normalization invariant violated in confirmed rows"); failures++; }
      else pass("All evidence_cell_weights weights sum to ~1.0 per evidence_unit");

      // Mark all staged rows confirmed
      await supabase.from("activity_entries")
        .update({ user_confirmed: true })
        .eq("user_id", testUserId!)
        .eq("source_document_id", FAKE_DOCUMENT_ID);
      pass("Marked all staged rows user_confirmed = true");
    }

    // ── Stage 4: F1 density ────────────────────────────────────────────────
    section("Stage 4 — computeF1Density (F1)");

    const f1Result = await computeF1Density(testUserId!, supabase as Parameters<typeof computeF1Density>[1]);

    if (f1Result.cells.length === 0) {
      fail("F1 returned zero cells — no density computed");
      failures++;
    } else {
      pass(`F1 returned ${f1Result.cells.length} non-zero cells`);
      const totalDensity = f1Result.cells.reduce((s, c) => s + c.density, 0);
      pass(`Total density across all cells: ${totalDensity.toFixed(4)}`);

      console.log("\n  Top 5 cells by density:");
      const sorted = [...f1Result.cells].sort((a, b) => b.density - a.density).slice(0, 5);
      for (const c of sorted) {
        console.log(`    ${domainName(c.domain_index)} × ${trackName(c.track_index)} [${c.quadrant}]  density=${c.density.toFixed(4)}`);
      }
    }

  } finally {
    // ── Cleanup: delete ephemeral test user (cascades all test data) ────────
    section("Cleanup");
    if (testUserId) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(testUserId);
      if (delErr) console.warn(`  ⚠ Could not delete test user: ${delErr.message}`);
      else pass(`Deleted test user ${testUserId} (cascade deleted all test data)`);
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    section(failures === 0 ? "ALL STAGES PASSED ✓" : `FAILED — ${failures} failure(s)`);
    process.exit(failures > 0 ? 1 : 0);
  }
}

main().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
