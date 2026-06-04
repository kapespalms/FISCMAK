"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload, FileUp, Trash2, FolderOpen } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { Button } from "@/components/ui/Button";
import { ACCEPTED_CV_ACCEPT, ACCEPTED_CV_LABEL } from "@/lib/v2/document-upload-types";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import { OUTPUT_TEMPLATE_TYPE_SESSION_KEY } from "@/lib/v2/output-user-templates";

type TemplateSummary = {
  source: "upload" | "vault";
  document_id?: string;
  document_label?: string;
  file_name: string;
  word_count: number;
  uploaded_at: string;
  preview?: string;
};

type SeedableDocument = {
  document_id: string;
  file_name: string;
  document_label: string;
  document_type: string;
  uploaded_at: string;
  preview: string;
};

type OutputUserTemplatePanelProps = {
  templateType: string;
  templateName: string;
};

export function OutputUserTemplatePanel({
  templateType,
  templateName,
}: OutputUserTemplatePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [template, setTemplate] = useState<TemplateSummary | null>(null);
  const [seedableDocuments, setSeedableDocuments] = useState<SeedableDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/output/user-template?template_type=${encodeURIComponent(templateType)}`,
      );
      const data = await res.json();
      setTemplate(data.template ?? null);
      setSeedableDocuments(data.seedable_documents ?? []);
      if (data.template?.source === "vault" && data.template.document_id) {
        setSelectedDocumentId(data.template.document_id);
      }
    } catch {
      setError("Could not load seed settings.");
    } finally {
      setLoading(false);
    }
  }, [templateType]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(OUTPUT_TEMPLATE_TYPE_SESSION_KEY, templateType);
    }
    void loadTemplate();
  }, [templateType, loadTemplate]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("template_type", templateType);
      const res = await fetch("/api/v1/output/user-template", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Upload failed.");
        return;
      }
      setTemplate(data.template ?? null);
      setSelectedDocumentId("");
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function seedFromVault(documentId: string) {
    if (!documentId) return;
    setUploading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/output/user-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: templateType,
          document_id: documentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not use that document.");
        return;
      }
      setTemplate(data.template ?? null);
      setSelectedDocumentId(documentId);
    } catch {
      setError("Could not use that document.");
    } finally {
      setUploading(false);
    }
  }

  async function removeTemplate() {
    setUploading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/output/user-template?template_type=${encodeURIComponent(templateType)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Could not clear seed.");
        return;
      }
      setTemplate(null);
      setSelectedDocumentId("");
    } catch {
      setError("Could not clear seed.");
    } finally {
      setUploading(false);
    }
  }

  const hasSeed = Boolean(template);
  const seedTitle = template
    ? template.source === "vault"
      ? template.document_label ?? template.file_name
      : template.file_name
    : "Seed this document";

  return (
    <CardSection
      compact
      className="border-cx-forest-dark/15 bg-cx-forest-dark/[0.02]"
      eyebrow="Seed document"
      title={seedTitle}
      description={
        hasSeed
          ? `Mak will co-author into this structure for your ${templateName} using Career Data evidence.`
          : `Optional — pick a document you already uploaded, or upload a template (${ACCEPTED_CV_LABEL}).`
      }
      icon={FileUp}
      mak={OUTPUT_MAK.user_template(templateType, templateName, hasSeed)}
      action={
        hasSeed ? (
          <Button
            variant="secondary"
            className="min-h-0 px-3 py-1.5 text-xs"
            disabled={uploading}
            onClick={() => void removeTemplate()}
          >
            <Trash2 size={14} className="mr-1.5" />
            Clear seed
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <p className="text-sm text-cx-forest-dark/60">Loading…</p>
      ) : (
        <div className="space-y-4">
          {seedableDocuments.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cx-forest-dark/60">
                <FolderOpen size={14} />
                From your Career Data
              </p>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedDocumentId}
                  disabled={uploading}
                  onChange={(e) => setSelectedDocumentId(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-cx-forest-dark/20 bg-white px-3 py-2 text-sm text-cx-forest-dark"
                >
                  <option value="">Select an uploaded document…</option>
                  {seedableDocuments.map((doc) => (
                    <option key={doc.document_id} value={doc.document_id}>
                      {doc.document_label} — {doc.file_name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  className="min-h-0 shrink-0 px-3 py-2 text-xs"
                  disabled={uploading || !selectedDocumentId}
                  onClick={() => void seedFromVault(selectedDocumentId)}
                >
                  Use as seed
                </Button>
              </div>
              <Link
                href="/app/objective?tab=documents"
                className="text-xs font-medium text-cx-forest-dark underline underline-offset-2 hover:text-cx-forest-dark/80"
              >
                Upload more in Career Data →
              </Link>
            </div>
          )}

          {seedableDocuments.length === 0 && (
            <p className="text-sm text-cx-forest-dark/70">
              No readable documents in Career Data yet.{" "}
              <Link
                href="/app/objective?tab=documents"
                className="font-medium underline underline-offset-2"
              >
                Upload documents
              </Link>{" "}
              to seed from an existing file, or upload a template below.
            </p>
          )}

          <div className="space-y-2 border-t border-cx-forest-dark/10 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/60">
              Or upload a template
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_CV_ACCEPT}
              className="hidden"
              onChange={(e) => void onFileChange(e)}
            />
            <Button
              variant="secondary"
              className="min-h-0 px-3 py-1.5 text-xs"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={14} className="mr-1.5" />
              {hasSeed && template?.source === "upload" ? "Replace template" : "Upload template"}
            </Button>
          </div>

          {hasSeed && (
            <div className="space-y-2 border-t border-cx-forest-dark/10 pt-3">
              <p className="text-xs text-cx-forest-dark/70">
                {template!.source === "vault" ? "From Career Data · " : "Uploaded template · "}
                {template!.word_count.toLocaleString()} words ·{" "}
                {new Date(template!.uploaded_at).toLocaleDateString()}
              </p>
              {template!.preview && (
                <pre className="max-h-24 overflow-hidden whitespace-pre-wrap rounded-lg bg-white/80 p-3 text-xs text-cx-forest-dark/80">
                  {template!.preview}
                  {template!.preview.length >= 400 ? "…" : ""}
                </pre>
              )}
              <MakDiscussLink
                mak={OUTPUT_MAK.user_template(templateType, templateName, true)}
                variant="button"
              />
            </div>
          )}

          {!hasSeed && seedableDocuments.length > 0 && (
            <p className="text-sm text-cx-forest-dark/70">
              Without a seed, Mak uses FISCMAK&apos;s default structure for this document type.
            </p>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-[#C28D6C]">{error}</p>}
    </CardSection>
  );
}
