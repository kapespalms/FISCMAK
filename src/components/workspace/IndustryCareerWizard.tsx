"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { Badge } from "@/components/ui/Badge";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import {
  getSectionsForIndustryDocument,
  INDUSTRY_STAGE_POSITIONING,
  INDUSTRY_TRANSITION_TIPS,
  normalizeIndustryDocumentType,
  type IndustryCareerStageId,
  type IndustryDocumentType,
  type IndustrySectorId,
} from "@/lib/v2/industry-career-templates";

type SectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
};

type IndustryPayload = {
  document_type: IndustryDocumentType;
  sector_id: IndustrySectorId;
  stage_id: IndustryCareerStageId;
  sector_label: string;
  sector_roles: string;
  stage_positioning: {
    strengths: string[];
    commonRoles: string[];
    resumeTips: string[];
    bestIndustries: IndustrySectorId[];
  } | null;
  transition_tips: string[];
  cover_letter_tips: string[];
  recruiting_sectors: Array<{ id: IndustrySectorId; label: string }>;
  sections: SectionRow[];
  overall_completion: number;
  full_draft_preview: string;
  user?: { name?: string | null; specialty?: string | null };
};

type IndustryCareerWizardProps = {
  documentType: IndustryDocumentType | string;
  onFullDraft?: (text: string) => void;
};

const STAGE_OPTIONS = Object.entries(INDUSTRY_STAGE_POSITIONING).map(([id, def]) => ({
  id: id as IndustryCareerStageId,
  label: def.label,
}));

export function IndustryCareerWizard({
  documentType: rawDocumentType,
  onFullDraft,
}: IndustryCareerWizardProps) {
  const documentType = normalizeIndustryDocumentType(rawDocumentType);
  const isResume = documentType === "industry_resume";

  const [data, setData] = useState<IndustryPayload | null>(null);
  const [active, setActive] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contextSaving, setContextSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [positioningOpen, setPositioningOpen] = useState(true);
  const [tipsOpen, setTipsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/industry-career/${documentType}/current`);
    const json = (await res.json()) as IndustryPayload;
    setData(json);
    const first = json.sections[0]?.section ?? "";
    setActive((prev) => (json.sections.some((s) => s.section === prev) ? prev : first));
    setLoading(false);
    return json;
  }, [documentType]);

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
  const targetWords = sectionMeta?.target_words ?? 80;

  async function patchContext(patch: Record<string, unknown>) {
    setContextSaving(true);
    const res = await fetch(`/api/v1/industry-career/${documentType}/current`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      await load();
      setMessage("Context updated");
    }
    setContextSaving(false);
    setTimeout(() => setMessage(""), 2000);
  }

  async function saveSection() {
    if (!data || !active) return;
    setSaving(true);
    const res = await fetch(
      `/api/v1/industry-career/${documentType}/section/${active}/save`,
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
    if (!data || !active) return;
    const def = getSectionsForIndustryDocument(documentType, data.sector_id).find(
      (s) => s.id === active,
    );
    if (def) setDraft(def.placeholder);
  }

  async function assembleDraft() {
    if (!data) return;
    await navigator.clipboard.writeText(data.full_draft_preview);
    setMessage("Full draft copied to clipboard");
    onFullDraft?.(data.full_draft_preview);
    setTimeout(() => setMessage(""), 2500);
  }

  if (loading || !data || !sectionMeta) {
    return <p className="text-sm text-cx-forest-dark/70">Loading industry document…</p>;
  }

  const positioning = data.stage_positioning;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-80">
        <div className="space-y-2 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-3">
          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Target industry
          </label>
          <select
            value={data.sector_id}
            disabled={contextSaving}
            onChange={(e) => void patchContext({ sector_id: e.target.value })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {data.recruiting_sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-cx-forest-dark/60">{data.sector_roles}</p>

          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Career stage
          </label>
          <select
            value={data.stage_id}
            disabled={contextSaving}
            onChange={(e) => void patchContext({ stage_id: e.target.value })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {STAGE_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setPositioningOpen((o) => !o)}
          className="w-full text-left text-xs font-semibold uppercase text-cx-forest-dark/70"
        >
          {positioningOpen ? "Hide" : "Show"} stage positioning
        </button>
        {positioningOpen && positioning && (
          <div className="space-y-2 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.02] p-3 text-xs text-cx-forest-dark/70">
            <p className="font-medium text-cx-forest-dark">Strengths</p>
            <ul className="list-disc pl-4">
              {positioning.strengths.slice(0, 4).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="font-medium text-cx-forest-dark">Common roles</p>
            <ul className="list-disc pl-4">
              {positioning.commonRoles.slice(0, 3).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {!isResume && (
              <>
                <p className="font-medium text-cx-forest-dark">Cover letter tips</p>
                <ul className="list-disc pl-4">
                  {data.cover_letter_tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase text-cx-forest-dark/70">
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
                ? "border-[#5FD65F] bg-[#5FD65F]/10 font-semibold text-cx-forest-dark"
                : "border-cx-forest-dark/15 text-cx-forest-dark hover:bg-cx-forest-dark/[0.04]"
            }`}
          >
            <p>{s.title}</p>
            <p className="text-xs text-cx-forest-dark/70">
              {s.completion_percentage}% · ~{s.target_words} words
            </p>
          </button>
        ))}
        <Button variant="secondary" className="w-full" onClick={assembleDraft}>
          Assemble full {isResume ? "resume" : "letter"}
        </Button>
      </aside>

      <CardSection
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        eyebrow={isResume ? "Industry resume" : "Industry cover letter"}
        title={sectionMeta.title}
        description={`${data.sector_label} · ${sectionMeta.subtitle}`}
        mak={OUTPUT_MAK.industry_career_section(
          isResume ? "Industry resume" : "Industry cover letter",
          data.sector_label,
          sectionMeta.title,
        )}
      >
        <button
          type="button"
          onClick={() => setTipsOpen((o) => !o)}
          className="text-left text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
        >
          {tipsOpen ? "Hide" : "Show"} transition tips
        </button>
        {tipsOpen && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-cx-forest-dark/70">
            {INDUSTRY_TRANSITION_TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}

        <ul className="list-disc space-y-1 pl-5 text-sm text-cx-forest-dark/70">
          {sectionMeta.prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={12}
          placeholder={sectionMeta.subtitle}
          className="min-h-[240px] w-full flex-1 rounded-md border border-cx-forest-dark/15 bg-white p-4 text-base leading-relaxed text-cx-forest-dark"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-cx-forest-dark/70">
            {wordCount} / {targetWords} words
            {isResume && " · target 1–2 pages total"}
          </p>
          <div className="flex gap-2">
            <MakDiscussLink
              mak={OUTPUT_MAK.industry_career_section(
                isResume ? "Industry resume" : "Industry cover letter",
                data.sector_label,
                sectionMeta.title,
              )}
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
