"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardSection } from "@/components/ui/CardSection";
import { PageShell } from "@/components/layout/PageShell";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { CAREER_PHASES } from "@/lib/constants";
import { PROFILE_MAK } from "@/lib/card-mak-prompts";
import {
  AVATAR_CHANGED_EVENT,
  getProfileAvatarUrl,
  processAvatarFile,
} from "@/lib/profile-avatar";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    specialty: "",
    career_phase: CAREER_PHASES[2] as string,
    institution_name: "",
    department_name: "",
    goals: "",
  });

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
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) setError(fetchError.message);
      else if (data) {
        const p = data as Profile;
        setForm({
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          specialty: p.specialty ?? "",
          career_phase: p.career_phase ?? CAREER_PHASES[2],
          institution_name: p.institution_name ?? "",
          department_name: p.department_name ?? "",
          goals: p.goals ?? "",
        });
        if (p.photo_url && !getProfileAvatarUrl()) {
          setAvatarUrl(p.photo_url);
        }
      }
      setLoading(false);
    }

    load();
  }, []);

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
    if (!isSupabaseConfigured()) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      ...form,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageShell
      eyebrow="Account"
      title="Profile"
      subtitle="Onboarding and career context"
      maxWidth="md"
    >
      {error && (
        <p className="cx-alert-banner mb-6 px-4 py-3 text-sm">
          {error}
        </p>
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
        description="Specialty, institution, and stated goals feed Coach Mak and your Career Profile."
        icon={User}
        mak={PROFILE_MAK.context}
      >
        {loading ? (
          <p className="text-sm text-cx-forest-dark/70">Loading profile…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                id="first"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
              />
              <Input
                label="Last name"
                id="last"
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
              />
            </div>
            <Input
              label="Specialty"
              id="specialty"
              value={form.specialty}
              onChange={(e) =>
                setForm((f) => ({ ...f, specialty: e.target.value }))
              }
            />
            <div>
              <label htmlFor="phase" className="text-cx-label">
                Career phase
              </label>
              <select
                id="phase"
                value={form.career_phase}
                onChange={(e) =>
                  setForm((f) => ({ ...f, career_phase: e.target.value }))
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-cx-forest-dark/20 px-4 text-cx-forest-dark"
              >
                {CAREER_PHASES.map((p) => (
                  <option key={p} value={p}>
                    {p}
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
                Career goals
              </label>
              <textarea
                id="goals"
                value={form.goals}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goals: e.target.value }))
                }
                rows={4}
                className="mt-2 w-full rounded-xl border border-cx-forest-dark/20 p-4 text-cx-forest-dark"
                placeholder="What are you working toward?"
              />
            </div>
            <Button type="submit">{saved ? "Saved" : "Save profile"}</Button>
          </form>
        )}
      </CardSection>
    </PageShell>
  );
}
