"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILLS, DOMAINS } from "@/lib/constants";
import { PROFILE_SECTIONS } from "@/lib/v2/profile-cells";
import { ItemFormModal } from "@/components/profile/ItemFormModal";
import type { BankItem } from "@/lib/v2/output-studio-bank";
import type { LatticeListItem } from "@/app/api/v1/lattice/list/route";

const QUADRANT_CHIPS: Record<string, { label: string; cls: string }> = {
  OV: { label: "OV", cls: "bg-emerald-50 text-emerald-700" },
  OI: { label: "OI", cls: "bg-amber-50  text-amber-700"  },
  SV: { label: "SV", cls: "bg-sky-50    text-sky-700"    },
  SI: { label: "SI", cls: "bg-violet-50 text-violet-700" },
};

function itemLabel(item: LatticeListItem): string {
  return item.display_label || item.raw_text?.slice(0, 140) || "(unlabelled)";
}

function cellTag(c: { skill_index: number; domain_index: number; weight: number }) {
  const s = (SKILLS[c.skill_index] ?? "").split(" ").slice(0, 2).join(" ");
  const d = (DOMAINS[c.domain_index] ?? "").split("/")[0]!.trim();
  return `${s} × ${d}`;
}

function findSection(item: LatticeListItem) {
  if (!item.item_type) return null;
  return PROFILE_SECTIONS.find((s) =>
    (s.types as string[]).includes(item.item_type!),
  ) ?? null;
}

export function LatticeListView() {
  const [items, setItems] = useState<LatticeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"date_desc" | "date_asc">("date_desc");
  const [editItem, setEditItem] = useState<LatticeListItem | null>(null);

  const load = useCallback(async (q: string, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort: s, limit: "100" });
      const res  = await fetch(`/api/v1/lattice/list?${params}`);
      const data = (await res.json()) as { items?: LatticeListItem[]; total?: number };
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(query, sort); }, [load, query, sort]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => void load(query, sort), 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaved(updated: BankItem) {
    setItems((prev) =>
      prev.map((i) => (i.item_id === updated.id
        ? { ...i, display_label: updated.display_label, item_type: updated.item_type }
        : i
      )),
    );
    setEditItem(null);
  }

  const editSection = editItem ? findSection(editItem) : null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accomplishments…"
            className="w-full rounded-xl border border-neutral-200 py-2 pl-9 pr-3 text-sm text-cx-forest-dark placeholder:text-neutral-400 focus:border-fis-gold focus:outline-none focus:ring-1 focus:ring-fis-gold"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={13} className="text-neutral-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "date_desc" | "date_asc")}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs text-cx-forest-dark focus:border-fis-gold focus:outline-none"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
          </select>
        </div>
        <span className="text-xs text-cx-forest-dark/50">{total} item{total !== 1 ? "s" : ""}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cx-forest-dark/15 py-12 text-center">
          <p className="text-sm text-cx-forest-dark/50">
            {query ? "No items match your search." : "No confirmed evidence yet — upload a CV or add items manually on your profile."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const qChip = QUADRANT_CHIPS[item.recognition_quadrant];
            const sortedCells = [...item.cells].sort((a, b) => b.weight - a.weight).slice(0, 3);
            return (
              <li
                key={item.id}
                className="group flex items-start gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium text-cx-forest-dark truncate">
                    {itemLabel(item)}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {qChip && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", qChip.cls)}>
                        {qChip.label}
                      </span>
                    )}
                    {item.item_type && (
                      <span className="rounded-full bg-fis-gold/10 px-2 py-0.5 text-[10px] font-medium text-fis-gold">
                        {item.item_type}
                      </span>
                    )}
                    {sortedCells.map((c, ci) => (
                      <span key={ci} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                        {cellTag(c)}
                      </span>
                    ))}
                    {!item.physician_confirmed && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                        unconfirmed
                      </span>
                    )}
                  </div>
                </div>
                {/* Edit — only for items with cv_item_metadata */}
                {item.item_id && findSection(item) && (
                  <button
                    type="button"
                    onClick={() => setEditItem(item)}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-cx-forest-dark/50 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-cx-forest-dark"
                  >
                    Edit
                  </button>
                )}
                <span className="shrink-0 text-[10px] text-neutral-400 mt-0.5">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Edit modal */}
      {editItem && editSection && (
        <ItemFormModal
          section={editSection}
          item={{
            id:               editItem.item_id!,
            evidence_unit_id: editItem.id,
            item_type:        editItem.item_type as import("@/lib/v2/output-studio-bank").CvItemType,
            structured_data:  {},
            display_label:    editItem.display_label,
            apt_role: null, apt_scholarship: null, apt_impact: null,
            is_representative: false,
            created_at:       editItem.created_at,
            raw_text:         editItem.raw_text,
            skill_index:      editItem.skill_index,
            domain_index:     editItem.domain_index,
            recognition_quadrant: editItem.recognition_quadrant,
            energy_score:     null,
            physician_confirmed: editItem.physician_confirmed,
          }}
          onSave={handleSaved}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
