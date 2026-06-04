import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isKpAdminEmail } from "@/lib/v2/kp-admin";
import { getProgramBySlug } from "@/lib/v2/programs/registry";
import { PageShell } from "@/components/layout/PageShell";
import { ProgramRosterPanel } from "@/components/program/ProgramRosterPanel";

const STAFF_ROLES = [
  "program_director",
  "program_coordinator",
  "ccc_chair",
  "dio_viewer",
];

const FALLBACK_PROGRAM_ID =
  getProgramBySlug("uh-psych-cmc")?.id ?? "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

async function resolveStaffProgramId(): Promise<string> {
  if (!isSupabaseConfigured()) return FALLBACK_PROGRAM_ID;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || isKpAdminEmail(user.email ?? "")) return FALLBACK_PROGRAM_ID;

  const { data } = await supabase
    .from("program_memberships")
    .select("program_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", STAFF_ROLES)
    .limit(1)
    .maybeSingle();

  return data?.program_id ?? FALLBACK_PROGRAM_ID;
}

export default async function ProgramPage() {
  const programId = await resolveStaffProgramId();

  return (
    <PageShell
      eyebrow="Program"
      title="Program Dashboard"
      subtitle="Resident roster and CCC preparation — formal training record only."
      maxWidth="xl"
    >
      <ProgramRosterPanel programId={programId} />
    </PageShell>
  );
}
