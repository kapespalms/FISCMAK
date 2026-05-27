import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  documentFileNameFromRecord,
  documentLabelFromRecord,
} from "@/lib/v2/onboarding-document-types";
import type { DocumentRecord } from "@/lib/v2/types";
import { OUTPUT_TEMPLATES } from "@/lib/constants";

export type UserOutputTemplateSource = "upload" | "vault";

export type UserOutputTemplate = {
  source?: UserOutputTemplateSource;
  /** Career Data vault document when source is vault */
  document_id?: string;
  document_label?: string;
  file_name: string;
  source_format: string;
  word_count: number;
  extracted_text: string;
  uploaded_at: string;
};

export type UserOutputTemplatesMap = Partial<Record<string, UserOutputTemplate>>;

export const OUTPUT_USER_TEMPLATE_TEXT_LIMIT = 20_000;
export const OUTPUT_TEMPLATE_TYPE_SESSION_KEY = "fiscmak_output_template_type";

export function isKnownOutputTemplateType(templateType: string): boolean {
  return OUTPUT_TEMPLATES.some((t) => t.id === templateType);
}

export function getUserOutputTemplates(
  meta: OnboardingMetadata,
): UserOutputTemplatesMap {
  return meta.output_user_templates ?? {};
}

export function getUserOutputTemplate(
  meta: OnboardingMetadata,
  templateType: string,
): UserOutputTemplate | null {
  return meta.output_user_templates?.[templateType] ?? null;
}

export function setUserOutputTemplate(
  meta: OnboardingMetadata,
  templateType: string,
  template: UserOutputTemplate,
): OnboardingMetadata {
  return {
    ...meta,
    output_user_templates: {
      ...getUserOutputTemplates(meta),
      [templateType]: template,
    },
  };
}

export function removeUserOutputTemplate(
  meta: OnboardingMetadata,
  templateType: string,
): OnboardingMetadata {
  const next = { ...getUserOutputTemplates(meta) };
  delete next[templateType];
  return {
    ...meta,
    output_user_templates: Object.keys(next).length ? next : undefined,
  };
}

export function truncateTemplateText(text: string): string {
  if (text.length <= OUTPUT_USER_TEMPLATE_TEXT_LIMIT) return text;
  return `${text.slice(0, OUTPUT_USER_TEMPLATE_TEXT_LIMIT)}\n\n[Template truncated for context length.]`;
}

function wordCountFromText(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function userOutputTemplateFromDocument(
  doc: DocumentRecord,
): UserOutputTemplate | null {
  const text = doc.extracted_text?.trim();
  if (!text) return null;
  const metaWc = doc.metadata?.word_count;
  return {
    source: "vault",
    document_id: doc.document_id,
    document_label: documentLabelFromRecord(doc),
    file_name: documentFileNameFromRecord(doc),
    source_format:
      typeof doc.metadata?.source_format === "string"
        ? doc.metadata.source_format
        : "vault",
    word_count:
      typeof metaWc === "number" ? metaWc : wordCountFromText(text),
    extracted_text: truncateTemplateText(text),
    uploaded_at: doc.uploaded_at,
  };
}

/** Resolve seed content — refreshes text from vault when linked to a document */
export function resolveUserOutputTemplate(
  meta: OnboardingMetadata,
  templateType: string,
  documents: DocumentRecord[],
): UserOutputTemplate | null {
  const stored = getUserOutputTemplate(meta, templateType);
  if (!stored) return null;
  if (stored.source !== "vault" || !stored.document_id) return stored;

  const doc = documents.find((d) => d.document_id === stored.document_id);
  if (!doc) return stored;
  const fresh = userOutputTemplateFromDocument(doc);
  if (!fresh) return stored;
  return { ...stored, ...fresh };
}

function templateSourceLabel(template: UserOutputTemplate): string {
  if (template.source === "vault") {
    return `Career Data: ${template.document_label ?? template.file_name}`;
  }
  return template.file_name;
}

/** Mak system context — collaborative drafting against user's seed document */
export function buildUserOutputTemplateMakContext(
  template: UserOutputTemplate,
  templateType: string,
): string {
  const label = OUTPUT_TEMPLATES.find((t) => t.id === templateType)?.name ?? templateType;
  const origin =
    template.source === "vault"
      ? "Previously uploaded to Career Data vault"
      : "Uploaded as Output Studio template";
  const sourceLabel = templateSourceLabel(template);
  return `[User seed for ${label} — collaborative drafting]
${origin}: ${sourceLabel} (${template.word_count} words)

Follow the document's structure, section headings, and formatting conventions below.
Fill placeholders with Career Data vault evidence only — do not invent metrics.
Ask one clarifying question at a time when a section needs more detail from the physician.
Preserve their voice and format; you are co-authoring into their seed document, not replacing it.

--- SEED DOCUMENT START ---
${truncateTemplateText(template.extracted_text)}
--- SEED DOCUMENT END ---`;
}

/** AI generation prompt block for Output Studio generate action */
export function buildUserOutputTemplateGenerationInstructions(
  template: UserOutputTemplate,
  templateType: string,
): string {
  const label = OUTPUT_TEMPLATES.find((t) => t.id === templateType)?.name ?? templateType;
  return `The physician selected an existing document to seed their ${label} (${templateSourceLabel(template)}).
Collaboratively populate it using vault evidence. Mirror section order, headings, and tone from their seed.
Do not discard their structure — adapt content into it.

SEED DOCUMENT:
${truncateTemplateText(template.extracted_text)}`;
}

export function resolveOutputTemplateType(
  explicit?: string | null,
): string | null {
  if (explicit && isKnownOutputTemplateType(explicit)) return explicit;
  return null;
}

export function serializeUserOutputTemplateForClient(
  template: UserOutputTemplate,
): {
  source: UserOutputTemplateSource;
  document_id?: string;
  document_label?: string;
  file_name: string;
  source_format: string;
  word_count: number;
  uploaded_at: string;
  preview: string;
} {
  return {
    source: template.source ?? "upload",
    document_id: template.document_id,
    document_label: template.document_label,
    file_name: template.file_name,
    source_format: template.source_format,
    word_count: template.word_count,
    uploaded_at: template.uploaded_at,
    preview: template.extracted_text.slice(0, 400),
  };
}
