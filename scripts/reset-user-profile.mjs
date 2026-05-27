#!/usr/bin/env node
/**
 * Reset a FISCMAK account to a fresh state (no demo / seeded onboarding data).
 * Optionally re-release a UH roster invite token for institutional onboarding.
 *
 * Usage:
 *   node scripts/reset-user-profile.mjs --email kristenpalmermd@gmail.com --initials YD
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectPostgres, loadEnvLocal } from "./supabase-connection.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const tokenSeed = JSON.parse(
  fs.readFileSync(path.join(root, "docs/seeds/program_invite_tokens.json"), "utf8"),
);

function parseArgs(argv) {
  const out = { email: null, initials: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--email") out.email = argv[++i];
    else if (argv[i] === "--initials") out.initials = argv[++i]?.toUpperCase();
  }
  if (!out.email) {
    console.error(
      "Usage: node scripts/reset-user-profile.mjs --email you@example.com [--initials YD]",
    );
    process.exit(1);
  }
  return out;
}

function inviteTokenForInitials(initials) {
  return (
    tokenSeed.tokens.find((t) => t.trainee_initials?.toUpperCase() === initials)?.token ?? null
  );
}

async function deleteUserRows(client, table, userId, column = "user_id") {
  try {
    const result = await client.query(
      `DELETE FROM ${table} WHERE ${column} = $1`,
      [userId],
    );
    return result.rowCount ?? 0;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/relation .* does not exist|column .* does not exist/i.test(msg)) return 0;
    throw new Error(`${table}.${column}: ${msg}`);
  }
}

async function deleteBySubquery(client, table, sql, params, label = table) {
  try {
    const result = await client.query(`DELETE FROM ${table} WHERE ${sql}`, params);
    return result.rowCount ?? 0;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/relation .* does not exist|column .* does not exist/i.test(msg)) return 0;
    throw new Error(`${label}: ${msg}`);
  }
}

async function deleteDossierChildren(client, userId) {
  try {
    const result = await client.query(
      `DELETE FROM narrative_progress
       WHERE dossier_id IN (SELECT dossier_id FROM promotion_dossier WHERE user_id = $1)`,
      [userId],
    );
    return result.rowCount ?? 0;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/relation .* does not exist|column .* does not exist/i.test(msg)) return 0;
    throw err;
  }
}

async function main() {
  const { email, initials } = parseArgs(process.argv);
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
  const displayEmail = auth.rows[0].email ?? email;

  const inviteToken = initials ? inviteTokenForInitials(initials) : null;
  if (initials && !inviteToken) {
    throw new Error(`No invite token found for roster initials ${initials}.`);
  }

  const tables = [
    "chat_messages",
    "career_assessments",
    "documents",
    "activity_entries",
    "career_goals",
    "mempalace_exports",
    "user_job_matches",
    "generated_documents",
    "evidence_items",
    "lattice_cells",
    "lattice_snapshots",
    "career_patterns",
    "career_signals",
    "lattice_cell_events",
    "identity_trajectory",
    "energy_signals",
    "mak_insights",
    "mak_action_items",
    "export_jobs",
    "output_templates_user_uploaded",
    "document_versions",
    "evidence_links",
    "uploaded_documents",
    "classification_overrides",
    "next_steps",
    "program_memberships",
  ];

  const deleted = {};
  deleted.narrative_progress = await deleteDossierChildren(client, userId);
  deleted.promotion_dossier = await deleteUserRows(client, "promotion_dossier", userId);
  deleted.mak_messages = await deleteBySubquery(
    client,
    "mak_messages",
    "conversation_id IN (SELECT id FROM mak_conversations WHERE user_id = $1)",
    [userId],
  );
  deleted.mak_conversations = await deleteUserRows(client, "mak_conversations", userId);
  deleted.career_aspirations = await deleteUserRows(
    client,
    "career_aspirations",
    userId,
    "physician_id",
  );

  for (const table of tables) {
    deleted[table] = await deleteUserRows(client, table, userId);
  }

  deleted.physician_profiles = await deleteUserRows(
    client,
    "physician_profiles",
    userId,
    "physician_id",
  );

  const releasedTokens = await client.query(
    `UPDATE program_invite_tokens
     SET used_by = NULL, used_at = NULL
     WHERE used_by = $1`,
    [userId],
  );

  await client.query(
    `UPDATE user_settings
     SET goals = '[]'::jsonb,
         salary_expectations = '{}'::jsonb,
         notification_preferences = '{}'::jsonb,
         data_sharing = '{}'::jsonb,
         updated_at = now()
     WHERE user_id = $1`,
    [userId],
  );

  const defaultName = displayEmail
    .split("@")[0]
    .replace(/\./g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  await client.query(
    `UPDATE app_users SET
      email = $2,
      name = $3,
      specialty = NULL,
      base_specialty = NULL,
      subspecialty = NULL,
      subspecialty_training_complete = false,
      career_stage = NULL,
      practice_setting = NULL,
      academic_rank = NULL,
      primary_career_track = NULL,
      institution = NULL,
      cv_uploaded = false,
      mempalace_id = NULL,
      tier1_complete = false,
      tier2_complete = false,
      tier3_complete = false,
      pgy_level = NULL,
      current_rotation = NULL,
      specialty_origin = NULL,
      content_pack = NULL,
      primary_program_id = NULL,
      preferred_location = NULL,
      salary_min = NULL,
      salary_max = NULL,
      onboarding_metadata = '{}'::jsonb,
      last_active = now()
    WHERE user_id = $1`,
    [userId, displayEmail, defaultName],
  );

  const missing = await client.query("SELECT 1 FROM app_users WHERE user_id = $1", [userId]);
  if (!missing.rows[0]) {
    await client.query(
      `INSERT INTO app_users (user_id, email, name, onboarding_metadata)
       VALUES ($1, $2, $3, '{}'::jsonb)`,
      [userId, displayEmail, defaultName],
    );
    await client.query(
      `INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [userId],
    );
  }

  await client.end();

  const joinPath = inviteToken
    ? `http://127.0.0.1:3000/join/${inviteToken}`
    : "http://127.0.0.1:3000/join/uh/psychiatry";
  const onboardingPath = inviteToken
    ? `http://127.0.0.1:3000/app/onboarding?token=${encodeURIComponent(inviteToken)}`
    : "http://127.0.0.1:3000/app/onboarding?program=uh-psych-cmc";

  console.log(`\nReset profile for ${displayEmail}`);
  console.log(`  User ID:              ${userId}`);
  console.log(`  Invite tokens freed:  ${releasedTokens.rowCount ?? 0}`);
  if (initials) {
    console.log(`  Roster slot:          ${initials}${inviteToken ? ` · token ${inviteToken}` : ""}`);
  }
  console.log("\n  Cleared rows:");
  for (const [table, count] of Object.entries(deleted)) {
    if (count > 0) console.log(`    ${table}: ${count}`);
  }
  console.log("\n  Next steps (UH institutional onboarding):");
  console.log(`    1. Sign in as ${displayEmail}`);
  console.log(`    2. Open ${joinPath}`);
  console.log(`       or go directly to ${onboardingPath}`);
  console.log("    3. Complete onboarding from scratch — no tiers pre-filled.\n");
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
