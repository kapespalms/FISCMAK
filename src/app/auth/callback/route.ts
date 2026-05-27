import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";
import { sanitizeNextPath } from "@/lib/auth/oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

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

  if (searchParams.get("next") === "/reset-password") {
    return NextResponse.redirect(`${origin}/reset-password`);
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
      const onboardingTarget = next.startsWith("/app/onboarding") ? next : "/app/onboarding";
      return NextResponse.redirect(`${origin}${onboardingTarget}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
