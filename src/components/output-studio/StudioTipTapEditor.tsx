"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StudioSectionBlock } from "@/components/output-studio/StudioSectionBlock";
import type { OutputDocument, SectionContent } from "@/lib/v2/output-studio-generate";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  review_ready: "Ready to review",
  exported: "Exported",
  archived: "Archived",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-cx-forest-dark/10 text-cx-forest-dark/70",
  review_ready: "bg-[#5FD65F]/20 text-cx-forest-dark",
  exported: "bg-cx-forest-dark/20 text-cx-forest-dark",
  archived: "bg-cx-forest-dark/5 text-cx-forest-dark/40",
};

type SaveFn = (sections: SectionContent[], status: string) => Promise<void>;

type StudioTipTapEditorProps = {
  document: OutputDocument;
  onBack: () => void;
  onSave: SaveFn;
};

export function StudioTipTapEditor({ document, onBack, onSave }: StudioTipTapEditorProps) {
  const [sections, setSections] = useState<SectionContent[]>(document.sections);
  const [status, setStatus] = useState<string>(document.status);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const handleSectionChange = useCallback((updated: SectionContent) => {
    setSections((prev) => prev.map((s) => (s.type === updated.type ? updated : s)));
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(sections, status);
      setDirty(false);
    } catch {
      setSaveError("Save failed — try again.");
    } finally {
      setSaving(false);
    }
  }, [sections, status, onSave]);

  const enabledSections = sections.filter((s) => s.enabled);
  const hiddenSections = sections.filter((s) => !s.enabled);
  const hasHiddenWithContent = hiddenSections.some(
    (s) => s.tiptap_content?.content && s.tiptap_content.content.length > 0
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-cx-forest-dark/15 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-cx-forest-dark/60 hover:text-cx-forest-dark"
        >
          <ArrowLeft size={14} />
          All documents
        </button>

        <span className="h-4 w-px bg-cx-forest-dark/15" aria-hidden />

        <div className="flex-1 min-w-0">
          <h2 className="truncate text-base font-semibold text-cx-forest-dark">{document.title}</h2>
          <p className="text-xs text-cx-forest-dark/50">
            Generated {new Date(document.generated_at).toLocaleDateString()} ·{" "}
            {document.document_type.replace(/_/g, " ")} ·{" "}
            {document.evidence_snapshot_ids.length} source{document.evidence_snapshot_ids.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Status selector */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setDirty(true); }}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium border-0 outline-none cursor-pointer",
            STATUS_COLORS[status] ?? STATUS_COLORS.draft,
          )}
        >
          {Object.entries(STATUS_LABELS).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>

        {/* Save */}
        <div className="flex items-center gap-2">
          {saveError && <span className="text-xs text-red-500">{saveError}</span>}
          {!dirty && !saving && (
            <span className="flex items-center gap-1 text-xs text-cx-forest-dark/40">
              <CheckCircle size={12} /> Saved
            </span>
          )}
          {dirty && !saving && (
            <span className="flex items-center gap-1 text-xs text-cx-forest-dark/50">
              <Clock size={12} /> Unsaved
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="h-8 min-h-0 px-4 py-0 text-sm"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {/* Enabled sections (in order) */}
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              if (!section.enabled && !showHidden) return null;
              return (
                <StudioSectionBlock
                  key={section.type}
                  section={section}
                  onChange={handleSectionChange}
                  focused={focusedSection === section.type}
                  onFocus={() => setFocusedSection(section.type)}
                />
              );
            })}

          {/* Hidden sections toggle */}
          {hiddenSections.length > 0 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowHidden((v) => !v)}
                className="text-xs text-cx-forest-dark/50 hover:text-cx-forest-dark underline"
              >
                {showHidden
                  ? `Hide ${hiddenSections.length} off section${hiddenSections.length !== 1 ? "s" : ""}`
                  : `Show ${hiddenSections.length} off section${hiddenSections.length !== 1 ? "s" : ""}${hasHiddenWithContent ? " (has content)" : ""}`}
              </button>
            </div>
          )}
        </div>

        {/* Deferred notice */}
        <div className="mt-6 rounded-lg border border-dashed border-cx-forest-dark/15 p-3 text-xs text-cx-forest-dark/40">
          <span className="font-medium">Deferred (not yet built):</span> Edit with Mak (LLM revision per block) ·
          Export to .docx / PDF · Representative publication asterisk · APT annotation fields
        </div>
      </div>
    </div>
  );
}
