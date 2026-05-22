"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MOOD_TRIGGERS,
  burnoutAlertLevel,
  computeBurnoutSignals,
  loadEnergyHistory,
  loadSubjectiveCheckIn,
  saveSubjectiveCheckIn,
} from "@/lib/subjective-storage";

export function SubjectiveWorkspace() {
  const [energyLevel, setEnergyLevel] = useState(6);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [history, setHistory] = useState<{ date: string; level: number }[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    const checkIn = loadSubjectiveCheckIn();
    setEnergyLevel(checkIn.energyLevel);
    setTriggers(checkIn.triggers);
    setUpdatedAt(checkIn.updatedAt);
    setHistory(loadEnergyHistory());
  }, []);

  const persist = useCallback(
    (level: number, nextTriggers: string[]) => {
      const now = new Date().toISOString();
      saveSubjectiveCheckIn({
        energyLevel: level,
        triggers: nextTriggers,
        updatedAt: now,
      });
      setUpdatedAt(now);
      setHistory(loadEnergyHistory());
    },
    [],
  );

  function toggleTrigger(trigger: string) {
    const next = triggers.includes(trigger)
      ? triggers.filter((t) => t !== trigger)
      : [...triggers, trigger];
    setTriggers(next);
    persist(energyLevel, next);
  }

  function handleEnergyChange(level: number) {
    setEnergyLevel(level);
    persist(level, triggers);
  }

  const burnout = computeBurnoutSignals(energyLevel, triggers);
  const alert = burnoutAlertLevel(burnout);

  const valueAlignment = [
    { label: "Teaching students", actual: 35, desired: 50 },
    { label: "Direct patient care", actual: 40, desired: 35 },
    { label: "Research innovation", actual: 15, desired: 25 },
    { label: "Leadership", actual: 10, desired: 15 },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subjective: How you&apos;re feeling</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">
          {updatedAt
            ? `Updated ${new Date(updatedAt).toLocaleString()}`
            : "Energy, mood, and alignment signals"}
        </p>
      </div>

      <Card>
        <h2 className="font-semibold">Today&apos;s energy level</h2>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Drag or tap — Coach Mak uses this to guide the conversation
        </p>
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-xs text-fiscmak-muted">
            <span>😴 Drained</span>
            <span className="text-lg font-bold text-fiscmak-green">
              {energyLevel}/10
            </span>
            <span>😊 Energized</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={energyLevel}
            onChange={(e) => handleEnergyChange(Number(e.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-fiscmak-red via-fiscmak-amber to-fiscmak-green accent-fiscmak-green"
            aria-label="Energy level"
          />
        </div>
        <div className="mt-6">
          <p className="text-sm font-semibold">Today I felt:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOOD_TRIGGERS.map((trigger) => {
              const checked = triggers.includes(trigger);
              return (
                <button
                  key={trigger}
                  type="button"
                  onClick={() => toggleTrigger(trigger)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    checked
                      ? "border-fiscmak-green bg-fiscmak-green-light text-fiscmak-green-dark"
                      : "border-fiscmak-border bg-white text-fiscmak-muted hover:border-fiscmak-green"
                  }`}
                >
                  {checked ? "☑ " : "☐ "}
                  {trigger}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card accent={alert === "red" ? "red" : alert === "amber" ? "amber" : "green"}>
        <h2 className="font-semibold">Burnout signal tracking</h2>
        <div className="mt-4 space-y-3">
          {(
            [
              ["Emotional exhaustion", burnout.emotionalExhaustion],
              ["Depersonalization", burnout.depersonalization],
              ["Reduced efficacy", burnout.reducedEfficacy],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-fiscmak-subtle">
                <div
                  className={`h-full rounded-full ${
                    value > 50
                      ? "bg-fiscmak-red"
                      : value > 25
                        ? "bg-fiscmak-amber"
                        : "bg-fiscmak-green"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {alert === "red" && (
          <p className="mt-4 text-sm font-medium text-fiscmak-red">
            Alert: Burnout signals rising — consider a deep work block or
            reflection with Mak.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold">Value alignment</h2>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Goals vs. where your time actually goes
        </p>
        <div className="mt-4 space-y-4">
          {valueAlignment.map(({ label, actual, desired }) => {
            const gap = actual - desired;
            return (
              <div key={label}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-fiscmak-muted">
                    {actual}% actual · {desired}% desired ·{" "}
                    <span
                      className={
                        gap < 0 ? "text-fiscmak-red" : gap > 0 ? "text-fiscmak-green" : ""
                      }
                    >
                      {gap > 0 ? "+" : ""}
                      {gap}%
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-fiscmak-subtle">
                  <div
                    className="h-full rounded-full bg-fiscmak-green"
                    style={{ width: `${actual}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {history.length > 0 && (
        <Card>
          <h2 className="font-semibold">Energy trend (last 7 days)</h2>
          <div className="mt-4 flex h-32 items-end gap-2">
            {history.map(({ date, level }) => (
              <div key={date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-fiscmak-green"
                  style={{ height: `${level * 10}%`, minHeight: 4 }}
                  title={`${level}/10`}
                />
                <span className="text-[10px] text-fiscmak-muted">
                  {date.slice(5)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge energy="draining">Low days tracked</Badge>
            <Badge energy="energizing">High days tracked</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
