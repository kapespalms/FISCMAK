"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CAREER_PHASES } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    specialty: "",
    career_phase: CAREER_PHASES[2],
    institution_name: "",
    department_name: "",
    goals: "",
  });

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
      }
      setLoading(false);
    }

    load();
  }, []);

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-fiscmak-muted">Onboarding & career context</p>
      </div>

      {error && (
        <p className="text-sm text-fiscmak-red">{error}</p>
      )}

      <Card>
        {loading ? (
          <p className="text-fiscmak-muted">Loading profile…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="phase" className="text-sm font-semibold">
                Career phase
              </label>
              <select
                id="phase"
                value={form.career_phase}
                onChange={(e) =>
                  setForm((f) => ({ ...f, career_phase: e.target.value }))
                }
                className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4"
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
              <label htmlFor="goals" className="text-sm font-semibold">
                Career goals
              </label>
              <textarea
                id="goals"
                value={form.goals}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goals: e.target.value }))
                }
                rows={4}
                className="mt-2 w-full rounded-md border border-fiscmak-border p-4"
                placeholder="What are you working toward?"
              />
            </div>
            <Button type="submit">{saved ? "Saved ✓" : "Save profile"}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
