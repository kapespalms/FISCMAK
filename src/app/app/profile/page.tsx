"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Camera,
  FlaskConical,
  GraduationCap,
  Heart,
  MapPin,
  Medal,
  MessageCircle,
  Mic,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { NpiRegistryPanel, type NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useAppShell } from "@/components/layout/AppShell";
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
import type { CvItemType, BankItem } from "@/lib/v2/output-studio-bank";

/** Groups of CV item types shown as section cards */
const PROFILE_SECTIONS: {
  title: string;
  icon: React.ElementType;
  types: CvItemType[];
  emptyLabel: string;
}[] = [
  {
    title: "Experience",
    icon: Briefcase,
    types: ["CV-LEAD", "CV-COMM-INST", "CV-COMM-NATL"],
    emptyLabel: "Capture a clinical or leadership role",
  },
  {
    title: "Education & Credentials",
    icon: GraduationCap,
    types: ["CV-DEG", "CV-LIC", "CV-CERT", "CV-SKILL"],
    emptyLabel: "Add a degree, license, or certification",
  },
  {
    title: "Publications",
    icon: BookOpen,
    types: ["CV-PUB-ORIG", "CV-PUB-REV", "CV-PUB-CASE", "CV-PUB-CHAP", "CV-PUB-EDIT", "CV-PUB-ABS"],
    emptyLabel: "Add a publication or abstract",
  },
  {
    title: "Presentations",
    icon: Mic,
    types: ["CV-PRES-NATL", "CV-PRES-REG", "CV-PRES-INST", "CV-PRES-POST", "CV-PRES-INV"],
    emptyLabel: "Add a presentation or poster",
  },
  {
    title: "Teaching",
    icon: Users,
    types: ["CV-TEACH-UME", "CV-TEACH-GME", "CV-TEACH-CME", "CV-CURR", "CV-CURR-MAT", "CV-MENTOR"],
    emptyLabel: "Capture a teaching activity",
  },
  {
    title: "Research & QI",
    icon: FlaskConical,
    types: ["CV-RES-PROJ", "CV-GRANT", "CV-QI"],
    emptyLabel: "Add a research project, grant, or QI initiative",
  },
  {
    title: "Service & Leadership",
    icon: Heart,
    types: ["CV-PEER", "CV-ADVOCACY"],
    emptyLabel: "Capture a committee, peer review, or advocacy role",
  },
  {
    title: "Recognition",
    icon: Star,
    types: ["CV-AWARD", "CV-MEDIA", "CV-MEM"],
    emptyLabel: "Add an award, media mention, or membership",
  },
];

function itemLabel(item: BankItem): string {
  const sd = item.structured_data as Record<string, unknown> | null;
  if (typeof sd?.title === "string" && sd.title) return sd.title;
  if (item.display_label) return item.display_label;
  return item.item_type;
}

function itemSub(item: BankItem): string | null {
  const sd = item.structured_data as Record<string, unknown> | null;
  if (typeof sd?.organization === "string" && sd.organization) return sd.organization;
  if (typeof sd?.journal === "string" && sd.journal) return sd.journal;
  if (typeof sd?.venue === "string" && sd.venue) return sd.venue;
  return null;
}

export default function ProfilePage() {
  const { openMak } = useAppShell();

  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [headline, setHeadline] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const [npiStatus, setNpiStatus] = useState<NpiRegistryStatus | null>(null);
  const [npiLoading, setNpiLoading] = useState(true);

  const [bankItems, setBankItems] = useState<BankItem[]>([]);
  const [bankLoading, setBankLoading] = useState(true);

  // Avatar
  useEffect(() => {
    setAvatarUrl(getProfileAvatarUrl());
    function onAvatarChange(e: Event) {
      const detail = (e as CustomEvent<string | null>).detail;
      setAvatarUrl(detail ?? getProfileAvatarUrl());
    }
    window.addEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
    return () => window.removeEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
  }, []);

  // Profile header data
  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/v1/users/me");
        const me = await meRes.json() as Record<string, unknown>;
        const nameParts = typeof me.name === "string" ? me.name.trim() : "";
        if (nameParts) setDisplayName(nameParts);

        const specialty = (me.base_specialty ?? me.specialty ?? "") as string;
        const institution = (me.institution ?? "") as string;
        if (specialty || institution) {
          setHeadline([specialty, institution].filter(Boolean).join(" · "));
        }

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const oauthName = trustedNameFromOAuthMetadata(
            user?.user_metadata as Record<string, unknown> | undefined,
          );
          if (oauthName?.first && !nameParts) {
            setDisplayName(combineName(oauthName.first, oauthName.last));
          }
          if (user) {
            const { data } = await supabase
              .from("profiles")
              .select("first_name, last_name, institution_name, department_name, photo_url")
              .eq("id", user.id)
              .maybeSingle();
            if (data) {
              const p = data as Profile;
              if (p.first_name?.trim()) {
                setDisplayName(combineName(p.first_name ?? "", p.last_name ?? ""));
              }
              if (p.institution_name) {
                setLocation(p.institution_name);
              }
              if (p.photo_url && !hasCustomProfileAvatar()) {
                setAvatarUrl(resolveProfileAvatarUrl(p.photo_url));
              }
            }
          }
        }
      } catch {
        // non-blocking
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // NPI
  useEffect(() => {
    fetch("/api/v1/npi")
      .then((r) => r.json())
      .then((d: NpiRegistryStatus) => setNpiStatus(d))
      .catch(() => setNpiStatus(null))
      .finally(() => setNpiLoading(false));
  }, []);

  // Bank items
  useEffect(() => {
    if (!isSupabaseConfigured()) { setBankLoading(false); return; }
    const supabase = createClient();
    void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: rows } = await supabase
          .from("cv_item_metadata")
          .select("id, evidence_unit_id, item_type, structured_data, display_label, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (rows) setBankItems(rows as BankItem[]);
      } catch {
        // non-blocking
      } finally {
        setBankLoading(false);
      }
    })();
  }, []);

  function itemsForTypes(types: CvItemType[]): BankItem[] {
    return bankItems.filter((item) => (types as string[]).includes(item.item_type));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">

      {/* Header card */}
      <div className="overflow-hidden rounded-2xl border border-cx-forest-dark/10 bg-white shadow-sm">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-fis-gold/20 via-fis-gold/10 to-white" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="relative -mt-12 mb-4 flex items-end justify-between">
            <div className="relative">
              <div className="rounded-full ring-4 ring-white">
                <UserAvatar src={avatarUrl} name={displayName} size="lg" />
              </div>
            </div>
            {npiStatus?.npi_verified && (
              <div className="flex items-center gap-1.5 rounded-full bg-fis-gold/10 px-3 py-1.5 text-xs font-medium text-fis-gold">
                <BadgeCheck size={13} />
                NPI verified
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-10 w-48 animate-pulse rounded-lg bg-neutral-100" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-cx-forest-dark">
                  {displayName ?? "Your name"}
                </h1>
                {npiStatus?.npi_verified && (
                  <Shield size={15} className="shrink-0 text-fis-gold" aria-label="NPI verified" />
                )}
              </div>
              {headline && (
                <p className="mt-1 text-sm text-cx-forest-dark/70">{headline}</p>
              )}
              {location && (
                <div className="mt-1 flex items-center gap-1 text-xs text-cx-forest-dark/50">
                  <MapPin size={12} />
                  {location}
                </div>
              )}
            </>
          )}

          {/* Open to — Phase 0 placeholder */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-fis-gold/40 px-3 py-1 text-xs text-fis-gold/80">
              Open to opportunities
            </span>
          </div>
        </div>
      </div>

      {/* Bank section cards */}
      {PROFILE_SECTIONS.map(({ title, icon: Icon, types, emptyLabel }) => {
        const items = itemsForTypes(types as CvItemType[]);
        return (
          <div
            key={title}
            className="rounded-2xl border border-cx-forest-dark/10 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={16} className="shrink-0 text-fis-gold" />
                <h2 className="text-sm font-semibold text-cx-forest-dark">{title}</h2>
                {items.length > 0 && (
                  <span className="rounded-full bg-fis-gold/10 px-2 py-0.5 text-[10px] font-medium text-fis-gold">
                    {items.length}
                  </span>
                )}
              </div>
              {/* Phase 1: Add button + drag-drop */}
            </div>

            {bankLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-neutral-100" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-cx-forest-dark/15 p-4">
                <p className="text-xs text-cx-forest-dark/50">{emptyLabel}</p>
                <button
                  type="button"
                  onClick={openMak}
                  className="flex items-center gap-1.5 text-xs font-medium text-fis-gold transition-opacity hover:opacity-80"
                >
                  <MessageCircle size={12} />
                  Capture with Mak
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-cx-forest-dark/6">
                {items.map((item) => (
                  <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium text-cx-forest-dark">{itemLabel(item)}</p>
                    {itemSub(item) && (
                      <p className="mt-0.5 text-xs text-cx-forest-dark/55">{itemSub(item)}</p>
                    )}
                  </li>
                ))}
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

    </div>
  );
}
