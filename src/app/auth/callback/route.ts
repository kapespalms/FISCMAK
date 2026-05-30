import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";
import { sanitizeNextPath } from "@/lib/auth/oauth";
import { resolvePostLoginPath } from "@/lib/v2/onboarding-progress";
import type { AppUser } from "@/lib/v2/types";
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
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (appUser) {
      const target = resolvePostLoginPath(appUser as AppUser, next);
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
