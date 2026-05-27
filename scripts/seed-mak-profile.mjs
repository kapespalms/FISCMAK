#!/usr/bin/env node
/**
 * Seed a FISCMAK app_users profile from a UH Psychiatry roster slot.
 *
 * Usage:
 *   node scripts/seed-mak-profile.mjs --email kristenpalmermd@gmail.com --initials YD
 *   node scripts/seed-mak-profile.mjs --email demo@example.com --initials AG --name "Alex Garcia"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { connectPostgres, loadEnvLocal } from "./supabase-connection.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROGRAM_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const PROGRAM_SLUG = "uh-psych-cmc";
const INSTITUTION = "University Hospitals Cleveland Medical Center";

const schedule = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs/seeds/psychiatry_uh_2026_2027_block_schedule.json"),
    "utf8",
  ),
);

const tokenSeed = JSON.parse(
  fs.readFileSync(path.join(root, "docs/seeds/program_invite_tokens.json"), "utf8"),
);

function parseArgs(argv) {
  const out = { email: null, initials: null, name: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--email") out.email = argv[++i];
    else if (argv[i] === "--initials") out.initials = argv[++i]?.toUpperCase();
    else if (argv[i] === "--name") out.name = argv[++i];
  }
  if (!out.email || !out.initials) {
    console.error(
      "Usage: node scripts/seed-mak-profile.mjs --email you@example.com --initials YD [--name \"Full Name\"]",
    );
    process.exit(1);
  }
  return out;
}

function rosterPgy(initials) {
  return (
    schedule.trainee_roster.find((r) => r.initials.toUpperCase() === initials)?.pgy_level ??
    null
  );
}

function firstRotationLabel(initials) {
  const row = schedule.trainee_block_assignments.find(
    (a) => a.trainee_initials.toUpperCase() === initials,
  );
  if (!row) return "Orientation";
  const labels = {
    va_ct6: "VA CT6 (Inpatient)",
    uh_concord: "UH Concord (Inpatient)",
    swg: "SWG (Inpatient)",
    psych_ed_uh: "Psychiatric Emergency — UH",
    uh_ed: "UH Emergency Department",
    uh_interventional: "UH Interventional Psychiatry",
    cl: "Consult-Liaison Psychiatry",
    outpatient_adult: "Outpatient Adult Clinics",
  };
  return labels[row.rotation_code] ?? row.rotation_code.replace(/_/g, " ");
}

function inviteTokenForInitials(initials) {
  return (
    tokenSeed.tokens.find(
      (t) =>
        t.program_slug === PROGRAM_SLUG &&
        t.trainee_initials?.toUpperCase() === initials,
    ) ?? null
  );
}

function instrumentAnswers(now) {
  const t = now;
  return [
    { clusterId: "pfi-fulfillment", value: 3, capturedAt: t },
    { clusterId: "pfi-burnout-exhaustion", value: 2, capturedAt: t },
    { clusterId: "pfi-burnout-disengagement", value: 1, capturedAt: t },
    { clusterId: "pfi-self-valuation", value: 3, capturedAt: t },
    { clusterId: "bits-unnecessary", value: 2.5, capturedAt: t },
    { clusterId: "bits-unreasonable", value: 2, capturedAt: t },
    { clusterId: "career-track-energy", value: 7, capturedAt: t },
    {
      clusterId: "career-5yr-goal",
      value: "Build strong inpatient psychiatry skills and clarify fellowship vs. community practice path.",
      capturedAt: t,
    },
    { clusterId: "pif-stage", value: 3, capturedAt: t },
    { clusterId: "uwes-engagement", value: 4, capturedAt: t },
    { clusterId: "iw-hours", value: 8, capturedAt: t },
  ];
}

function touchpointOneAnswers() {
  return [
    { q_id: "Q1.1", answer: "Resident", confidence: "high" },
    { q_id: "Q1.2", answer: "Clinical Excellence", confidence: "high" },
    {
      q_id: "Q1.3",
      answer: "Psychiatry resident building clinical depth across inpatient and emergency settings.",
      confidence: "high",
    },
    {
      q_id: "Q1.4",
      answer: "Excel on inpatient rotations and develop a clear post-residency practice direction.",
      confidence: "high",
    },
    { q_id: "Q1.5", answer: 4, confidence: "high" },
    { q_id: "Q1.6", answer: "Clinical", confidence: "high" },
    { q_id: "Q1.7", answer: "Yes", confidence: "high" },
    { q_id: "Q1.8", answer: 3, confidence: "medium" },
  ];
}

async function main() {
  const { email, initials, name: nameArg } = parseArgs(process.argv);
  loadEnvLocal();
  const client = await connectPostgres();

  const auth = await client.query(
    "SELECT id, email FROM auth.users WHERE lower(email) = lower($1)",
    [email],
  );
  if (!auth.rows[0]) {
    throw new Error(`No auth.users row for ${email}. Sign up first.`);
  }
  const userId = auth.rows[0].id;

  const pgy = rosterPgy(initials);
  if (!pgy) {
    throw new Error(`Initials ${initials} not found on UH Psychiatry roster.`);
  }

  const rotation = firstRotationLabel(initials);
  const invite = inviteTokenForInitials(initials);
  const now = new Date().toISOString();
  const displayName =
    nameArg ??
    email
      .split("@")[0]
      .replace(/\./g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const specialtyOrigin =
    "I was drawn to psychiatry because the work sits at the intersection of neuroscience, relationships, and social context — and inpatient psychiatry makes that complexity visible every day.";

  const membershipId = crypto.randomUUID();
  const instrumentIds = [
    "pfi",
    "career_aspirations",
    "pif",
    "bits",
    "uwes",
    "invisible_work",
  ];

  const onboardingMetadata = {
    onboarding_path: "institutional",
    program_id: PROGRAM_ID,
    program_slug: PROGRAM_SLUG,
    trainee_initials: initials,
    invite_token: invite?.token ?? null,
    invite_slot_number: invite?.slot_number ?? null,
    program_membership: {
      membership_id: membershipId,
      program_id: PROGRAM_ID,
      user_id: userId,
      role: "trainee",
      pgy_level: pgy,
      active: true,
      created_at: now,
    },
    instrument_ids: instrumentIds,
    instrument_answers: instrumentAnswers(now),
    api_enrichment_plan: {
      pubmed_icite: true,
      openalex: true,
      nih_reporter: false,
      nppes: true,
      cms_medicare: true,
      cms_open_payments: true,
      orcid: true,
    },
    evaluation_framework: {
      primary_slug: "psychiatry",
      primary_name: "Psychiatry",
      subspecialty: null,
      milestone_status: "active",
      milestone_version: "v2",
      universal_competency_keys: ["patient_care", "medical_knowledge", "practice_based_learning"],
      subcompetency_ids: [],
      mapping_notes: ["Seeded from UH Psychiatry roster profile."],
    },
    narrative_anchor: {
      target_specialty: "Psychiatry",
      origin_story: specialtyOrigin,
      captured_at: now,
    },
    career_objective:
      "Build inpatient psychiatry competence and capture rotation evidence for ILP and CCC narrative.",
    goals_confirmed: true,
    goals_confirmed_at: now,
    computed_at: now,
    reconciliation: [],
  };

  await client.query("BEGIN");

  await client.query(
    `INSERT INTO app_users (
      user_id, email, name, specialty, base_specialty, subspecialty, subspecialty_training_complete,
      career_stage, practice_setting, academic_rank, primary_career_track,
      institution, cv_uploaded, tier1_complete, tier2_complete, tier3_complete,
      pgy_level, current_rotation, specialty_origin, content_pack, primary_program_id,
      onboarding_metadata, created_at, last_active
    ) VALUES (
      $1, $2, $3, 'Psychiatry', 'Psychiatry', NULL, false,
      'Resident', 'Academic', NULL, 'Clinician',
      $4, false, true, true, true,
      $5, $6, $7, 'trainee', $8::uuid,
      $9::jsonb, COALESCE((SELECT created_at FROM app_users WHERE user_id = $1), now()), now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      specialty = EXCLUDED.specialty,
      base_specialty = EXCLUDED.base_specialty,
      subspecialty = EXCLUDED.subspecialty,
      subspecialty_training_complete = EXCLUDED.subspecialty_training_complete,
      career_stage = EXCLUDED.career_stage,
      practice_setting = EXCLUDED.practice_setting,
      academic_rank = EXCLUDED.academic_rank,
      primary_career_track = EXCLUDED.primary_career_track,
      institution = EXCLUDED.institution,
      tier1_complete = EXCLUDED.tier1_complete,
      tier2_complete = EXCLUDED.tier2_complete,
      tier3_complete = EXCLUDED.tier3_complete,
      pgy_level = EXCLUDED.pgy_level,
      current_rotation = EXCLUDED.current_rotation,
      specialty_origin = EXCLUDED.specialty_origin,
      content_pack = EXCLUDED.content_pack,
      primary_program_id = EXCLUDED.primary_program_id,
      onboarding_metadata = EXCLUDED.onboarding_metadata,
      last_active = now()`,
    [
      userId,
      email,
      displayName,
      INSTITUTION,
      pgy,
      rotation,
      specialtyOrigin,
      PROGRAM_ID,
      JSON.stringify(onboardingMetadata),
    ],
  );

  await client.query(
    `INSERT INTO program_memberships (membership_id, program_id, user_id, role, pgy_level, active, created_at)
     VALUES ($1, $2::uuid, $3, 'trainee', $4, true, now())
     ON CONFLICT (program_id, user_id) DO UPDATE SET
       pgy_level = EXCLUDED.pgy_level,
       active = true`,
    [membershipId, PROGRAM_ID, userId, pgy],
  );

  if (invite?.token) {
    await client.query(
      `UPDATE program_invite_tokens
       SET used_by = $1, used_at = now()
       WHERE token = $2 AND (used_by IS NULL OR used_by = $1)`,
      [userId, invite.token],
    );
  }

  await client.query(
    `DELETE FROM career_assessments WHERE user_id = $1 AND touchpoint_number = 1`,
    [userId],
  );

  await client.query(
    `INSERT INTO career_assessments (
      assessment_id, user_id, touchpoint_number, question_category,
      questions_answered, score, completed_at, created_at
    ) VALUES ($1, $2, 1, 'INTRO', $3::jsonb, NULL, now(), now())`,
    [crypto.randomUUID(), userId, JSON.stringify(touchpointOneAnswers())],
  );

  await client.query("COMMIT");
  await client.end();

  console.log(`\nSeeded Mak profile for ${email}`);
  console.log(`  User ID:     ${userId}`);
  console.log(`  Name:        ${displayName}`);
  console.log(`  Program:     UH Psychiatry (${PROGRAM_SLUG})`);
  console.log(`  Roster:      ${initials} · ${pgy}`);
  console.log(`  Rotation:    ${rotation}`);
  if (invite?.token) {
    console.log(`  Invite:      ${invite.token} (slot ${invite.slot_number})`);
  }
  console.log(`  Onboarding:  tier1/2/3 complete — dashboard ready\n`);
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
