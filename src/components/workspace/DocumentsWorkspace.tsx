"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { CvDraftWorkspace } from "@/components/documents/CvDraftWorkspace";
import { useAppShell } from "@/components/layout/AppShell";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload-types";
import {
  uploadUserDocument,
  syncMempalaceAfterCvUpload,
} from "@/lib/v2/document-upload-client";
import { themeKeyFromMetadata, type WorkspaceBucket, type DocumentBucketCounts } from "@/lib/v2/documents-workspace";
import { resumeContentFromMetadata } from "@/lib/v2/resume-content";
import { DOCUMENTS_MAK_CHIPS } from "@/lib/v2/documents-mak-context";
import { FileText, FolderOpen, Layers, Sparkles, Upload } from "lucide-react";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";

type DocListItem = {
  document_id: string;
  document_type: string;
  document_label?: string;
  file_name?: string;
  uploaded_at: string;
  extraction_status: string;
  extracted_text_preview?: string;
  workspace_bucket?: string | null;
  draft_title?: string;
  incomplete_count?: number;
  has_content?: boolean;
  content_json?: unknown;
  metadata?: Record<string, unknown>;
};

const BUCKETS: { id: WorkspaceBucket; label: string; icon: typeof Upload }[] = [
  { id: "sources", label: "Sources", icon: Upload },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "templates", label: "Templates", icon: Layers },
  { id: "generated", label: "Generated", icon: Sparkles },
];

export function DocumentsWorkspace() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openMakWithMessage } = useAppShell();
  const [documents, setDocuments] = useState<DocListItem[]>([]);
  const [bucketCounts, setBucketCounts] = useState<DocumentBucketCounts | null>(null);
  const [templates, setTemplates] = useState<
    {
      template_type: string;
      label: string;
      file_name: string;
      word_count: number;
      source: "upload" | "vault";
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBucket, setActiveBucket] = useState<WorkspaceBucket>("sources");
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [activeDraftId, setActiveDraftId] = useState<string | null>(
    searchParams.get("draft") || null,
  );
  const [pasteText, setPasteText] = useState("");

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/documents");
      const data = await res.json();
      setDocuments(data.documents ?? []);
      if (data.bucket_counts) {
        setBucketCounts(data.bucket_counts as DocumentBucketCounts);
      }
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/output/user-template");
      const data = await res.json();
      const items = (data.templates ?? []) as {
        template_type: string;
        file_name: string;
        word_count: number;
        source?: string;
      }[];
      setTemplates(
        items.map((t) => ({
          template_type: t.template_type,
          label: t.template_type.replace(/_/g, " "),
          file_name: t.file_name,
          word_count: t.word_count,
          source: (t.source ?? "upload") as "upload" | "vault",
        })),
      );
    } catch {
      setTemplates([]);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
    void loadTemplates();
  }, [loadDocuments, loadTemplates]);

  useEffect(() => {
    if (searchParams.get("upload") === "1") {
      const t = window.setTimeout(() => fileInputRef.current?.click(), 300);
      return () => window.clearTimeout(t);
    }
  }, [searchParams]);

  const sources = documents.filter(
    (d) => d.workspace_bucket !== "drafts" && d.workspace_bucket !== "generated" && !d.has_content,
  );
  const drafts = documents.filter(
    (d) => d.workspace_bucket === "drafts" || d.has_content,
  );
  const generated = documents.filter((d) => d.workspace_bucket === "generated");

  const bucketCountFor = (id: WorkspaceBucket): number | null => {
    if (!bucketCounts) return null;
    return bucketCounts[id];
  };

  const activeDraft = activeDraftId
    ? documents.find((d) => d.document_id === activeDraftId)
    : null;

  async function uploadFile(file: File) {
    setProcessing(true);
    setError(null);
    try {
      await uploadUserDocument(file, {
        document_type: "CV",
        document_subtype: "CV",
        document_label: "CV / Resume",
      });
      await syncMempalaceAfterCvUpload();
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
      setError(`Upload ${ACCEPTED_CV_LABEL}, or paste text below.`);
      return;
    }
    await uploadFile(file);
    e.target.value = "";
  }

  async function createBlankDraft() {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/documents/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_title: "New CV draft" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not create draft");
      await loadDocuments();
      setActiveDraftId(data.document_id);
      setActiveBucket("drafts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setProcessing(false);
    }
  }

  async function mergeSelectedSources() {
    const ids = [...selectedSourceIds];
    if (ids.length === 0) {
      setError("Select at least one source with extracted text.");
      return;
    }
    setMerging(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/documents/merge-cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_ids: ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Merge failed");
      await loadDocuments();
      setActiveDraftId(data.document_id);
      setActiveBucket("drafts");
      setSelectedSourceIds(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setMerging(false);
    }
  }

  function toggleSource(id: string) {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (activeDraftId && activeDraft) {
    const content =
      (activeDraft.content_json
        ? resumeContentFromMetadata({ content_json: activeDraft.content_json })
        : null) ?? resumeContentFromMetadata(activeDraft.metadata ?? {});
    return (
      <PageShell
        eyebrow="Documents"
        title="CV draft editor"
        subtitle="Structured blocks with live preview — changes save automatically."
        maxWidth="full"
      >
        <CvDraftWorkspace
          documentId={activeDraftId}
          initialTitle={activeDraft.draft_title ?? activeDraft.document_label ?? "CV Draft"}
          initialContent={content}
          initialTheme={themeKeyFromMetadata(activeDraft.metadata)}
          onBack={() => setActiveDraftId(null)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={SOAP_TAB.objective.nav}
      title="Documents"
      subtitle="Sources, drafts, templates, and exports — one flat workspace for your CV pipeline."
      maxWidth="full"
    >
      <AcademicSoapSectionGate intent="review" />

      {error && (
        <p className="mb-4 rounded-xl border border-[#C28D6C]/20 bg-[#C28D6C]/8 px-4 py-3 text-sm text-[#C28D6C]">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {DOCUMENTS_MAK_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className="cx-nav-pill cx-nav-pill-inactive text-sm"
            onClick={() => openMakWithMessage(chip.message)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {BUCKETS.map(({ id, label, icon: Icon }) => {
          const count = bucketCountFor(id);
          return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveBucket(id)}
            className={
              activeBucket === id
                ? "cx-nav-pill cx-nav-pill-active inline-flex items-center gap-2"
                : "cx-nav-pill cx-nav-pill-inactive inline-flex items-center gap-2"
            }
          >
            <Icon size={16} />
            {label}
            {count != null && count > 0 && (
              <span className="rounded-full bg-cx-forest-dark/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                {count}
              </span>
            )}
          </button>
          );
        })}
      </div>

      <div className="cx-section-surface">
        {activeBucket === "sources" && (
          <div className="space-y-6">
            <CardSection
              eyebrow="Archive"
              title="Sources"
              description="Uploaded CVs and files — immutable inputs for merge and Mak."
              icon={Upload}
              mak={OBJECTIVE_MAK.documents}
            >
              <label
                htmlFor="documents-upload"
                className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-cx-forest-dark/25 bg-cx-forest-dark/[0.03] px-6 py-10 transition-colors hover:border-cx-forest-dark/40"
              >
                <Upload className="text-cx-text" size={28} />
                <p className="mt-3 font-semibold text-cx-text">Upload source file</p>
                <input
                  ref={fileInputRef}
                  id="documents-upload"
                  type="file"
                  accept={ACCEPTED_CV_ACCEPT}
                  className="hidden"
                  onChange={onFileSelect}
                  disabled={processing}
                />
              </label>
              {processing && (
                <p className="mt-3 text-sm text-cx-text/70">Processing…</p>
              )}
              <form
                className="mt-6 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!pasteText.trim()) return;
                  const blob = new Blob([pasteText.trim()], { type: "text/plain" });
                  void uploadFile(new File([blob], "pasted-cv.txt", { type: "text/plain" }));
                }}
              >
                <textarea
                  className="cx-field w-full"
                  rows={4}
                  placeholder="Or paste CV text…"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                />
                <Button type="submit" disabled={processing || !pasteText.trim()}>
                  Upload pasted text
                </Button>
              </form>
            </CardSection>

            {loading && <p className="text-sm text-cx-text/70">Loading sources…</p>}
            {!loading && sources.length === 0 && (
              <p className="rounded-xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] px-4 py-8 text-center text-sm text-cx-text/70">
                No sources yet. Upload a CV to get started.
              </p>
            )}

            <div className="space-y-3">
              {sources.map((doc) => {
                const hasText = Boolean(doc.extracted_text_preview?.trim());
                return (
                  <div
                    key={doc.document_id}
                    className="flex flex-wrap items-start gap-3 rounded-xl border border-cx-forest-dark/15 bg-white/80 p-4"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      disabled={!hasText}
                      checked={selectedSourceIds.has(doc.document_id)}
                      onChange={() => toggleSource(doc.document_id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-cx-text">
                        {doc.document_label ?? doc.file_name ?? doc.document_type}
                      </p>
                      <p className="text-xs text-cx-text/60">
                        {new Date(doc.uploaded_at).toLocaleDateString()} ·{" "}
                        {doc.extraction_status}
                      </p>
                    </div>
                    <Badge>{hasText ? "Ready" : "No text"}</Badge>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              disabled={merging || selectedSourceIds.size === 0}
              onClick={() => void mergeSelectedSources()}
            >
              {merging ? "Merging…" : "Build draft from selected sources"}
            </Button>
          </div>
        )}

        {activeBucket === "drafts" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => void createBlankDraft()} disabled={processing}>
                New blank draft
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setActiveBucket("sources");
                }}
              >
                Merge from sources
              </Button>
            </div>
            {loading && <p className="text-sm text-cx-text/70">Loading drafts…</p>}
            {!loading && drafts.length === 0 && (
              <p className="rounded-xl border border-cx-forest-dark/10 px-4 py-8 text-center text-sm text-cx-text/70">
                No drafts yet. Create one or merge uploaded sources.
              </p>
            )}
            <div className="space-y-3">
              {drafts.map((doc) => (
                <button
                  key={doc.document_id}
                  type="button"
                  className="w-full rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4 text-left transition hover:border-cx-forest-dark/30 hover:bg-cx-forest-dark/[0.06]"
                  onClick={() => setActiveDraftId(doc.document_id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-cx-text">
                      {doc.draft_title ?? doc.document_label ?? "CV Draft"}
                    </p>
                    {(doc.incomplete_count ?? 0) > 0 && (
                      <Badge>{doc.incomplete_count} to fix</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-cx-text/60">
                    Updated {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeBucket === "templates" && (
          <div className="space-y-4">
            <p className="text-sm text-cx-text/75">
              Reuse Output Studio user templates. Manage seeds in{" "}
              <Link href="/app/output" className="font-medium underline">
                Output Studio
              </Link>
              .
            </p>
            {templates.length === 0 && (
              <p className="rounded-xl border border-cx-forest-dark/10 px-4 py-8 text-center text-sm text-cx-text/70">
                No saved templates yet. Seed a template from a vault document in Output Studio.
              </p>
            )}
            {templates.map((t) => (
              <div
                key={t.template_type}
                className="rounded-xl border border-cx-forest-dark/15 p-4"
              >
                <p className="font-semibold text-cx-text">{t.label}</p>
                <p className="text-sm text-cx-text/65">
                  {t.file_name} · {t.word_count} words · {t.source}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeBucket === "generated" && (
          <div className="space-y-4">
            {generated.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-cx-forest-dark/20 px-6 py-12 text-center">
                <FolderOpen className="text-cx-text/40" size={40} />
                <p className="mt-4 font-medium text-cx-text">Exports coming soon</p>
                <p className="mt-2 max-w-md text-sm text-cx-text/65">
                  PDF and DOCX export will appear here when generated from Output Studio or this
                  workspace.
                </p>
              </div>
            ) : (
              generated.map((doc) => (
                <div
                  key={doc.document_id}
                  className="rounded-xl border border-cx-forest-dark/15 p-4"
                >
                  <p className="font-semibold">{doc.document_type}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
