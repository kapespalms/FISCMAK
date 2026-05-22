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
  const [step, setStep] = useState<"specialty" | "stage">("specialty");
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
          router.replace(u.tier2_complete ? "/app/dashboard" : "/app/onboarding/tier2");
        }
        if (u.specialty) {
          setSpecialty(u.specialty);
          setSpecialtyQuery(u.specialty);
        }
      })
      .catch(() => {});
  }, [router]);

  async function saveSpecialty() {
    if (!specialty || !ACGME_SPECIALTIES.includes(specialty as (typeof ACGME_SPECIALTIES)[number])) {
      setError("Select a specialty from the list.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/tier1/specialty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specialty }),
    });
    if (!res.ok) {
      setError("Could not save specialty");
      setLoading(false);
      return;
    }
    setStep("stage");
    setLoading(false);
  }

  async function saveStage() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/tier1/career-stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ career_stage: careerStage }),
    });
    if (!res.ok) {
      setError("Could not save career stage");
      setLoading(false);
      return;
    }
    router.replace("/app/onboarding/tier2");
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
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">
          Quick setup · Step {step === "specialty" ? "1" : "2"} of 2
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          {step === "specialty" ? "What's your specialty?" : "Where are you in your career?"}
        </h1>
        <p className="mt-2 text-sm text-fiscmak-muted">
          Two questions — then straight to your dashboard. CV upload and goals are optional later.
        </p>

        {step === "specialty" ? (
          <div className="mt-6 space-y-3">
            <div className="relative">
              <label htmlFor="specialty-search" className="text-sm font-semibold">
                Search ACGME specialties
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
                placeholder="Start typing, e.g. Cardiology, Pediatrics…"
                className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4 text-base focus:border-fiscmak-green focus:outline-none"
                autoComplete="off"
              />
              {listOpen && (
                <ul
                  className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-fiscmak-border bg-white shadow-md"
                  role="listbox"
                >
                  {filteredSpecialties.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-fiscmak-muted">No matches</li>
                  ) : (
                    filteredSpecialties.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={specialty === s}
                          onClick={() => pickSpecialty(s)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-fiscmak-subtle ${
                            specialty === s ? "bg-fiscmak-green-light font-semibold" : ""
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
            {specialty && (
              <p className="text-sm text-fiscmak-green-dark">
                Selected: <span className="font-semibold">{specialty}</span>
              </p>
            )}
            <Button className="w-full" onClick={saveSpecialty} disabled={loading || !specialty}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {CAREER_STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setCareerStage(s)}
                className={`flex w-full rounded-lg border px-4 py-3 text-left ${
                  careerStage === s
                    ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                    : "border-fiscmak-border hover:bg-fiscmak-subtle"
                }`}
              >
                {s}
              </button>
            ))}
            <Button className="w-full" onClick={saveStage} disabled={loading}>
              Open dashboard
            </Button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-fiscmak-red">{error}</p>}
      </Card>
    </div>
  );
}
