/**
 * Urgent auth diagnostic + password reset. Never logs secrets or passwords.
 * Usage: node scripts/urgent-auth-fix.mjs [--reset]
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  const raw = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    env[t.slice(0, i)] = t.slice(i + 1).replace(/^["']|["']$/g, "");
  }
  return env;
}

const TARGET_EMAIL = "kristenpalmermd@gmail.com";
const NEW_PASSWORD = process.env.URGENT_AUTH_PASSWORD;

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const doReset = process.argv.includes("--reset");

async function main() {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    console.error("listUsers failed:", listErr.message);
    process.exit(1);
  }

  const user = list.users.find(
    (u) => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase(),
  );

  if (!user) {
    console.log("USER_EXISTS: false");
    console.log("ACTION: user must sign up at /signup first");
    process.exit(0);
  }

  console.log("USER_EXISTS: true");
  console.log("USER_ID:", user.id);
  console.log("EMAIL_CONFIRMED:", Boolean(user.email_confirmed_at));
  console.log("CONFIRMED_AT:", user.email_confirmed_at ?? "null");
  console.log("LAST_SIGN_IN:", user.last_sign_in_at ?? "never");
  console.log("BANNED:", Boolean(user.banned_until));

  if (doReset && !NEW_PASSWORD) {
    console.error("Set URGENT_AUTH_PASSWORD when using --reset");
    process.exit(1);
  }

  if (doReset) {
    const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
      password: NEW_PASSWORD,
      email_confirm: true,
    });
    if (updateErr) {
      console.error("PASSWORD_RESET: failed", updateErr.message);
      process.exit(1);
    }
    console.log("PASSWORD_RESET: ok");
    console.log("EMAIL_CONFIRMED: forced true");
  }

  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email: TARGET_EMAIL,
    password: NEW_PASSWORD,
  });

  if (signInErr) {
    console.log("SIGN_IN_TEST: failed");
    console.log("SIGN_IN_ERROR:", signInErr.message);
    process.exit(1);
  }

  console.log("SIGN_IN_TEST: ok");
  console.log("HAS_SESSION:", Boolean(signIn.session));
  console.log("SESSION_USER_ID:", signIn.user?.id ?? "null");

  if (signIn.session) {
    const { data: appRow, error: dbErr } = await admin
      .from("app_users")
      .select("user_id, tier1_complete")
      .eq("user_id", signIn.user.id)
      .maybeSingle();

    if (dbErr) {
      console.log("APP_USERS_CHECK: error", dbErr.message);
    } else {
      console.log("APP_USERS_EXISTS:", Boolean(appRow));
      console.log("TIER1_COMPLETE:", appRow?.tier1_complete ?? "n/a");
    }
  }
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
