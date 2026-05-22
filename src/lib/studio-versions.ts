import { isClientDemoMode } from "@/lib/demo-mode";

export type DocumentVersion = {
  id: string;
  version_number: number;
  content: string;
  plain_text: string;
  created_at: string;
  change_notes?: string;
};

const prefix = "fiscmak_studio_versions_";

export function loadVersions(templateId: string): DocumentVersion[] {
  if (typeof window === "undefined" || !isClientDemoMode()) return [];
  try {
    const raw = localStorage.getItem(prefix + templateId);
    if (raw) return JSON.parse(raw) as DocumentVersion[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveVersion(
  templateId: string,
  editorStateJson: string,
  plainText: string,
  changeNotes?: string,
): DocumentVersion[] {
  if (!isClientDemoMode()) return [];
  const existing = loadVersions(templateId);
  const version: DocumentVersion = {
    id: crypto.randomUUID(),
    version_number: existing.length + 1,
    content: editorStateJson,
    plain_text: plainText,
    created_at: new Date().toISOString(),
    change_notes: changeNotes,
  };
  const next = [version, ...existing].slice(0, 10);
  localStorage.setItem(prefix + templateId, JSON.stringify(next));
  return next;
}

export function loadDraft(templateId: string): string | null {
  if (typeof window === "undefined" || !isClientDemoMode()) return null;
  return localStorage.getItem(`fiscmak_studio_draft_${templateId}`);
}

export function saveDraft(templateId: string, editorStateJson: string) {
  if (!isClientDemoMode()) return;
  localStorage.setItem(`fiscmak_studio_draft_${templateId}`, editorStateJson);
}
