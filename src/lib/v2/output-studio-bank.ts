import { createClient } from "@/lib/supabase/server";

// 32 canonical CV Item Type IDs — FISCMAK Psychiatry Dictionary (pilot set)
export const CV_ITEM_TYPES = [
  // Education & credentials
  "CV-DEG", "CV-LIC", "CV-CERT", "CV-SKILL",
  // Publications
  "CV-PUB-ORIG", "CV-PUB-REV", "CV-PUB-CASE", "CV-PUB-CHAP", "CV-PUB-EDIT", "CV-PUB-ABS",
  // Presentations
  "CV-PRES-NATL", "CV-PRES-REG", "CV-PRES-INST", "CV-PRES-POST", "CV-PRES-INV",
  // Teaching & education
  "CV-TEACH-UME", "CV-TEACH-GME", "CV-TEACH-CME", "CV-CURR", "CV-CURR-MAT", "CV-MENTOR",
  // Research & funding
  "CV-RES-PROJ", "CV-GRANT", "CV-QI",
  // Service, leadership, professional
  "CV-COMM-INST", "CV-COMM-NATL", "CV-PEER", "CV-LEAD", "CV-ADVOCACY",
  "CV-MEDIA", "CV-AWARD", "CV-MEM",
] as const;

export type CvItemType = (typeof CV_ITEM_TYPES)[number];

export type BankItem = {
  id: string;
  evidence_unit_id: string;
  item_type: CvItemType;
  structured_data: Record<string, unknown>;
  display_label: string | null;
  apt_role: string | null;
  apt_scholarship: string | null;
  apt_impact: string | null;
  is_representative: boolean;
  created_at: string;
  // joined from evidence_unit
  raw_text: string | null;
  skill_index: number | null;
  domain_index: number | null;
  recognition_quadrant: string | null;
  energy_score: number | null;
  physician_confirmed: boolean;
};

export type FetchBankOpts = {
  // Filter on cv_item_metadata.created_at — ISO date string (inclusive lower bound)
  since_date?: string;
  item_type?: CvItemType | CvItemType[];
};

export async function fetchBankItems(userId: string, opts: FetchBankOpts = {}): Promise<BankItem[]> {
  const supabase = await createClient();

  // !evidence_unit_id hints Supabase which FK column to use for the join
  let query = supabase
    .from("cv_item_metadata")
    .select(
      "id, evidence_unit_id, item_type, structured_data, display_label, " +
      "apt_role, apt_scholarship, apt_impact, is_representative, created_at, " +
      "evidence_unit!evidence_unit_id(skill_index, domain_index, recognition_quadrant, energy_score, raw_text, physician_confirmed)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (opts.since_date) {
    query = query.gte("created_at", opts.since_date);
  }

  if (opts.item_type) {
    const types = Array.isArray(opts.item_type) ? opts.item_type : [opts.item_type];
    query = query.in("item_type", types);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapBankRow);
}

export type CaptureInput = {
  evidence_unit_id: string;
  item_type: CvItemType;
  structured_data?: Record<string, unknown>;
  display_label?: string | null;
};

export async function captureBankItem(userId: string, input: CaptureInput): Promise<BankItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cv_item_metadata")
    .upsert(
      {
        user_id: userId,
        evidence_unit_id: input.evidence_unit_id,
        item_type: input.item_type,
        structured_data: input.structured_data ?? {},
        display_label: input.display_label ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "evidence_unit_id" }
    )
    .select(
      "id, evidence_unit_id, item_type, structured_data, display_label, " +
      "apt_role, apt_scholarship, apt_impact, is_representative, created_at, " +
      "evidence_unit!evidence_unit_id(skill_index, domain_index, recognition_quadrant, energy_score, raw_text, physician_confirmed)"
    )
    .single();
  if (error) throw error;
  return mapBankRow(data);
}

export type BankItemPatch = Partial<{
  structured_data: Record<string, unknown>;
  display_label: string | null;
  apt_role: string | null;
  apt_scholarship: string | null;
  apt_impact: string | null;
  is_representative: boolean;
}>;

export async function updateBankItem(userId: string, id: string, patch: BankItemPatch): Promise<BankItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cv_item_metadata")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select(
      "id, evidence_unit_id, item_type, structured_data, display_label, " +
      "apt_role, apt_scholarship, apt_impact, is_representative, created_at, " +
      "evidence_unit!evidence_unit_id(skill_index, domain_index, recognition_quadrant, energy_score, raw_text, physician_confirmed)"
    )
    .single();
  if (error) throw error;
  return mapBankRow(data);
}

/**
 * Delete a bank item by deleting its parent evidence_unit.
 * ON DELETE CASCADE removes cv_item_metadata + evidence_cell_weights automatically,
 * so the item disappears from both the profile and the lattice heatmap.
 */
export async function deleteBankItem(userId: string, evidenceUnitId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("evidence_unit")
    .delete()
    .eq("id", evidenceUnitId)
    .eq("user_id", userId);
  if (error) throw error;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBankRow(row: any): BankItem {
  const eu = row.evidence_unit ?? {};
  return {
    id: row.id,
    evidence_unit_id: row.evidence_unit_id,
    item_type: row.item_type as CvItemType,
    structured_data: (row.structured_data as Record<string, unknown>) ?? {},
    display_label: row.display_label ?? null,
    apt_role: row.apt_role ?? null,
    apt_scholarship: row.apt_scholarship ?? null,
    apt_impact: row.apt_impact ?? null,
    is_representative: row.is_representative ?? false,
    created_at: row.created_at,
    raw_text: eu.raw_text ?? null,
    skill_index: eu.skill_index ?? null,
    domain_index: eu.domain_index ?? null,
    recognition_quadrant: eu.recognition_quadrant ?? null,
    energy_score: eu.energy_score ?? null,
    physician_confirmed: eu.physician_confirmed ?? false,
  };
}
