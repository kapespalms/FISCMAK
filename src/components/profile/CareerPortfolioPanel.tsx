"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { PROFILE_MAK } from "@/lib/card-mak-prompts";
import {
  CAREER_PORTFOLIO_STAGES,
  PORTFOLIO_DESIGN_PRINCIPLES,
  type CareerPortfolioStageId,
} from "@/lib/v2/career-portfolio-templates";
import { cn } from "@/lib/utils";

type PortfolioItemRow = {
  id: string;
  label: string;
  hint: string | null;
  checked: boolean;
  notes: string | null;
};

type PortfolioDomainRow = {
  id: string;
  title: string;
  items: PortfolioItemRow[];
};

type PortfolioPayload = {
  stage_id: CareerPortfolioStageId;
  focus: string;
  domains: PortfolioDomainRow[];
  cross_cutting: Array<{
    id: string;
    title: string;
    description: string;
    checked: boolean;
    notes: string | null;
  }>;
  overall_completion: number;
  summary_preview: string;
};

export function CareerPortfolioPanel() {
  const [data, setData] = useState<PortfolioPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});
  const [crossOpen, setCrossOpen] = useState(false);
  const [principlesOpen, setPrinciplesOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/career-portfolio/current");
    const json = (await res.json()) as PortfolioPayload;
    setData(json);
    setOpenDomains((prev) => {
      const next = { ...prev };
      for (const d of json.domains) {
        if (next[d.id] === undefined) next[d.id] = true;
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
    const res = await fetch(`/api/v1/career-portfolio/item/${encodeURIComponent(itemId)}/save`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) await load();
    setSavingId(null);
  }

  async function changeStage(stageId: CareerPortfolioStageId) {
    const res = await fetch("/api/v1/career-portfolio/current", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: stageId }),
    });
    if (res.ok) {
      await load();
      setMessage("Portfolio stage updated");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  async function copySummary() {
    if (!data) return;
    await navigator.clipboard.writeText(data.summary_preview);
    setMessage("Portfolio summary copied");
    setTimeout(() => setMessage(""), 2500);
  }

  if (loading || !data) {
    return <p className="text-sm text-cx-forest-dark/70">Loading career portfolio…</p>;
  }

  const stageLabel = CAREER_PORTFOLIO_STAGES.find((s) => s.id === data.stage_id)?.label ?? data.stage_id;

  return (
    <CardSection
      eyebrow="Career portfolio"
      title="Living portfolio by stage"
      description={`${stageLabel} · ${data.focus}`}
      mak={PROFILE_MAK.career_portfolio(stageLabel)}
      action={
        <Badge energy={data.overall_completion >= 60 ? "energizing" : "neutral"}>
          {data.overall_completion}%
        </Badge>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-semibold uppercase text-cx-forest-dark/70">
            Portfolio stage
          </label>
          <select
            value={data.stage_id}
            onChange={(e) => void changeStage(e.target.value as CareerPortfolioStageId)}
            className="mt-1 w-full rounded-md border border-cx-forest-dark/15 bg-white px-2 py-1.5 text-sm"
          >
            {CAREER_PORTFOLIO_STAGES.map((s) => (
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
        className="text-left text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
      >
        {principlesOpen ? "Hide" : "Show"} design principles
      </button>
      {principlesOpen && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-cx-forest-dark/70">
          {PORTFOLIO_DESIGN_PRINCIPLES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="space-y-3">
        {data.domains.map((domain) => {
          const open = openDomains[domain.id] ?? true;
          const done = domain.items.filter((i) => i.checked || i.notes?.trim()).length;
          return (
            <div
              key={domain.id}
              className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.02]"
            >
              <button
                type="button"
                onClick={() => setOpenDomains((o) => ({ ...o, [domain.id]: !open }))}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
              >
                <span className="text-sm font-semibold text-cx-forest-dark">{domain.title}</span>
                <span className="flex items-center gap-2 text-xs text-cx-forest-dark/60">
                  {done}/{domain.items.length}
                  <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
                </span>
              </button>
              {open && (
                <div className="space-y-3 border-t border-cx-forest-dark/10 px-3 py-3">
                  <MakDiscussLink
                    mak={PROFILE_MAK.career_portfolio_domain(domain.title, stageLabel)}
                    className="text-xs"
                  />
                  {domain.items.map((item) => (
                    <PortfolioItemEditor
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
          onClick={() => setCrossOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-left"
        >
          <span className="text-sm font-semibold text-cx-forest-dark">
            Cross-cutting elements (all stages)
          </span>
          <ChevronDown size={14} className={cn("transition-transform", crossOpen && "rotate-180")} />
        </button>
        {crossOpen && (
          <div className="space-y-3 border-t border-cx-forest-dark/10 px-3 py-3">
            {data.cross_cutting.map((item) => (
              <div key={item.id}>
                <PortfolioItemEditor
                  item={{
                    id: item.id,
                    label: item.title,
                    hint: item.description,
                    checked: item.checked,
                    notes: item.notes,
                  }}
                  saving={savingId === item.id}
                  onSave={(patch) => void saveItem(item.id, patch)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {message && <p className="text-sm text-cx-success">{message}</p>}
    </CardSection>
  );
}

function PortfolioItemEditor({
  item,
  saving,
  onSave,
}: {
  item: PortfolioItemRow;
  saving: boolean;
  onSave: (patch: { checked?: boolean; notes?: string }) => void;
}) {
  const [notes, setNotes] = useState(item.notes ?? "");

  useEffect(() => {
    setNotes(item.notes ?? "");
  }, [item.notes]);

  return (
    <div className="space-y-1.5">
      <label className="flex cursor-pointer items-start gap-2 text-sm text-cx-forest-dark">
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
            <span className="mt-0.5 block text-xs text-cx-forest-dark/60">{item.hint}</span>
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
        placeholder="Evidence, metrics, links, or notes…"
        className="w-full rounded-md border border-cx-forest-dark/10 bg-white px-2 py-1.5 text-xs text-cx-forest-dark"
      />
    </div>
  );
}
