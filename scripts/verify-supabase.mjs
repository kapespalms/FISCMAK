#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

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

async function main() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing from .env.local");
    process.exit(1);
  }
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log("Supabase table check:\n");
  for (const t of TABLES) {
    const { rows } = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS ok`,
      [t],
    );
    console.log(`${rows[0]?.ok ? "✓" : "✗"} ${t}`);
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
