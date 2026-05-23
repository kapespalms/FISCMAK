#!/usr/bin/env node
/**
 * Apply FISCMAK Supabase migrations using DATABASE_URL / SESSION_POOLER_URL from .env.local
 * Usage: npm run db:migrate
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConnectionCandidates, connectPostgres, loadEnvLocal } from "./supabase-connection.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function tableExists(client, name) {
  const { rows } = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS ok`,
    [name],
  );
  return Boolean(rows[0]?.ok);
}

async function runSqlFile(client, relativePath, label) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  skip (missing file): ${relativePath}`);
    return { ok: false, skipped: true };
  }
  const sql = fs.readFileSync(fullPath, "utf8");
  console.log(`\n→ ${label}`);
  console.log(`  file: ${relativePath}`);
  try {
    await client.query(sql);
    console.log("  ✓ applied");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/already exists/i.test(msg)) {
      console.log(`  ~ already exists (${msg.split("\n")[0]})`);
      return { ok: true, partial: true };
    }
    console.error(`  ✗ failed: ${msg}`);
    return { ok: false, error: msg };
  }
}

const BACKFILL = `
INSERT INTO app_users (user_id, email, name)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
`;

const VERIFY_TABLES = [
  "app_users",
  "career_assessments",
  "chat_messages",
  "activity_entries",
  "physicians",
  "api_enrichment_runs",
  "reconciliation_items",
];

async function main() {
  loadEnvLocal();

  console.log("FISCMAK Supabase migrations");
  console.log(`Trying ${buildConnectionCandidates().length} connection option(s)…`);

  const client = await connectPostgres();

  const hasAppUsers = await tableExists(client, "app_users");
  const hasPhysicians = await tableExists(client, "physicians");
  const hasActivities = await tableExists(client, "activity_entries");

  console.log("\nCurrent state:");
  console.log(`  app_users: ${hasAppUsers ? "yes" : "no"}`);
  console.log(`  physicians (career data): ${hasPhysicians ? "yes" : "no"}`);
  console.log(`  activity_entries: ${hasActivities ? "yes" : "no"}`);

  const steps = [];

  if (!hasAppUsers) {
    steps.push({
      file: "docs/FISCMAK_V2_SCHEMA.sql",
      label: "V2 platform schema (app_users, assessments, jobs, chat…)",
    });
  } else {
    console.log("\n→ V2 platform schema — skipped (app_users exists)");
  }

  steps.push({
    file: "docs/migrations/20260521_touchpoint1_onboarding.sql",
    label: "Touchpoint 1 onboarding columns",
  });

  if (!hasActivities) {
    steps.push({
      file: "docs/migrations/20260522_activity_entries_v2.sql",
      label: "Activity entries (Mak capture + lattice)",
    });
  } else {
    console.log("\n→ Activity entries — skipped (table exists)");
  }

  if (!hasPhysicians) {
    steps.push({
      file: "docs/migrations/20260521_career_data_schema.sql",
      label: "Career Data vault schema (physicians, enrichment, reconciliation…)",
    });
  } else {
    console.log("\n→ Career Data schema — skipped (physicians exists)");
  }

  let failures = 0;
  for (const step of steps) {
    const result = await runSqlFile(client, step.file, step.label);
    if (!result.ok && !result.skipped) failures += 1;
  }

  if (await tableExists(client, "app_users")) {
    console.log("\n→ Backfill app_users from auth.users");
    try {
      await client.query(BACKFILL);
      console.log("  ✓ backfill complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ~ backfill skipped: ${msg.split("\n")[0]}`);
    }
  }

  console.log("\nVerification:");
  for (const t of VERIFY_TABLES) {
    const ok = await tableExists(client, t);
    console.log(`  ${ok ? "✓" : "✗"} ${t}`);
  }

  await client.end();

  if (failures > 0) {
    console.error(
      `\nCompleted with ${failures} failure(s). Check errors above or run SQL manually in Supabase SQL Editor.`,
    );
    process.exit(1);
  }

  console.log("\nDone. Restart `npm run dev` and sign in to use Supabase persistence.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
