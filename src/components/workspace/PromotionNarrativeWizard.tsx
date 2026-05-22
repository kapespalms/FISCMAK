"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  PROMOTION_NARRATIVE_SECTIONS,
  prefillSection,
  type PromotionNarrativeSectionId,
} from "@/lib/v2/promotion-narrative-sections";

type SectionRow = {
  section: PromotionNarrativeSectionId;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
};

type DossierPayload = {
  dossier: { dossier_id: string; target_rank: string | null; target_track: string | null };
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
  const [active, setActive] = useState<PromotionNarrativeSectionId>("introduction");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/promotion/dossier/current");
    const json = (await res.json()) as DossierPayload;
    setData(json);
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

  const sectionDef = PROMOTION_NARRATIVE_SECTIONS.find((s) => s.id === active)!;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  async function saveSection() {
    if (!data) return;
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
    if (!data) return;
    const text = prefillSection(active, {
      target_rank: readiness?.target_rank ?? data.dossier.target_rank ?? undefined,
      target_track: readiness?.target_track ?? data.dossier.target_track ?? undefined,
      specialty: data.user?.specialty ?? undefined,
      career_stage: data.user?.career_stage ?? undefined,
      strengths: readiness?.strengths,
      gaps: readiness?.gaps,
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

  if (loading || !data) {
    return <p className="text-sm text-fiscmak-muted">Loading promotion narrative…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-2 lg:w-64">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase text-fiscmak-muted">6 sections</p>
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
                ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                : "border-fiscmak-border hover:bg-fiscmak-subtle"
            }`}
          >
            <p>{s.title}</p>
            <p className="text-xs text-fiscmak-muted">
              {s.completion_percentage}% · ~{s.target_words} words
            </p>
          </button>
        ))}
        <Button variant="secondary" className="w-full" onClick={assembleDraft}>
          Assemble full draft
        </Button>
      </aside>

      <Card className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold">{sectionDef.title}</h3>
          <p className="text-sm text-fiscmak-muted">{sectionDef.subtitle}</p>
        </div>

        <ul className="list-disc space-y-1 pl-5 text-sm text-fiscmak-muted">
          {sectionDef.prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          placeholder={sectionDef.placeholder}
          className="min-h-[280px] w-full flex-1 rounded-md border border-fiscmak-border p-4 text-base leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-fiscmak-muted">
            {wordCount} / {sectionDef.targetWords} words
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={applyPrefill}>
              Prefill with Mak hints
            </Button>
            <Button onClick={saveSection} disabled={saving}>
              {saving ? "Saving…" : "Save section"}
            </Button>
          </div>
        </div>
        {message && <p className="text-sm text-fiscmak-green">{message}</p>}
      </Card>
    </div>
  );
}
