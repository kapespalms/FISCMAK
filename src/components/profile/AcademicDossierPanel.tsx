"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { PROFILE_MAK } from "@/lib/card-mak-prompts";
import {
  ACADEMIC_DOSSIER_STAGES,
  DOSSIER_DESIGN_PRINCIPLES,
  type AcademicDossierStageId,
} from "@/lib/v2/academic-dossier-templates";
import { cn } from "@/lib/utils";

type DossierItemRow = {
  id: string;
  label: string;
  hint: string | null;
  checked: boolean;
  notes: string | null;
};

type DossierSectionRow = {
  id: string;
  title: string;
  items: DossierItemRow[];
};

type DossierPayload = {
  stage_id: AcademicDossierStageId;
  purpose: string;
  sections: DossierSectionRow[];
  supporting_documents: DossierItemRow[];
  formatting_guidelines: string[];
  overall_completion: number;
  summary_preview: string;
};

export function AcademicDossierPanel() {
  const [data, setData] = useState<DossierPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [supportOpen, setSupportOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [principlesOpen, setPrinciplesOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/academic-dossier/current");
    const json = (await res.json()) as DossierPayload;
    setData(json);
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const s of json.sections) {
        if (next[s.id] === undefined) next[s.id] = true;
      }
      return next;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveItem(itemId: string, patch: { checked?: boolean; notes?: string }) {
    setSavingId(itemId);
    const res = await fetch(`/api/v1/academic-dossier/item/${encodeURIComponent(itemId)}/save`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) await load();
    setSavingId(null);
  }

  async function changeStage(stageId: AcademicDossierStageId) {
    const res = await fetch("/api/v1/academic-dossier/current", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: stageId }),
    });
    if (res.ok) {
      await load();
      setMessage("Dossier stage updated");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  async function copySummary() {
    if (!data) return;
    await navigator.clipboard.writeText(data.summary_preview);
    setMessage("Dossier summary copied");
    setTimeout(() => setMessage(""), 2500);
  }

  if (loading || !data) {
    return <p className="text-sm text-cx-text/70">Loading academic dossier…</p>;
  }

  const stageLabel =
    ACADEMIC_DOSSIER_STAGES.find((s) => s.id === data.stage_id)?.label ?? data.stage_id;

  return (
    <CardSection
      eyebrow="Academic dossier"
      title="Career stage dossier guide"
      description={`${stageLabel} · ${data.purpose}`}
      mak={PROFILE_MAK.academic_dossier(stageLabel)}
      action={
        <Badge energy={data.overall_completion >= 60 ? "energizing" : "neutral"}>
          {data.overall_completion}%
        </Badge>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-semibold uppercase text-cx-text/70">
            Dossier stage
          </label>
          <select
            value={data.stage_id}
            onChange={(e) => void changeStage(e.target.value as AcademicDossierStageId)}
            className="mt-1 w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {ACADEMIC_DOSSIER_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <Button variant="secondary" onClick={copySummary}>
          Export summary
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setPrinciplesOpen((o) => !o)}
        className="text-left text-xs font-medium text-cx-text/70 hover:text-cx-text"
      >
        {principlesOpen ? "Hide" : "Show"} design principles
      </button>
      {principlesOpen && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-cx-text/70">
          {DOSSIER_DESIGN_PRINCIPLES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="space-y-3">
        {data.sections.map((sectionRow) => {
          const open = openSections[sectionRow.id] ?? true;
          const done = sectionRow.items.filter((i) => i.checked || i.notes?.trim()).length;
          return (
            <div
              key={sectionRow.id}
              className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.02]"
            >
              <button
                type="button"
                onClick={() => setOpenSections((o) => ({ ...o, [sectionRow.id]: !open }))}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
              >
                <span className="text-sm font-semibold text-cx-text">{sectionRow.title}</span>
                <span className="flex items-center gap-2 text-xs text-cx-text/60">
                  {sectionRow.items.length > 0 ? `${done}/${sectionRow.items.length}` : "—"}
                  <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
                </span>
              </button>
              {open && (
                <div className="space-y-3 border-t border-cx-forest-dark/10 px-3 py-3">
                  <MakDiscussLink
                    mak={PROFILE_MAK.academic_dossier_section(sectionRow.title, stageLabel)}
                    className="text-xs"
                  />
                  {sectionRow.items.map((item) => (
                    <DossierItemEditor
                      key={item.id}
                      item={item}
                      saving={savingId === item.id}
                      onSave={(patch) => void saveItem(item.id, patch)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.02]">
        <button
          type="button"
          onClick={() => setSupportOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-left"
        >
          <span className="text-sm font-semibold text-cx-text">
            Supporting documents (maintain alongside dossier)
          </span>
          <ChevronDown size={14} className={cn("transition-transform", supportOpen && "rotate-180")} />
        </button>
        {supportOpen && (
          <div className="space-y-3 border-t border-cx-forest-dark/10 px-3 py-3">
            {data.supporting_documents.map((item) => (
              <DossierItemEditor
                key={item.id}
                item={item}
                saving={savingId === item.id}
                onSave={(patch) => void saveItem(item.id, patch)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.02]">
        <button
          type="button"
          onClick={() => setGuidelinesOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-left"
        >
          <span className="text-sm font-semibold text-cx-text">Formatting guidelines</span>
          <ChevronDown size={14} className={cn("transition-transform", guidelinesOpen && "rotate-180")} />
        </button>
        {guidelinesOpen && (
          <ul className="list-disc space-y-1 border-t border-cx-forest-dark/10 px-3 py-3 pl-8 text-sm text-cx-text/70">
            {data.formatting_guidelines.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        )}
      </div>

      {message && <p className="text-sm text-cx-success">{message}</p>}
    </CardSection>
  );
}

function DossierItemEditor({
  item,
  saving,
  onSave,
}: {
  item: DossierItemRow;
  saving: boolean;
  onSave: (patch: { checked?: boolean; notes?: string }) => void;
}) {
  const [notes, setNotes] = useState(item.notes ?? "");

  useEffect(() => {
    setNotes(item.notes ?? "");
  }, [item.notes]);

  return (
    <div className="space-y-1.5">
      <label className="flex cursor-pointer items-start gap-2 text-sm text-cx-text">
        <input
          type="checkbox"
          checked={item.checked}
          disabled={saving}
          onChange={(e) => onSave({ checked: e.target.checked, notes })}
          className="mt-0.5"
        />
        <span>
          {item.label}
          {item.hint && (
            <span className="mt-0.5 block text-xs text-cx-text/60">{item.hint}</span>
          )}
        </span>
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== (item.notes ?? "")) onSave({ notes, checked: item.checked });
        }}
        rows={2}
        placeholder="Content, metrics, links, or draft notes…"
        className="w-full rounded-md border border-cx-forest-dark/10 bg-white px-2 py-1.5 text-xs text-cx-text"
      />
    </div>
  );
}
