"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";

type CvUploadPanelProps = {
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
  showPaste?: boolean;
};

export function CvUploadPanel({ disabled, onUpload, showPaste = true }: CvUploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!isAcceptedCvFileName(file.name)) {
      setError(`Choose ${ACCEPTED_CV_LABEL}.`);
      setSelectedFile(null);
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  }

  async function submitFile(file: File) {
    setProcessing(true);
    setError(null);
    try {
      await onUpload(file);
      setSelectedFile(null);
      setPasteText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProcessing(false);
    }
  }

  async function handleUploadClick() {
    if (!selectedFile) {
      setError("Choose a file first, then click Upload CV.");
      return;
    }
    await submitFile(selectedFile);
  }

  async function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const blob = new Blob([pasteText.trim()], { type: "text/plain" });
    await submitFile(new File([blob], "pasted-cv.txt", { type: "text/plain" }));
  }

  const busy = disabled || processing;

  return (
    <div className="space-y-4">
      <label
        htmlFor="cv-upload-input"
        className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-cx-border bg-cx-cream/40 px-6 py-8 transition-colors hover:border-cx-charcoal hover:bg-cx-cream/70"
      >
        <Upload className="text-cx-charcoal" size={28} />
        <p className="mt-3 font-semibold text-cx-text">Choose CV file</p>
        <p className="mt-1 text-sm text-cx-text-secondary">{ACCEPTED_CV_LABEL}</p>
        <input
          id="cv-upload-input"
          type="file"
          accept={ACCEPTED_CV_ACCEPT}
          className="hidden"
          onChange={handleFileSelect}
          disabled={busy}
        />
      </label>

      {selectedFile && (
        <p className="text-sm text-cx-body">
          Selected: <span className="font-medium text-cx-text">{selectedFile.name}</span>
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        onClick={handleUploadClick}
        disabled={busy || !selectedFile}
      >
        {processing ? "Uploading…" : "Upload CV"}
      </Button>

      {showPaste && (
        <form onSubmit={handlePasteSubmit} className="space-y-3 border-t border-cx-border pt-4">
          <label htmlFor="cv-paste-input" className="text-sm font-semibold text-cx-text">
            Or paste CV text
          </label>
          <textarea
            id="cv-paste-input"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            placeholder="Paste CV content here…"
            className="cx-field w-full"
            disabled={busy}
          />
          <Button type="submit" variant="secondary" disabled={busy || !pasteText.trim()}>
            Upload pasted text
          </Button>
        </form>
      )}

      {processing && (
        <p className="text-sm text-cx-text-secondary">Uploading and extracting CV text…</p>
      )}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
