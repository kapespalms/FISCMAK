#!/usr/bin/env node
import { connectPostgres, loadEnvLocal } from "./supabase-connection.mjs";

const TABLES = [
  "app_users",
  "career_assessments",
  "documents",
  "chat_messages",
  "activity_entries",
  "physicians",
  "publications",
  "api_enrichment_runs",
  "reconciliation_items",
  "mempalace_exports",
];

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

async function main() {
  loadEnvLocal();
  const client = await connectPostgres();

  console.log("\nSupabase table check:\n");
  for (const t of TABLES) {
    const ok = await tableExists(client, t);
    console.log(`${ok ? "✓" : "✗"} ${t}`);
  }

  if (await tableExists(client, "app_users")) {
    const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM app_users");
    console.log(`\napp_users rows: ${rows[0]?.n ?? 0}`);
  }
  if (await tableExists(client, "activity_entries")) {
    const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM activity_entries");
    console.log(`activity_entries rows: ${rows[0]?.n ?? 0}`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
