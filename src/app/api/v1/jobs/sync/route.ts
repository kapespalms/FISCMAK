import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runJobIngestion } from "@/lib/v2/job-ingestion";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Sync curated (+ partner when configured) job feeds into the jobs table. */
export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const results = await runJobIngestion(supabase);
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    console.error("Job sync failed:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Job sync failed" },
      { status: 500 },
    );
  }
}
