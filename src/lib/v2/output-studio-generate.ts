// Output Studio — Wave 1 section assembly and output_documents CRUD.
//
// Wave 1 is structured assembly only (no LLM). Each section is assembled
// from cv_item_metadata + evidence_unit rows and stored as TipTap ProseMirror JSON.
//
// EDITOR FLAG: Section content is stored in ProseMirror (TipTap-native) format.
// The spec (FISCMAK_Output_Studio_Editor_Spec.md) specifies TipTap as the editor.
// The existing v2 Lexical path is NOT touched.
// Before building edit UI: confirm TipTap with founder; do NOT install either
// editor until that decision is locked. The JSON here is portable to either.

import { createClient } from "@/lib/supabase/server";
import type { BankItem, CvItemType } from "@/lib/v2/output-studio-bank";

// ── ProseMirror types (TipTap wire format) ───────────────────────────────────

export type ProseMirrorText = { type: "text"; text: string };
export type ProseMirrorNode = {
  type: string;
  content?: ProseMirrorNode[];
  attrs?: Record<string, unknown>;
};
export type ProseMirrorDoc = { type: "doc"; content: ProseMirrorNode[] };

// ── Section content (one element of output_documents.sections) ───────────────

export type SectionContent = {
  type: string;
  label: string;
  enabled: boolean;
  order: number;
  mak_role: "assemble" | "draft" | "draft_and_assemble";
  tiptap_content: ProseMirrorDoc | null;
  provenance_ids: string[];
  reach_subheadings: boolean;
};

// ── output_documents row ─────────────────────────────────────────────────────

export type OutputDocument = {
  id: string;
  user_id: string;
  document_type: string;
  title: string;
  audience_context: string | null;
  institution_route_id: string | null;
  status: "draft" | "review_ready" | "exported" | "archived";
  sections: SectionContent[];
  evidence_snapshot_ids: string[];
  generated_at: string;
  last_edited_at: string;
  exported_at: string | null;
  generation_model: string | null;
};

// ── CV section definitions (Standard route, Wave 1 pilot) ────────────────────

type CvSectionDef = {
  type: string;
  label: string;
  item_types: CvItemType[];
  reach_subheadings: boolean;
};

const CV_SECTIONS: CvSectionDef[] = [
  {
    type: "education_credentials",
    label: "Education & Credentials",
    item_types: ["CV-DEG", "CV-LIC", "CV-CERT", "CV-SKILL"],
    reach_subheadings: false,
  },
  {
    type: "publications",
    label: "Publications",
    item_types: ["CV-PUB-ORIG", "CV-PUB-REV", "CV-PUB-CASE", "CV-PUB-CHAP", "CV-PUB-EDIT", "CV-PUB-ABS"],
    reach_subheadings: false,
  },
  {
    type: "presentations",
    label: "Presentations",
    item_types: ["CV-PRES-NATL", "CV-PRES-REG", "CV-PRES-INST", "CV-PRES-POST", "CV-PRES-INV"],
    // CWRU requires reach grouping for presentations (Intl/Natl/Regional/Local/Institutional)
    reach_subheadings: true,
  },
  {
    type: "teaching_activities",
    label: "Teaching Activities",
    item_types: ["CV-TEACH-UME", "CV-TEACH-GME", "CV-TEACH-CME", "CV-CURR", "CV-CURR-MAT", "CV-MENTOR"],
    reach_subheadings: false,
  },
  {
    type: "research_funding",
    label: "Research & Funding",
    item_types: ["CV-RES-PROJ", "CV-GRANT", "CV-QI"],
    reach_subheadings: false,
  },
  {
    type: "service_leadership",
    label: "Service & Leadership",
    item_types: ["CV-COMM-INST", "CV-COMM-NATL", "CV-PEER", "CV-LEAD", "CV-ADVOCACY", "CV-MEDIA", "CV-AWARD", "CV-MEM"],
    reach_subheadings: false,
  },
];

// ── Text derivation ──────────────────────────────────────────────────────────

function deriveItemText(item: BankItem): string {
  if (item.display_label) return item.display_label;

  const d = item.structured_data;

  // Publications: authors. title. journal. year.
  if (item.item_type.startsWith("CV-PUB-")) {
    const parts = [
      Array.isArray(d.authors) ? (d.authors as string[]).join(", ") : null,
      d.title,
      d.journal_or_book,
      d.year,
    ].filter(Boolean);
    if (parts.length) return `${parts.join(". ")}.`;
  }

  // Presentations: title, venue, city, year
  if (item.item_type.startsWith("CV-PRES-")) {
    const parts = [d.title ?? item.raw_text, d.venue, d.city, d.year].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }

  // Grants: title, agency, role, period
  if (item.item_type === "CV-GRANT") {
    const parts = [d.title, d.agency, d.role, d.period_start && `${d.period_start}–${d.period_end ?? "present"}`].filter(Boolean);
    if (parts.length) return parts.join(". ");
  }

  // Awards / memberships / generic
  if (d.name || d.name_or_title) {
    const name = (d.name ?? d.name_or_title) as string;
    const org = (d.granting_body ?? d.institution_or_org ?? "") as string;
    const year = (d.year ?? d.year_or_dates ?? "") as string | number;
    return [name, org, year].filter(Boolean).join(", ");
  }

  if (item.raw_text) return item.raw_text.trim();
  return "[No description — confirm this bank item to generate a display label]";
}

// ── ProseMirror builders ─────────────────────────────────────────────────────

function pmText(text: string): ProseMirrorText {
  return { type: "text", text };
}

function pmParagraph(text: string): ProseMirrorNode {
  return { type: "paragraph", content: [pmText(text)] };
}

function pmListItem(text: string): ProseMirrorNode {
  return { type: "listItem", content: [pmParagraph(text)] };
}

function pmBulletList(items: BankItem[]): ProseMirrorDoc {
  return {
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: items.map((item) => pmListItem(deriveItemText(item))),
      },
    ],
  };
}

function pmEmpty(): ProseMirrorDoc {
  return {
    type: "doc",
    content: [pmParagraph("No items captured yet — add CV items to your bank to populate this section.")],
  };
}

// ── Section builders ─────────────────────────────────────────────────────────

export function buildCvSections(bankItems: BankItem[]): SectionContent[] {
  return CV_SECTIONS.map((def, idx) => {
    const items = bankItems.filter((b) => def.item_types.includes(b.item_type));
    return {
      type: def.type,
      label: def.label,
      enabled: items.length > 0,
      order: idx + 1,
      mak_role: "assemble" as const,
      tiptap_content: items.length > 0 ? pmBulletList(items) : pmEmpty(),
      provenance_ids: items.map((i) => i.evidence_unit_id),
      reach_subheadings: def.reach_subheadings,
    };
  });
}

export function buildMonthlyBullets(bankItems: BankItem[], sinceDate: string): SectionContent {
  const label = `Monthly CV Update — items captured since ${sinceDate}`;
  return {
    type: "monthly_bullets",
    label,
    enabled: bankItems.length > 0,
    order: 1,
    mak_role: "assemble",
    tiptap_content: bankItems.length > 0 ? pmBulletList(bankItems) : pmEmpty(),
    provenance_ids: bankItems.map((i) => i.evidence_unit_id),
    reach_subheadings: false,
  };
}

// ── output_documents CRUD ────────────────────────────────────────────────────

export type CreateDocumentOpts = {
  document_type: string;
  title: string;
  audience_context?: string;
  sections: SectionContent[];
  evidence_snapshot_ids: string[];
};

export async function createOutputDocument(userId: string, opts: CreateDocumentOpts): Promise<OutputDocument> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("output_documents")
    .insert({
      user_id: userId,
      document_type: opts.document_type,
      title: opts.title,
      audience_context: opts.audience_context ?? null,
      institution_route_id: null,
      status: "draft",
      sections: opts.sections,
      evidence_snapshot_ids: opts.evidence_snapshot_ids,
      generated_at: now,
      last_edited_at: now,
      generation_model: "structured-assembly-v1",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as OutputDocument;
}

export async function fetchOutputDocuments(userId: string): Promise<OutputDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("output_documents")
    .select("*")
    .eq("user_id", userId)
    .order("last_edited_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OutputDocument[];
}

export async function fetchOutputDocument(userId: string, id: string): Promise<OutputDocument | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("output_documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as OutputDocument) ?? null;
}

export type DocumentPatch = Partial<{
  sections: SectionContent[];
  status: "draft" | "review_ready" | "exported" | "archived";
  title: string;
}>;

export async function updateOutputDocument(userId: string, id: string, patch: DocumentPatch): Promise<OutputDocument> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("output_documents")
    .update({ ...patch, last_edited_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as OutputDocument;
}
