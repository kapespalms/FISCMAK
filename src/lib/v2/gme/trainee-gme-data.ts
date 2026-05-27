import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getAppUser, upsertAppUser } from "@/lib/v2/api-helpers";
import { getServerDemo } from "@/lib/v2/demo-store";
import { getProgramBySlug } from "@/lib/v2/programs/registry";
import type { AppUser } from "@/lib/v2/types";

export type SelfRatingRow = {
  subcompetency_id: string;
  self_level: number | null;
  narrative_reflection: string | null;
  updated_at?: string | null;
};

export type IlpGoalRow = {
  goal_id: string;
  subcompetency_id: string | null;
  goal_text: string;
  resources: string | null;
  target_date: string | null;
  status: string;
  source: string | null;
  created_at?: string | null;
  locked_at?: string | null;
};

export type RotationEntryRow = {
  entry_id: string;
  rotation_name: string;
  pgy_level: string | null;
  start_date: string | null;
  end_date: string | null;
  site: string | null;
  notes: string | null;
  created_at: string;
};

type GmeOnboardingMeta = {
  gme?: {
    milestone_self_ratings?: Record<
      string,
      Record<
        string,
        { self_level: number | null; narrative_reflection?: string | null; updated_at?: string }
      >
    >;
    ilp_goals?: Record<string, IlpGoalRow[]>;
    rotation_entries?: RotationEntryRow[];
  };
};

function readGmeMeta(user: AppUser | null): GmeOnboardingMeta["gme"] {
  const meta = user?.onboarding_metadata as GmeOnboardingMeta | null;
  return meta?.gme ?? {};
}

export function getTraineeProgramSlug(user: AppUser | null): string {
  const meta = user?.onboarding_metadata as { program_slug?: string } | null;
  return meta?.program_slug ?? "uh-psych-cmc";
}

export function resolveTraineeProgramId(user: AppUser | null): string | null {
  return getProgramBySlug(getTraineeProgramSlug(user))?.id ?? null;
}

export async function loadSelfRatings(
  userId: string,
  demo: boolean,
  period = "current",
): Promise<SelfRatingRow[]> {
  if (!isSupabaseConfigured() || demo) {
    const user = await getAppUser(userId, demo);
    const gme = readGmeMeta(user);
    const bucket = gme?.milestone_self_ratings?.[period] ?? {};
    return Object.entries(bucket).map(([subcompetency_id, row]) => ({
      subcompetency_id,
      self_level: row.self_level,
      narrative_reflection: row.narrative_reflection ?? null,
      updated_at: row.updated_at ?? null,
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestone_self_ratings")
    .select("subcompetency_id, self_level, narrative_reflection, updated_at")
    .eq("user_id", userId)
    .eq("reporting_period", period);

  if (error) throw new Error(error.message);
  return (data ?? []) as SelfRatingRow[];
}

export async function saveSelfRatings(
  userId: string,
  email: string,
  demo: boolean,
  period: string,
  ratings: Array<{
    subcompetency_id: string;
    self_level: number | null;
    narrative_reflection?: string | null;
  }>,
): Promise<SelfRatingRow[]> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured() || demo) {
    const user = await getAppUser(userId, demo);
    const meta = (user?.onboarding_metadata ?? {}) as GmeOnboardingMeta;
    const gme = meta.gme ?? {};
    const periodBucket = { ...(gme.milestone_self_ratings?.[period] ?? {}) };

    for (const rating of ratings) {
      periodBucket[rating.subcompetency_id] = {
        self_level: rating.self_level,
        narrative_reflection: rating.narrative_reflection ?? null,
        updated_at: now,
      };
    }

    await upsertAppUser(
      userId,
      email,
      {
        onboarding_metadata: {
          ...meta,
          gme: {
            ...gme,
            milestone_self_ratings: {
              ...(gme.milestone_self_ratings ?? {}),
              [period]: periodBucket,
            },
          },
        } as Record<string, unknown>,
      },
      demo,
    );

    return Object.entries(periodBucket).map(([subcompetency_id, row]) => ({
      subcompetency_id,
      self_level: row.self_level,
      narrative_reflection: row.narrative_reflection ?? null,
      updated_at: row.updated_at ?? null,
    }));
  }

  const supabase = await createClient();
  const rows = ratings.map((rating) => ({
    user_id: userId,
    reporting_period: period,
    subcompetency_id: rating.subcompetency_id,
    self_level: rating.self_level,
    narrative_reflection: rating.narrative_reflection ?? null,
    updated_at: now,
  }));

  const { error } = await supabase.from("milestone_self_ratings").upsert(rows, {
    onConflict: "user_id,reporting_period,subcompetency_id",
  });
  if (error) throw new Error(error.message);

  return loadSelfRatings(userId, demo, period);
}

export async function loadIlpGoals(
  userId: string,
  demo: boolean,
  period = "current",
): Promise<IlpGoalRow[]> {
  if (!isSupabaseConfigured() || demo) {
    const user = await getAppUser(userId, demo);
    const gme = readGmeMeta(user);
    return gme?.ilp_goals?.[period] ?? [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ilp_goals")
    .select(
      "goal_id, subcompetency_id, goal_text, resources, target_date, status, source, created_at, locked_at",
    )
    .eq("user_id", userId)
    .eq("reporting_period", period)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as IlpGoalRow[];
}

export async function insertIlpGoals(
  userId: string,
  email: string,
  demo: boolean,
  period: string,
  goals: Array<{
    subcompetency_id?: string | null;
    goal_text: string;
    resources?: string | null;
    target_date?: string | null;
    status?: string;
    source?: string;
  }>,
  replaceDrafts = false,
): Promise<IlpGoalRow[]> {
  if (!isSupabaseConfigured() || demo) {
    const user = await getAppUser(userId, demo);
    const meta = (user?.onboarding_metadata ?? {}) as GmeOnboardingMeta;
    const gme = meta.gme ?? {};
    let existing = [...(gme.ilp_goals?.[period] ?? [])];

    if (replaceDrafts) {
      existing = existing.filter((g) => g.status !== "draft" || g.source !== "system_draft");
    }

    const inserted = goals.map((goal) => ({
      goal_id: crypto.randomUUID(),
      subcompetency_id: goal.subcompetency_id ?? null,
      goal_text: goal.goal_text,
      resources: goal.resources ?? null,
      target_date: goal.target_date ?? null,
      status: goal.status ?? "draft",
      source: goal.source ?? "system_draft",
      created_at: new Date().toISOString(),
      locked_at: null,
    }));

    const merged = [...existing, ...inserted];
    await upsertAppUser(
      userId,
      email,
      {
        onboarding_metadata: {
          ...meta,
          gme: {
            ...gme,
            ilp_goals: {
              ...(gme.ilp_goals ?? {}),
              [period]: merged,
            },
          },
        } as Record<string, unknown>,
      },
      demo,
    );
    return merged;
  }

  const supabase = await createClient();
  if (replaceDrafts) {
    await supabase
      .from("ilp_goals")
      .delete()
      .eq("user_id", userId)
      .eq("reporting_period", period)
      .eq("status", "draft")
      .eq("source", "system_draft");
  }

  const rows = goals.map((goal) => ({
    user_id: userId,
    reporting_period: period,
    subcompetency_id: goal.subcompetency_id ?? null,
    goal_text: goal.goal_text,
    resources: goal.resources ?? null,
    target_date: goal.target_date ?? null,
    status: goal.status ?? "draft",
    source: goal.source ?? "system_draft",
  }));

  const { error } = await supabase.from("ilp_goals").insert(rows);
  if (error) throw new Error(error.message);

  return loadIlpGoals(userId, demo, period);
}

export async function patchIlpGoal(
  userId: string,
  email: string,
  demo: boolean,
  goalId: string,
  patch: Partial<Pick<IlpGoalRow, "goal_text" | "resources" | "target_date" | "status">>,
): Promise<IlpGoalRow | null> {
  if (!isSupabaseConfigured() || demo) {
    const user = await getAppUser(userId, demo);
    const meta = (user?.onboarding_metadata ?? {}) as GmeOnboardingMeta;
    const gme = meta.gme ?? {};
    const periods = gme.ilp_goals ?? {};
    let updated: IlpGoalRow | null = null;

    for (const [period, goals] of Object.entries(periods)) {
      const next = goals.map((goal) => {
        if (goal.goal_id !== goalId) return goal;
        updated = { ...goal, ...patch };
        return updated;
      });
      periods[period] = next;
    }

    if (!updated) return null;

    await upsertAppUser(
      userId,
      email,
      {
        onboarding_metadata: {
          ...meta,
          gme: { ...gme, ilp_goals: periods },
        } as Record<string, unknown>,
      },
      demo,
    );
    return updated;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ilp_goals")
    .update(patch)
    .eq("goal_id", goalId)
    .eq("user_id", userId)
    .select(
      "goal_id, subcompetency_id, goal_text, resources, target_date, status, source, created_at, locked_at",
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as IlpGoalRow | null) ?? null;
}

export async function loadRotationEntries(
  userId: string,
  demo: boolean,
): Promise<RotationEntryRow[]> {
  if (!isSupabaseConfigured() || demo) {
    const user = await getAppUser(userId, demo);
    const gme = readGmeMeta(user);
    return gme?.rotation_entries ?? [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_entries")
    .select("id, created_at, activity_date, raw_text")
    .eq("user_id", userId)
    .eq("input_source", "rotation_entry")
    .order("activity_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const parsed = parseRotationEntryRawText(row.raw_text ?? "");
    return {
      entry_id: row.id as string,
      rotation_name: parsed.rotation_name,
      pgy_level: parsed.pgy_level,
      start_date: parsed.start_date ?? (row.activity_date as string | null),
      end_date: parsed.end_date,
      site: parsed.site,
      notes: parsed.notes,
      created_at: (row.created_at as string) ?? new Date().toISOString(),
    };
  });
}

function formatRotationEntryRawText(
  entry: Omit<RotationEntryRow, "entry_id" | "created_at">,
): string {
  const parts = [
    `Rotation: ${entry.rotation_name}`,
    entry.pgy_level ? `PGY: ${entry.pgy_level}` : null,
    entry.start_date ? `Start: ${entry.start_date}` : null,
    entry.end_date ? `End: ${entry.end_date}` : null,
    entry.site ? `Site: ${entry.site}` : null,
    entry.notes ? `Notes: ${entry.notes}` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

function parseRotationEntryRawText(
  raw: string,
): Omit<RotationEntryRow, "entry_id" | "created_at"> {
  const rotationMatch = raw.match(/Rotation:\s*([^|]+)/i);
  const pgyMatch = raw.match(/PGY:\s*([^|]+)/i);
  const startMatch = raw.match(/Start:\s*([^|]+)/i);
  const endMatch = raw.match(/End:\s*([^|]+)/i);
  const siteMatch = raw.match(/Site:\s*([^|]+)/i);
  const notesMatch = raw.match(/Notes:\s*(.+)$/i);
  return {
    rotation_name: rotationMatch?.[1]?.trim() ?? (raw.slice(0, 120).trim() || "Rotation"),
    pgy_level: pgyMatch?.[1]?.trim() ?? null,
    start_date: startMatch?.[1]?.trim() ?? null,
    end_date: endMatch?.[1]?.trim() ?? null,
    site: siteMatch?.[1]?.trim() ?? null,
    notes: notesMatch?.[1]?.trim() ?? null,
  };
}

export async function insertRotationEntry(
  userId: string,
  email: string,
  demo: boolean,
  entry: {
    rotation_name: string;
    pgy_level?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    site?: string | null;
    notes?: string | null;
  },
): Promise<RotationEntryRow> {
  const now = new Date().toISOString();
  const row: RotationEntryRow = {
    entry_id: crypto.randomUUID(),
    rotation_name: entry.rotation_name.trim(),
    pgy_level: entry.pgy_level?.trim() ?? null,
    start_date: entry.start_date ?? null,
    end_date: entry.end_date ?? null,
    site: entry.site?.trim() ?? null,
    notes: entry.notes?.trim() ?? null,
    created_at: now,
  };

  if (!isSupabaseConfigured() || demo) {
    const user = await getAppUser(userId, demo);
    const meta = (user?.onboarding_metadata ?? {}) as GmeOnboardingMeta;
    const gme = meta.gme ?? {};
    const entries = [row, ...(gme.rotation_entries ?? [])];
    await upsertAppUser(
      userId,
      email,
      {
        onboarding_metadata: {
          ...meta,
          gme: { ...gme, rotation_entries: entries },
        } as Record<string, unknown>,
      },
      demo,
    );
    return row;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_entries")
    .insert({
      user_id: userId,
      activity_date: row.start_date ?? now.slice(0, 10),
      raw_text: formatRotationEntryRawText(row),
      input_source: "rotation_entry",
      energy_valence: null,
      primary_domain: "Clinical",
      primary_track: "Clinician",
    })
    .select("id, created_at")
    .single();

  if (error) throw new Error(error.message);

  return {
    ...row,
    entry_id: data.id as string,
    created_at: (data.created_at as string) ?? now,
  };
}

export async function loadRotationEvaluations(
  userId: string,
  programId: string,
): Promise<Array<{ numeric_scores?: Record<string, number> | null }>> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rotation_evaluations")
    .select("numeric_scores")
    .eq("program_id", programId)
    .eq("trainee_user_id", userId);

  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ numeric_scores?: Record<string, number> | null }>;
}

export async function approveIlpGoalForTrainee(input: {
  traineeUserId: string;
  goalId: string;
  approverUserId: string;
  demo: boolean;
  period?: string;
}): Promise<IlpGoalRow | null> {
  const period = input.period ?? "current";
  const patch = {
    status: "active",
    source: "pd",
    locked_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured() || input.demo) {
    const state = getServerDemo(input.traineeUserId);
    const meta = (state.user.onboarding_metadata ?? {}) as GmeOnboardingMeta;
    const gme = meta.gme ?? {};
    const goals = [...(gme.ilp_goals?.[period] ?? [])];
    const idx = goals.findIndex((g) => g.goal_id === input.goalId);
    if (idx < 0) return null;
    goals[idx] = { ...goals[idx], ...patch };
    state.user = {
      ...state.user,
      onboarding_metadata: {
        ...meta,
        gme: {
          ...gme,
          ilp_goals: { ...(gme.ilp_goals ?? {}), [period]: goals },
        },
      } as Record<string, unknown>,
    };
    return goals[idx];
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("ilp_goals")
      .update(patch)
      .eq("goal_id", input.goalId)
      .eq("user_id", input.traineeUserId)
      .select(
        "goal_id, subcompetency_id, goal_text, resources, target_date, status, source, created_at, locked_at",
      )
      .maybeSingle();
    if (error) throw error;
    return (data as IlpGoalRow | null) ?? null;
  } catch {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ilp_goals")
      .update(patch)
      .eq("goal_id", input.goalId)
      .eq("user_id", input.traineeUserId)
      .select(
        "goal_id, subcompetency_id, goal_text, resources, target_date, status, source, created_at, locked_at",
      )
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as IlpGoalRow | null) ?? null;
  }
}

export async function listProgramTraineeIds(programId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const ids = new Set<string>();

  const { data: members } = await supabase
    .from("program_memberships")
    .select("user_id")
    .eq("program_id", programId)
    .eq("role", "trainee")
    .eq("active", true);

  for (const row of members ?? []) {
    if (row.user_id) ids.add(row.user_id);
  }

  const { data: users } = await supabase
    .from("app_users")
    .select("user_id")
    .eq("primary_program_id", programId);

  for (const row of users ?? []) {
    if (row.user_id) ids.add(row.user_id);
  }

  const { data: evalTrainees } = await supabase
    .from("rotation_evaluations")
    .select("trainee_user_id")
    .eq("program_id", programId)
    .not("trainee_user_id", "is", null);

  for (const row of evalTrainees ?? []) {
    if (row.trainee_user_id) ids.add(row.trainee_user_id);
  }

  return [...ids];
}
