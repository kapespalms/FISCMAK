"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { Badge } from "@/components/ui/Badge";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import {
  COVER_LETTER_STAGES,
  COVER_LETTER_UNIVERSAL_TIPS,
  prefillCoverLetterSection,
  type CoverLetterStageId,
} from "@/lib/v2/cover-letter-templates";
import type {
  CoverLetterInstitutionalSettingId,
  CoverLetterPositionTypeId,
  CoverLetterSpecialtyCategoryId,
} from "@/lib/v2/cover-letter-guide";

type SectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
  example: string | null;
};

type ContextualGuidance = {
  position: string[];
  institutional: { values: string[]; tips: string[] };
  specialty: { differentiators: string[]; sampleLanguage: string | null };
  narrativeArc: string;
  advancedTips: string[];
};

type CoverLetterPayload = {
  stage_id: CoverLetterStageId;
  position_type: CoverLetterPositionTypeId;
  institutional_setting: CoverLetterInstitutionalSettingId;
  specialty_category: CoverLetterSpecialtyCategoryId;
  label: string;
  emphasis: string;
  universal_tips: string[];
  formatting_notes: string[];
  position_types: Array<{ id: CoverLetterPositionTypeId; label: string }>;
  institutional_settings: Array<{ id: CoverLetterInstitutionalSettingId; label: string }>;
  specialty_categories: Array<{ id: CoverLetterSpecialtyCategoryId; label: string }>;
  contextual_guidance: ContextualGuidance;
  advanced_strategies: {
    avoid: string[];
    red_flags: string[];
    specificity: { weak: string; strong: string };
  };
  sample_letters: Array<{ id: string; title: string; excerpt: string }>;
  submission_checklist: Array<{ id: string; label: string; checked: boolean }>;
  sections: SectionRow[];
  overall_completion: number;
  full_draft_preview: string;
  user?: {
    name?: string | null;
    specialty?: string | null;
    career_stage?: string | null;
    institution?: string | null;
  };
};

type CoverLetterWizardProps = {
  onFullDraft?: (text: string) => void;
};

export function CoverLetterWizard({ onFullDraft }: CoverLetterWizardProps) {
  const [data, setData] = useState<CoverLetterPayload | null>(null);
  const [active, setActive] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contextSaving, setContextSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tipsOpen, setTipsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/cover-letter/current");
    const json = (await res.json()) as CoverLetterPayload;
    setData(json);
    const first = json.sections[0]?.section ?? "";
    setActive((prev) => (json.sections.some((s) => s.section === prev) ? prev : first));
    setLoading(false);
    return json;
  }, []);

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
  const totalWords = data?.sections.reduce((sum, s) => {
    const w = s.content?.trim() ? s.content.trim().split(/\s+/).length : 0;
    return sum + w;
  }, 0) ?? 0;
  const draftWords =
    active === sectionMeta?.section
      ? totalWords - (sectionMeta.content?.trim().split(/\s+/).length ?? 0) + wordCount
      : totalWords;
  const stageDef = COVER_LETTER_STAGES.find((s) => s.id === data?.stage_id);
  const positionLabel =
    data?.position_types.find((p) => p.id === data.position_type)?.label ?? "";

  async function patchContext(patch: Record<string, unknown>) {
    setContextSaving(true);
    const res = await fetch("/api/v1/cover-letter/current", {
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
    setMessage("");
    const res = await fetch(`/api/v1/cover-letter/section/${active}/save`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
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
    const text = prefillCoverLetterSection(active, {
      name: data?.user?.name ?? undefined,
      specialty: data?.user?.specialty ?? undefined,
      institution: data?.user?.institution ?? undefined,
    });
    if (text) setDraft(text);
  }

  async function toggleChecklistItem(id: string, checked: boolean) {
    await patchContext({ checklist: { [id]: checked } });
  }

  async function assembleDraft() {
    if (!data) return;
    await navigator.clipboard.writeText(data.full_draft_preview);
    setMessage("Full cover letter copied to clipboard");
    onFullDraft?.(data.full_draft_preview);
    setTimeout(() => setMessage(""), 2500);
  }

  if (loading || !data || !sectionMeta) {
    return <p className="text-sm text-cx-forest-dark/70">Loading cover letter…</p>;
  }

  const ctx = data.contextual_guidance;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-80">
        <div className="space-y-2 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-3">
          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Career stage
          </label>
          <select
            value={data.stage_id}
            disabled={contextSaving}
            onChange={(e) => void patchContext({ stage_id: e.target.value })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {COVER_LETTER_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Position type
          </label>
          <select
            value={data.position_type}
            disabled={contextSaving}
            onChange={(e) => void patchContext({ position_type: e.target.value })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {data.position_types.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Institutional setting
          </label>
          <select
            value={data.institutional_setting}
            disabled={contextSaving}
            onChange={(e) => void patchContext({ institutional_setting: e.target.value })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {data.institutional_settings.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Specialty category
          </label>
          <select
            value={data.specialty_category}
            disabled={contextSaving}
            onChange={(e) => void patchContext({ specialty_category: e.target.value })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {data.specialty_categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <p className="text-xs text-cx-forest-dark/60">{stageDef?.emphasis}</p>
        </div>

        <button
          type="button"
          onClick={() => setGuideOpen((o) => !o)}
          className="w-full text-left text-xs font-semibold uppercase text-cx-forest-dark/70"
        >
          {guideOpen ? "Hide" : "Show"} tailoring guide
        </button>
        {guideOpen && (
          <div className="space-y-2 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.02] p-3 text-xs text-cx-forest-dark/70">
            <p className="font-medium text-cx-forest-dark">Narrative arc</p>
            <p className="italic">{ctx.narrativeArc}</p>
            <p className="font-medium text-cx-forest-dark">Position ({positionLabel})</p>
            <ul className="list-disc pl-4">
              {ctx.position.slice(0, 4).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {ctx.specialty.sampleLanguage && (
              <>
                <p className="font-medium text-cx-forest-dark">Specialty sample language</p>
                <p className="italic">{ctx.specialty.sampleLanguage}</p>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            {data.sections.length} sections · ~{draftWords} words
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

        <div className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.02]">
          <button
            type="button"
            onClick={() => setChecklistOpen((o) => !o)}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-cx-forest-dark"
          >
            Submission checklist
          </button>
          {checklistOpen && (
            <div className="space-y-2 border-t border-cx-forest-dark/10 px-3 py-2">
              {data.submission_checklist.map((item) => (
                <label key={item.id} className="flex cursor-pointer items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => void toggleChecklistItem(item.id, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <Button variant="secondary" className="w-full" onClick={assembleDraft}>
          Assemble full letter
        </Button>
      </aside>

      <CardSection
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        eyebrow={`${data.label} · ${positionLabel}`}
        title={sectionMeta.title}
        description={sectionMeta.subtitle}
        mak={OUTPUT_MAK.cover_letter_section(data.label, sectionMeta.title)}
      >
        <button
          type="button"
          onClick={() => setTipsOpen((o) => !o)}
          className="text-left text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
        >
          {tipsOpen ? "Hide" : "Show"} universal tips & strategies
        </button>
        {tipsOpen && (
          <div className="space-y-3 text-sm text-cx-forest-dark/70">
            <ul className="list-disc space-y-1 pl-5">
              {COVER_LETTER_UNIVERSAL_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <p className="text-xs font-semibold uppercase text-cx-forest-dark/60">What to avoid</p>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              {data.advanced_strategies.avoid.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="text-xs">
              <span className="font-medium">Specificity:</span> {data.advanced_strategies.specificity.strong}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSamplesOpen((o) => !o)}
          className="text-left text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
        >
          {samplesOpen ? "Hide" : "Show"} sample letters
        </button>
        {samplesOpen && data.sample_letters.length > 0 && (
          <div className="space-y-2">
            {data.sample_letters.map((sample) => (
              <div
                key={sample.id}
                className="rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] p-3 text-sm text-cx-forest-dark/70"
              >
                <p className="font-medium text-cx-forest-dark">{sample.title}</p>
                <p className="mt-1 text-xs italic">{sample.excerpt}</p>
              </div>
            ))}
          </div>
        )}

        {sectionMeta.example && (
          <div className="rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] p-3 text-sm text-cx-forest-dark/70">
            <p className="text-xs font-semibold uppercase text-cx-forest-dark/60">Opening example</p>
            <p className="mt-1 italic">{sectionMeta.example}</p>
          </div>
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
            {wordCount} / {targetWords} words (section) · {draftWords} total (target: one page)
          </p>
          <div className="flex gap-2">
            <MakDiscussLink
              mak={OUTPUT_MAK.cover_letter_section(data.label, sectionMeta.title)}
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
