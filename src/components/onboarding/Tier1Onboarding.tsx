"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ACGME_SPECIALTIES,
  CAREER_STAGES,
  filterSpecialties,
  type CareerStage,
} from "@/lib/v2/onboarding-options";

export function Tier1Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [careerStage, setCareerStage] = useState<CareerStage>("Fellow");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listOpen, setListOpen] = useState(false);

  const filteredSpecialties = useMemo(
    () => filterSpecialties(specialtyQuery),
    [specialtyQuery],
  );

  useEffect(() => {
    fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((u) => {
        if (u.tier1_complete) {
          router.replace(u.tier3_complete ? "/app/dashboard" : "/app/dashboard?welcome=1");
          return;
        }
        if (u.name) setName(u.name);
        if (u.specialty) {
          setSpecialty(u.specialty);
          setSpecialtyQuery(u.specialty);
        }
        if (u.career_stage) setCareerStage(u.career_stage);
      })
      .catch(() => {});
  }, [router]);

  async function submitProfile() {
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!specialty || !ACGME_SPECIALTIES.includes(specialty as (typeof ACGME_SPECIALTIES)[number])) {
      setError("Select a specialty from the list.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        specialty,
        career_stage: careerStage,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save profile");
      setLoading(false);
      return;
    }
    router.replace(data.redirect ?? "/app/dashboard?welcome=1");
    router.refresh();
  }

  function pickSpecialty(value: string) {
    setSpecialty(value);
    setSpecialtyQuery(value);
    setListOpen(false);
    setError("");
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
          Welcome · About 2 minutes
        </p>
        <h1 className="mt-1 text-xl font-semibold text-cx-forest-dark">Let&apos;s get you set up</h1>
        <p className="mt-2 text-sm text-cx-forest-dark/80">
          Name, specialty, and role — then Coach Mak takes over. The rest of onboarding happens
          through conversation (about 10–15 minutes), not forms.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="onboarding-name" className="text-sm font-semibold text-cx-forest-dark">
              Your name
            </label>
            <input
              id="onboarding-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="cx-field mt-2 min-h-11 w-full"
              autoComplete="name"
            />
          </div>

          <div className="relative">
            <label htmlFor="specialty-search" className="text-sm font-semibold text-cx-forest-dark">
              Specialty
            </label>
            <input
              id="specialty-search"
              type="text"
              value={specialtyQuery}
              onChange={(e) => {
                setSpecialtyQuery(e.target.value);
                setSpecialty("");
                setListOpen(true);
              }}
              onFocus={() => setListOpen(true)}
              placeholder="Start typing, e.g. Cardiology…"
              className="cx-field mt-2 min-h-11 w-full"
              autoComplete="off"
            />
            {listOpen && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-cx-forest-dark/15 bg-white shadow-md">
                {filteredSpecialties.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-cx-forest-dark/60">No matches</li>
                ) : (
                  filteredSpecialties.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => pickSpecialty(s)}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cx-forest-dark/5 ${
                          specialty === s
                            ? "bg-cx-forest-dark/10 font-semibold text-cx-forest-dark"
                            : "text-cx-forest-dark/80"
                        }`}
                      >
                        {s}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-cx-forest-dark">Career stage / role</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {CAREER_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCareerStage(s)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm ${
                    careerStage === s
                      ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold text-cx-forest-dark"
                      : "border-cx-forest-dark/20 text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={submitProfile} disabled={loading}>
            {loading ? "Saving…" : "Meet Coach Mak"}
          </Button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}
