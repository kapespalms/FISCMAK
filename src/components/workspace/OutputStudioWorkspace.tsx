"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OUTPUT_TEMPLATES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
import { PromotionNarrativeWizard } from "@/components/workspace/PromotionNarrativeWizard";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { useAppShell } from "@/components/layout/AppShell";

type ReadinessProfile = {
  target_track: string;
  target_rank: string;
  overall_readiness: number;
  promotion_timeline: string;
  strengths: { domain: string; score: number; note: string }[];
  gaps: { domain: string; score: number; note: string; suggestion: string }[];
};

type V2Template = {
  template_id: string;
  name: string;
  type: string;
  description: string;
};

type OutputContext = {
  career_vault?: {
    summary: string;
    changes_since_quarter: string | null;
    pending_review: number;
  };
  enrichment_delta?: string | null;
};

export function OutputStudioWorkspace() {
  const { startMakFlow } = useAppShell();
  const [selected, setSelected] = useState<string>(OUTPUT_TEMPLATES[0].id);
  const [generating, setGenerating] = useState(false);
  const [outputContext, setOutputContext] = useState<OutputContext | null>(null);
  const [evidence, setEvidence] = useState<ActivityEntry[]>([]);
  const [exportMsg, setExportMsg] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [readiness, setReadiness] = useState<ReadinessProfile | null>(null);
  const [v2Templates, setV2Templates] = useState<V2Template[]>([]);
  const editorRef = useRef<StudioEditorHandle>(null);

  const template = OUTPUT_TEMPLATES.find((t) => t.id === selected)!;

  const loadEvidence = useCallback(async () => {
    setEvidence(await fetchActivities());
  }, []);

  useEffect(() => {
    loadEvidence();
    setVersions(loadVersions(selected));
    fetch("/api/v1/promotion/readiness")
      .then((r) => r.json())
      .then(setReadiness)
      .catch(() => undefined);
    fetch("/api/v1/templates?type=all")
      .then((r) => r.json())
      .then((d) => setV2Templates(d.templates ?? []))
      .catch(() => undefined);
    fetch("/api/v1/output/generate")
      .then((r) => r.json())
      .then((d) =>
        setOutputContext({
          career_vault: d.career_vault,
          enrichment_delta: d.enrichment_delta,
        }),
      )
      .catch(() => undefined);
  }, [loadEvidence, selected]);

  async function generate() {
    setGenerating(true);
    try {
      if (selected === "promotion_narrative") {
        await fetch("/api/v1/promotion/dossier/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_rank: readiness?.target_rank,
            target_track: readiness?.target_track,
          }),
        });
      }
      const res = await fetch("/api/v1/output/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: selected,
          readiness,
        }),
      });
      const data = await res.json();
      const prefill =
        data.content ??
        (selected === "promotion_narrative" && readiness
          ? buildPromotionPrefill(readiness)
          : "");
      if (data.enrichment_delta || data.vault_summary) {
        setOutputContext({
          career_vault: {
            summary: data.vault_summary ?? outputContext?.career_vault?.summary ?? "",
            changes_since_quarter: data.enrichment_delta ?? null,
            pending_review: data.pending_review ?? 0,
          },
          enrichment_delta: data.enrichment_delta,
        });
      }
      editorRef.current?.setPlainText(prefill);
      setSaveStatus("unsaved");
    } finally {
      setGenerating(false);
    }
  }

  function buildPromotionPrefill(profile: ReadinessProfile): string {
    const strengths = profile.strengths
      .map((s) => `- ${s.domain} (${s.score}%): ${s.note}`)
      .join("\n");
    const gaps = profile.gaps
      .map((g) => `- ${g.domain} (${g.score}%): ${g.note}. ${g.suggestion}`)
      .join("\n");
    return `Promotion Narrative Draft\n\nTarget: ${profile.target_rank} (${profile.target_track})\nTimeline: ${profile.promotion_timeline}\nOverall readiness: ${profile.overall_readiness}%\n\nStrengths:\n${strengths}\n\nGaps to address:\n${gaps}\n\n[Section 1: Clinical Excellence — draft with Mak]\n\n[Section 2: Teaching & Mentorship]\n\n[Section 3: Scholarship & Research]\n\n[Section 4: Service & Leadership]\n\n[Section 5: Career Vision]\n\n[Section 6: Summary]`;
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
  const isPromotionWizard = selected === "promotion_narrative";

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-7xl flex-col gap-4">
      <AcademicSoapSectionGate intent="create" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title">Career Documents</h1>
          <p className="mt-1 text-sm text-fiscmak-muted">
            Generate and manage CVs, biosketches, reports, and career briefs from your Career Data
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setSelected("cv_update");
            startMakFlow(
              "create",
              "/app/output",
              "Let's update your CV with any new publications, grants, roles, or awards since your last version. I'll merge them with your Career Data vault.",
            );
          }}
        >
          Update CV with Mak
        </Button>
      </div>
      {(outputContext?.enrichment_delta || outputContext?.career_vault?.summary) && (
        <Card accent="green">
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">Career Data source</p>
          <p className="mt-1 text-sm font-medium">{outputContext.career_vault?.summary}</p>
          {outputContext.enrichment_delta && (
            <p className="mt-1 text-sm text-fm-strong">{outputContext.enrichment_delta}</p>
          )}
          {(outputContext.career_vault?.pending_review ?? 0) > 0 && (
            <p className="mt-1 text-xs text-fm-developing">
              {outputContext.career_vault?.pending_review} item(s) pending review — reconcile in
              Objective before finalizing documents.
            </p>
          )}
        </Card>
      )}
      <div className="flex min-h-0 flex-1 gap-6">
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
        {v2Templates.length > 0 && (
          <>
            <h2 className="mt-4 px-2 text-xs font-semibold uppercase text-fiscmak-muted">
              Spec templates
            </h2>
            {v2Templates.map((t) => (
              <button
                key={t.template_id}
                type="button"
                onClick={() => setSelected(t.type === "promotion_narrative" ? "promotion_narrative" : t.type)}
                title={t.description}
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white"
              >
                {t.name}
              </button>
            ))}
          </>
        )}
        <VersionHistoryPanel versions={versions} onRestore={restoreVersion} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {readiness && (
          <Card className="border-fiscmak-green/30 bg-fiscmak-green-light/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Promotion readiness</p>
                <p className="text-xs text-fiscmak-muted">
                  {readiness.target_rank} · {readiness.target_track} ·{" "}
                  {readiness.promotion_timeline}
                </p>
              </div>
              <Badge energy={readiness.overall_readiness >= 70 ? "energizing" : "neutral"}>
                {readiness.overall_readiness}% ready
              </Badge>
            </div>
          </Card>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">{template.name}</h2>
            <p className="text-sm text-fiscmak-muted">
              {isPromotionWizard
                ? "Six-section wizard — Master Document template"
                : `Target ~${template.words} words`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isPromotionWizard && (
              <>
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
              </>
            )}
            {exportMsg && (
              <span className="text-sm text-fiscmak-green">{exportMsg}</span>
            )}
          </div>
        </div>

        {isPromotionWizard ? (
          <PromotionNarrativeWizard
            readiness={readiness}
            onFullDraft={(text) => {
              void navigator.clipboard.writeText(text);
              setExportMsg("Full narrative copied to clipboard");
              setTimeout(() => setExportMsg(""), 2500);
            }}
          />
        ) : (
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
        )}

        {!isPromotionWizard && (
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
        )}
      </div>
    </div>
    </div>
  );
}
