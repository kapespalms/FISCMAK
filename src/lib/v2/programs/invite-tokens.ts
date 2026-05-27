import tokenSeed from "../../../../docs/seeds/program_invite_tokens.json";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getProgramById, getProgramBySlug, type ResidencyProgram } from "@/lib/v2/programs/registry";
import { buildOnboardingPathMetadata } from "@/lib/v2/onboarding-path";
import { buildProgramMembershipPatch } from "@/lib/v2/programs/program-membership";
import { syncProgramMembership } from "@/lib/v2/programs/sync-program-membership";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { upsertAppUser, getAppUser } from "@/lib/v2/api-helpers";
import { rosterPgyForInitials, resolveCurrentBlock } from "@/lib/v2/programs/block-schedule";
import type { AppUser } from "@/lib/v2/types";

export type InviteTokenRecord = {
  token_id: string;
  token: string;
  program_id: string;
  slot_number: number;
  label: string | null;
  trainee_initials: string | null;
  roster_email: string | null;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
};

export type InviteTokenPreview = {
  valid: boolean;
  available: boolean;
  token: string;
  program_slug: string | null;
  program_title: string | null;
  institution_name: string | null;
  content_tier: "full" | "blank" | null;
  slot_number: number | null;
  label: string | null;
  has_roster_initials: boolean;
  message?: string;
};

type SeedTokenRow = {
  token: string;
  program_slug: string;
  slot_number: number;
  label?: string | null;
  trainee_initials?: string | null;
  roster_email?: string | null;
};

const seedTokens = (tokenSeed as { tokens?: SeedTokenRow[] }).tokens ?? [];

function seedRowToRecord(row: SeedTokenRow): InviteTokenRecord {
  const program = getProgramBySlug(row.program_slug);
  return {
    token_id: `seed-${row.token}`,
    token: row.token,
    program_id: program?.id ?? "",
    slot_number: row.slot_number,
    label: row.label ?? null,
    trainee_initials: row.trainee_initials ?? null,
    roster_email: row.roster_email ?? null,
    used_by: null,
    used_at: null,
    expires_at: null,
  };
}

function isExpired(record: InviteTokenRecord): boolean {
  if (!record.expires_at) return false;
  return new Date(record.expires_at).getTime() < Date.now();
}

function previewFromRecord(
  record: InviteTokenRecord | null,
  message?: string,
): InviteTokenPreview {
  if (!record) {
    return {
      valid: false,
      available: false,
      token: "",
      program_slug: null,
      program_title: null,
      institution_name: null,
      content_tier: null,
      slot_number: null,
      label: null,
      has_roster_initials: false,
      message: message ?? "Invite link not found.",
    };
  }

  const program = getProgramById(record.program_id) ?? getProgramBySlug(record.program_slug);
  const used = Boolean(record.used_by);
  const expired = isExpired(record);

  return {
    valid: true,
    available: !used && !expired,
    token: record.token,
    program_slug: program?.slug ?? null,
    program_title: program?.display_title ?? null,
    institution_name: program?.institution_name ?? null,
    content_tier: program?.content_tier ?? null,
    slot_number: record.slot_number,
    label: record.label,
    has_roster_initials: Boolean(record.trainee_initials?.trim()),
    message: used
      ? "This invite has already been used."
      : expired
        ? "This invite link has expired."
        : message,
  };
}

async function fetchTokenFromDb(token: string): Promise<InviteTokenRecord | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("program_invite_tokens")
      .select(
        "token_id, token, program_id, slot_number, label, trainee_initials, roster_email, used_by, used_at, expires_at",
      )
      .eq("token", token.trim())
      .maybeSingle();
    if (error || !data) return null;
    return data as InviteTokenRecord;
  } catch {
    return null;
  }
}

function fetchTokenFromSeed(token: string): InviteTokenRecord | null {
  const row = seedTokens.find((t) => t.token === token.trim());
  return row ? seedRowToRecord(row) : null;
}

export async function lookupInviteTokenRecord(token: string): Promise<InviteTokenRecord | null> {
  const normalized = token.trim();
  if (!normalized) return null;
  return (await fetchTokenFromDb(normalized)) ?? fetchTokenFromSeed(normalized);
}

export async function lookupInviteTokenForUser(
  userId: string,
  token?: string | null,
): Promise<InviteTokenRecord | null> {
  if (token) {
    const record = await lookupInviteTokenRecord(token);
    if (record && (!record.used_by || record.used_by === userId)) return record;
  }
  for (const row of seedTokens) {
    const record = seedRowToRecord(row);
    if (record.used_by === userId) return record;
  }
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("program_invite_tokens")
        .select(
          "token_id, token, program_id, slot_number, label, trainee_initials, roster_email, used_by, used_at, expires_at",
        )
        .eq("used_by", userId)
        .maybeSingle();
      if (data) return data as InviteTokenRecord;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export async function lookupInviteToken(token: string): Promise<InviteTokenPreview> {
  const normalized = token.trim();
  if (!normalized) {
    return previewFromRecord(null, "Missing invite token.");
  }

  const fromDb = await fetchTokenFromDb(normalized);
  if (fromDb) return previewFromRecord(fromDb);

  const fromSeed = fetchTokenFromSeed(normalized);
  return previewFromRecord(fromSeed, fromSeed ? undefined : "Invite link not found.");
}

export function joinUrlForToken(token: string, origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    origin ??
    "http://127.0.0.1:3000";
  return `${base}/join/${encodeURIComponent(token)}`;
}

export function onboardingUrlForToken(token: string, origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    origin ??
    "http://127.0.0.1:3000";
  return `${base}/app/onboarding?token=${encodeURIComponent(token)}`;
}

function blockPrefillForProgram(
  program: ResidencyProgram,
  initials: string | null | undefined,
): { pgy_level?: string; current_rotation?: string } {
  if (!initials?.trim() || program.content_tier !== "full" || !program.schedule_source) {
    return {};
  }
  const block = resolveCurrentBlock({ trainee_initials: initials });
  if (block.matched) {
    return {
      pgy_level: block.pgy_level ?? block.roster_pgy_level ?? undefined,
      current_rotation: block.rotation_label ?? block.rotation_code ?? undefined,
    };
  }
  const rosterPgy = rosterPgyForInitials(initials);
  return rosterPgy ? { pgy_level: rosterPgy } : {};
}

export async function redeemInviteToken(input: {
  token: string;
  userId: string;
  email: string;
  demo: boolean;
}): Promise<
  | { ok: true; program: ResidencyProgram; user: AppUser }
  | { ok: false; status: number; message: string }
> {
  const normalized = input.token.trim();
  const record = (await fetchTokenFromDb(normalized)) ?? fetchTokenFromSeed(normalized);

  if (!record) {
    return { ok: false, status: 404, message: "Invite link not found." };
  }
  if (record.used_by && record.used_by !== input.userId) {
    return { ok: false, status: 409, message: "This invite has already been used." };
  }
  if (isExpired(record)) {
    return { ok: false, status: 410, message: "This invite link has expired." };
  }

  const alreadyRedeemedByUser = record.used_by === input.userId;

  const program = getProgramById(record.program_id);
  if (!program) {
    return { ok: false, status: 404, message: "Program for this invite was not found." };
  }

  if (
    record.roster_email &&
    record.roster_email.trim().toLowerCase() !== input.email.trim().toLowerCase()
  ) {
    return {
      ok: false,
      status: 403,
      message: "This invite is reserved for a different email address.",
    };
  }

  const initials = record.trainee_initials?.trim().toUpperCase() || null;
  const pathMeta = buildOnboardingPathMetadata({
    path: "institutional",
    program,
    trainee_initials: initials,
  });

  const user = await getAppUser(input.userId, input.demo);
  const priorMeta = user ? getOnboardingMetadata(user) : {};

  const membershipPatch = buildProgramMembershipPatch({
    userId: input.userId,
    program,
    pgyLevel: blockPrefillForProgram(program, initials).pgy_level ?? null,
    priorMeta: { ...priorMeta, ...pathMeta },
  });

  const blockPrefill = blockPrefillForProgram(program, initials);

  const updated = await upsertAppUser(
    input.userId,
    input.email,
    {
      primary_program_id: membershipPatch.primary_program_id,
      content_pack: membershipPatch.content_pack,
      institution: program.institution_name,
      base_specialty: program.base_specialty,
      career_stage: program.default_career_stage,
      practice_setting: program.default_practice_setting,
      ...blockPrefill,
      onboarding_metadata: {
        ...priorMeta,
        ...pathMeta,
        ...membershipPatch.onboarding_metadata,
        invite_token: normalized,
        invite_slot_number: record.slot_number,
      } as Record<string, unknown>,
    },
    input.demo,
  );

  if (!input.demo && isSupabaseConfigured() && !alreadyRedeemedByUser) {
    try {
      const admin = createAdminClient();
      await admin
        .from("program_invite_tokens")
        .update({
          used_by: input.userId,
          used_at: new Date().toISOString(),
        })
        .eq("token", normalized)
        .is("used_by", null);

      await syncProgramMembership({
        demo: false,
        userId: input.userId,
        membership: membershipPatch.onboarding_metadata.program_membership!,
      });
    } catch {
      /* membership sync best-effort */
    }
  } else if (!input.demo && isSupabaseConfigured() && alreadyRedeemedByUser) {
    try {
      await syncProgramMembership({
        demo: false,
        userId: input.userId,
        membership: membershipPatch.onboarding_metadata.program_membership!,
      });
    } catch {
      /* ignore */
    }
  }

  return { ok: true, program, user: updated };
}

export async function listInviteTokensForProgram(programSlug: string): Promise<
  Array<
    InviteTokenRecord & {
      join_url: string;
      program_slug: string;
      used: boolean;
    }
  >
> {
  const program = getProgramBySlug(programSlug);
  if (!program) return [];

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("program_invite_tokens")
        .select(
          "token_id, token, program_id, slot_number, label, trainee_initials, roster_email, used_by, used_at, expires_at",
        )
        .eq("program_id", program.id)
        .order("slot_number", { ascending: true });
      if (data?.length) {
        return (data as InviteTokenRecord[]).map((row) => ({
          ...row,
          program_slug: program.slug,
          join_url: joinUrlForToken(row.token),
          used: Boolean(row.used_by),
        }));
      }
    } catch {
      /* fall through to seed */
    }
  }

  return seedTokens
    .filter((t) => t.program_slug === programSlug)
    .map((row) => {
      const record = seedRowToRecord(row);
      return {
        ...record,
        program_slug: programSlug,
        join_url: joinUrlForToken(record.token),
        used: false,
      };
    });
}
