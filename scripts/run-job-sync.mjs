#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./supabase-connection.mjs";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { runJobIngestion } = await import("../src/lib/v2/job-ingestion.ts");
const results = await runJobIngestion(supabase);
console.log(JSON.stringify(results, null, 2));
