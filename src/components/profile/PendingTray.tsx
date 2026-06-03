"use client";

import { useState } from "react";
import { GripVertical, X } from "lucide-react";
import { PROFILE_SECTIONS, ITEM_TYPE_LABELS, type ProfileSection } from "@/lib/v2/profile-cells";
import type { CvItemType } from "@/lib/v2/output-studio-bank";

export type PendingItem = {
  id: string;
  raw_text: string | null;
  primary_domain: string | null; // SKILLS name (task axis)
  primary_track: string | null;  // DOMAINS name (identity axis)
  confidence_score: number | null;
  source_document_id: string | null;
  created_at: string;
};

type PendingTrayProps = {
  items: PendingItem[];
  /** Called after a pending item is successfully confirmed+placed. */
  onItemPlaced: (activityId: string) => void;
};

type TypePickerState = {
  activityId: string;
  rawText: string;
  section: ProfileSection;
};

export function PendingTray({ items, onItemPlaced }: PendingTrayProps) {
  const [typePicker, setTypePicker] = useState<TypePickerState | null>(null);
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) return null;

  function handleDragStart(e: React.DragEvent, item: PendingItem) {
    e.dataTransfer.setData("activity_id", item.id);
    e.dataTransfer.setData("raw_text", item.raw_text ?? "");
    e.dataTransfer.effectAllowed = "move";
  }

  async function placeItem(activityId: string, itemType: CvItemType, displayLabel: string) {
    setPlacingId(activityId);
    setError(null);
    try {
      const res = await fetch("/api/v1/profile/items/from-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: activityId, item_type: itemType, display_label: displayLabel }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        setError(d.message ?? "Could not place item.");
        return;
      }
      onItemPlaced(activityId);
      setTypePicker(null);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPlacingId(null);
    }
  }

  function handleMoveTo(item: PendingItem, section: ProfileSection) {
    if (section.types.length === 1) {
      void placeItem(item.id, section.types[0]!, item.raw_text?.slice(0, 120) ?? "");
    } else {
      setTypePicker({ activityId: item.id, rawText: item.raw_text ?? "", section });
    }
  }

  function confidenceBadge(score: number | null) {
    if (score === null) return null;
    const tier = score >= 0.8 ? "high" : score >= 0.6 ? "medium" : "low";
    const cls = tier === "high"
      ? "bg-fis-green/10 text-fis-green"
      : tier === "medium"
      ? "bg-fis-gold/10 text-fis-gold"
      : "bg-neutral-100 text-neutral-500";
    return (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
        {tier}
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-cx-forest-dark">Pending Items</h2>
          <p className="mt-0.5 text-xs text-cx-forest-dark/55">
            Parsed from your uploaded CV — drag each card to the right section, or use "Move to."
          </p>
        </div>
        <span className="rounded-full bg-fis-gold/10 px-2.5 py-1 text-xs font-medium text-fis-gold">
          {items.length} pending
        </span>
      </div>

      {error && (
        <p className="mb-3 text-xs text-red-600">{error}</p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            className="group flex cursor-grab items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 active:cursor-grabbing"
          >
            <GripVertical size={15} className="mt-0.5 shrink-0 text-neutral-300 group-hover:text-neutral-400" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-sm text-cx-forest-dark line-clamp-2">
                {item.raw_text ?? "(no text)"}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-cx-forest-dark/45">
                {item.primary_track && <span>{item.primary_track}</span>}
                {item.primary_domain && <span>· {item.primary_domain}</span>}
                {confidenceBadge(item.confidence_score)}
              </div>
            </div>

            {/* Move-to dropdown */}
            <div className="relative shrink-0">
              <select
                defaultValue=""
                disabled={placingId === item.id}
                onChange={(e) => {
                  const sec = PROFILE_SECTIONS.find((s) => s.id === e.target.value);
                  if (sec) handleMoveTo(item, sec);
                  e.target.value = "";
                }}
                className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-cx-forest-dark focus:border-fis-gold focus:outline-none"
              >
                <option value="" disabled>Move to…</option>
                {PROFILE_SECTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Type picker overlay for multi-type sections */}
      {typePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cx-forest-dark">
                Select type for {typePicker.section.title}
              </h3>
              <button
                type="button"
                onClick={() => setTypePicker(null)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"
              >
                <X size={15} />
              </button>
            </div>
            <p className="mb-4 text-xs text-cx-forest-dark/60 line-clamp-2">
              &ldquo;{typePicker.rawText.slice(0, 100)}&rdquo;
            </p>
            <div className="space-y-2">
              {typePicker.section.types.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!!placingId}
                  onClick={() => void placeItem(
                    typePicker.activityId,
                    t,
                    typePicker.rawText.slice(0, 120),
                  )}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-left text-sm text-cx-forest-dark transition-colors hover:border-fis-gold hover:bg-fis-gold/5 disabled:opacity-50"
                >
                  {ITEM_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
