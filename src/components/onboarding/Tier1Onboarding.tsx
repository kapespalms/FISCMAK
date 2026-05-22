"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const SPECIALTIES = [
  "Cardiology",
  "Internal Medicine",
  "Emergency Medicine",
  "Pediatrics",
  "Surgery",
  "Other",
];

const STAGES = ["Student", "Fellow", "Attending", "Other"] as const;

export function Tier1Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<"specialty" | "stage">("specialty");
  const [specialty, setSpecialty] = useState("");
  const [careerStage, setCareerStage] = useState<(typeof STAGES)[number]>("Fellow");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((u) => {
        if (u.tier1_complete) router.replace("/app/dashboard");
        if (u.specialty) setSpecialty(u.specialty);
      })
      .catch(() => {});
  }, [router]);

  async function saveSpecialty() {
    if (!specialty) return;
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
    router.replace("/app/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card>
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">Tier 1 onboarding</p>
        <h1 className="mt-1 text-2xl font-bold">
          {step === "specialty" ? "What's your specialty?" : "Where are you in your career?"}
        </h1>
        <p className="mt-2 text-sm text-fiscmak-muted">Less than 2 minutes — then Coach Mak opens your dashboard.</p>

        {step === "specialty" ? (
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecialty(s)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    specialty === s
                      ? "border-fiscmak-green bg-fiscmak-green-light font-semibold"
                      : "border-fiscmak-border hover:bg-fiscmak-subtle"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Input
              label="Or type your specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
            <Button className="w-full" onClick={saveSpecialty} disabled={loading || !specialty}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {STAGES.map((s) => (
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
              Finish & open dashboard
            </Button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-fiscmak-red">{error}</p>}
      </Card>
    </div>
  );
}
