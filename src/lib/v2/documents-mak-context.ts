import type { ResumeContent } from "@/lib/v2/resume-content";
import { collectIncompleteFields } from "@/lib/v2/resume-content";

export type DocumentsDraftMakInput = {
  active_document_id?: string | null;
  content_json?: ResumeContent | null;
  incomplete_fields?: ResumeContent["incomplete_fields"];
  draft_title?: string;
};

export function buildDocumentsDraftMakContext(input: DocumentsDraftMakInput): string {
  const content = input.content_json;
  if (!content && !input.active_document_id) return "";

  const incomplete = input.incomplete_fields?.length
    ? input.incomplete_fields
    : content
      ? collectIncompleteFields(content)
      : [];

  const lines: string[] = ["## Active CV draft (Documents workspace)"];
  if (input.draft_title) lines.push(`Title: ${input.draft_title}`);
  if (input.active_document_id) lines.push(`Document ID: ${input.active_document_id}`);

  if (incomplete.length > 0) {
    lines.push(
      `${incomplete.length} field(s) need attention (dates or details). Use incomplete_fields — never invent dates.`,
    );
    for (const f of incomplete.slice(0, 12)) {
      lines.push(`- ${f.block_id}.${f.field}${f.reason ? `: ${f.reason}` : ""}`);
    }
  }

  if (content?.merge_flags?.length) {
    lines.push(`Merge review flags: ${content.merge_flags.join("; ")}`);
  }

  if (content?.blocks?.length) {
    lines.push("Structured blocks (summary):");
    for (const block of content.blocks.slice(0, 20)) {
      if (block.type === "header") {
        lines.push(`- header: ${block.name}${block.specialty ? `, ${block.specialty}` : ""}`);
      } else if (block.type === "experience") {
        lines.push(
          `- experience: ${block.role} @ ${block.organization} (${block.dates.display || "dates TBD"}) — ${block.bullets.length} bullets`,
        );
      } else if (block.type === "education") {
        lines.push(`- education: ${block.degree}, ${block.institution}`);
      } else if (block.type === "skills") {
        lines.push(`- skills: ${block.label} (${block.items.length} items)`);
      }
    }
  }

  lines.push(
    "When editing: preserve factual accuracy from sources; flag uncertain dates with incomplete_fields rather than guessing.",
  );

  return lines.join("\n");
}

export function documentsMakIntroSuffix(incompleteCount: number): string {
  if (incompleteCount <= 0) return "";
  return ` I see ${incompleteCount} item${incompleteCount === 1 ? "" : "s"} on your draft that still need dates or details — we can fix those first.`;
}

export const DOCUMENTS_MAK_CHIPS = [
  { id: "fix_dates", label: "Fix missing dates", message: "Help me fix missing or uncertain dates on my active CV draft. Only use information from my sources; mark anything uncertain in incomplete_fields." },
  { id: "merge_sources", label: "Merge sources", message: "Help me merge my uploaded CV sources into one coherent draft without duplicating roles or inventing dates." },
  { id: "sharpen_bullets", label: "Sharpen bullets", message: "Sharpen the experience bullets on my active CV draft for academic medicine — outcome-focused, no invented metrics." },
] as const;
