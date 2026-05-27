"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OUTPUT_TEMPLATES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { PageShell } from "@/components/layout/PageShell";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
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
import { CareerNarrativeWizard } from "@/components/workspace/CareerNarrativeWizard";
import { AcademicCoreDocumentWizard } from "@/components/workspace/AcademicCoreDocumentWizard";
import { CoverLetterWizard } from "@/components/workspace/CoverLetterWizard";
import { IndustryCareerWizard } from "@/components/workspace/IndustryCareerWizard";
import { normalizeCoreDocumentId } from "@/lib/v2/academic-core-document-templates";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { useAppShell } from "@/components/layout/AppShell";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { OutputUserTemplatePanel } from "@/components/workspace/OutputUserTemplatePanel";
import { OUTPUT_TEMPLATE_TYPE_SESSION_KEY } from "@/lib/v2/output-user-templates";
import { TraineePreCccCard } from "@/components/gme/TraineePreCccCard";
import { TraineeMilestoneCard } from "@/components/gme/TraineeMilestoneCard";
import { TraineeMilestoneHeatmapCard } from "@/components/gme/TraineeMilestoneHeatmapCard";
import { TraineeRotationLogCard } from "@/components/gme/TraineeRotationLogCard";
import { Database, FileText, TrendingUp } from "lucide-react";

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
    void loadEvidence();
    const onLogged = () => void loadEvidence();
    window.addEventListener("fiscmak:activity-logged", onLogged);
    return () => window.removeEventListener("fiscmak:activity-logged", onLogged);
  }, [loadEvidence]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(OUTPUT_TEMPLATE_TYPE_SESSION_KEY, selected);
    }
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
  }, [selected]);

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
  const isCareerNarrativeWizard =
    selected === "career_narrative" || selected === "personal_statement";
  const isCoreDocumentWizard =
    selected === "biosketch" ||
    selected === "institutional_cv" ||
    selected === "teaching_portfolio";
  const isCoverLetterWizard = selected === "cover_letter";
  const isIndustryCareerWizard =
    selected === "industry_resume" || selected === "industry_cover_letter";

  return (
    <PageShell
      eyebrow={SOAP_TAB.output.nav}
      title={SOAP_TAB.output.title}
      subtitle={SOAP_TAB.output.description}
      maxWidth="full"
      className="flex h-[calc(100vh-10rem)] flex-col gap-4"
      action={
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
      }
    >
      <AcademicSoapSectionGate intent="create" />
      <TraineePreCccCard />
      <TraineeRotationLogCard />
      <TraineeMilestoneHeatmapCard />
      <TraineeMilestoneCard />
      {(outputContext?.enrichment_delta || outputContext?.career_vault?.summary) && (
        <CardSection
          accent="green"
          eyebrow="Career Data source"
          title="Document inputs"
          description={outputContext.career_vault?.summary}
          icon={Database}
          mak={OUTPUT_MAK.career_data_source}
        >
          {outputContext.enrichment_delta && (
            <p className="text-sm font-medium text-cx-forest-dark">{outputContext.enrichment_delta}</p>
          )}
          {(outputContext.career_vault?.pending_review ?? 0) > 0 && (
            <p className="mt-2 text-xs text-cx-forest-dark/70">
              {outputContext.career_vault?.pending_review} item(s) pending review — reconcile in
              Career Data before finalizing documents.
            </p>
          )}
        </CardSection>
      )}
      <div className="flex min-h-0 flex-1 gap-6">
      <aside className="w-56 shrink-0 space-y-2 overflow-y-auto">
        <CardSection
          compact
          eyebrow="Templates"
          title="FISCMAK library"
          icon={FileText}
          mak={OUTPUT_MAK.template(template.name, selected)}
        />
        {OUTPUT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              selected === t.id
                ? "bg-cx-forest-dark/10 font-semibold text-cx-forest-dark"
                : "text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
            }`}
          >
            {t.name}
          </button>
        ))}
        {v2Templates.length > 0 && (
          <>
            <h2 className="mt-4 px-2 text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
              Spec templates
            </h2>
            {v2Templates.map((t) => (
              <button
                key={t.template_id}
                type="button"
                onClick={() =>
                  setSelected(
                    t.type === "promotion_narrative"
                      ? "promotion_narrative"
                      : t.type === "career_narrative"
                        ? "career_narrative"
                        : t.type === "personal_statement"
                          ? "personal_statement"
                          : t.type === "biosketch"
                            ? "biosketch"
                            : t.type === "institutional_cv"
                              ? "institutional_cv"
                              : t.type === "teaching_portfolio"
                                ? "teaching_portfolio"
                                : t.type,
                  )
                }
                title={t.description}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
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
          <CardSection
            compact
            className="border-cx-forest-dark/15 bg-cx-forest-dark/[0.03]"
            eyebrow="Promotion"
            title="Readiness profile"
            description={`${readiness.target_rank} · ${readiness.target_track} · ${readiness.promotion_timeline}`}
            icon={TrendingUp}
            mak={OUTPUT_MAK.promotion_readiness}
            action={
              <Badge energy={readiness.overall_readiness >= 70 ? "energizing" : "neutral"}>
                {readiness.overall_readiness}% ready
              </Badge>
            }
          />
        )}
        <OutputUserTemplatePanel templateType={selected} templateName={template.name} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
              Active template
            </p>
            <h2 className="text-xl font-semibold text-cx-forest-dark">{template.name}</h2>
            <p className="text-sm text-cx-forest-dark/70">
              {isPromotionWizard
                ? "Track-specific promotion wizard — section by section"
                : isCareerNarrativeWizard
                  ? "Stage × track × application wizard — living career narrative"
                  : isCoreDocumentWizard
                    ? "Section-by-section drafting — NIH Biosketch, Institutional CV, or Teaching Portfolio"
                    : isCoverLetterWizard
                      ? "Stage × position × specialty × setting — comprehensive cover letter guide"
                      : isIndustryCareerWizard
                        ? "Industry transition — resume or cover letter by sector and career stage"
                        : `Target ~${template.words} words`}
            </p>
            <MakDiscussLink
              mak={OUTPUT_MAK.template(template.name, selected)}
              className="mt-2 text-cx-forest-dark hover:text-cx-forest-dark/80"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isPromotionWizard && !isCareerNarrativeWizard && !isCoreDocumentWizard && !isCoverLetterWizard && !isIndustryCareerWizard && (
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
              <span className="text-sm text-[#5FD65F]">{exportMsg}</span>
            )}
          </div>
        </div>

        {isCareerNarrativeWizard ? (
          <CareerNarrativeWizard
            defaultApplicationId={
              selected === "personal_statement" ? "training_personal_statement" : undefined
            }
            onFullDraft={(text) => {
              void navigator.clipboard.writeText(text);
              setExportMsg("Full narrative copied to clipboard");
              setTimeout(() => setExportMsg(""), 2500);
            }}
          />
        ) : isPromotionWizard ? (
          <PromotionNarrativeWizard
            readiness={readiness}
            onFullDraft={(text) => {
              void navigator.clipboard.writeText(text);
              setExportMsg("Full narrative copied to clipboard");
              setTimeout(() => setExportMsg(""), 2500);
            }}
          />
        ) : isCoreDocumentWizard ? (
          <AcademicCoreDocumentWizard
            documentId={normalizeCoreDocumentId(selected)}
            onFullDraft={(text) => {
              void navigator.clipboard.writeText(text);
              setExportMsg("Full draft copied to clipboard");
              setTimeout(() => setExportMsg(""), 2500);
            }}
          />
        ) : isCoverLetterWizard ? (
          <CoverLetterWizard
            onFullDraft={(text) => {
              void navigator.clipboard.writeText(text);
              setExportMsg("Full cover letter copied to clipboard");
              setTimeout(() => setExportMsg(""), 2500);
            }}
          />
        ) : isIndustryCareerWizard ? (
          <IndustryCareerWizard
            documentType={selected}
            onFullDraft={(text) => {
              void navigator.clipboard.writeText(text);
              setExportMsg("Industry document copied to clipboard");
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
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cx-forest-dark/15 px-4 py-2 text-sm text-cx-forest-dark/70">
            <span className={overLimit ? "font-medium text-cx-attention" : ""}>
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

        {!isPromotionWizard && !isCareerNarrativeWizard && !isCoreDocumentWizard && !isCoverLetterWizard && !isIndustryCareerWizard && (
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
    </PageShell>
  );
}
