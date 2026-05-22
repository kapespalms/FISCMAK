"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ENERGY_OPTIONS,
  DOMAINS,
  TRACKS,
} from "@/lib/constants";

type Activity = {
  id: string;
  text: string;
  energy: string;
  domain: string;
  track: string;
  date: string;
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      text: "Mentored resident through difficult family meeting prep",
      energy: "energizing",
      domain: DOMAINS[1],
      track: TRACKS[1],
      date: "2026-05-18",
    },
  ]);
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState("energizing");

  function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setActivities((a) => [
      {
        id: crypto.randomUUID(),
        text: text.trim(),
        energy,
        domain: DOMAINS[1],
        track: TRACKS[0],
        date: new Date().toISOString().slice(0, 10),
      },
      ...a,
    ]);
    setText("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Activities</h1>
        <p className="mt-1 text-fiscmak-muted">Capture career evidence</p>
      </div>

      <Card>
        <h2 className="font-semibold">Log activity</h2>
        <form onSubmit={addActivity} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="activity"
              className="text-sm font-semibold"
            >
              What did you do?
            </label>
            <textarea
              id="activity"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border border-fiscmak-border p-4 text-base focus:border-fiscmak-green"
              placeholder="Something meaningful that might not show up on a CV…"
            />
          </div>
          <div>
            <label htmlFor="energy" className="text-sm font-semibold">
              Energy
            </label>
            <select
              id="energy"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4"
            >
              {ENERGY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Save activity</Button>
          <p className="text-xs text-fiscmak-muted">
            OpenAI classification + Supabase sync coming when API keys are set.
          </p>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold">Recent</h2>
        {activities.map((a) => (
          <Card
            key={a.id}
            accent={
              a.energy.includes("drain")
                ? "red"
                : a.energy.includes("energiz")
                  ? "green"
                  : "amber"
            }
          >
            <p className="text-sm">{a.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                energy={
                  a.energy.includes("drain")
                    ? "draining"
                    : a.energy.includes("energiz")
                      ? "energizing"
                      : "neutral"
                }
              >
                {a.energy.replace("_", " ")}
              </Badge>
              <Badge>{a.domain}</Badge>
              <Badge>{a.track}</Badge>
              <span className="text-xs text-fiscmak-muted">{a.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
