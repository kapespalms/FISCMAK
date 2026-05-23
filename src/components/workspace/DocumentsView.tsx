"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Upload } from "lucide-react";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";

type V2Document = {
  document_id: string;
  document_type: string;
  file_url: string | null;
  uploaded_at: string;
  extraction_status: string;
  extracted_text_preview?: string;
};

export function DocumentsView() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<V2Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/documents");
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (searchParams.get("upload") !== "1") return;
    const timer = window.setTimeout(() => fileInputRef.current?.click(), 300);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  async function uploadFile(file: File, documentType = "CV") {
    setProcessing(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", documentType);
      const res = await fetch("/api/v1/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Upload failed");
      }
      await fetch("/api/v1/mempalace/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await loadDocuments();
      setPasteText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProcessing(false);
    }
  }

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAcceptedCvFileName(file.name)) {
      setError(`Upload ${ACCEPTED_CV_LABEL}, or paste your CV text below.`);
      return;
    }
    await uploadFile(file);
    e.target.value = "";
  }

  async function onPasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const blob = new Blob([pasteText.trim()], { type: "text/plain" });
    const file = new File([blob], "pasted-cv.txt", { type: "text/plain" });
    await uploadFile(file);
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <Card>
        <label
          htmlFor="file-upload-objective"
          className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-cx-border bg-cx-cream/40 px-6 py-10 transition-colors hover:border-cx-charcoal hover:bg-cx-cream/70"
        >
          <Upload className="text-cx-charcoal" size={28} />
          <p className="mt-3 font-semibold text-cx-text">Drop or click to upload CV</p>
          <p className="mt-1 text-sm text-cx-text-secondary">
            {ACCEPTED_CV_LABEL} — syncs to MemPalace for Mak coaching
          </p>
          <input
            ref={fileInputRef}
            id="file-upload-objective"
            type="file"
            accept={ACCEPTED_CV_ACCEPT}
            className="hidden"
            onChange={onFileSelect}
            disabled={processing}
          />
        </label>
        {processing && (
          <p className="mt-4 text-center text-sm text-cx-text-secondary">
            Processing document and syncing MemPalace…
          </p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold text-cx-text">Or paste document text</h2>
        <form onSubmit={onPasteSubmit} className="mt-4 space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            placeholder="Paste CV or personal statement text here…"
            className="cx-field w-full"
          />
          <Button type="submit" disabled={processing || !pasteText.trim()}>
            Upload pasted text
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold text-cx-text">Uploaded</h2>
        {loading && <p className="text-sm text-cx-text-secondary">Loading…</p>}
        {!loading && documents.length === 0 && (
          <p className="text-sm text-cx-text-secondary">No documents yet.</p>
        )}
        {documents.map((doc) => (
          <Card key={doc.document_id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-cx-text">{doc.document_type}</p>
              <Badge>{doc.extraction_status}</Badge>
            </div>
            <p className="mt-2 text-xs text-cx-text-secondary">
              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
