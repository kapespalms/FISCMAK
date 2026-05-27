#!/usr/bin/env node
/**
 * Confirm a Supabase auth user for local dev (skip email confirmation).
 *
 * Usage:
 *   node scripts/confirm-auth-user.mjs --email kristenpalmermd@gmail.com
 */
import { connectPostgres, loadEnvLocal } from "./supabase-connection.mjs";

function parseArgs(argv) {
  let email = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--email") email = argv[++i];
  }
  if (!email) {
    console.error("Usage: node scripts/confirm-auth-user.mjs --email you@example.com");
    process.exit(1);
  }
  return email;
}

async function main() {
  const email = parseArgs(process.argv);
  loadEnvLocal();
  const client = await connectPostgres();

  const before = await client.query(
    `SELECT id, email, email_confirmed_at
     FROM auth.users WHERE lower(email) = lower($1)`,
    [email],
  );
  if (!before.rows[0]) {
    throw new Error(`No auth.users row for ${email}. Sign up first.`);
  }

  await client.query(
    `UPDATE auth.users
     SET email_confirmed_at = COALESCE(email_confirmed_at, now())
     WHERE lower(email) = lower($1)`,
    [email],
  );

  const after = await client.query(
    `SELECT id, email, email_confirmed_at FROM auth.users WHERE lower(email) = lower($1)`,
    [email],
  );

  await client.end();

  console.log(`\nConfirmed ${after.rows[0].email}`);
  console.log(`  User ID:             ${after.rows[0].id}`);
  console.log(`  email_confirmed_at:  ${after.rows[0].email_confirmed_at}`);
  console.log("\nYou can sign in at /login now.\n");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
