import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { NextResponse } from "next/server";

/** Clear Supabase session cookies on the server (required for SSR auth). */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    return NextResponse.json({ error: "sign_out_failed", message }, { status: 500 });
  }
}
