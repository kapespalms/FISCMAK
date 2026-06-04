import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isKpAdminEmail } from "@/lib/v2/kp-admin";

const PROGRAM_STAFF_ROLES = [
  "program_director",
  "program_coordinator",
  "ccc_chair",
  "dio_viewer",
];

export default async function ProgramLayout({ children }: { children: React.ReactNode }) {
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

  const { data: membership } = await supabase
    .from("program_memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", PROGRAM_STAFF_ROLES)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/app/dashboard");
  }

  return <>{children}</>;
}
