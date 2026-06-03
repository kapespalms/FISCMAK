"use client";

import { useCallback, useEffect, useState } from "react";
import type { BankItem } from "@/lib/v2/output-studio-bank";
import type { OutputDocument, SectionContent } from "@/lib/v2/output-studio-generate";

export type GenerateOpts = {
  document_type: string;
  title: string;
  audience_context?: string;
  since_date?: string;
  item_types?: string[];
};

export type UseOutputStudioResult = {
  documents: OutputDocument[];
  bankItems: BankItem[];
  loading: boolean;
  error: string | null;
  generateDocument: (opts: GenerateOpts) => Promise<{ document?: OutputDocument; error?: string }>;
  updateDocument: (
    id: string,
    patch: { sections?: SectionContent[]; status?: string; title?: string }
  ) => Promise<{ document?: OutputDocument; error?: string }>;
  reload: () => Promise<void>;
};

export function useOutputStudio(): UseOutputStudioResult {
  const [documents, setDocuments] = useState<OutputDocument[]>([]);
  const [bankItems, setBankItems] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [docsResult, bankResult] = await Promise.allSettled([
      fetch("/api/v1/output/studio/documents").then((r) => r.json()),
      fetch("/api/v1/output/studio/bank").then((r) => r.json()),
    ]);
    if (docsResult.status === "fulfilled") {
      setDocuments((docsResult.value as { documents?: OutputDocument[] }).documents ?? []);
    } else {
      setError("Failed to load documents.");
    }
    if (bankResult.status === "fulfilled") {
      setBankItems((bankResult.value as { bank_items?: BankItem[] }).bank_items ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const generateDocument = useCallback(
    async (opts: GenerateOpts): Promise<{ document?: OutputDocument; error?: string }> => {
      const res = await fetch("/api/v1/output/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      });
      const data = (await res.json()) as { document?: OutputDocument; error?: string };
      if (data.document) {
        setDocuments((prev) => [data.document!, ...prev]);
      }
      return data;
    },
    []
  );

  const updateDocument = useCallback(
    async (
      id: string,
      patch: { sections?: SectionContent[]; status?: string; title?: string }
    ): Promise<{ document?: OutputDocument; error?: string }> => {
      const res = await fetch(`/api/v1/output/studio/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as { document?: OutputDocument; error?: string };
      if (data.document) {
        setDocuments((prev) => prev.map((d) => (d.id === id ? data.document! : d)));
      }
      return data;
    },
    []
  );

  return { documents, bankItems, loading, error, generateDocument, updateDocument, reload };
}
