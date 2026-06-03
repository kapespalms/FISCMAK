#!/usr/bin/env node
/**
 * seed-demo-lattice.mjs — persistent demo user for lattice visualization
 *
 * Creates (or reuses) a fixed demo account, then populates the lattice with
 * evidence from a rich sample CV + energy rankings.
 *
 *   Idempotent: clears prior demo rows before re-seeding.
 *   Persistent: the auth user is NOT deleted on exit.
 *
 * Run: node scripts/seed-demo-lattice.mjs
 * Needs: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * ⚠ Run as service role. Never commit credentials.
 */

import fs   from "node:fs";
import path from "node:path";
import { randomUUID }    from "node:crypto";
import { spawnSync }     from "node:child_process";
import { fileURLToPath } from "node:url";
import { createClient }  from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── config ─────────────────────────────────────────────────────────────────

const DEMO_EMAIL    = "demo-lattice@fiscmak.dev";
const DEMO_PASSWORD = "FiscmakDemo2026!";          // changed by founder after seeding if needed
const FAKE_DOC_ID   = "00000000-0000-0000-0000-000000000001";

// Energy rankings for the demo user (domain_index 0–7, rank 1–5).
// Spread across the full scale so glyphs render across all columns.
const DEMO_ENERGY_RANKINGS = [
  { domain_index: 0, rank: 5 },   // Clinician       — very energizing
  { domain_index: 1, rank: 4 },   // Educator        — energizing
  { domain_index: 2, rank: 2 },   // Researcher      — draining
  { domain_index: 3, rank: 1 },   // Admin/Leader    — very draining
  { domain_index: 4, rank: 4 },   // Advocate        — energizing
  { domain_index: 5, rank: 5 },   // Innovator       — very energizing
  { domain_index: 6, rank: 3 },   // Quality/Safety  — neutral
  { domain_index: 7, rank: 4 },   // Wellness Champ  — energizing
];

// ── rich demo CV ────────────────────────────────────────────────────────────
// Designed to populate 12+ distinct cells with varied density.
// Section headings are matched by the parser's CV_SECTION_RULES.

const DEMO_CV = `
PSYCHIATRY RESIDENCY & FELLOWSHIP TRAINING
Completed general psychiatry residency at University Hospitals Cleveland Medical Center, 2020–2024.
Completed child and adolescent psychiatry fellowship, 2024–2026.
Subspecialty rotation in consultation-liaison psychiatry; managed medically complex inpatients.
Addiction psychiatry rotation; managed patients on medication-assisted treatment protocols.
Inpatient psychiatry attending, 15-bed acute-care unit, 2 years.

CLINICAL EXPERIENCE
Provided direct patient care for 40+ outpatients weekly; complex psychopharmacology management.
Conducted psychiatric consultations for general hospital teams; liaison with internal medicine and neurology.
Emergency psychiatry coverage; acute crisis management and safety assessments.
Psychotherapy supervision and direct care: CBT, DBT, and supportive therapy formats.

PUBLICATIONS
Palmer K, Chen L. Antidepressant augmentation in treatment-resistant depression. Am J Psychiatry. 2025.
Palmer K, Smith J. CBT outcomes in bipolar disorder. J Clin Psychiatry. 2024.
Palmer K et al. Burnout and resilience in psychiatry residents: a multi-site study. Acad Psychiatry. 2024.
Chen L, Palmer K. Racial disparities in psychiatric inpatient care. Psychiatric Services. 2023.
Nguyen T, Palmer K. Collaborative care implementation in primary care settings. J Gen Intern Med. 2023.

RESEARCH
Principal investigator: NIH-funded grant examining sleep disruption in treatment-resistant depression.
Co-investigator: Ketamine augmentation in bipolar depression (Phase 2 clinical trial, 2023–2025).
Completed IRB-approved retrospective chart review; 200 patients with psychotic disorders.
Co-authored peer-reviewed manuscript on pharmacogenomics in psychiatry.

PRESENTATIONS
Grand rounds presenter: Novel Pharmacotherapy in Treatment-Resistant Depression, UH, 2025.
Invited talk at American Psychiatric Association Annual Meeting, 2024.
Poster presentation: ADAA Conference on anxiety and trauma disorders, 2023.
Invited seminar on medication-assisted treatment outcomes, regional conference.

TEACHING & CURRICULUM DEVELOPMENT
Designed and co-directed 16-session psychotherapy didactic curriculum for PGY-2 and PGY-3 residents.
Developed case-based learning modules on psychopharmacology; rated highly effective by 96% of residents.
Clerkship director for third-year medical student psychiatry rotation, 2024–present.
Course director: Introduction to Psychiatric Interviewing for second-year medical students.

MENTORING
Faculty mentor for three psychiatry residents pursuing academic careers; two obtained research grants.
Mentor for underrepresented medical students through AAMC Minority Affairs program.
Career advisor for five psychiatry residents exploring fellowship and faculty options.

COMMUNICATION
Trained in interpreter-mediated psychiatric interviews; delivered culturally-sensitive care in Spanish.
Developed plain-language patient communication materials for psychoeducation groups.
Facilitated difficult family meetings for patients with treatment-refractory illness.
Led shared decision-making workshops for residents on treatment preference conversations.

INTERPROFESSIONAL COLLABORATION
Co-led collaborative care team with primary care, social work, and pharmacy in integrated behavioral health.
Participated in weekly multidisciplinary team rounds on inpatient psychiatry unit.
Partnered with nursing to redesign seclusion and restraint prevention protocols.

LEADERSHIP & ADMINISTRATION
Chair, Department Resident Wellness Committee, 2023–2025; implemented peer support program.
Committee member, Graduate Medical Education Curriculum Committee, University Hospitals.
Officer, Association of Academic Psychiatry annual conference planning committee.
Administrative lead for intern onboarding; developed orientation curriculum.

QUALITY IMPROVEMENT
Led quality improvement initiative reducing inpatient restraint use by 45% over 24 months.
Chaired patient safety committee reviewing adverse events; implemented standardized handoff protocol.
Safety initiative to improve clozapine monitoring compliance; reduced missed labs by 60%.

ADVOCACY & POLICY
Testified before Ohio state legislature on mental health parity enforcement.
Community health advocate: led mental health awareness campaign in underserved East Cleveland communities.
Served on hospital equity committee addressing racial disparities in psychiatric care.
Diversity, equity, and inclusion committee member; developed culturally-responsive training for residents.

INNOVATION & DIGITAL HEALTH
Developed a digital health application prototype for between-session psychotherapy skill practice.
Implemented informatics dashboard to track resident learning milestones; adopted program-wide.
Health technology pilot: evaluated telepsychiatry platform for rural patients; reduced no-show rate 35%.
Co-inventor of a platform for automated patient-reported outcome collection in outpatient psychiatry.

WELLNESS & PROFESSIONAL DEVELOPMENT
Co-founder of resident wellness initiative; introduced evidence-based resilience curriculum.
Peer support leader supporting colleagues during high-stress periods; recognized for burnout prevention.
Completed certified mindfulness instructor training; led mindfulness sessions for clinical staff.
Advocate for physician self-care and healthy boundary-setting in academic medicine.

AWARDS & RECOGNITION
Excellence in Teaching Award, University Hospitals Department of Psychiatry, 2024.
Junior Faculty Excellence Award, Case Western Reserve University School of Medicine, 2025.
APA Early Career Psychiatrist Recognition Award, 2024.
Board certification in psychiatry, American Board of Psychiatry and Neurology.
`.trim();

// ── env + client ────────────────────────────────────────────────────────────

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

// ── output helpers ──────────────────────────────────────────────────────────

const ok   = (msg)  => console.log(`  ✓ ${msg}`);
const info = (msg)  => console.log(`  ℹ ${msg}`);
const fail = (msg)  => { console.error(`  ✗ ${msg}`); process.exitCode = 1; };
const sec  = (t)    => console.log(`\n── ${t} ${"─".repeat(Math.max(0, 56 - t.length))}`);

// ── inline helpers ──────────────────────────────────────────────────────────

const SKILL_NAMES  = [
  "Clinical Expertise","Medical Knowledge","Practice-Based Learning",
  "Communication","Professionalism & Ethics","Systems Thinking",
  "Collaboration & Teamwork","Personal & Professional Development",
];
const DOMAIN_NAMES = [
  "Clinician","Educator","Researcher","Administrator/Leader",
  "Advocate","Innovator","Quality/Safety","Wellness Champion",
];

function skillName(i)  { return SKILL_NAMES[i]  ?? `skill_${i}`; }
function domainName(i) { return DOMAIN_NAMES[i] ?? `domain_${i}`; }

function unpackCells(mak_rationale) {
  if (!mak_rationale) return [];
  try {
    return (JSON.parse(mak_rationale).cv_cells ?? []).map(({ d, t, w, q }) => ({
      skill_index: d, domain_index: t, weight: w,
      quadrant: (q === "OV" || q === "SV") ? q : "OV",
    }));
  } catch { return []; }
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svcKey) {
    fail("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, svcKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── 0. Find or create demo user ────────────────────────────────────────────
  sec("Step 0 — find or create demo user");

  let userId;

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) { fail(`listUsers: ${listErr.message}`); process.exit(1); }

  const existing = list?.users?.find((u) => u.email === DEMO_EMAIL);

  if (existing) {
    userId = existing.id;
    ok(`Found existing demo user ${userId}`);
  } else {
    const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (createErr || !user) { fail(`createUser: ${createErr?.message}`); process.exit(1); }
    userId = user.id;
    ok(`Created demo user ${userId}`);
  }

  console.log(`\n  Demo user ID:    ${userId}`);
  console.log(`  Demo user email: ${DEMO_EMAIL}`);

  // ── 1. Clear prior demo data (idempotent) ──────────────────────────────────
  sec("Step 1 — clear prior demo data");

  await supabase.from("evidence_cell_weights").delete().eq("user_id", userId);
  await supabase.from("evidence_unit").delete().eq("user_id", userId);
  await supabase.from("activity_entries").delete().eq("user_id", userId);
  await supabase.from("energy_rankings").delete().eq("user_id", userId);
  ok("Cleared evidence_cell_weights, evidence_unit, activity_entries, energy_rankings");

  // ── 2. Parse demo CV ───────────────────────────────────────────────────────
  sec("Step 2 — parse demo CV (via tsx)");

  const tmpFile = path.join(ROOT, "scripts", "_demo_seed_parser_tmp.ts");
  const escaped = JSON.stringify(DEMO_CV);
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
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }

  if (!parsedRows.length) { fail("Parser produced 0 rows"); process.exit(1); }
  ok(`Parsed ${parsedRows.length} CV rows`);

  // ── 3. Seed activity_entries ───────────────────────────────────────────────
  sec("Step 3 — seed activity_entries");

  const today = new Date().toISOString().slice(0, 10);
  const activityRows = parsedRows.map((row) => {
    const primary = row.cells[0];
    return {
      user_id:                   userId,
      activity_date:             today,
      raw_text:                  row.raw_text,
      input_source:              "cv_document",
      primary_domain:            skillName(primary.skill_index),
      primary_track:             domainName(primary.domain_index),
      confidence_score:          row.confidence_score,
      primary_domain_confidence: row.confidence_score,
      primary_track_confidence:  row.confidence_score,
      evidence_strength:         row.confidence_score >= 0.80 ? "high" : row.confidence_score >= 0.60 ? "medium" : "low",
      recognition_quadrant:      primary.quadrant,
      source_document_id:        FAKE_DOC_ID,
      user_confirmed:            false,
      mak_rationale:             JSON.stringify({ cv_cells: row.cells.map((c) => ({ d: c.skill_index, t: c.domain_index, w: c.weight, q: c.quadrant })) }),
    };
  });

  const { data: inserted, error: insertErr } = await supabase
    .from("activity_entries").insert(activityRows).select("id");
  if (insertErr) { fail(`activity_entries insert: ${insertErr.message}`); process.exit(1); }
  ok(`Inserted ${inserted.length} activity_entries rows`);

  const activityIds = inserted.map((r) => r.id);

  // ── 4. Confirm → evidence_unit + evidence_cell_weights ────────────────────
  sec("Step 4 — confirm → evidence_unit + evidence_cell_weights");

  const { data: staged } = await supabase
    .from("activity_entries")
    .select("id, raw_text, mak_rationale")
    .in("id", activityIds)
    .eq("user_confirmed", false);

  const now = new Date().toISOString();
  let euCreated = 0, ecwCreated = 0;

  for (const row of staged ?? []) {
    const cells = unpackCells(row.mak_rationale);
    if (!cells.length) continue;
    const primary = cells[0];

    const { data: eu, error: euErr } = await supabase
      .from("evidence_unit")
      .insert({
        user_id: userId, skill_index: primary.skill_index,
        domain_index: primary.domain_index, recognition_quadrant: primary.quadrant,
        raw_text: row.raw_text, physician_confirmed: true,
        source_activity_id: row.id, created_at: now, updated_at: now,
      })
      .select("id").single();

    if (euErr || !eu) { fail(`evidence_unit insert: ${euErr?.message}`); continue; }
    euCreated++;

    const ecwRows = cells.map((c) => ({
      evidence_unit_id: eu.id, user_id: userId,
      skill_index: c.skill_index, domain_index: c.domain_index,
      weight: c.weight, recognition_quadrant: c.quadrant,
    }));
    const { error: ecwErr } = await supabase.from("evidence_cell_weights").insert(ecwRows);
    if (ecwErr) { fail(`evidence_cell_weights: ${ecwErr.message}`); continue; }
    ecwCreated += ecwRows.length;
  }

  await supabase.from("activity_entries").update({ user_confirmed: true })
    .in("id", activityIds).eq("user_id", userId);

  ok(`Created ${euCreated} evidence_unit rows`);
  ok(`Created ${ecwCreated} evidence_cell_weights rows`);

  // ── 5. Insert energy_rankings ──────────────────────────────────────────────
  sec("Step 5 — insert energy_rankings");

  const rankRows = DEMO_ENERGY_RANKINGS.map((r) => ({ user_id: userId, ...r, updated_at: now }));
  const { error: rankErr } = await supabase.from("energy_rankings").insert(rankRows);
  if (rankErr) { fail(`energy_rankings insert: ${rankErr.message}`); }
  else ok(`Inserted ${rankRows.length} energy_rankings (domains 0–7)`);

  // ── 6. Verify — inline F1 ─────────────────────────────────────────────────
  sec("Step 6 — verify: inline F1 density");

  const { data: cellWeights } = await supabase
    .from("evidence_cell_weights")
    .select("skill_index, domain_index, recognition_quadrant, weight, evidence_unit_id")
    .eq("user_id", userId);

  const { data: euRows } = await supabase
    .from("evidence_unit")
    .select("id")
    .eq("user_id", userId)
    .eq("physician_confirmed", true);

  const confirmedIds = new Set((euRows ?? []).map((e) => e.id));
  const densityMap = new Map();

  for (const ecw of cellWeights ?? []) {
    if (!confirmedIds.has(ecw.evidence_unit_id)) continue;
    const key = `${ecw.skill_index}:${ecw.domain_index}`;
    densityMap.set(key, (densityMap.get(key) ?? 0) + 0.50 * ecw.weight);
  }

  const cells = [...densityMap.entries()]
    .map(([key, density]) => {
      const [s, d] = key.split(":");
      return { skill_index: +s, domain_index: +d, density };
    })
    .sort((a, b) => b.density - a.density);

  ok(`F1 produced ${cells.length} non-zero cells`);

  const maxD = cells[0]?.density ?? 1;
  console.log("\n  Populated cells (ipsative, sorted by density):\n");
  console.log("    Skill × Domain                                density   ipsative");
  console.log("    " + "─".repeat(66));
  for (const c of cells) {
    const label = `${skillName(c.skill_index)} × ${domainName(c.domain_index)}`;
    const bar   = "█".repeat(Math.round((c.density / maxD) * 12));
    console.log(`    ${label.padEnd(48)}${c.density.toFixed(4)}   ${bar}`);
  }

  const energyNote = DEMO_ENERGY_RANKINGS
    .map((r) => {
      const dot = r.rank >= 4 ? "●" : r.rank <= 2 ? "○" : "·";
      return `${domainName(r.domain_index)}:${r.rank}${dot}`;
    })
    .join("  ");
  console.log(`\n  Energy rankings: ${energyNote}`);
  console.log(`  (● energizing ≥4, · neutral=3, ○ draining ≤2)\n`);

  sec("Done");
  console.log(`  Demo user ID:    ${userId}`);
  console.log(`  Email:           ${DEMO_EMAIL}`);
  console.log(`  Cells populated: ${cells.length}`);
  console.log(`  Log in as this user to view the lattice visualization.\n`);
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
