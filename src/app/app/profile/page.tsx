"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Search, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardSection } from "@/components/ui/CardSection";
import { PageShell } from "@/components/layout/PageShell";
import { NpiRegistryPanel, type NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { SpecialtyIntakeFields } from "@/components/onboarding/SpecialtyIntakeFields";
import { PROFILE_MAK } from "@/lib/card-mak-prompts";
import {
  AVATAR_CHANGED_EVENT,
  getProfileAvatarUrl,
  hasCustomProfileAvatar,
  processAvatarFile,
  resolveProfileAvatarUrl,
} from "@/lib/profile-avatar";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  combineName,
  splitTrustedName,
  trustedNameFromOAuthMetadata,
} from "@/lib/auth/trusted-name";
import type { Profile } from "@/lib/types/database";
import { CAREER_LEVELS, type CareerLevel } from "@/lib/v2/onboarding-options";
import {
  defaultTrainingComplete,
  migrateLegacySpecialty,
} from "@/lib/v2/specialty-hierarchy";
import { BoardOfDirectorsPanel } from "@/components/profile/BoardOfDirectorsPanel";
import { CareerPortfolioPanel } from "@/components/profile/CareerPortfolioPanel";
import { AcademicDossierPanel } from "@/components/profile/AcademicDossierPanel";
import type { BoardProfileView } from "@/lib/v2/career-board-models";
import type { AppUser } from "@/lib/v2/types";

function splitName(full: string | null | undefined): { first: string; last: string } {
  return splitTrustedName(full);
}

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [baseSpecialty, setBaseSpecialty] = useState("");
  const [baseQuery, setBaseQuery] = useState("");
  const [baseListOpen, setBaseListOpen] = useState(false);
  const [subspecialty, setSubspecialty] = useState("");
  const [subspecialtyQuery, setSubspecialtyQuery] = useState("");
  const [subspecialtyListOpen, setSubspecialtyListOpen] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);

  const [npiStatus, setNpiStatus] = useState<NpiRegistryStatus | null>(null);
  const [npiLoading, setNpiLoading] = useState(true);
  const [board, setBoard] = useState<BoardProfileView | null>(null);
  const [boardLoading, setBoardLoading] = useState(true);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    career_stage: CAREER_LEVELS[3] as CareerLevel,
    institution_name: "",
    department_name: "",
    goals: "",
  });
  const [namePrefilled, setNamePrefilled] = useState(false);

  function applySpecialtyFromUser(user: Pick<AppUser, "base_specialty" | "subspecialty" | "specialty" | "subspecialty_training_complete" | "career_stage">) {
    const normalized = user.base_specialty
      ? {
          base_specialty: user.base_specialty,
          subspecialty: user.subspecialty ?? null,
          subspecialty_training_complete: Boolean(user.subspecialty_training_complete),
        }
      : migrateLegacySpecialty(user.specialty ?? null);

    if (normalized.base_specialty) {
      setBaseSpecialty(normalized.base_specialty);
      setBaseQuery(normalized.base_specialty);
    }
    if (normalized.subspecialty) {
      setSubspecialty(normalized.subspecialty);
      setSubspecialtyQuery(normalized.subspecialty);
      setTrainingComplete(
        user.subspecialty_training_complete ??
          defaultTrainingComplete(user.career_stage, normalized.subspecialty),
      );
    }
  }

  useEffect(() => {
    setAvatarUrl(getProfileAvatarUrl());
    function onAvatarChange(e: Event) {
      const detail = (e as CustomEvent<string | null>).detail;
      setAvatarUrl(detail ?? getProfileAvatarUrl());
    }
    window.addEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
    return () => window.removeEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/v1/users/me");
        const me = (await meRes.json()) as AppUser & { institution?: string | null };

        setForm((f) => ({
          ...f,
          career_stage: (me.career_stage as CareerLevel) ?? f.career_stage,
          institution_name: me.institution ?? f.institution_name,
        }));
        applySpecialtyFromUser(me);

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const oauthName = trustedNameFromOAuthMetadata(
            user?.user_metadata as Record<string, unknown> | undefined,
          );
          if (oauthName?.first) {
            setForm((f) => ({
              ...f,
              first_name: oauthName.first,
              last_name: oauthName.last,
            }));
            setNamePrefilled(true);
          }
          if (user) {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();
            if (data) {
              const p = data as Profile;
              if (p.first_name?.trim()) {
                setForm((f) => ({
                  ...f,
                  first_name: p.first_name ?? f.first_name,
                  last_name: p.last_name ?? f.last_name,
                  institution_name: p.institution_name ?? f.institution_name,
                  department_name: p.department_name ?? "",
                  goals: p.goals ?? "",
                }));
                setNamePrefilled(true);
              } else {
                setForm((f) => ({
                  ...f,
                  institution_name: p.institution_name ?? f.institution_name,
                  department_name: p.department_name ?? "",
                  goals: p.goals ?? "",
                }));
              }
              if (p.photo_url && !hasCustomProfileAvatar()) {
                setAvatarUrl(resolveProfileAvatarUrl(p.photo_url));
              }
              if (!me.base_specialty && p.specialty) {
                applySpecialtyFromUser({ ...me, specialty: p.specialty });
              }
            }
          }
        } else if (me.name?.trim() && me.tier1_complete) {
          const { first, last } = splitName(me.name);
          if (first) {
            setForm((f) => ({ ...f, first_name: first, last_name: last }));
            setNamePrefilled(true);
          }
        }
      } catch {
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    fetch("/api/v1/career-board")
      .then((r) => r.json())
      .then((data: { board?: BoardProfileView | null }) => setBoard(data.board ?? null))
      .catch(() => setBoard(null))
      .finally(() => setBoardLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/v1/npi")
      .then((r) => r.json())
      .then((data: NpiRegistryStatus) => setNpiStatus(data))
      .catch(() => setNpiStatus(null))
      .finally(() => setNpiLoading(false));
  }, []);

  function pickBase(value: string) {
    setBaseSpecialty(value);
    setBaseQuery(value);
    setBaseListOpen(false);
    setSubspecialty("");
    setSubspecialtyQuery("");
    setTrainingComplete(false);
  }

  function pickSubspecialty(value: string) {
    setSubspecialty(value);
    setSubspecialtyQuery(value);
    setSubspecialtyListOpen(false);
    setTrainingComplete(defaultTrainingComplete(form.career_stage, value));
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError(null);
    try {
      await processAvatarFile(file);
      setAvatarUrl(getProfileAvatarUrl());
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Could not update photo.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!baseSpecialty) {
      setError("Select a base specialty from the list.");
      return;
    }

    const fullName = combineName(form.first_name, form.last_name);
    const meRes = await fetch("/api/v1/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName || undefined,
        base_specialty: baseSpecialty,
        subspecialty: subspecialty || null,
        subspecialty_training_complete: subspecialty ? trainingComplete : false,
        career_stage: form.career_stage,
        institution: form.institution_name || undefined,
      }),
    });
    const meData = await meRes.json();
    if (!meRes.ok) {
      setError(meData.message ?? "Could not save career profile.");
      return;
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: upsertError } = await supabase.from("profiles").upsert({
          id: user.id,
          first_name: form.first_name,
          last_name: form.last_name,
          specialty: meData.specialty ?? baseSpecialty,
          career_phase: form.career_stage,
          institution_name: form.institution_name,
          department_name: form.department_name,
          goals: form.goals,
          updated_at: new Date().toISOString(),
        });
        if (upsertError) {
          setError(upsertError.message);
          return;
        }
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageShell
      eyebrow="Account"
      title="Profile"
      maxWidth="md"
    >
      {error && (
        <p className="cx-alert-banner mb-6 px-4 py-3 text-sm">{error}</p>
      )}

      <CardSection
        eyebrow="Account"
        title="Profile photo"
        description="Shown in the top bar. JPG or PNG, under 2 MB."
        icon={Camera}
      >
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar
            src={avatarUrl}
            name={`${form.first_name} ${form.last_name}`.trim() || null}
            size="lg"
          />
          <div className="space-y-2">
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
              Change photo
            </Button>
            {avatarError && <p className="text-sm text-cx-attention">{avatarError}</p>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden
            onChange={(e) => void handleAvatarChange(e)}
          />
        </div>
      </CardSection>

      <CardSection
        eyebrow="Account"
        title="Career context"
        description="Specialty hierarchy matches onboarding — base residency program plus optional fellowship."
        icon={User}
        mak={PROFILE_MAK.context}
      >
        {loading ? (
          <p className="text-sm text-cx-forest-dark/70">Loading profile…</p>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                id="first"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                readOnly={namePrefilled}
              />
              <Input
                label="Last name"
                id="last"
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
                readOnly={namePrefilled}
              />
            </div>
            {namePrefilled && (
              <p className="text-xs text-cx-forest-dark/60">
                Pre-filled from your sign-in or program roster.
              </p>
            )}

            <SpecialtyIntakeFields
              baseSpecialty={baseSpecialty}
              baseQuery={baseQuery}
              onBaseQueryChange={setBaseQuery}
              onPickBase={pickBase}
              baseListOpen={baseListOpen}
              onBaseListOpenChange={setBaseListOpen}
              subspecialty={subspecialty}
              subspecialtyQuery={subspecialtyQuery}
              onSubspecialtyQueryChange={setSubspecialtyQuery}
              onPickSubspecialty={pickSubspecialty}
              subspecialtyListOpen={subspecialtyListOpen}
              onSubspecialtyListOpenChange={setSubspecialtyListOpen}
              trainingComplete={trainingComplete}
              onTrainingCompleteChange={setTrainingComplete}
              careerStage={form.career_stage}
            />

            <div>
              <label htmlFor="career-stage" className="text-cx-label">
                Career level
              </label>
              <select
                id="career-stage"
                value={form.career_stage}
                onChange={(e) => {
                  const career_stage = e.target.value as CareerLevel;
                  setForm((f) => ({ ...f, career_stage }));
                  if (subspecialty) {
                    setTrainingComplete(defaultTrainingComplete(career_stage, subspecialty));
                  }
                }}
                className="mt-2 min-h-11 w-full rounded-xl border border-cx-forest-dark/20 px-4 text-cx-forest-dark"
              >
                {CAREER_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Institution"
              id="institution"
              value={form.institution_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, institution_name: e.target.value }))
              }
            />
            <Input
              label="Department"
              id="department"
              value={form.department_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, department_name: e.target.value }))
              }
            />
            <div>
              <label htmlFor="goals" className="text-cx-label">
                Career goals (notes)
              </label>
              <textarea
                id="goals"
                value={form.goals}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goals: e.target.value }))
                }
                rows={4}
                className="mt-2 w-full rounded-xl border border-cx-forest-dark/20 p-4 text-cx-forest-dark"
                placeholder="Free-form notes — structured goals live on Strategy."
              />
            </div>
            <Button type="submit">{saved ? "Saved" : "Save profile"}</Button>
          </form>
        )}
      </CardSection>

      <BoardOfDirectorsPanel board={board} loading={boardLoading} />

      <CareerPortfolioPanel />

      <AcademicDossierPanel />

      <CardSection
        eyebrow="Verification"
        title="NPI registry lookup"
        description={
          npiStatus?.npi_verified
            ? "Your NPI is verified against the CMS NPPES registry."
            : "Add your NPI to verify your provider record against the CMS NPPES registry."
        }
        icon={Search}
      >
        {npiLoading ? (
          <p className="text-sm text-cx-forest-dark/70">Loading NPI status…</p>
        ) : (
          <NpiRegistryPanel
            status={npiStatus}
            initialNpi={npiStatus?.npi ?? ""}
            reloadAfterAction
            onVerified={(next) => setNpiStatus(next)}
          />
        )}
      </CardSection>
    </PageShell>
  );
}
