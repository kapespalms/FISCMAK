import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getServerDemo } from "@/lib/v2/demo-store";
import { getAppUserServer } from "@/lib/v2/app-user-server";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { uhPsychAccessFromMetadata } from "@/lib/v2/programs/uh-program-access";

export type ServerSessionUser = {
  userId: string;
  email: string;
  demo: boolean;
};

export async function getServerSessionUser(): Promise<ServerSessionUser | null> {
  if (!isSupabaseConfigured()) {
    return { userId: "demo-user", email: "demo@fiscmak.app", demo: true };
  }
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { userId: user.id, email: user.email ?? "", demo: false };
}

/** Server-side UH Psychiatry program gate (matches UhProgramGate client logic). */
export async function userHasUhPsychProgramAccess(
  session?: ServerSessionUser | null,
): Promise<boolean> {
  const auth = session ?? (await getServerSessionUser());
  if (!auth) return false;
  const appUser = await getAppUserServer(auth.userId, auth.demo);
  if (!appUser) {
    if (auth.demo) {
      const demoUser = getServerDemo(auth.userId).user;
      return uhPsychAccessFromMetadata(getOnboardingMetadata(demoUser));
    }
    return false;
  }
  return uhPsychAccessFromMetadata(getOnboardingMetadata(appUser));
}
