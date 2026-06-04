"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  FlaskConical,
  GraduationCap,
  Heart,
  MapPin,
  Medal,
  Mic,
  Pencil,
  Plus,
  Shield,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { NpiRegistryPanel, type NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { ItemFormModal } from "@/components/profile/ItemFormModal";
import { PendingTray, type PendingItem } from "@/components/profile/PendingTray";
import { CvUploadPanel } from "@/components/profile/CvUploadPanel";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  AVATAR_CHANGED_EVENT,
  getProfileAvatarUrl,
  hasCustomProfileAvatar,
  resolveProfileAvatarUrl,
} from "@/lib/profile-avatar";
import {
  trustedNameFromOAuthMetadata,
  combineName,
} from "@/lib/auth/trusted-name";
import type { Profile } from "@/lib/types/database";
import { PROFILE_SECTIONS, ITEM_TYPE_LABELS, type ProfileSection } from "@/lib/v2/profile-cells";
import type { BankItem, CvItemType } from "@/lib/v2/output-studio-bank";

// ── Icon map for section titles ───────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ElementType> = {
  experience:    Briefcase,
  education:     GraduationCap,
  publications:  BookOpen,
  presentations: Mic,
  teaching:      Users,
  research:      FlaskConical,
  service:       Heart,
  recognition:   Star,
};

function itemLabel(item: BankItem): string {
  const sd = item.structured_data as Record<string, unknown>;
  return (
    item.display_label ||
    String(sd.title ?? sd.name_or_title ?? sd.role_title ?? sd.committee_name ?? sd.project_title ?? sd.name ?? "")
  ) || item.item_type;
}

function itemSub(item: BankItem): string | null {
  const sd = item.structured_data as Record<string, unknown>;
  const org = String(sd.institution_or_org ?? sd.institution ?? sd.journal_or_book ?? sd.venue ?? sd.agency ?? "");
  const year = sd.year ? String(sd.year) : "";
  return [org, year].filter(Boolean).join(" · ") || null;
}

// ── Drop-zone state per section ───────────────────────────────────────────

type DropModal = {
  sectionId: string;
  activityId: string;
  rawText: string;
};

// ── Main component ────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [headline, setHeadline] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const [npiStatus, setNpiStatus] = useState<NpiRegistryStatus | null>(null);
  const [npiLoading, setNpiLoading] = useState(true);

  // Bank items keyed by section id
  const [bankBySec, setBankBySec] = useState<Record<string, BankItem[]>>({});
  const [bankLoading, setBankLoading] = useState(true);

  // Pending tray
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  // Modal state
  const [addModal, setAddModal] = useState<{ section: ProfileSection; initialType?: CvItemType } | null>(null);
  const [editModal, setEditModal] = useState<{ section: ProfileSection; item: BankItem } | null>(null);
  const [dropModal, setDropModal] = useState<DropModal | null>(null);

  // Drop target hover
  const [dragOverSec, setDragOverSec] = useState<string | null>(null);

  // ── Load header data ────────────────────────────────────────────────────

  useEffect(() => {
    setAvatarUrl(getProfileAvatarUrl());
    const onAvatarChange = (e: Event) => {
      const detail = (e as CustomEvent<string | null>).detail;
      setAvatarUrl(detail ?? getProfileAvatarUrl());
    };
    window.addEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
    return () => window.removeEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/v1/users/me");
        const me = (await meRes.json()) as Record<string, unknown>;
        const nameParts = typeof me.name === "string" ? me.name.trim() : "";
        if (nameParts) setDisplayName(nameParts);
        const specialty = String(me.base_specialty ?? me.specialty ?? "");
        const institution = String(me.institution ?? "");
        if (specialty || institution) setHeadline([specialty, institution].filter(Boolean).join(" · "));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const oauthName = trustedNameFromOAuthMetadata(user?.user_metadata as Record<string, unknown> | undefined);
          if (oauthName?.first && !nameParts) setDisplayName(combineName(oauthName.first, oauthName.last));
          if (user) {
            const { data } = await supabase
              .from("profiles")
              .select("first_name, last_name, institution_name, photo_url")
              .eq("id", user.id)
              .maybeSingle();
            if (data) {
              const p = data as Profile;
              if (p.first_name?.trim()) setDisplayName(combineName(p.first_name ?? "", p.last_name ?? ""));
              if (p.institution_name) setLocation(p.institution_name);
              if (p.photo_url && !hasCustomProfileAvatar()) setAvatarUrl(resolveProfileAvatarUrl(p.photo_url));
            }
          }
        }
      } catch { /* non-blocking */ }
      finally { setLoading(false); }
    }
    void load();
  }, []);

  useEffect(() => {
    fetch("/api/v1/npi")
      .then((r) => r.json())
      .then((d: NpiRegistryStatus) => setNpiStatus(d))
      .catch(() => setNpiStatus(null))
      .finally(() => setNpiLoading(false));
  }, []);

  // ── Load bank items ─────────────────────────────────────────────────────

  const loadBank = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/profile/items");
      if (!res.ok) return;
      const data = (await res.json()) as { items?: BankItem[] };
      const grouped: Record<string, BankItem[]> = {};
      for (const sec of PROFILE_SECTIONS) grouped[sec.id] = [];
      for (const item of data.items ?? []) {
        for (const sec of PROFILE_SECTIONS) {
          if ((sec.types as string[]).includes(item.item_type)) {
            grouped[sec.id]!.push(item);
            break;
          }
        }
      }
      setBankBySec(grouped);
    } finally {
      setBankLoading(false);
    }
  }, []);

  useEffect(() => { void loadBank(); }, [loadBank]);

  // ── Load pending items ─────────────────────────────────────────────────

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/profile/pending");
      if (!res.ok) return;
      const data = (await res.json()) as { pending?: PendingItem[]; migration_pending?: boolean };
      if (!data.migration_pending) setPendingItems(data.pending ?? []);
    } catch { /* non-blocking */ }
  }, []);

  useEffect(() => { void loadPending(); }, [loadPending]);

  // ── Delete handler ──────────────────────────────────────────────────────

  async function handleDelete(item: BankItem) {
    if (!confirm(`Delete "${itemLabel(item)}"? This also removes it from the lattice.`)) return;
    const res = await fetch(`/api/v1/profile/items/${item.id}`, { method: "DELETE" });
    if (res.ok) void loadBank();
  }

  // ── Drag-drop handlers for section cards ───────────────────────────────

  function handleDragOver(e: React.DragEvent, secId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSec(secId);
  }

  function handleDragLeave() { setDragOverSec(null); }

  function handleDrop(e: React.DragEvent, sec: ProfileSection) {
    e.preventDefault();
    setDragOverSec(null);
    const activityId = e.dataTransfer.getData("activity_id");
    const rawText = e.dataTransfer.getData("raw_text");
    if (!activityId) return;

    if (sec.types.length === 1) {
      // Auto-place with the only type
      void placeFromActivity(activityId, sec.types[0]!, rawText.slice(0, 120));
    } else {
      setDropModal({ sectionId: sec.id, activityId, rawText });
    }
  }

  async function placeFromActivity(activityId: string, itemType: CvItemType, displayLabel: string) {
    const res = await fetch("/api/v1/profile/items/from-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity_id: activityId, item_type: itemType, display_label: displayLabel }),
    });
    if (res.ok) {
      setPendingItems((prev) => prev.filter((p) => p.id !== activityId));
      void loadBank();
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">

      {/* Header card */}
      <div className="overflow-hidden rounded-2xl border border-cx-forest-dark/10 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-fis-gold/20 via-fis-gold/10 to-white" />
        <div className="px-6 pb-6">
          <div className="relative -mt-10 mb-4 flex items-end justify-between">
            <div className="rounded-full ring-4 ring-white">
              <UserAvatar src={avatarUrl} name={displayName} size="lg" />
            </div>
            {npiStatus?.npi_verified && (
              <div className="flex items-center gap-1.5 rounded-full bg-fis-gold/10 px-3 py-1.5 text-xs font-medium text-fis-gold">
                <BadgeCheck size={13} />
                NPI verified
              </div>
            )}
          </div>
          {loading ? (
            <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-100" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-cx-forest-dark">{displayName ?? "Your name"}</h1>
                {npiStatus?.npi_verified && <Shield size={14} className="shrink-0 text-fis-gold" />}
              </div>
              {headline && <p className="mt-0.5 text-sm text-cx-forest-dark/70">{headline}</p>}
              {location && (
                <div className="mt-1 flex items-center gap-1 text-xs text-cx-forest-dark/50">
                  <MapPin size={11} /> {location}
                </div>
              )}
            </>
          )}
          <div className="mt-4">
            <span className="rounded-full border border-fis-gold/40 px-3 py-1 text-xs text-fis-gold/80">
              Open to opportunities
            </span>
          </div>
        </div>
      </div>

      {/* CV upload */}
      <CvUploadPanel onComplete={loadPending} />

      {/* Pending tray (shown when items exist) */}
      <PendingTray
        items={pendingItems}
        onItemPlaced={(id) => {
          setPendingItems((prev) => prev.filter((p) => p.id !== id));
          void loadBank();
        }}
      />

      {/* Section cards */}
      {PROFILE_SECTIONS.map((sec) => {
        const Icon = SECTION_ICONS[sec.id] ?? Star;
        const items = bankBySec[sec.id] ?? [];
        const isDragTarget = dragOverSec === sec.id;

        return (
          <div
            key={sec.id}
            onDragOver={(e) => handleDragOver(e, sec.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, sec)}
            className={`rounded-2xl border bg-white p-6 shadow-sm transition-colors ${
              isDragTarget
                ? "border-fis-gold bg-fis-gold/5"
                : "border-cx-forest-dark/10"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={16} className="shrink-0 text-fis-gold" />
                <h2 className="text-sm font-semibold text-cx-forest-dark">{sec.title}</h2>
                {items.length > 0 && (
                  <span className="rounded-full bg-fis-gold/10 px-2 py-0.5 text-[10px] font-medium text-fis-gold">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAddModal({ section: sec })}
                className="flex items-center gap-1.5 rounded-lg border border-fis-gold/30 px-3 py-1.5 text-xs font-medium text-fis-gold transition-colors hover:bg-fis-gold/10"
              >
                <Plus size={13} />
                Add
              </button>
            </div>

            {bankLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-neutral-100" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div
                className={`flex flex-col items-start gap-2 rounded-xl border border-dashed px-4 py-4 transition-colors ${
                  isDragTarget
                    ? "border-fis-gold bg-fis-gold/5"
                    : "border-cx-forest-dark/15"
                }`}
              >
                {isDragTarget ? (
                  <p className="text-xs font-medium text-fis-gold">Drop here to place</p>
                ) : (
                  <p className="text-xs text-cx-forest-dark/50">{sec.emptyLabel}</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-cx-forest-dark/6">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cx-forest-dark truncate">{itemLabel(item)}</p>
                      {itemSub(item) && (
                        <p className="mt-0.5 text-xs text-cx-forest-dark/55">{itemSub(item)}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditModal({ section: sec, item })}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-cx-forest-dark"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-[#C28D6C]/10 hover:text-[#C28D6C]"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                  </li>
                ))}

                {/* Drag-over zone at bottom of non-empty card */}
                {isDragTarget && (
                  <li className="py-2 text-center text-xs font-medium text-fis-gold">
                    Drop to add here
                  </li>
                )}
              </ul>
            )}
          </div>
        );
      })}

      {/* NPI verification */}
      <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Medal size={16} className="shrink-0 text-fis-gold" />
          <h2 className="text-sm font-semibold text-cx-forest-dark">NPI Verification</h2>
        </div>
        {npiLoading ? (
          <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-100" />
        ) : (
          <NpiRegistryPanel
            status={npiStatus}
            initialNpi={npiStatus?.npi ?? ""}
            reloadAfterAction
            onVerified={(next) => setNpiStatus(next)}
          />
        )}
      </div>

      {/* Add modal */}
      {addModal && (
        <ItemFormModal
          section={addModal.section}
          initialType={addModal.initialType}
          onSave={(item) => {
            setBankBySec((prev) => {
              const sec = addModal.section;
              return { ...prev, [sec.id]: [item, ...(prev[sec.id] ?? [])] };
            });
            setAddModal(null);
          }}
          onClose={() => setAddModal(null)}
        />
      )}

      {/* Edit modal */}
      {editModal && (
        <ItemFormModal
          section={editModal.section}
          item={editModal.item}
          onSave={(updated) => {
            setBankBySec((prev) => {
              const secId = editModal.section.id;
              return {
                ...prev,
                [secId]: (prev[secId] ?? []).map((i) => (i.id === updated.id ? updated : i)),
              };
            });
            setEditModal(null);
          }}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Drop type picker for multi-type sections */}
      {dropModal && (() => {
        const sec = PROFILE_SECTIONS.find((s) => s.id === dropModal.sectionId)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="mb-3 text-sm font-semibold text-cx-forest-dark">
                Select type for {sec.title}
              </h3>
              <p className="mb-4 text-xs text-cx-forest-dark/60 line-clamp-2">
                &ldquo;{dropModal.rawText.slice(0, 100)}&rdquo;
              </p>
              <div className="space-y-2">
                {sec.types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      void placeFromActivity(dropModal.activityId, t, dropModal.rawText.slice(0, 120));
                      setDropModal(null);
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-left text-sm text-cx-forest-dark transition-colors hover:border-fis-gold hover:bg-fis-gold/5"
                  >
                    {ITEM_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDropModal(null)}
                className="mt-3 w-full text-xs text-cx-forest-dark/50 hover:text-cx-forest-dark"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
