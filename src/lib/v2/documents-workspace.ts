import type { DocumentRecord } from "@/lib/v2/types";
import {
  documentLabelFromRecord,
  documentFileNameFromRecord,
} from "@/lib/v2/onboarding-document-types";
import {
  resumeContentFromMetadata,
  type ResumeContent,
  type ResumeThemeKey,
} from "@/lib/v2/resume-content";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { getUserOutputTemplates } from "@/lib/v2/output-user-templates";
import { OUTPUT_TEMPLATES } from "@/lib/constants";

export type WorkspaceBucket = "sources" | "drafts" | "templates" | "generated";

export const WORKSPACE_BUCKET_KEY = "workspace_bucket";
export const CONTENT_JSON_KEY = "content_json";
export const THEME_KEY = "theme_key";
export const DRAFT_TITLE_KEY = "draft_title";
export const SOURCE_DOCUMENT_IDS_KEY = "source_document_ids";

export const ACTIVE_DOCUMENT_SESSION_KEY = "fiscmak_active_document_id";
export const DOCUMENTS_CONTEXT_EVENT = "fiscmak:documents-context";

export type DocumentsMakContextPayload = {
  active_document_id: string | null;
  content_json: ResumeContent | null;
  incomplete_fields: ResumeContent["incomplete_fields"];
  draft_title?: string;
};

export function workspaceBucketFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): WorkspaceBucket | null {
  const raw = metadata?.[WORKSPACE_BUCKET_KEY];
  if (
    raw === "sources" ||
    raw === "drafts" ||
    raw === "templates" ||
    raw === "generated"
  ) {
    return raw;
  }
  if (metadata?.[CONTENT_JSON_KEY]) return "drafts";
  return null;
}

export function isDraftDocument(doc: DocumentRecord): boolean {
  return workspaceBucketFromMetadata(doc.metadata) === "drafts";
}

export function isSourceDocument(doc: DocumentRecord): boolean {
  const bucket = workspaceBucketFromMetadata(doc.metadata);
  if (bucket === "drafts" || bucket === "generated") return false;
  if (bucket === "sources") return true;
  return Boolean(doc.extracted_text || doc.file_name);
}

export function draftTitleFromRecord(doc: DocumentRecord): string {
  const meta = doc.metadata ?? {};
  if (typeof meta[DRAFT_TITLE_KEY] === "string" && meta[DRAFT_TITLE_KEY]) {
    return meta[DRAFT_TITLE_KEY] as string;
  }
  return documentLabelFromRecord(doc) || "Untitled draft";
}

export function themeKeyFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): ResumeThemeKey {
  return metadata?.[THEME_KEY] === "compact" ? "compact" : "spacious";
}

export function partitionDocuments(docs: DocumentRecord[]) {
  const sources: DocumentRecord[] = [];
  const drafts: DocumentRecord[] = [];
  const generated: DocumentRecord[] = [];

  for (const doc of docs) {
    const bucket = workspaceBucketFromMetadata(doc.metadata);
    if (bucket === "drafts" || resumeContentFromMetadata(doc.metadata)) {
      drafts.push(doc);
    } else if (bucket === "generated") {
      generated.push(doc);
    } else {
      sources.push(doc);
    }
  }

  return { sources, drafts, generated };
}

export type DocumentBucketCounts = {
  sources: number;
  drafts: number;
  generated: number;
  templates: number;
};

export function documentBucketCounts(
  docs: DocumentRecord[],
  templateCount: number,
): DocumentBucketCounts {
  const { sources, drafts, generated } = partitionDocuments(docs);
  return {
    sources: sources.length,
    drafts: drafts.length,
    generated: generated.length,
    templates: templateCount,
  };
}

export type TemplateBucketItem = {
  template_type: string;
  label: string;
  file_name: string;
  word_count: number;
  source: "upload" | "vault";
  document_id?: string;
};

export function templateBucketItems(meta: OnboardingMetadata): TemplateBucketItem[] {
  const stored = getUserOutputTemplates(meta);
  return OUTPUT_TEMPLATES.filter((t) => stored[t.id]).map((t) => {
    const item = stored[t.id]!;
    return {
      template_type: t.id,
      label: t.name,
      file_name: item.file_name,
      word_count: item.word_count,
      source: item.source ?? "upload",
      document_id: item.document_id,
    };
  });
}

export function documentListItem(doc: DocumentRecord) {
  const content = resumeContentFromMetadata(doc.metadata);
  return {
    document_id: doc.document_id,
    document_type: doc.document_type,
    document_label: documentLabelFromRecord(doc),
    file_name: documentFileNameFromRecord(doc),
    uploaded_at: doc.uploaded_at,
    extraction_status: doc.extraction_status,
    workspace_bucket: workspaceBucketFromMetadata(doc.metadata),
    draft_title: isDraftDocument(doc) ? draftTitleFromRecord(doc) : undefined,
    theme_key: themeKeyFromMetadata(doc.metadata),
    incomplete_count: content?.incomplete_fields?.length ?? 0,
    has_content: Boolean(content),
  };
}

export function seedHeaderFromUser(user: {
  name: string | null;
  specialty: string | null;
  base_specialty: string | null;
  current_rotation: string | null;
}) {
  return {
    name: user.name ?? "",
    specialty: user.specialty ?? user.base_specialty ?? undefined,
    credentials: user.current_rotation
      ? `Current rotation: ${user.current_rotation}`
      : undefined,
  };
}
