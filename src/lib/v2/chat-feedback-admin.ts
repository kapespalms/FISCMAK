import { createAdminClient } from "@/lib/supabase/admin";

export type MakFeedbackSummary = {
  thumbs_up: number;
  thumbs_down: number;
  recent_snippet_count: number;
  recent_snippets: { rating: "up" | "down"; section: string | null; preview: string; created_at: string }[];
};

const SNIPPET_PREVIEW_LEN = 120;
const RECENT_SNIPPET_LIMIT = 5;

export async function fetchMakFeedbackSummary(userId: string): Promise<MakFeedbackSummary | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data: rows, error } = await supabase
      .from("chat_feedback")
      .select("rating, section, message_content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.warn("[kp-admin] chat_feedback fetch:", error.message);
      return null;
    }

    const list = rows ?? [];
    let thumbs_up = 0;
    let thumbs_down = 0;
    for (const row of list) {
      if (row.rating === "down") thumbs_down += 1;
      else thumbs_up += 1;
    }

    const recent_snippets = list.slice(0, RECENT_SNIPPET_LIMIT).map((row) => {
      const raw = String(row.message_content ?? "").trim();
      const preview =
        raw.length <= SNIPPET_PREVIEW_LEN
          ? raw
          : `${raw.slice(0, SNIPPET_PREVIEW_LEN)}…`;
      return {
        rating: row.rating === "down" ? ("down" as const) : ("up" as const),
        section: typeof row.section === "string" ? row.section : null,
        preview,
        created_at: row.created_at ?? new Date().toISOString(),
      };
    });

    return {
      thumbs_up,
      thumbs_down,
      recent_snippet_count: list.length,
      recent_snippets,
    };
  } catch (e) {
    console.warn("[kp-admin] chat_feedback:", e instanceof Error ? e.message : e);
    return null;
  }
}
