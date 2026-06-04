"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { Badge } from "@/components/ui/Badge";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import {
  getCoreDocumentDef,
  normalizeCoreDocumentId,
  prefillDocumentSection,
  type AcademicCoreDocumentId,
} from "@/lib/v2/academic-core-document-templates";

type SectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
};

type DocumentPayload = {
  document_id: AcademicCoreDocumentId;
  label: string;
  description: string;
  formatting_notes: string[];
  sections: SectionRow[];
  overall_completion: number;
  full_draft_preview: string;
  user?: {
    name?: string | null;
    specialty?: string | null;
    career_stage?: string | null;
    academic_rank?: string | null;
  };
};

type AcademicCoreDocumentWizardProps = {
  documentId: AcademicCoreDocumentId | string;
  onFullDraft?: (text: string) => void;
};

export function AcademicCoreDocumentWizard({
  documentId: rawDocumentId,
  onFullDraft,
}: AcademicCoreDocumentWizardProps) {
  const documentId = normalizeCoreDocumentId(rawDocumentId);
  const docDef = getCoreDocumentDef(documentId);

  const [data, setData] = useState<DocumentPayload | null>(null);
  const [active, setActive] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tipsOpen, setTipsOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/academic-documents/${documentId}/current`);
    const json = (await res.json()) as DocumentPayload;
    setData(json);
    const first = json.sections[0]?.section ?? "";
    setActive((prev) => (json.sections.some((s) => s.section === prev) ? prev : first));
    setLoading(false);
    return json;
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data) return;
    const row = data.sections.find((s) => s.section === active);
    setDraft(row?.content ?? "");
  }, [active, data]);

  const sectionMeta = data?.sections.find((s) => s.section === active);
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const targetWords = sectionMeta?.target_words ?? 200;
  const sectionPlaceholder =
    docDef.sections.find((s) => s.id === active)?.placeholder ??
    "Draft with specific metrics and evidence from your Career Data vault…";

  async function saveSection() {
    if (!data || !active) return;
    setSaving(true);
    setMessage("");
    const res = await fetch(
      `/api/v1/academic-documents/${documentId}/section/${active}/save`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      },
    );
    if (res.ok) {
      setMessage("Section saved");
      await load();
    } else {
      setMessage("Save failed");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 2000);
  }

  function applyPrefill() {
    if (!active) return;
    const text = prefillDocumentSection(active, {
      name: data?.user?.name ?? undefined,
      specialty: data?.user?.specialty ?? undefined,
      rank: data?.user?.academic_rank,
    });
    if (text) setDraft(text);
  }

  async function assembleDraft() {
    if (!data) return;
    await navigator.clipboard.writeText(data.full_draft_preview);
    setMessage("Full draft copied to clipboard");
    onFullDraft?.(data.full_draft_preview);
    setTimeout(() => setMessage(""), 2500);
  }

  if (loading || !data || !sectionMeta) {
    return <p className="text-sm text-cx-text/70">Loading {docDef.label}…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-72">
        <div className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-3">
          <p className="text-xs font-semibold uppercase text-cx-text/70">{docDef.label}</p>
          <p className="mt-1 text-xs text-cx-text/60">{docDef.description}</p>
          <button
            type="button"
            onClick={() => setFormatOpen((o) => !o)}
            className="mt-2 text-left text-xs font-medium text-cx-text/70 hover:text-cx-text"
          >
            {formatOpen ? "Hide" : "Show"} formatting notes
          </button>
          {formatOpen && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-cx-text/60">
              {data.formatting_notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase text-cx-text/70">
            {data.sections.length} sections
          </p>
          <Badge energy={data.overall_completion >= 70 ? "energizing" : "neutral"}>
            {data.overall_completion}%
          </Badge>
        </div>
        {data.sections.map((s) => (
          <button
            key={s.section}
            type="button"
            onClick={() => setActive(s.section)}
            className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
              active === s.section
                ? "border-[#AC8636] bg-[#AC8636]/10 font-semibold text-cx-text"
                : "border-cx-forest-dark/15 text-cx-text hover:bg-cx-forest-dark/[0.04]"
            }`}
          >
            <p>{s.title}</p>
            <p className="text-xs text-cx-text/70">
              {s.completion_percentage}% · ~{s.target_words} words
            </p>
          </button>
        ))}
        <Button variant="secondary" className="w-full" onClick={assembleDraft}>
          Assemble full draft
        </Button>
      </aside>

      <CardSection
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        eyebrow={docDef.label}
        title={sectionMeta.title}
        description={sectionMeta.subtitle}
        mak={OUTPUT_MAK.academic_document_section(docDef.label, sectionMeta.title)}
      >
        <button
          type="button"
          onClick={() => setTipsOpen((o) => !o)}
          className="text-left text-xs font-medium text-cx-text/70 hover:text-cx-text"
        >
          {tipsOpen ? "Hide" : "Show"} section prompts
        </button>
        {tipsOpen && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-cx-text/70">
            {sectionMeta.prompts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          placeholder={sectionPlaceholder}
          className="min-h-[280px] w-full flex-1 rounded-md border border-cx-forest-dark/15 bg-white p-4 text-base leading-relaxed text-cx-text"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-cx-text/70">
            {wordCount} / {targetWords} words
          </p>
          <div className="flex gap-2">
            <MakDiscussLink
              mak={OUTPUT_MAK.academic_document_section(docDef.label, sectionMeta.title)}
              variant="button"
            />
            <Button variant="secondary" onClick={applyPrefill}>
              Insert template
            </Button>
            <Button onClick={saveSection} disabled={saving}>
              {saving ? "Saving…" : "Save section"}
            </Button>
          </div>
        </div>
        {message && <p className="text-sm text-cx-success">{message}</p>}
      </CardSection>
    </div>
  );
}
