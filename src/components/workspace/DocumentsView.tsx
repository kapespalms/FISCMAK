"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Upload } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  type UploadedDocument,
  loadDemoDocuments,
  saveDemoDocuments,
} from "@/lib/documents";

export function DocumentsView() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");

  const loadDocuments = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setDocuments(loadDemoDocuments());
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setDocuments(loadDemoDocuments());
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("uploaded_documents")
      .select(
        "id, file_name, file_type, parsed_text, detected_document_type, extracted_entities, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setDocuments((data as UploadedDocument[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function processText(text: string, fileName: string, fileType: string) {
    setProcessing(true);
    setError(null);

    try {
      const parseRes = await fetch("/api/documents/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fileName, fileType }),
      });
      const parsed = await parseRes.json();

      const doc: UploadedDocument = {
        id: crypto.randomUUID(),
        file_name: fileName,
        file_type: fileType,
        parsed_text: parsed.parsed_text ?? text,
        detected_document_type: parsed.detected_document_type ?? null,
        extracted_entities: parsed.extracted_entities ?? null,
        created_at: new Date().toISOString(),
      };

      if (!isSupabaseConfigured()) {
        const next = [doc, ...loadDemoDocuments()];
        saveDemoDocuments(next);
        setDocuments(next);
      } else {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sign in to save documents");

        const { data, error: insertError } = await supabase
          .from("uploaded_documents")
          .insert({
            user_id: user.id,
            file_name: fileName,
            file_type: fileType,
            parsed_text: doc.parsed_text,
            detected_document_type: doc.detected_document_type,
            extracted_entities: doc.extracted_entities,
            processed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setDocuments((d) => [data as UploadedDocument, ...d]);
      }

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

    if (!file.name.match(/\.(txt|md)$/i)) {
      setError("MVP supports .txt and .md files. Paste PDF/DOCX content below.");
      return;
    }

    const text = await file.text();
    await processText(text, file.name, file.type || "text/plain");
    e.target.value = "";
  }

  async function onPasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pasteText.trim()) return;
    await processText(pasteText.trim(), "pasted-document.txt", "text/plain");
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-fiscmak-red">
          {error}
        </p>
      )}

      <Card>
        <label
          htmlFor="file-upload-objective"
          className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-fiscmak-border bg-fiscmak-subtle px-6 py-10 transition-colors hover:border-fiscmak-green hover:bg-fiscmak-green-light"
        >
          <Upload className="text-fiscmak-green" size={28} />
          <p className="mt-3 font-semibold">Drop or click to upload</p>
          <p className="mt-1 text-sm text-fiscmak-muted">
            .txt or .md (paste PDF/DOCX text below)
          </p>
          <input
            id="file-upload-objective"
            type="file"
            accept=".txt,.md,text/plain"
            className="hidden"
            onChange={onFileSelect}
            disabled={processing}
          />
        </label>
        {processing && (
          <p className="mt-4 text-center text-sm text-fiscmak-muted">
            Processing document…
          </p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold">Or paste document text</h2>
        <form onSubmit={onPasteSubmit} className="mt-4 space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            placeholder="Paste CV or personal statement text here…"
            className="w-full rounded-md border border-fiscmak-border p-4 text-base"
          />
          <Button type="submit" disabled={processing || !pasteText.trim()}>
            Parse pasted text
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold">Uploaded</h2>
        {loading && <p className="text-sm text-fiscmak-muted">Loading…</p>}
        {!loading && documents.length === 0 && (
          <p className="text-sm text-fiscmak-muted">No documents yet.</p>
        )}
        {documents.map((doc) => (
          <Card key={doc.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{doc.file_name}</p>
              {doc.detected_document_type && (
                <Badge>{doc.detected_document_type}</Badge>
              )}
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-fiscmak-muted">
              {doc.parsed_text?.slice(0, 280)}
              {(doc.parsed_text?.length ?? 0) > 280 ? "…" : ""}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
