"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ResumeBlockEditor } from "@/components/documents/ResumeBlockEditor";
import { ResumePreview } from "@/components/documents/ResumePreview";
import { cn } from "@/lib/utils";
import {
  ACTIVE_DOCUMENT_SESSION_KEY,
  DOCUMENTS_CONTEXT_EVENT,
  type DocumentsMakContextPayload,
} from "@/lib/v2/documents-workspace";
import {
  collectIncompleteFields,
  emptyResumeContent,
  parseResumeContent,
  resumeContentToPlainText,
  type ResumeContent,
  type ResumeThemeKey,
} from "@/lib/v2/resume-content";
import { mergeFlagLabel } from "@/lib/v2/merge-flag-labels";
import { downloadBlob, exportPdf } from "@/lib/studio-export";

type CvDraftWorkspaceProps = {
  documentId: string;
  initialTitle: string;
  initialContent: ResumeContent | null;
  initialTheme: ResumeThemeKey;
  onBack: () => void;
};

function dispatchDocumentsContext(payload: DocumentsMakContextPayload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACTIVE_DOCUMENT_SESSION_KEY, payload.active_document_id ?? "");
  window.dispatchEvent(
    new CustomEvent(DOCUMENTS_CONTEXT_EVENT, { detail: payload }),
  );
}

export function CvDraftWorkspace({
  documentId,
  initialTitle,
  initialContent,
  initialTheme,
  onBack,
}: CvDraftWorkspaceProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<ResumeContent>(
    initialContent ?? emptyResumeContent(),
  );
  const [themeKey, setThemeKey] = useState<ResumeThemeKey>(initialTheme);
  const [highlightBlockId, setHighlightBlockId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [exportingPdf, setExportingPdf] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncMakContext = useCallback(
    (next: ResumeContent) => {
      const incomplete_fields = collectIncompleteFields(next);
      dispatchDocumentsContext({
        active_document_id: documentId,
        content_json: { ...next, incomplete_fields },
        incomplete_fields,
        draft_title: title,
      });
    },
    [documentId, title],
  );

  useEffect(() => {
    syncMakContext(content);
    return () => {
      dispatchDocumentsContext({
        active_document_id: null,
        content_json: null,
        incomplete_fields: [],
      });
    };
  }, [content, syncMakContext]);

  useEffect(() => {
    if (highlightBlockId) {
      document.getElementById(`block-${highlightBlockId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightBlockId]);

  const persist = useCallback(
    async (nextContent: ResumeContent, nextTheme: ResumeThemeKey, nextTitle: string) => {
      setSaveStatus("saving");
      const incomplete_fields = collectIncompleteFields(nextContent);
      const payload = { ...nextContent, incomplete_fields };
      try {
        const res = await fetch(`/api/v1/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_json: payload,
            theme_key: nextTheme,
            draft_title: nextTitle,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
        syncMakContext(payload);
      } catch {
        setSaveStatus("unsaved");
      }
    },
    [documentId, syncMakContext],
  );

  function scheduleSave(next: ResumeContent, theme: ResumeThemeKey, nextTitle: string) {
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persist(next, theme, nextTitle);
    }, 800);
  }

  function handleContentChange(next: ResumeContent) {
    setContent(next);
    scheduleSave(next, themeKey, title);
  }

  function handleThemeChange(next: ResumeThemeKey) {
    setThemeKey(next);
    scheduleSave(content, next, title);
  }

  function handleTitleBlur() {
    scheduleSave(content, themeKey, title);
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      const bodyText = resumeContentToPlainText(content);
      const blob = await exportPdf(title.trim() || "CV Draft", bodyText, []);
      const safeName = (title.trim() || "cv-draft").replace(/[^\w.-]+/g, "_");
      downloadBlob(blob, `${safeName}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
        >
          ← Documents hub
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleExportPdf()}
            disabled={exportingPdf}
            className="rounded-lg border border-cx-forest-dark/20 px-3 py-1.5 text-sm font-medium text-cx-forest-dark hover:bg-cx-forest-dark/5 disabled:opacity-60"
          >
            {exportingPdf ? "Exporting…" : "Download PDF"}
          </button>
          <span
            className={cn(
              "text-xs font-medium",
              saveStatus === "saved" && "text-cx-forest-dark/50",
              saveStatus === "saving" && "text-cx-forest-dark/70",
              saveStatus === "unsaved" && "text-amber-700",
            )}
          >
            {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved changes"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="min-w-[200px] flex-1 text-sm">
          <span className="text-cx-forest-dark/70">Draft title</span>
          <input
            className="cx-field mt-1 w-full text-lg font-semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
          />
        </label>
        <div className="flex rounded-lg border border-cx-forest-dark/15 p-0.5">
          {(["compact", "spacious"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm capitalize",
                themeKey === key
                  ? "bg-cx-forest-dark text-white"
                  : "text-cx-forest-dark/70 hover:bg-cx-forest-dark/5",
              )}
              onClick={() => handleThemeChange(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {content.merge_flags && content.merge_flags.length > 0 && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <p className="font-semibold">Review merged sources</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/90">
            {content.merge_flags.map((flag) => (
              <li key={flag}>{mergeFlagLabel(flag)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-h-[480px] rounded-2xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.02] p-4 lg:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
            Editor
          </p>
          <ResumeBlockEditor
            content={content}
            highlightBlockId={highlightBlockId}
            onChange={handleContentChange}
            onHighlightBlock={setHighlightBlockId}
          />
        </div>
        <div className="rounded-2xl border border-cx-forest-dark/10 bg-gradient-to-b from-cx-page-muted to-white p-6 lg:p-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
            Preview
          </p>
          <ResumePreview
            content={content}
            themeKey={themeKey}
            highlightBlockId={highlightBlockId}
          />
        </div>
      </div>
    </div>
  );
}

export function parseDraftFromApi(metadata: Record<string, unknown> | undefined) {
  if (!metadata?.content_json) return null;
  return parseResumeContent(metadata.content_json);
}
