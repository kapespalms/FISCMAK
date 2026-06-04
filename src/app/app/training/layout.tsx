import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isKpAdminEmail } from "@/lib/v2/kp-admin";

export default async function TrainingLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (isKpAdminEmail(user.email ?? "")) {
    return <>{children}</>;
  }

  // Allow if the user has a trainee program membership…
  const { data: membership } = await supabase
    .from("program_memberships")
    .select("membership_id")
    .eq("user_id", user.id)
    .eq("role", "trainee")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (membership) {
    return <>{children}</>;
  }

  // …or a primary_program_id set on their profile (invite-join path)
  const { data: appUser } = await supabase
    .from("app_users")
    .select("primary_program_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (appUser?.primary_program_id) {
    return <>{children}</>;
  }

  redirect("/app/dashboard");
}
