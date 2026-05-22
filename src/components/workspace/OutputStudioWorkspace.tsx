"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OUTPUT_TEMPLATES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fetchActivities } from "@/lib/activities-storage";
import type { ActivityEntry } from "@/lib/types/database";
import { EvidenceDrawer } from "@/components/studio/EvidenceDrawer";
import { VersionHistoryPanel } from "@/components/studio/VersionHistoryPanel";
import {
  StudioLexicalEditor,
  type StudioEditorHandle,
} from "@/components/studio/StudioLexicalEditor";
import { exportDocx, exportPdf, downloadBlob } from "@/lib/studio-export";
import {
  loadVersions,
  saveVersion,
  type DocumentVersion,
} from "@/lib/studio-versions";

export function OutputStudioWorkspace() {
  const [selected, setSelected] = useState<string>(OUTPUT_TEMPLATES[0].id);
  const [generating, setGenerating] = useState(false);
  const [evidence, setEvidence] = useState<ActivityEntry[]>([]);
  const [exportMsg, setExportMsg] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const editorRef = useRef<StudioEditorHandle>(null);

  const template = OUTPUT_TEMPLATES.find((t) => t.id === selected)!;

  const loadEvidence = useCallback(async () => {
    setEvidence(await fetchActivities());
  }, []);

  useEffect(() => {
    loadEvidence();
    setVersions(loadVersions(selected));
  }, [loadEvidence, selected]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/output/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType: selected }),
      });
      const data = await res.json();
      editorRef.current?.setPlainText(data.content ?? "");
      setSaveStatus("unsaved");
    } finally {
      setGenerating(false);
    }
  }

  function handleSaveVersion() {
    if (!editorRef.current) return;
    setSaveStatus("saving");
    const json = editorRef.current.getEditorStateJson();
    const plain = editorRef.current.getPlainText();
    const next = saveVersion(selected, json, plain, "Manual save");
    setVersions(next);
    setSaveStatus("saved");
  }

  function restoreVersion(v: DocumentVersion) {
    editorRef.current?.restoreFromJson(v.content);
    setSaveStatus("unsaved");
  }

  function evidenceForExport() {
    const linked = editorRef.current?.getLinkedEvidence() ?? [];
    return linked.map((l) => {
      const act = evidence.find((e) => e.id === l.id);
      return { id: l.id, text: l.text, date: act?.activity_date };
    });
  }

  async function copyExport() {
    const text = editorRef.current?.getPlainText() ?? "";
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setExportMsg("Copied to clipboard");
    setTimeout(() => setExportMsg(""), 2000);
  }

  async function downloadDocx() {
    const text = editorRef.current?.getPlainText() ?? "";
    if (!text.trim()) return;
    const blob = await exportDocx(template.name, text, evidenceForExport());
    downloadBlob(
      blob,
      `${selected}_${new Date().toISOString().slice(0, 10)}.docx`,
    );
    setExportMsg("DOCX downloaded");
    setTimeout(() => setExportMsg(""), 2000);
  }

  async function downloadPdf() {
    const text = editorRef.current?.getPlainText() ?? "";
    if (!text.trim()) return;
    const blob = await exportPdf(template.name, text, evidenceForExport());
    downloadBlob(
      blob,
      `${selected}_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    setExportMsg("PDF downloaded");
    setTimeout(() => setExportMsg(""), 2000);
  }

  const overLimit = wordCount > template.words * 1.1;

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-7xl gap-6">
      <aside className="w-56 shrink-0 space-y-2 overflow-y-auto">
        <h2 className="px-2 text-xs font-semibold uppercase text-fiscmak-muted">
          FISCMAK templates
        </h2>
        {OUTPUT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${
              selected === t.id
                ? "bg-fiscmak-green-light font-semibold text-fiscmak-green-dark"
                : "hover:bg-white"
            }`}
          >
            {t.name}
          </button>
        ))}
        <VersionHistoryPanel versions={versions} onRestore={restoreVersion} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">{template.name}</h2>
            <p className="text-sm text-fiscmak-muted">
              Target ~{template.words} words
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={generate} disabled={generating}>
              {generating ? "Generating…" : "Generate"}
            </Button>
            <Button variant="secondary" onClick={handleSaveVersion}>
              Save version
            </Button>
            <Button variant="secondary" onClick={copyExport}>
              Copy
            </Button>
            <Button variant="secondary" onClick={downloadDocx}>
              DOCX
            </Button>
            <Button variant="secondary" onClick={downloadPdf}>
              PDF
            </Button>
            {exportMsg && (
              <span className="text-sm text-fiscmak-green">{exportMsg}</span>
            )}
          </div>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <StudioLexicalEditor
            key={selected}
            ref={editorRef}
            templateId={selected}
            onWordCount={(n) => {
              setWordCount(n);
              setSaveStatus((s) => (s === "saved" ? "unsaved" : s));
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-fiscmak-border px-4 py-2 text-sm text-fiscmak-muted">
            <span className={overLimit ? "font-medium text-fiscmak-amber" : ""}>
              {wordCount} / {template.words} words
              {overLimit && " — over recommended limit"}
            </span>
            <span>
              {saveStatus === "saving"
                ? "Saving…"
                : saveStatus === "unsaved"
                  ? "Unsaved changes · auto-save every 10s"
                  : "Saved"}
            </span>
          </div>
        </Card>
      </div>

      <EvidenceDrawer
        evidence={evidence}
        onInsertChip={(item) =>
          editorRef.current?.insertEvidenceChip(
            item.id,
            item.raw_text ?? "Evidence",
          )
        }
        onInsertText={(text) => editorRef.current?.insertPlainText(text)}
      />
    </div>
  );
}
