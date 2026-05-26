"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { Badge } from "@/components/ui/Badge";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import {
  CAREER_NARRATIVE_APPLICATIONS,
  CAREER_NARRATIVE_STAGES,
  CAREER_NARRATIVE_TRACKS,
  GENERAL_NARRATIVE_TIPS,
  prefillCareerNarrativeSection,
  resolveSectionsForContext,
  type CareerNarrativeApplicationId,
  type CareerNarrativeStageId,
  type CareerNarrativeTrackId,
} from "@/lib/v2/career-narrative-templates";
import {
  PERSONAL_STATEMENT_UNIVERSAL_TIPS,
  resolveSpecialtyGuide,
} from "@/lib/v2/personal-statement-templates";

type SectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
};

type CareerNarrativePayload = {
  stage_id: CareerNarrativeStageId;
  track_id: CareerNarrativeTrackId;
  application_id: CareerNarrativeApplicationId;
  sections: SectionRow[];
  overall_completion: number;
  full_draft_preview: string;
  user?: {
    specialty?: string | null;
    career_stage?: string | null;
    career_objective?: string | null;
  };
};

type CareerNarrativeWizardProps = {
  onFullDraft?: (text: string) => void;
  defaultApplicationId?: CareerNarrativeApplicationId;
};

export function CareerNarrativeWizard({
  onFullDraft,
  defaultApplicationId,
}: CareerNarrativeWizardProps) {
  const [data, setData] = useState<CareerNarrativePayload | null>(null);
  const [active, setActive] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contextSaving, setContextSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tipsOpen, setTipsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/career-narrative/current");
    let json = (await res.json()) as CareerNarrativePayload;
    if (
      defaultApplicationId &&
      json.application_id !== defaultApplicationId
    ) {
      const patchRes = await fetch("/api/v1/career-narrative/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: defaultApplicationId }),
      });
      if (patchRes.ok) {
        json = (await patchRes.json()) as CareerNarrativePayload;
      }
    }
    setData(json);
    const first =
      json.sections[0]?.section ??
      resolveSectionsForContext({
        stageId: json.stage_id,
        applicationId: json.application_id,
      })[0]?.id ??
      "";
    setActive((prev) => (json.sections.some((s) => s.section === prev) ? prev : first));
    setLoading(false);
    return json;
  }, [defaultApplicationId]);

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

  async function saveSection() {
    if (!data || !active) return;
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/v1/career-narrative/section/${active}/save`, {
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
    if (!data || !active) return;
    const text = prefillCareerNarrativeSection(active, {
      stageId: data.stage_id,
      trackId: data.track_id,
      applicationId: data.application_id,
      specialty: data.user?.specialty ?? undefined,
      careerObjective: data.user?.career_objective ?? undefined,
    });
    if (text) setDraft(text);
  }

  async function updateContext(patch: {
    stage_id?: CareerNarrativeStageId;
    track_id?: CareerNarrativeTrackId;
    application_id?: CareerNarrativeApplicationId;
  }) {
    if (!data) return;
    setContextSaving(true);
    const res = await fetch("/api/v1/career-narrative/current", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const json = (await res.json()) as CareerNarrativePayload;
      setData(json);
      setActive(json.sections[0]?.section ?? active);
      setMessage("Template updated");
    } else {
      setMessage("Update failed");
    }
    setContextSaving(false);
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
    return <p className="text-sm text-cx-forest-dark/70">Loading career narrative…</p>;
  }

  const stageDef = CAREER_NARRATIVE_STAGES.find((s) => s.id === data.stage_id)!;
  const trackDef = CAREER_NARRATIVE_TRACKS.find((t) => t.id === data.track_id)!;
  const appDef = CAREER_NARRATIVE_APPLICATIONS.find((a) => a.id === data.application_id)!;
  const isPersonalStatement = data.application_id === "training_personal_statement";
  const specialtyGuide = resolveSpecialtyGuide(data.user?.specialty);
  const sectionPlaceholder =
    resolveSectionsForContext({
      stageId: data.stage_id,
      applicationId: data.application_id,
    }).find((s) => s.id === active)?.placeholder ?? "Draft in first person with specific examples…";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-72">
        <div className="space-y-2 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-3">
          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Career stage
          </label>
          <select
            value={data.stage_id}
            disabled={contextSaving}
            onChange={(e) => void updateContext({ stage_id: e.target.value as CareerNarrativeStageId })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {CAREER_NARRATIVE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">Career track</label>
          <select
            value={data.track_id}
            disabled={contextSaving}
            onChange={(e) => void updateContext({ track_id: e.target.value as CareerNarrativeTrackId })}
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {CAREER_NARRATIVE_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Application type
          </label>
          <select
            value={data.application_id}
            disabled={contextSaving}
            onChange={(e) =>
              void updateContext({ application_id: e.target.value as CareerNarrativeApplicationId })
            }
            className="w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {CAREER_NARRATIVE_APPLICATIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-cx-forest-dark/60">{stageDef.purpose}</p>
        </div>

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
          Assemble full draft
        </Button>
      </aside>

      <CardSection
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        eyebrow={`${stageDef.label} · ${trackDef.label}`}
        title={sectionMeta.title}
        description={`${sectionMeta.subtitle} · ${appDef.label}`}
        mak={OUTPUT_MAK.career_narrative_section(sectionMeta.title, stageDef.label, trackDef.label)}
      >
        <button
          type="button"
          onClick={() => setTipsOpen((o) => !o)}
          className="text-left text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
        >
          {tipsOpen ? "Hide" : "Show"} writing guidance
        </button>
        {tipsOpen && (
          <div className="space-y-2 text-sm text-cx-forest-dark/70">
            {isPersonalStatement ? (
              <>
                {specialtyGuide && (
                  <div className="rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] p-3">
                    <p className="font-medium text-cx-forest-dark">
                      Specialty: {specialtyGuide.label}
                      {!data.user?.specialty && " (set specialty in Profile for tailored prompts)"}
                    </p>
                    <p className="mt-1">{specialtyGuide.uniqueAngle}</p>
                    <p className="mt-2 text-xs">
                      Avoid: {(specialtyGuide.avoid ?? []).join("; ") || "specialty clichés"}
                    </p>
                    {specialtyGuide.toneNote && (
                      <p className="mt-1 text-xs">Tone: {specialtyGuide.toneNote}</p>
                    )}
                  </div>
                )}
                <ul className="list-disc space-y-1 pl-5">
                  {PERSONAL_STATEMENT_UNIVERSAL_TIPS.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p>
                  <span className="font-medium">Identity:</span> {trackDef.coreIdentity}
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {GENERAL_NARRATIVE_TIPS.slice(0, 4).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="text-xs text-cx-forest-dark/60">
              Audience: {appDef.audience}. Voice: {appDef.voice}.
            </p>
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
          rows={14}
          placeholder={sectionPlaceholder}
          className="min-h-[280px] w-full flex-1 rounded-md border border-cx-forest-dark/15 bg-white p-4 text-base leading-relaxed text-cx-forest-dark"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-cx-forest-dark/70">
            {wordCount} / {targetWords} words
          </p>
          <div className="flex gap-2">
            <MakDiscussLink
              mak={OUTPUT_MAK.career_narrative_section(
                sectionMeta.title,
                stageDef.label,
                trackDef.label,
              )}
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
