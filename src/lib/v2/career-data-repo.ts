import { createClient } from "@/lib/supabase/server";
import type { EnrichmentSnapshot } from "@/lib/v2/api-enrichment";
import type { ReconciliationItem } from "@/lib/v2/onboarding-touchpoint1";
import type { AppUser } from "@/lib/v2/types";

function mapItemType(item: ReconciliationItem): string {
  const id = item.id.toLowerCase();
  if (id.includes("grant")) return "grant";
  if (id.includes("pub") || id.includes("doi")) return "publication";
  if (id.includes("npi") || id.includes("cert")) return "certification";
  if (id.includes("payment")) return "payment";
  return "role";
}

function mapTrigger(trigger: EnrichmentSnapshot["trigger"]): string {
  if (trigger === "cv_upload") return "onboarding";
  return trigger;
}

/** Ensure physicians row exists (migration sync trigger may also handle this). */
export async function ensurePhysicianRow(user: AppUser, email: string): Promise<void> {
  try {
    const supabase = await createClient();
    const parts = (user.name ?? "").trim().split(/\s+/);
    await supabase.from("physicians").upsert(
      {
        physician_id: user.user_id,
        email,
        first_name: parts[0] ?? null,
        last_name: parts.slice(1).join(" ") || null,
        npi: null,
        orcid: null,
      },
      { onConflict: "physician_id" },
    );
  } catch (e) {
    console.error("ensurePhysicianRow failed:", e);
  }
}

/** Dual-write enrichment run + reconciliation queue to Supabase (no-op if tables missing). */
export async function persistEnrichmentSnapshot(
  user: AppUser,
  email: string,
  snapshot: EnrichmentSnapshot,
): Promise<void> {
  try {
    await ensurePhysicianRow(user, email);
    const supabase = await createClient();

    await supabase.from("api_enrichment_runs").upsert(
      {
        run_id: snapshot.run_id,
        physician_id: user.user_id,
        trigger: mapTrigger(snapshot.trigger),
        status: snapshot.status === "failed" ? "failed" : snapshot.status,
        completed_at: snapshot.completed_at,
        apis_requested: snapshot.sources,
        apis_completed: snapshot.sources,
        step_log: [{ at: snapshot.completed_at, message: snapshot.changes_summary ?? "Enrichment complete" }],
      },
      { onConflict: "run_id" },
    );

    for (const item of snapshot.reconciliation_items) {
      const { data: existing } = await supabase
        .from("reconciliation_items")
        .select("item_id")
        .eq("physician_id", user.user_id)
        .eq("external_id", item.id)
        .maybeSingle();

      const row = {
        physician_id: user.user_id,
        enrichment_run_id: snapshot.run_id,
        item_type: mapItemType(item),
        title: item.label,
        detail: item.detail,
        source_api: item.source,
        external_id: item.id,
        status: item.status,
      };

      if (existing?.item_id) {
        await supabase.from("reconciliation_items").update(row).eq("item_id", existing.item_id);
      } else {
        await supabase.from("reconciliation_items").insert(row);
      }
    }
  } catch (e) {
    console.error("persistEnrichmentSnapshot failed:", e);
  }
}

export async function persistReconciliationStatuses(
  physicianId: string,
  updates: Array<{ externalId: string; status: "confirmed" | "rejected" | "pending" }>,
): Promise<void> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();
    for (const u of updates) {
      await supabase
        .from("reconciliation_items")
        .update({
          status: u.status,
          resolved_at: u.status === "pending" ? null : now,
        })
        .eq("physician_id", physicianId)
        .eq("external_id", u.externalId);
    }
  } catch (e) {
    console.error("persistReconciliationStatuses failed:", e);
  }
}

export async function fetchJobEngagementFromDb(
  userId: string,
): Promise<{ jobs_viewed: number; jobs_saved: number; average_match_score: number | null }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_job_matches")
      .select("match_score, viewed_at, saved_at")
      .eq("user_id", userId);
    const rows = data ?? [];
    const saved = rows.filter((r) => r.saved_at);
    const viewed = rows.filter((r) => r.viewed_at);
    const avg =
      rows.length > 0
        ? rows.reduce((s, r) => s + (r.match_score ?? 0), 0) / rows.length
        : null;
    return {
      jobs_viewed: viewed.length,
      jobs_saved: saved.length,
      average_match_score: avg,
    };
  } catch {
    return { jobs_viewed: 0, jobs_saved: 0, average_match_score: null };
  }
}
