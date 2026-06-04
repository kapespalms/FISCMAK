"use client";

import { useState } from "react";
import { GripVertical, Pencil, X, Check } from "lucide-react";
import { PROFILE_SECTIONS, ITEM_TYPE_LABELS, type ProfileSection } from "@/lib/v2/profile-cells";
import type { CvItemType } from "@/lib/v2/output-studio-bank";

export type PendingItem = {
  id: string;
  raw_text: string | null;
  primary_domain: string | null;
  primary_track: string | null;
  confidence_score: number | null;
  source_document_id: string | null;
  input_source: string | null;
  created_at: string;
};

type PendingTrayProps = {
  items: PendingItem[];
  onItemPlaced: (activityId: string) => void;
};

type TypePickerState = {
  activityId: string;
  label: string;
  section: ProfileSection;
};

export function PendingTray({ items, onItemPlaced }: PendingTrayProps) {
  const [typePicker, setTypePicker] = useState<TypePickerState | null>(null);
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) return null;

  function startEdit(item: PendingItem) {
    setEditingId(item.id);
    setEditLabel(item.raw_text?.slice(0, 120) ?? "");
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel("");
  }

  function resolvedLabel(item: PendingItem): string {
    return item.id === editingId ? editLabel : (item.raw_text?.slice(0, 120) ?? "");
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
      setEditingId(null);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPlacingId(null);
    }
  }

  async function dismissItem(activityId: string) {
    setDismissingId(activityId);
    setError(null);
    try {
      const res = await fetch(`/api/v1/profile/pending/${activityId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        setError(d.message ?? "Could not dismiss item.");
        return;
      }
      onItemPlaced(activityId);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setDismissingId(null);
    }
  }

  function handleMoveTo(item: PendingItem, section: ProfileSection) {
    const label = resolvedLabel(item);
    if (section.types.length === 1) {
      void placeItem(item.id, section.types[0]!, label);
    } else {
      setTypePicker({ activityId: item.id, label, section });
    }
  }

  function sourceBadge(item: PendingItem) {
    const isMak = !item.source_document_id;
    if (isMak) {
      return (
        <span className="rounded-full bg-[#3C8A60]/10 px-2 py-0.5 text-[10px] font-medium text-[#3C8A60]">
          Mak
        </span>
      );
    }
    return (
      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
        CV
      </span>
    );
  }

  function confidenceBadge(score: number | null) {
    if (score === null) return null;
    const tier = score >= 0.8 ? "high" : score >= 0.6 ? "medium" : "low";
    const cls =
      tier === "high"
        ? "bg-[#3C8A60]/10 text-[#3C8A60]"
        : tier === "medium"
          ? "bg-[#AC8636]/10 text-[#AC8636]"
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
            Confirm to add to your profile bank, or dismiss to remove.
          </p>
        </div>
        <span className="rounded-full bg-[#AC8636]/10 px-2.5 py-1 text-xs font-medium text-[#AC8636]">
          {items.length} pending
        </span>
      </div>

      {error && (
        <p className="mb-3 text-xs text-[#C28D6C]">{error}</p>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isEditing = editingId === item.id;
          const isBusy = placingId === item.id || dismissingId === item.id;

          return (
            <div
              key={item.id}
              draggable={!isEditing}
              onDragStart={(e) => {
                e.dataTransfer.setData("activity_id", item.id);
                e.dataTransfer.setData("raw_text", item.raw_text ?? "");
                e.dataTransfer.effectAllowed = "move";
              }}
              className="group flex cursor-grab items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 active:cursor-grabbing"
            >
              <GripVertical size={15} className="mt-0.5 shrink-0 text-neutral-300 group-hover:text-neutral-400" />

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {isEditing ? (
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    maxLength={255}
                    className="w-full rounded-lg border border-[#AC8636]/40 bg-white px-2.5 py-1.5 text-sm text-cx-forest-dark focus:border-[#AC8636] focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-cx-forest-dark line-clamp-2">
                    {item.raw_text ?? "(no text)"}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-cx-forest-dark/45">
                  {sourceBadge(item)}
                  {item.primary_track && <span>{item.primary_track}</span>}
                  {item.primary_domain && <span>· {item.primary_domain}</span>}
                  {confidenceBadge(item.confidence_score)}
                </div>
              </div>

              {/* Action area */}
              <div className="flex shrink-0 items-center gap-1.5">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-neutral-200 px-2 py-1 text-[10px] text-neutral-500 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    title="Edit label"
                    disabled={isBusy}
                    onClick={() => startEdit(item)}
                    className="rounded-lg p-1 text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-cx-forest-dark disabled:opacity-40"
                  >
                    <Pencil size={13} />
                  </button>
                )}

                {/* Move-to / Confirm dropdown */}
                <select
                  defaultValue=""
                  disabled={isBusy}
                  onChange={(e) => {
                    const sec = PROFILE_SECTIONS.find((s) => s.id === e.target.value);
                    if (sec) handleMoveTo(item, sec);
                    e.target.value = "";
                  }}
                  className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-cx-forest-dark focus:border-[#AC8636] focus:outline-none disabled:opacity-40"
                >
                  <option value="" disabled>
                    {isEditing ? (
                      <Check size={11} />
                    ) : null}
                    Confirm…
                  </option>
                  {PROFILE_SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>

                {/* Dismiss */}
                <button
                  type="button"
                  title="Dismiss"
                  disabled={isBusy}
                  onClick={() => void dismissItem(item.id)}
                  className="rounded-lg p-1 text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-[#C28D6C] disabled:opacity-40"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}
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
              &ldquo;{typePicker.label.slice(0, 100)}&rdquo;
            </p>
            <div className="space-y-2">
              {typePicker.section.types.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!!placingId}
                  onClick={() =>
                    void placeItem(typePicker.activityId, t, typePicker.label)
                  }
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-left text-sm text-cx-forest-dark transition-colors hover:border-[#AC8636] hover:bg-[#AC8636]/5 disabled:opacity-50"
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
