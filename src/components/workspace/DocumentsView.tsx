"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { FileText, Upload } from "lucide-react";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";
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
      window.dispatchEvent(new CustomEvent("fiscmak:document-uploaded"));
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
      <div className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.04] px-4 py-4">
        <p className="font-semibold text-cx-forest-dark">CV workspace</p>
        <p className="mt-1 text-sm text-cx-forest-dark/70">
          Structured drafts, merge sources, and live preview — open the full Documents hub.
        </p>
        <a
          href="/app/documents"
          className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-cx-forest-dark px-5 text-sm font-semibold text-white hover:bg-cx-forest-dark/90"
        >
          Open Documents workspace
        </a>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <CardSection
        eyebrow="Upload"
        title="CV & documents"
        description={`${ACCEPTED_CV_LABEL} — syncs to MemPalace for Mak coaching`}
        icon={Upload}
        mak={OBJECTIVE_MAK.documents}
      >
        <label
          htmlFor="file-upload-objective"
          className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-cx-forest-dark/25 bg-cx-forest-dark/[0.03] px-6 py-10 transition-colors hover:border-cx-forest-dark/40 hover:bg-cx-forest-dark/[0.06]"
        >
          <Upload className="text-cx-forest-dark" size={28} />
          <p className="mt-3 font-semibold text-cx-forest-dark">Drop or click to upload CV</p>
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
          <p className="mt-4 text-center text-sm text-cx-forest-dark/70">
            Processing document and syncing MemPalace…
          </p>
        )}
      </CardSection>

      <CardSection
        eyebrow="Alternative"
        title="Paste document text"
        icon={FileText}
        mak={OBJECTIVE_MAK.documents}
      >
        <form onSubmit={onPasteSubmit} className="space-y-4">
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
      </CardSection>

      <CardSection eyebrow="Library" title="Uploaded documents" mak={OBJECTIVE_MAK.documents}>
        {loading && <p className="text-sm text-cx-forest-dark/70">Loading…</p>}
        {!loading && documents.length === 0 && (
          <p className="text-sm text-cx-forest-dark/70">No documents yet.</p>
        )}
        <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.document_id}
            className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-cx-forest-dark">{doc.document_type}</p>
              <Badge>{doc.extraction_status}</Badge>
            </div>
            <p className="mt-2 text-xs text-cx-forest-dark/70">
              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        </div>
      </CardSection>
    </div>
  );
}
