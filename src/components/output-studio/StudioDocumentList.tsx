"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { OutputDocument } from "@/lib/v2/output-studio-generate";
import type { GenerateOpts } from "@/lib/v2/output-studio-hook";
import { FileText, Plus, Calendar, Loader2, Download } from "lucide-react";

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-cx-forest-dark/10 text-cx-text/70" },
  review_ready: { label: "Ready", cls: "bg-[#3C8A60]/10 text-[#3C8A60]" },
  exported: { label: "Exported", cls: "bg-cx-forest-dark/20 text-cx-text" },
  archived: { label: "Archived", cls: "bg-cx-forest-dark/5 text-cx-text/40" },
};

type StudioDocumentListProps = {
  documents: OutputDocument[];
  loading: boolean;
  onOpen: (doc: OutputDocument) => void;
  onGenerate: (opts: GenerateOpts) => Promise<{ document?: OutputDocument; error?: string }>;
  onExport: (id: string, format: "docx") => Promise<{ error?: string }>;
};

export function StudioDocumentList({ documents, loading, onOpen, onGenerate, onExport }: StudioDocumentListProps) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleGenerate(opts: GenerateOpts) {
    setGenerating(true);
    setGenError(null);
    const result = await onGenerate(opts);
    setGenerating(false);
    if (result.error) {
      setGenError(result.error);
    } else if (result.document) {
      onOpen(result.document);
    }
  }

  function generateFullCv() {
    const today = new Date();
    const title = `Academic CV — ${today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
    void handleGenerate({ document_type: "cv", title });
  }

  async function handleExport(e: React.MouseEvent, id: string) {
    e.stopPropagation(); // don't open the document
    setExportingId(id);
    setExportError(null);
    const result = await onExport(id, "docx");
    setExportingId(null);
    if (result.error) setExportError(result.error);
  }

  function generateMonthlyBullets() {
    const today = new Date();
    const sinceDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    const title = `Monthly CV Update — ${today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
    void handleGenerate({ document_type: "cv", title, since_date: sinceDate });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      {/* Generate actions */}
      <div className="flex flex-wrap items-start gap-3">
        <Card className="flex-1 min-w-[220px] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-cx-text/60">Full CV</p>
          <p className="mt-1 text-sm text-cx-text/80">All bank items assembled by section.</p>
          <Button
            onClick={generateFullCv}
            disabled={generating}
            className="mt-3 h-9 min-h-0 px-4 py-0 text-sm"
          >
            {generating ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Generating…</span>
            ) : (
              <span className="flex items-center gap-2"><Plus size={14} /> Generate Full CV</span>
            )}
          </Button>
        </Card>

        <Card className="flex-1 min-w-[220px] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-cx-text/60">Monthly bullets</p>
          <p className="mt-1 text-sm text-cx-text/80">Items captured since the first of this month.</p>
          <Button
            variant="secondary"
            onClick={generateMonthlyBullets}
            disabled={generating}
            className="mt-3 h-9 min-h-0 px-4 py-0 text-sm"
          >
            <span className="flex items-center gap-2"><Calendar size={14} /> Generate Monthly Update</span>
          </Button>
        </Card>

        {genError && (
          <p className="w-full text-sm text-[#C28D6C]">{genError}</p>
        )}
        {exportError && (
          <p className="w-full text-sm text-[#C28D6C]">{exportError}</p>
        )}
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-cx-text/40">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading documents…
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={40} className="mb-3 text-cx-text/20" />
            <p className="text-base font-semibold text-cx-text/50">No documents yet</p>
            <p className="mt-1 text-sm text-cx-text/40">
              Generate a Full CV or Monthly Update above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const chip = STATUS_CHIP[doc.status] ?? STATUS_CHIP.draft;
              const enabledSections = doc.sections.filter((s) => s.enabled).length;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => onOpen(doc)}
                  className={cn(
                    "w-full rounded-xl border border-cx-forest-dark/10 bg-white p-4",
                    "text-left transition-colors hover:border-cx-forest-dark/25 hover:bg-cx-forest-dark/[0.02]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="mt-0.5 shrink-0 text-cx-text/30" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-cx-text">
                          {doc.title}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", chip.cls)}>
                          {chip.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-cx-text/50">
                        {doc.document_type.replace(/_/g, " ")} ·{" "}
                        {enabledSections} section{enabledSections !== 1 ? "s" : ""} ·{" "}
                        last edited {new Date(doc.last_edited_at).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Export button */}
                    <button
                      type="button"
                      title="Export .docx"
                      disabled={exportingId === doc.id}
                      onClick={(e) => void handleExport(e, doc.id)}
                      className="shrink-0 flex items-center justify-center rounded-lg p-1.5 text-cx-text/35 transition-colors hover:bg-cx-forest-dark/8 hover:text-fis-gold disabled:opacity-40"
                    >
                      {exportingId === doc.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Download size={15} />
                      )}
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
