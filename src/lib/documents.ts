export type UploadedDocument = {
  id: string;
  file_name: string;
  file_type: string;
  parsed_text: string;
  detected_document_type: string | null;
  extracted_entities: Record<string, unknown> | null;
  created_at: string;
};

const KEY = "fiscmak_documents_demo";

export function loadDemoDocuments(): UploadedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as UploadedDocument[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveDemoDocuments(docs: UploadedDocument[]) {
  localStorage.setItem(KEY, JSON.stringify(docs));
}
