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

/** Dual-write enrichment run + reconciliation queue + vault domain tables. */
export async function persistEnrichmentSnapshot(
  user: AppUser,
  email: string,
  snapshot: EnrichmentSnapshot,
): Promise<void> {
  try {
    await ensurePhysicianRow(user, email);
    const supabase = await createClient();

    if (snapshot.npi || snapshot.orcid) {
      await supabase
        .from("physicians")
        .update({
          npi: snapshot.npi ?? undefined,
          orcid: snapshot.orcid ?? undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("physician_id", user.user_id);
    }

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

    await persistVaultExtracts(supabase, user.user_id, snapshot);
  } catch (e) {
    console.error("persistEnrichmentSnapshot failed:", e);
  }
}

async function persistVaultExtracts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  physicianId: string,
  snapshot: EnrichmentSnapshot,
): Promise<void> {
  const extracts = snapshot.vault_extracts;
  if (!extracts) return;

  for (const pub of extracts.publications) {
    const title = pub.title?.trim() || "Untitled publication";
    const matchCol = pub.doi ? "doi" : pub.pmid ? "pmid" : null;
    const matchVal = pub.doi ?? pub.pmid ?? null;

    if (matchCol && matchVal) {
      const { data: existing } = await supabase
        .from("publications")
        .select("pub_id")
        .eq("physician_id", physicianId)
        .eq(matchCol, matchVal)
        .maybeSingle();

      const row = {
        physician_id: physicianId,
        doi: pub.doi ?? null,
        pmid: pub.pmid ?? null,
        title,
        citation_count: pub.citation_count ?? null,
        api_discovered: true,
        reconciled: false,
        data_source: pub.doi ? "openalex" : "pubmed",
        updated_at: new Date().toISOString(),
      };

      if (existing?.pub_id) {
        await supabase.from("publications").update(row).eq("pub_id", existing.pub_id);
      } else {
        await supabase.from("publications").insert(row);
      }
    } else {
      await supabase.from("publications").insert({
        physician_id: physicianId,
        title,
        citation_count: pub.citation_count ?? null,
        api_discovered: true,
        reconciled: false,
        data_source: "cv_parse",
      });
    }
  }

  for (const grantId of extracts.grant_ids) {
    const normalized = grantId.replace(/\s+/g, " ").trim();
    const { data: existing } = await supabase
      .from("grants")
      .select("grant_id")
      .eq("physician_id", physicianId)
      .eq("nih_project_number", normalized)
      .maybeSingle();

    const row = {
      physician_id: physicianId,
      nih_project_number: normalized,
      funder: "NIH",
      grant_title: `Grant ${normalized}`,
      api_discovered: true,
      reconciled: false,
      data_source: "nih_reporter",
      updated_at: new Date().toISOString(),
    };

    if (existing?.grant_id) {
      await supabase.from("grants").update(row).eq("grant_id", existing.grant_id);
    } else {
      await supabase.from("grants").insert(row);
    }
  }

  if (snapshot.committees_detected > 0) {
    const { count } = await supabase
      .from("service_activities")
      .select("service_id", { count: "exact", head: true })
      .eq("physician_id", physicianId)
      .eq("category", "committee")
      .eq("data_source", "cv_parse");

    if ((count ?? 0) === 0) {
      await supabase.from("service_activities").insert({
        physician_id: physicianId,
        activity_name: "Committee service (CV-detected)",
        category: "committee",
        scope: "institutional",
        role: "member",
        data_source: "cv_parse",
      });
    }
  }

  if (snapshot.courses_detected > 0) {
    const { count } = await supabase
      .from("educational_activities")
      .select("edu_id", { count: "exact", head: true })
      .eq("physician_id", physicianId)
      .eq("data_source", "cv_parse");

    if ((count ?? 0) === 0) {
      await supabase.from("educational_activities").insert({
        physician_id: physicianId,
        activity_name: "Teaching activities (CV-detected)",
        activity_type: "lecturer",
        data_source: "cv_parse",
      });
    }
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
