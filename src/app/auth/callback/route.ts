import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await ensureAppUser(supabase, user);
    } catch {
      /* DB trigger may have created the row */
    }

    const { data: appUser } = await supabase
      .from("app_users")
      .select("tier1_complete")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!appUser?.tier1_complete) {
      return NextResponse.redirect(`${origin}/app/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
