"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload-types";
import {
  ONBOARDING_DOCUMENT_TYPE_OPTIONS,
  getOnboardingUploadOption,
  resolveOnboardingDocumentUpload,
} from "@/lib/v2/onboarding-document-types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, CircleX, Pencil, Upload, XCircle } from "lucide-react";
import {
  LuxuryCardHeader,
  LuxuryTextarea,
  LuxuryWorkspace,
} from "@/components/onboarding/OnboardingLuxuryUi";

type SavedDocument = {
  document_id: string;
  typeId: string;
  typeLabel: string;
  fileName: string;
  preview: string;
  status: "complete";
};

type UploadingDocument = {
  localId: string;
  typeId: string;
  typeLabel: string;
  fileName: string;
  progress: number;
  status: "uploading" | "error";
  error?: string;
};

type DocumentRow = SavedDocument | UploadingDocument;

type OnboardingDocumentsStepProps = {
  onContinue: () => void;
  continueDisabled?: boolean;
  variant?: "default" | "luxury";
};

function isUploading(doc: DocumentRow): doc is UploadingDocument {
  return doc.status === "uploading" || doc.status === "error";
}

function uploadWithProgress(
  form: FormData,
  onProgress: (progress: number) => void,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        reject(new Error("Upload failed"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }
      reject(new Error(typeof data.message === "string" ? data.message : "Upload failed"));
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.open("POST", "/api/v1/documents");
    xhr.send(form);
  });
}

export function OnboardingDocumentsStep({
  onContinue,
  continueDisabled = false,
  variant = "default",
}: OnboardingDocumentsStepProps) {
  const luxury = variant === "luxury";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [selectedDocType, setSelectedDocType] = useState("CV");
  const [customDocLabel, setCustomDocLabel] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editDrafts, setEditDrafts] = useState<Record<string, { typeId: string; customLabel: string }>>(
    {},
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const selectedDocOption = getOnboardingUploadOption(selectedDocType);
  const isUploadingAny = documents.some((doc) => isUploading(doc) && doc.status === "uploading");

  const refreshSavedDocuments = useCallback(async () => {
    const res = await fetch("/api/v1/documents");
    const data = await res.json();
    const saved = (data.documents ?? []) as Array<{
      document_id: string;
      document_subtype: string;
      document_label: string;
      file_name: string;
      extracted_text_preview?: string;
    }>;

    setDocuments((current) => {
      const inFlight = current.filter(isUploading);
      const savedRows: SavedDocument[] = saved.map((doc) => ({
        document_id: doc.document_id,
        typeId: doc.document_subtype,
        typeLabel: doc.document_label,
        fileName: doc.file_name,
        preview: doc.extracted_text_preview ?? "",
        status: "complete",
      }));
      return [...inFlight, ...savedRows];
    });
  }, []);

  useEffect(() => {
    void refreshSavedDocuments();
  }, [refreshSavedDocuments]);

  async function startUpload(file: File, typeId: string, customLabel?: string) {
    setError("");

    let resolved;
    try {
      resolved = resolveOnboardingDocumentUpload(typeId, customLabel);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Select a document type.");
      return;
    }

    if (!isAcceptedCvFileName(file.name)) {
      setError(`Upload ${ACCEPTED_CV_LABEL}, or paste text below.`);
      return;
    }

    const localId = crypto.randomUUID();
    const uploadingRow: UploadingDocument = {
      localId,
      typeId,
      typeLabel: resolved.document_label,
      fileName: file.name,
      progress: 0,
      status: "uploading",
    };

    setDocuments((current) => [uploadingRow, ...current.filter((doc) => !isUploading(doc) || doc.localId !== localId)]);

    const form = new FormData();
    form.append("file", file);
    form.append("document_type", resolved.document_type);
    form.append("document_subtype", resolved.document_subtype);
    form.append("document_label", resolved.document_label);
    if (customLabel?.trim()) form.append("custom_label", customLabel.trim());

    try {
      await uploadWithProgress(form, (progress) => {
        setDocuments((current) =>
          current.map((doc) =>
            isUploading(doc) && doc.localId === localId ? { ...doc, progress } : doc,
          ),
        );
      });
      setDocuments((current) => current.filter((doc) => !(isUploading(doc) && doc.localId === localId)));
      await refreshSavedDocuments();
      setPasteText("");
      if (typeId === "Other") setCustomDocLabel("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setDocuments((current) =>
        current.map((doc) =>
          isUploading(doc) && doc.localId === localId
            ? { ...doc, status: "error", error: message, progress: 0 }
            : doc,
        ),
      );
      setError(message);
    }
  }

  function onFilesSelected(files: FileList | File[] | null) {
    if (!files?.length) return;

    if (selectedDocOption?.requiresCustomLabel && !customDocLabel.trim()) {
      setError("Enter a label for your document type.");
      return;
    }

    const customLabel = selectedDocOption?.requiresCustomLabel ? customDocLabel : undefined;
    for (const file of Array.from(files)) {
      void startUpload(file, selectedDocType, customLabel);
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFilesSelected(e.target.files);
    e.target.value = "";
  }

  function onDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function onDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    onFilesSelected(e.dataTransfer.files);
  }

  function onPasteBlur() {
    if (!pasteText.trim()) return;
    if (selectedDocOption?.requiresCustomLabel && !customDocLabel.trim()) {
      setError("Enter a label for your document type.");
      return;
    }

    const file = new File([pasteText.trim()], `pasted-${selectedDocType}.txt`, {
      type: "text/plain",
    });
    void startUpload(
      file,
      selectedDocType,
      selectedDocOption?.requiresCustomLabel ? customDocLabel : undefined,
    );
  }

  function beginEdit() {
    const drafts: Record<string, { typeId: string; customLabel: string }> = {};
    documents.forEach((doc) => {
      if (!isUploading(doc)) {
        drafts[doc.document_id] = {
          typeId: doc.typeId,
          customLabel: doc.typeId === "Other" ? doc.typeLabel : "",
        };
      }
    });
    setEditDrafts(drafts);
    setEditMode(true);
  }

  async function saveDocumentType(
    documentId: string,
    nextTypeId?: string,
    nextCustomLabel?: string,
  ) {
    const draft = editDrafts[documentId];
    const typeId = nextTypeId ?? draft?.typeId;
    if (!typeId) return;

    const option = getOnboardingUploadOption(typeId);
    const customLabel =
      nextCustomLabel ??
      draft?.customLabel ??
      (option?.requiresCustomLabel ? "" : undefined);

    if (option?.requiresCustomLabel && !customLabel?.trim()) {
      setError("Enter a label for Other documents.");
      return;
    }

    setSavingEditId(documentId);
    setError("");
    try {
      const res = await fetch(`/api/v1/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_subtype: typeId,
          custom_label: option?.requiresCustomLabel ? customLabel?.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not update document type");
      setEditDrafts((current) => ({
        ...current,
        [documentId]: {
          typeId,
          customLabel: option?.requiresCustomLabel ? (customLabel?.trim() ?? "") : "",
        },
      }));
      await refreshSavedDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update document type");
    } finally {
      setSavingEditId(null);
    }
  }

  async function deleteDocument(documentId: string) {
    setDeletingDocumentId(documentId);
    setError("");
    try {
      const res = await fetch(`/api/v1/documents/${documentId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not remove document");

      setSelectedDocumentId((current) => (current === documentId ? null : current));
      setEditDrafts((current) => {
        const next = { ...current };
        delete next[documentId];
        return next;
      });
      setDocuments((current) =>
        current.filter((doc) => isUploading(doc) || doc.document_id !== documentId),
      );
      await refreshSavedDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove document");
    } finally {
      setDeletingDocumentId(null);
    }
  }

  const selectedDocument = documents.find(
    (doc): doc is SavedDocument =>
      !isUploading(doc) && doc.document_id === selectedDocumentId,
  );

  const content = (
    <>
      {!luxury && (
        <>
          <h1 className="text-page-title">Evidence Vault</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            Drop CVs, certifications, and performance artifacts. Encrypted at rest.
          </p>
        </>
      )}
      {luxury && (
        <LuxuryCardHeader
          title="Evidence Vault"
          description="Drop CVs, certifications, and performance artifacts. Encrypted at rest."
        />
      )}

      <div className={cn("space-y-3", luxury ? "mt-0" : "mt-5")}>
        <div className="flex items-center justify-between gap-3">
          <p className={cn("text-sm font-semibold", luxury ? "font-futura-bold uppercase tracking-[0.12em] text-[#D4AF37]" : "text-cx-forest-dark")}>
            Uploaded documents
          </p>
          {documents.some((doc) => !isUploading(doc)) && (
            <button
              type="button"
              onClick={() => (editMode ? setEditMode(false) : beginEdit())}
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                editMode
                  ? "text-[#d4c574] hover:text-[#d4c574]/80"
                  : "text-cx-forest-dark hover:text-cx-forest-dark/80",
              )}
            >
              <Pencil size={14} />
              {editMode ? "Done" : "Edit"}
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div
            className={cn(
              "rounded-xl border border-dashed px-3 py-4 text-sm",
              luxury
                ? "border-white/10 text-gray-500"
                : "border-cx-forest-dark/20 text-cx-forest-dark/70",
            )}
          >
            No documents yet. Drop CVs, certifications, or other artifacts — or continue without uploading.
          </div>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => {
              if (isUploading(doc)) {
                return (
                  <li
                    key={doc.localId}
                    className="rounded-lg border border-cx-forest-dark/15 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/60">
                          {doc.typeLabel}
                        </p>
                        <p className="truncate text-sm font-medium text-cx-forest-dark">{doc.fileName}</p>
                      </div>
                      {doc.status === "error" ? (
                        <XCircle size={18} className="shrink-0 text-cx-attention" />
                      ) : (
                        <Circle size={18} className="shrink-0 animate-pulse text-cx-forest-dark/40" />
                      )}
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-cx-forest-dark/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-200",
                          doc.status === "error" ? "bg-cx-attention" : "bg-cx-success",
                        )}
                        style={{ width: `${doc.status === "error" ? 100 : doc.progress}%` }}
                      />
                    </div>
                    {doc.status === "error" && doc.error && (
                      <p className="mt-2 text-xs text-cx-attention">{doc.error}</p>
                    )}
                  </li>
                );
              }

              const draft = editDrafts[doc.document_id];
              const activeTypeId = draft?.typeId ?? doc.typeId;
              const draftOption = getOnboardingUploadOption(activeTypeId);

              return (
                <li key={doc.document_id}>
                  <div
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      !editMode && selectedDocumentId === doc.document_id
                        ? "border-cx-forest-dark bg-cx-forest-dark/5"
                        : "border-cx-forest-dark/15",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {editMode ? (
                          <div className="space-y-2">
                            <select
                              value={draft?.typeId ?? doc.typeId}
                              onChange={(e) => {
                                const nextTypeId = e.target.value;
                                const nextCustomLabel =
                                  nextTypeId === "Other"
                                    ? (editDrafts[doc.document_id]?.customLabel ?? doc.typeLabel)
                                    : "";
                                setEditDrafts((current) => ({
                                  ...current,
                                  [doc.document_id]: {
                                    typeId: nextTypeId,
                                    customLabel: nextCustomLabel,
                                  },
                                }));
                                void saveDocumentType(doc.document_id, nextTypeId, nextCustomLabel);
                              }}
                              className="cx-field w-full text-sm"
                              disabled={
                                savingEditId === doc.document_id ||
                                deletingDocumentId === doc.document_id
                              }
                            >
                              {ONBOARDING_DOCUMENT_TYPE_OPTIONS.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <p className="truncate text-sm font-medium text-cx-forest-dark">
                              {doc.fileName}
                            </p>
                            {draftOption?.requiresCustomLabel && (
                              <input
                                type="text"
                                value={draft?.customLabel ?? ""}
                                onChange={(e) =>
                                  setEditDrafts((current) => ({
                                    ...current,
                                    [doc.document_id]: {
                                      typeId: draft?.typeId ?? doc.typeId,
                                      customLabel: e.target.value,
                                    },
                                  }))
                                }
                                onBlur={(e) =>
                                  void saveDocumentType(
                                    doc.document_id,
                                    draft?.typeId ?? doc.typeId,
                                    e.target.value,
                                  )
                                }
                                placeholder="Document label"
                                className="cx-field w-full text-sm"
                                disabled={deletingDocumentId === doc.document_id}
                              />
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDocumentId((current) =>
                                current === doc.document_id ? null : doc.document_id,
                              )
                            }
                            className="w-full text-left"
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/60">
                              {doc.typeLabel}
                            </p>
                            <p className="truncate text-sm font-medium text-cx-forest-dark">
                              {doc.fileName}
                            </p>
                          </button>
                        )}
                      </div>
                      {editMode ? (
                        <button
                          type="button"
                          aria-label={`Remove ${doc.fileName}`}
                          disabled={deletingDocumentId === doc.document_id}
                          onClick={() => void deleteDocument(doc.document_id)}
                          className="shrink-0 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                          <CircleX size={18} className="text-[#d4c574]" />
                        </button>
                      ) : (
                        <CheckCircle2 size={18} className="shrink-0 text-[#a9ff5c]" aria-hidden />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedDocument && !editMode && (
        <div className="mt-4 rounded-lg border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/60">
            Preview
          </p>
          <p className="mt-1 text-sm font-medium text-cx-forest-dark">{selectedDocument.fileName}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-cx-forest-dark/80">
            {selectedDocument.preview || "Document uploaded and parsed successfully."}
          </p>
        </div>
      )}

      <div className={cn("space-y-4 border-t pt-6", luxury ? "border-white/5" : "border-cx-forest-dark/10 mt-6")}>
        <div>
          <label
            htmlFor="tp1-doc-type"
            className={cn("text-sm font-semibold", luxury && "font-futura-bold uppercase tracking-[0.12em] text-[#D4AF37]")}
          >
            Document type
          </label>
          <select
            id="tp1-doc-type"
            value={selectedDocType}
            onChange={(e) => {
              setSelectedDocType(e.target.value);
              setCustomDocLabel("");
              setError("");
            }}
            className={cn("mt-2 w-full", luxury ? "rounded-xl border border-white/5 bg-[#0A0C10] px-4 py-3 text-sm text-white focus:border-[#A3E635] focus:outline-none" : "cx-field")}
          >
            {ONBOARDING_DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedDocOption?.requiresCustomLabel && (
          <div>
            <label htmlFor="tp1-custom-label" className="text-sm font-semibold">
              Document label
            </label>
            <input
              id="tp1-custom-label"
              type="text"
              value={customDocLabel}
              onChange={(e) => setCustomDocLabel(e.target.value)}
              placeholder="Describe this document"
              className="cx-field mt-2"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-8 transition-colors",
            luxury
              ? cn(
                  "border-white/10 bg-[#0A0C10] hover:border-[#A3E635]/40 hover:bg-[#1C2030]",
                  dragActive && "border-[#A3E635] bg-[#1C2030]",
                )
              : cn(
                  "border-cx-forest-dark/25 bg-cx-forest-dark/[0.03] hover:border-cx-forest-dark/40 hover:bg-cx-forest-dark/5",
                  dragActive && "border-cx-success bg-cx-forest-dark/10",
                ),
          )}
        >
          <Upload className={luxury ? "text-[#A3E635]" : "text-cx-forest-dark"} size={24} />
          <p className={cn("mt-2 font-semibold", luxury && "font-futura-bold text-white")}>
            Drop files here or click to upload
          </p>
          <p className={cn("text-sm", luxury ? "text-gray-500" : "text-cx-forest-dark/80")}>
            {selectedDocOption?.label ?? "Documents"} · {ACCEPTED_CV_LABEL} · multiple files OK
          </p>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_CV_ACCEPT}
          multiple
          className="hidden"
          onChange={onFileInputChange}
        />

        <div className="space-y-2">
          <label
            htmlFor="tp1-paste"
            className={cn("text-sm font-semibold", luxury && "font-futura-bold uppercase tracking-[0.12em] text-[#D4AF37]")}
          >
            Or paste document text
          </label>
          {luxury ? (
            <LuxuryTextarea
              id="tp1-paste"
              value={pasteText}
              onChange={setPasteText}
              onBlur={onPasteBlur}
              rows={4}
              placeholder="Paste document content…"
            />
          ) : (
            <textarea
              id="tp1-paste"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              onBlur={onPasteBlur}
              rows={4}
              className="w-full rounded-md border border-cx-forest-dark/15 p-3 text-sm"
              placeholder="Paste document content…"
            />
          )}
          <p className={cn("text-xs", luxury ? "text-gray-500" : "text-cx-forest-dark/60")}>
            Pasted text uploads automatically when you click away from this field.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {luxury ? (
          <button
            type="button"
            onClick={onContinue}
            disabled={continueDisabled || isUploadingAny}
            className="w-full rounded-xl bg-white px-10 py-4 font-futura-bold text-sm uppercase tracking-[0.2em] text-[#0A0C10] shadow-[0_4px_20px_rgba(255,255,255,0.05)] transition-all hover:bg-gray-200 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <Button
            className="w-full"
            onClick={onContinue}
            disabled={continueDisabled || isUploadingAny}
          >
            Continue
          </Button>
        )}
      </div>

      {error && (
        <p
          className={cn(
            "mt-3 px-4 py-3 text-sm",
            luxury
              ? "rounded-xl border border-red-500/30 bg-red-500/10 text-red-200"
              : "cx-alert-banner",
          )}
        >
          {error}
        </p>
      )}
    </>
  );

  if (luxury) {
    return <LuxuryWorkspace>{content}</LuxuryWorkspace>;
  }

  return <Card>{content}</Card>;
}
