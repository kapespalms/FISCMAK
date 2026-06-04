"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { uploadUserDocument } from "@/lib/v2/document-upload-client";

type CvUploadPanelProps = {
  /** Called when upload + parse completes so the pending tray can refresh. */
  onComplete: () => void;
};

export function CvUploadPanel({ onComplete }: CvUploadPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setProgress(2);
    setErrorMsg(null);
    try {
      await uploadUserDocument(
        file,
        { document_type: "CV", document_subtype: "CV", document_label: "CV / Resume" },
        (p) => setProgress(p),
      );
      setStatus("done");
      onComplete();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-fis-green/30 bg-fis-green/5 px-5 py-4 text-sm text-fis-green">
        <CheckCircle size={16} className="shrink-0" />
        CV parsed — review the pending items below and drag them to their section cards.
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="ml-auto text-xs text-fis-green/70 underline hover:text-fis-green"
        >
          Upload another
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-fis-gold/30 bg-fis-gold/5 px-6 py-8 text-center transition-colors hover:border-fis-gold/60"
    >
      <Upload size={22} className="text-fis-gold/60" />
      <p className="text-sm font-medium text-cx-text">
        {status === "uploading" ? "Parsing your CV…" : "Upload a CV to autofill your profile"}
      </p>
      <p className="text-xs text-cx-text/50">
        {status === "uploading"
          ? `${progress ?? 0}% complete`
          : "Drag a file here or click to browse — .pdf, .docx, .txt"}
      </p>

      {status === "uploading" && (
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-fis-gold transition-all duration-300"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-1.5 text-xs text-[#C28D6C]">
          <AlertCircle size={13} />
          {errorMsg}
        </div>
      )}

      {status !== "uploading" && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-fis-gold/40 bg-white px-4 py-2 text-sm font-medium text-fis-gold transition-colors hover:bg-fis-gold/10"
        >
          Choose file
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="sr-only"
        aria-hidden
        onChange={handleChange}
      />
    </div>
  );
}
