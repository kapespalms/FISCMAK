"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { Badge } from "@/components/ui/Badge";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import {
  getPromotionTrackDefinition,
  getSectionsForTrack,
  prefillSection,
  PROMOTION_TRACKS,
  type PromotionTrackId,
} from "@/lib/v2/promotion-narrative-sections";

type SectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  emphasis?: "primary" | "secondary" | null;
  content: string | null;
  completion_percentage: number;
};

type DossierPayload = {
  dossier: { dossier_id: string; target_rank: string | null; target_track: string | null };
  track_id: PromotionTrackId;
  sections: SectionRow[];
  overall_completion: number;
  full_draft_preview: string;
  user?: { specialty?: string | null; career_stage?: string | null };
};

type ReadinessProfile = {
  target_track: string;
  target_rank: string;
  strengths: { domain: string; note: string }[];
  gaps: { domain: string; suggestion: string }[];
};

type PromotionNarrativeWizardProps = {
  readiness: ReadinessProfile | null;
  onFullDraft?: (text: string) => void;
};

export function PromotionNarrativeWizard({
  readiness,
  onFullDraft,
}: PromotionNarrativeWizardProps) {
  const [data, setData] = useState<DossierPayload | null>(null);
  const [active, setActive] = useState<string>("introduction");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackSaving, setTrackSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tipsOpen, setTipsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/promotion/dossier/current");
    const json = (await res.json()) as DossierPayload;
    setData(json);
    const firstSection = json.sections[0]?.section ?? "introduction";
    setActive((prev) => (json.sections.some((s) => s.section === prev) ? prev : firstSection));
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

  const trackId = data?.track_id ?? "clinician_educator";
  const trackDef = getPromotionTrackDefinition(trackId);
  const sectionMeta = getSectionsForTrack(trackId).find((s) => s.id === active);
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const targetWords = sectionMeta?.targetWords ?? 200;

  async function saveSection() {
    if (!data || !sectionMeta) return;
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/v1/promotion/narrative/${active}/save`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dossier_id: data.dossier.dossier_id, content: draft }),
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
    if (!data || !sectionMeta) return;
    const text = prefillSection(active, {
      target_rank: readiness?.target_rank ?? data.dossier.target_rank ?? undefined,
      target_track: trackDef.dossierLabel,
      specialty: data.user?.specialty ?? undefined,
      career_stage: data.user?.career_stage ?? undefined,
      strengths: readiness?.strengths,
      gaps: readiness?.gaps,
    });
    if (text) setDraft(text);
  }

  async function changeTrack(nextTrackId: PromotionTrackId) {
    if (!data || nextTrackId === trackId) return;
    setTrackSaving(true);
    const nextDef = getPromotionTrackDefinition(nextTrackId);
    const res = await fetch(`/api/v1/promotion/dossier/${data.dossier.dossier_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_track: nextDef.dossierLabel }),
    });
    if (res.ok) {
      const json = await load();
      setActive(json.sections[0]?.section ?? "introduction");
      setMessage(`Switched to ${nextDef.label} template`);
    } else {
      setMessage("Could not update track");
    }
    setTrackSaving(false);
    setTimeout(() => setMessage(""), 2500);
  }

  async function assembleDraft() {
    if (!data) return;
    await navigator.clipboard.writeText(data.full_draft_preview);
    setMessage("Full draft copied to clipboard");
    onFullDraft?.(data.full_draft_preview);
    setTimeout(() => setMessage(""), 2500);
  }

  if (loading || !data || !sectionMeta) {
    return <p className="text-sm text-cx-text/70">Loading promotion narrative…</p>;
  }

  const sectionTitle = sectionMeta.title;
  const sectionSubtitle = sectionMeta.subtitle;
  const prompts = sectionMeta.prompts;
  const placeholder = sectionMeta.placeholder;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-72">
        <div className="space-y-2 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-3">
          <label className="text-xs font-semibold uppercase text-cx-text/70">
            Promotion track
          </label>
          <select
            value={trackId}
            disabled={trackSaving}
            onChange={(e) => void changeTrack(e.target.value as PromotionTrackId)}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm text-cx-text"
          >
            {PROMOTION_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-cx-text/60">{trackDef.primaryDomain}</p>
          <p className="text-xs text-cx-text/60">{trackDef.typicalLength}</p>
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
            <div className="flex items-start justify-between gap-2">
              <p>{s.title}</p>
              {s.emphasis === "primary" && (
                <span className="shrink-0 text-[10px] font-semibold uppercase text-[#AC8636]">
                  Primary
                </span>
              )}
            </div>
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
        eyebrow={`Promotion narrative · ${trackDef.label}`}
        title={sectionTitle}
        description={sectionSubtitle}
        mak={OUTPUT_MAK.promotion_section(sectionTitle, trackDef.label)}
      >
        <button
          type="button"
          onClick={() => setTipsOpen((o) => !o)}
          className="text-left text-xs font-medium text-cx-text/70 hover:text-cx-text"
        >
          {tipsOpen ? "Hide" : "Show"} track writing tips
        </button>
        {tipsOpen && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-cx-text/70">
            {trackDef.trackTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}

        <ul className="list-disc space-y-1 pl-5 text-sm text-cx-text/70">
          {prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          placeholder={placeholder}
          className="min-h-[280px] w-full flex-1 rounded-md border border-cx-forest-dark/15 bg-white p-4 text-base leading-relaxed text-cx-text"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-cx-text/70">
            {wordCount} / {targetWords} words
          </p>
          <div className="flex gap-2">
            <MakDiscussLink
              mak={OUTPUT_MAK.promotion_section(sectionTitle, trackDef.label)}
              variant="button"
            />
            <Button variant="secondary" onClick={applyPrefill}>
              Prefill hints
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
