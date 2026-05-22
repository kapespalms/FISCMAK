"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CAREER_PHASES } from "@/lib/constants";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-fiscmak-muted">Onboarding & career context</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" id="first" name="first" />
            <Input label="Last name" id="last" name="last" />
          </div>
          <Input label="Specialty" id="specialty" name="specialty" />
          <div>
            <label htmlFor="phase" className="text-sm font-semibold">
              Career phase
            </label>
            <select
              id="phase"
              name="phase"
              className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4"
            >
              {CAREER_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <Input label="Institution" id="institution" name="institution" />
          <Input label="Department" id="department" name="department" />
          <div>
            <label htmlFor="goals" className="text-sm font-semibold">
              Career goals
            </label>
            <textarea
              id="goals"
              name="goals"
              rows={4}
              className="mt-2 w-full rounded-md border border-fiscmak-border p-4"
              placeholder="What are you working toward?"
            />
          </div>
          <Button type="submit">{saved ? "Saved ✓" : "Save profile"}</Button>
        </form>
      </Card>
    </div>
  );
}
