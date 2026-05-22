import type { ActivityEntry } from "@/lib/types/database";

const KEY = "fiscmak_activities_demo";

export const DEMO_ACTIVITIES: ActivityEntry[] = [
  {
    id: "demo-1",
    user_id: "demo",
    created_at: new Date().toISOString(),
    activity_date: "2026-05-18",
    raw_text: "Mentored resident through difficult family meeting prep",
    input_source: "text",
    energy_valence: "energizing",
    primary_domain: "Communication",
    primary_track: "Educator",
    primary_domain_confidence: 0.8,
    primary_track_confidence: 0.85,
    confidence_score: 0.82,
    scope: "team",
    evidence_strength: "self_reported",
  },
];

export function loadDemoActivities(): ActivityEntry[] {
  if (typeof window === "undefined") return DEMO_ACTIVITIES;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as ActivityEntry[];
  } catch {
    /* ignore */
  }
  return DEMO_ACTIVITIES;
}

export function saveDemoActivities(items: ActivityEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function fetchActivities(): Promise<ActivityEntry[]> {
  const { createClient, isSupabaseConfigured } = await import(
    "@/lib/supabase/client"
  );

  if (!isSupabaseConfigured()) {
    return loadDemoActivities();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return loadDemoActivities();

  const { data } = await supabase
    .from("activity_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("activity_date", { ascending: false })
    .limit(50);

  return (data as ActivityEntry[]) ?? [];
}
