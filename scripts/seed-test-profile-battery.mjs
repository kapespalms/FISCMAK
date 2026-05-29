#!/usr/bin/env node
/**
 * Provision FISCMAK test profile battery (auth + app_users).
 *
 * Usage:
 *   FISCMAK_TEST_PASSWORD='…' node scripts/seed-test-profile-battery.mjs --all
 *   FISCMAK_TEST_PASSWORD='…' node scripts/seed-test-profile-battery.mjs --username TESTGEN2
 *   node scripts/seed-test-profile-battery.mjs --all --dry-run
 *
 * Password is read from FISCMAK_TEST_PASSWORD (never committed). See docs/seeds/FISCMAK_TEST_PROFILE_BATTERY.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./supabase-connection.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const battery = JSON.parse(
  fs.readFileSync(path.join(root, "docs/seeds/test_profile_battery.json"), "utf8"),
);

const PROGRAM_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const PROGRAM_SLUG = "uh-psych-cmc";

function parseArgs(argv) {
  const out = { all: false, username: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--all") out.all = true;
    else if (argv[i] === "--username") out.username = argv[++i]?.toUpperCase();
    else if (argv[i] === "--dry-run") out.dryRun = true;
  }
  if (!out.all && !out.username) {
    console.error(
      "Usage: FISCMAK_TEST_PASSWORD='…' node scripts/seed-test-profile-battery.mjs --all | --username TESTGEN2 [--dry-run]",
    );
    process.exit(1);
  }
  return out;
}

function emailFor(username) {
  return `${username.toLowerCase()}@${battery.email_domain}`;
}

function contentPackFor(careerStage) {
  if (careerStage === "Medical Student" || careerStage === "Resident" || careerStage === "Fellow") {
    return "trainee";
  }
  if (careerStage === "Early Career (0–7 yr)") return "early_attending";
  return "default";
}

function displayName(username, formalLabel) {
  return `${username} — ${formalLabel.split(",")[0]}`;
}

function specialtyOrigin(profile, baseSpecialty) {
  return `Test profile ${profile.username}: exploring ${baseSpecialty} with FISCMAK pathway QA.`;
}

function buildOnboardingMetadata(profile, group, userId, now) {
  const meta = {
    onboarding_path: group.onboarding_path,
    test_profile_username: profile.username,
    test_profile_group: profile.group,
    test_profile_training_level: profile.training_level,
    test_profile_interpretation: profile.interpretation,
    computed_at: now,
  };

  if (profile.group === "institutional") {
    Object.assign(meta, {
      program_id: PROGRAM_ID,
      program_slug: PROGRAM_SLUG,
      program_membership:
        profile.career_stage === "Resident" || profile.career_stage === "Fellow"
          ? {
              membership_id: crypto.randomUUID(),
              program_id: PROGRAM_ID,
              user_id: userId,
              role: "trainee",
              pgy_level: profile.pgy_level ?? null,
              active: true,
              created_at: now,
            }
          : undefined,
      evaluation_framework:
        profile.career_stage === "Resident" || profile.career_stage === "Fellow"
          ? {
              primary_slug: "psychiatry",
              primary_name: "Psychiatry",
              subspecialty: profile.subspecialty ?? null,
              milestone_status: "active",
              milestone_version: "v2",
              universal_competency_keys: ["patient_care", "medical_knowledge", "practice_based_learning"],
              subcompetency_ids: [],
              mapping_notes: [`Seeded from test profile battery (${profile.username}).`],
            }
          : undefined,
    });
  }

  if (profile.training_level.startsWith("MS")) {
    meta.ms_year = profile.training_level === "MS3" ? 3 : 4;
  }

  return meta;
}

function resolveProfile(profile) {
  const group = battery.groups[profile.group];
  const baseSpecialty =
    profile.base_specialty ?? group.base_specialty ?? "Internal Medicine";
  const practiceSetting = group.practice_setting ?? "Academic";
  const institution =
    profile.group === "institutional" ? group.institution : null;

  return {
    email: emailFor(profile.username),
    name: displayName(profile.username, profile.formal_label),
    specialty: profile.subspecialty ?? baseSpecialty,
    base_specialty: baseSpecialty,
    subspecialty: profile.subspecialty ?? null,
    career_stage: profile.career_stage,
    practice_setting: practiceSetting,
    institution,
    pgy_level: profile.pgy_level ?? null,
    current_rotation: profile.current_rotation ?? null,
    primary_program_id: profile.group === "institutional" ? PROGRAM_ID : null,
    content_pack: contentPackFor(profile.career_stage),
    primary_career_track: "Clinician",
    specialty_origin: specialtyOrigin(profile, baseSpecialty),
  };
}

async function upsertAuthUser(admin, email, password, username, dryRun) {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw new Error(`listUsers: ${listErr.message}`);

  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (dryRun) {
    return { userId: existing?.id ?? "(new)", created: !existing };
  }

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { test_profile_username: username },
    });
    if (error) throw new Error(`updateUser ${email}: ${error.message}`);
    return { userId: existing.id, created: false };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { test_profile_username: username },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return { userId: data.user.id, created: true };
}

async function upsertAppUser(client, userId, profile, resolved, dryRun) {
  const now = new Date().toISOString();
  const group = battery.groups[profile.group];
  const onboardingMetadata = buildOnboardingMetadata(profile, group, userId, now);

  if (dryRun) {
    console.log(`  [dry-run] app_users ${resolved.email} · ${profile.career_stage} · ${profile.training_level}`);
    return;
  }

  await client.query("BEGIN");

  await client.query(
    `INSERT INTO app_users (
      user_id, email, name, specialty, base_specialty, subspecialty, subspecialty_training_complete,
      career_stage, practice_setting, academic_rank, primary_career_track,
      institution, cv_uploaded, tier1_complete, tier2_complete, tier3_complete,
      pgy_level, current_rotation, specialty_origin, content_pack, primary_program_id,
      onboarding_metadata, created_at, last_active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, NULL, $10,
      $11, false, true, false, false,
      $12, $13, $14, $15, $16::uuid,
      $17::jsonb, now(), now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      specialty = EXCLUDED.specialty,
      base_specialty = EXCLUDED.base_specialty,
      subspecialty = EXCLUDED.subspecialty,
      career_stage = EXCLUDED.career_stage,
      practice_setting = EXCLUDED.practice_setting,
      primary_career_track = EXCLUDED.primary_career_track,
      institution = EXCLUDED.institution,
      tier1_complete = EXCLUDED.tier1_complete,
      pgy_level = EXCLUDED.pgy_level,
      current_rotation = EXCLUDED.current_rotation,
      specialty_origin = EXCLUDED.specialty_origin,
      content_pack = EXCLUDED.content_pack,
      primary_program_id = EXCLUDED.primary_program_id,
      onboarding_metadata = EXCLUDED.onboarding_metadata,
      last_active = now()`,
    [
      userId,
      resolved.email,
      resolved.name,
      resolved.specialty,
      resolved.base_specialty,
      resolved.subspecialty,
      Boolean(resolved.subspecialty),
      resolved.career_stage,
      resolved.practice_setting,
      resolved.primary_career_track,
      resolved.institution,
      resolved.pgy_level,
      resolved.current_rotation,
      resolved.specialty_origin,
      resolved.content_pack,
      resolved.primary_program_id,
      JSON.stringify(onboardingMetadata),
    ],
  );

  if (
    profile.group === "institutional" &&
    (profile.career_stage === "Resident" || profile.career_stage === "Fellow") &&
    onboardingMetadata.program_membership
  ) {
    const membership = onboardingMetadata.program_membership;
    await client.query(
      `INSERT INTO program_memberships (membership_id, program_id, user_id, role, pgy_level, active, created_at)
       VALUES ($1, $2::uuid, $3, 'trainee', $4, true, now())
       ON CONFLICT (program_id, user_id) DO UPDATE SET
         pgy_level = EXCLUDED.pgy_level,
         role = EXCLUDED.role,
         active = true`,
      [membership.membership_id, PROGRAM_ID, userId, resolved.pgy_level],
    );
  }

  await client.query("COMMIT");
}

async function main() {
  const { all, username, dryRun } = parseArgs(process.argv);
  loadEnvLocal();
  const password = process.env.FISCMAK_TEST_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  if (!dryRun && !password) {
    console.error("Set FISCMAK_TEST_PASSWORD in the environment (see docs/seeds/FISCMAK_TEST_PROFILE_BATTERY.md).");
    process.exit(1);
  }

  const profiles = all
    ? battery.profiles
    : battery.profiles.filter((p) => p.username === username);
  if (!profiles.length) {
    throw new Error(`Unknown username ${username}`);
  }

  const admin = dryRun
    ? null
    : createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

  const { connectPostgres } = await import("./supabase-connection.mjs");
  const pg = dryRun ? null : await connectPostgres();

  console.log(`\nFISCMAK test profile battery — ${profiles.length} profile(s)${dryRun ? " (dry run)" : ""}\n`);

  for (const profile of profiles) {
    const resolved = resolveProfile(profile);
    console.log(`${profile.username} → ${resolved.email}`);
    if (dryRun) {
      console.log(`  [dry-run] ${profile.formal_label} · ${profile.career_stage} · ${profile.interpretation.slice(0, 60)}…`);
      continue;
    }
    const { userId, created } = await upsertAuthUser(
      admin,
      resolved.email,
      password ?? "dry-run",
      profile.username,
      dryRun,
    );
    if (pg) {
      await upsertAppUser(pg, userId, profile, resolved, dryRun);
    }
    console.log(`  ${created ? "Created" : "Updated"} auth + app profile · ${profile.formal_label}`);
  }

  if (pg) await pg.end();

  console.log("\nSign in at /login with the test email + FISCMAK_TEST_PASSWORD.\n");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
