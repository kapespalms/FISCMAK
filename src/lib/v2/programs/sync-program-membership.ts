import { createClient } from "@/lib/supabase/server";
import type { ProgramMembershipRecord } from "@/lib/v2/programs/program-membership";

/** Persist program_memberships row when Supabase is available (demo stores metadata only). */
export async function syncProgramMembership(input: {
  demo: boolean;
  userId: string;
  membership: ProgramMembershipRecord;
}): Promise<void> {
  if (input.demo) return;

  const supabase = await createClient();
  const { error } = await supabase.from("program_memberships").upsert(
    {
      membership_id: input.membership.membership_id,
      program_id: input.membership.program_id,
      user_id: input.membership.user_id,
      role: input.membership.role,
      pgy_level: input.membership.pgy_level,
      active: input.membership.active,
      created_at: input.membership.created_at,
    },
    { onConflict: "program_id,user_id" },
  );

  if (error) {
    console.warn("[syncProgramMembership]", error.message);
  }
}
