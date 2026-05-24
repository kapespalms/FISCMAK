import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const POOLER_PREFIXES = ["aws-1", "aws-0"];
const POOLER_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ca-central-1",
  "sa-east-1",
];

export function loadEnvLocal() {
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

function projectRefFromEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const match = url?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

function passwordFromUrl(urlString) {
  try {
    const u = new URL(urlString);
    return u.password ? decodeURIComponent(u.password) : null;
  } catch {
    return null;
  }
}

/** Prefer session pooler for migrations; fall back through env vars and region guesses. */
export function buildConnectionCandidates() {
  const candidates = [];
  const seen = new Set();

  function add(url, label) {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push({ url, label });
  }

  for (const key of ["SESSION_POOLER_URL", "DIRECT_URL", "DATABASE_URL"]) {
    if (process.env[key]) add(process.env[key], key);
  }

  const ref = projectRefFromEnv();
  const password =
    passwordFromUrl(process.env.SESSION_POOLER_URL ?? "") ??
    passwordFromUrl(process.env.DIRECT_URL ?? "") ??
    passwordFromUrl(process.env.DATABASE_URL ?? "");

  if (ref && password && !/^\[?YOUR-PASSWORD\]?$/i.test(password)) {
    for (const prefix of POOLER_PREFIXES) {
      for (const region of POOLER_REGIONS) {
        add(
          `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${prefix}-${region}.pooler.supabase.com:5432/postgres`,
          `session pooler (${prefix}-${region})`,
        );
      }
    }
    add(
      `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${POOLER_REGIONS[0]}.pooler.supabase.com:6543/postgres`,
      "transaction pooler (6543)",
    );
  }

  return candidates;
}

export async function connectPostgres({ verbose = true } = {}) {
  const candidates = buildConnectionCandidates();
  if (candidates.length === 0) {
    throw new Error(
      "No DATABASE_URL in .env.local. Copy Session pooler URI from Supabase Dashboard → Connect.",
    );
  }

  let lastError = null;
  for (const candidate of candidates) {
    const client = new pg.Client({
      connectionString: candidate.url,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      if (verbose) console.log(`Connected via ${candidate.label}`);
      return client;
    } catch (err) {
      lastError = err;
      if (verbose) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  × ${candidate.label}: ${msg.split("\n")[0]}`);
      }
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }

  const ipv4Hint =
    lastError instanceof Error &&
    (/ENOTFOUND.*db\./i.test(lastError.message) ||
      /Tenant or user not found/i.test(lastError.message))
      ? [
          "",
          "IPv4 network detected — direct host db.[ref].supabase.co often does not resolve.",
          "In Supabase Dashboard → Connect, open the **Session pooler** tab (port 5432),",
          "copy that URI into .env.local as SESSION_POOLER_URL, then re-run npm run db:migrate.",
          "Do not use the direct connection string on IPv4-only networks.",
        ].join("\n")
      : "";

  throw lastError instanceof Error
    ? new Error(
        lastError.message +
          (ipv4Hint ||
            "\nSet SESSION_POOLER_URL from Supabase Dashboard → Connect → Session mode."),
      )
    : new Error(
        "Could not connect. Set SESSION_POOLER_URL from Supabase Dashboard → Connect → Session mode.",
      );
}
