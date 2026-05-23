"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { Upload } from "lucide-react";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";

export function Tier2Onboarding() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((u) => {
        if (!u.tier1_complete) router.replace("/app/onboarding");
        if (u.tier2_complete) router.replace("/app/dashboard");
      })
      .catch(() => {});
  }, [router]);

  async function uploadFile(file: File) {
    setProcessing(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", "CV");
      const res = await fetch("/api/v1/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");

      await fetch("/api/v1/mempalace/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      router.replace("/app/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
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
    await uploadFile(new File([blob], "pasted-cv.txt", { type: "text/plain" }));
  }

  function skip() {
    router.replace("/app/dashboard");
    router.refresh();
  }

  return (
    <PageShell
      eyebrow="Optional"
      title="Upload your CV"
      subtitle="Mak uses your CV to personalize coaching, surface invisible work, and prefill promotion narratives."
      maxWidth="md"
      className="py-4"
    >
      <Card>
        <label
          htmlFor="tier2-cv-upload"
          className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-cx-border bg-cx-cream/50 px-6 py-10 transition-colors hover:border-cx-accent hover:bg-cx-accent-soft/30"
        >
          <Upload className="text-cx-text" size={28} />
          <p className="mt-3 font-semibold text-cx-text">Drop or click to upload CV</p>
          <p className="mt-1 text-sm text-cx-text-secondary">{ACCEPTED_CV_LABEL}</p>
          <input
            id="tier2-cv-upload"
            type="file"
            accept={ACCEPTED_CV_ACCEPT}
            className="hidden"
            onChange={onFileSelect}
            disabled={processing}
          />
        </label>

        <form onSubmit={onPasteSubmit} className="mt-6 space-y-3">
          <label htmlFor="tier2-paste" className="text-cx-label">
            Or paste CV text
          </label>
          <textarea
            id="tier2-paste"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            placeholder="Paste CV content here…"
            className="w-full rounded-xl border border-cx-border p-4 text-base text-cx-text"
          />
          <Button type="submit" disabled={processing || !pasteText.trim()}>
            Upload pasted text
          </Button>
        </form>

        {processing && (
          <p className="mt-4 text-center text-sm text-cx-text-secondary">
            Uploading and syncing to MemPalace…
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-cx-attention bg-amber-50 px-4 py-3 text-sm text-cx-text">
            {error}
          </p>
        )}

        <Button variant="secondary" className="mt-6 w-full" onClick={skip} disabled={processing}>
          Skip for now
        </Button>
      </Card>
    </PageShell>
  );
}
