#!/usr/bin/env node
/**
 * Generate program invite tokens (60 slots per program by default).
 * Usage:
 *   npm run db:invite-tokens
 *   npm run db:invite-tokens -- --program uh-psych-cmc --slots 60
 *   npm run db:invite-tokens -- --all
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectPostgres, loadEnvLocal } from "./supabase-connection.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const PROGRAMS = [
  {
    slug: "uh-psych-cmc",
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    slots: 60,
    rosterFile: "docs/seeds/psychiatry_uh_2026_2027_block_schedule.json",
  },
  {
    slug: "pathway-internal-medicine",
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    slots: 60,
  },
  {
    slug: "pathway-family-medicine",
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    slots: 60,
  },
  {
    slug: "pathway-pediatrics",
    id: "d4e5f6a7-b8c9-0123-def0-234567890123",
    slots: 60,
  },
  {
    slug: "pathway-surgery",
    id: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    slots: 60,
  },
];

function parseArgs(argv) {
  const out = { all: false, program: null, slots: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--all") out.all = true;
    if (argv[i] === "--program" && argv[i + 1]) out.program = argv[++i];
    if (argv[i] === "--slots" && argv[i + 1]) out.slots = Number(argv[++i]);
  }
  return out;
}

function makeToken() {
  return crypto.randomBytes(9).toString("base64url");
}

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
}

function loadRosterInitials(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return [];
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  return (data.trainee_roster ?? []).map((r) => String(r.initials).toUpperCase());
}

async function ensurePrograms(client) {
  for (const p of PROGRAMS) {
    await client.query(
      `INSERT INTO programs (program_id, slug, institution_name, program_name, specialty, content_tier, invite_slot_capacity, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       ON CONFLICT (slug) DO UPDATE SET invite_slot_capacity = EXCLUDED.invite_slot_capacity`,
      [
        p.id,
        p.slug,
        p.slug === "uh-psych-cmc"
          ? "University Hospitals Cleveland Medical Center"
          : "Academic Medical Center",
        p.slug === "uh-psych-cmc" ? "Psychiatry Residency" : p.slug.replace(/^pathway-/, "").replace(/-/g, " "),
        p.slug === "uh-psych-cmc" ? "Psychiatry" : "General",
        p.slug === "uh-psych-cmc" ? "full" : "blank",
        p.slots,
        JSON.stringify(
          p.slug === "uh-psych-cmc"
            ? { academic_year: "2026-2027" }
            : { pathway_type: "blank", document_seeds: [] },
        ),
      ],
    );
  }
}

async function generateForProgram(client, program, slotCount) {
  const roster = program.rosterFile ? loadRosterInitials(program.rosterFile) : [];
  const output = [];

  for (let slot = 1; slot <= slotCount; slot += 1) {
    const initials = roster[slot - 1] ?? null;
    const label = initials ? `Roster ${initials}` : `Resident slot ${slot}`;
    let token = makeToken();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await client.query(
          `INSERT INTO program_invite_tokens (token, program_id, slot_number, label, trainee_initials)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (program_id, slot_number) DO UPDATE SET
             label = EXCLUDED.label,
             trainee_initials = COALESCE(program_invite_tokens.trainee_initials, EXCLUDED.trainee_initials)`,
          [token, program.id, slot, label, initials],
        );
        break;
      } catch {
        token = makeToken();
      }
    }

    const { rows } = await client.query(
      `SELECT token, slot_number, label, trainee_initials, used_by IS NOT NULL AS used
       FROM program_invite_tokens WHERE program_id = $1 AND slot_number = $2`,
      [program.id, slot],
    );
    const row = rows[0];
    output.push({
      token: row.token,
      program_slug: program.slug,
      slot_number: row.slot_number,
      label: row.label,
      trainee_initials: row.trainee_initials,
      join_url: `${appUrl()}/join/${row.token}`,
      used: row.used,
    });
  }

  return output;
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  const targets = args.all
    ? PROGRAMS
    : PROGRAMS.filter((p) => p.slug === (args.program ?? "uh-psych-cmc"));

  if (targets.length === 0) {
    console.error("Unknown program. Use --program <slug> or --all");
    process.exit(1);
  }

  const client = await connectPostgres();
  await ensurePrograms(client);

  const allTokens = [];
  for (const program of targets) {
    const slots = args.slots ?? program.slots;
    console.log(`\n→ ${program.slug} (${slots} slots)`);
    const tokens = await generateForProgram(client, program, slots);
    allTokens.push(...tokens);
    const available = tokens.filter((t) => !t.used).length;
    console.log(`  ✓ ${tokens.length} tokens (${available} available)`);
    console.log(`  sample: ${tokens[0]?.join_url ?? "—"}`);
  }

  const exportPath = path.join(root, "docs/seeds/program_invite_tokens.json");
  fs.writeFileSync(
    exportPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        app_url: appUrl(),
        programs: PROGRAMS.map((p) => p.slug),
        tokens: allTokens.map(({ token, program_slug, slot_number, label, trainee_initials }) => ({
          token,
          program_slug,
          slot_number,
          label,
          trainee_initials,
        })),
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`\nExported ${allTokens.length} tokens → docs/seeds/program_invite_tokens.json`);
  await client.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
