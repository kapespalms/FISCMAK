"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type {
  GoalHorizon,
  GoalFramework,
  GoalRecord,
} from "@/lib/v2/goal-records";
import { HORIZON_FRAMEWORK, HORIZON_LABELS } from "@/lib/v2/goal-records";

// ── Field definitions per framework ────────────────────────────────────────

type FieldDef = { key: string; label: string; hint?: string; multiline?: boolean; required?: boolean };

const SMART_FIELDS: FieldDef[] = [
  { key: "specific",    label: "Specific",    hint: "What exactly will you do?", required: true },
  { key: "measurable",  label: "Measurable",  hint: "How will you know you've achieved it?" },
  { key: "achievable",  label: "Achievable",  hint: "Is this realistic given your current resources?" },
  { key: "relevant",    label: "Relevant",    hint: "Why does this matter to you right now?" },
  { key: "time_bound",  label: "Time-bound",  hint: "By when?" },
];

const SMART_II_FIELDS: FieldDef[] = [
  ...SMART_FIELDS,
  {
    key: "implementation_intention",
    label: "Implementation intention",
    hint: "When [situation], I will [action]. Makes follow-through concrete.",
    multiline: true,
  },
];

const WOOP_FIELDS: FieldDef[] = [
  { key: "wish",     label: "Wish",     hint: "What do you most wish for?", required: true, multiline: true },
  { key: "outcome",  label: "Outcome",  hint: "Best outcome if your wish came true?", multiline: true },
  { key: "obstacle", label: "Obstacle", hint: "What inner obstacle stands in the way?", multiline: true },
  { key: "plan",     label: "Plan",     hint: "When [obstacle], I will [action].", multiline: true },
];

const LEGACY_FIELDS: FieldDef[] = [
  { key: "description", label: "Legacy statement", hint: "What do you want your career to mean in the end?", required: true, multiline: true },
];

function fieldsForFramework(fw: GoalFramework): FieldDef[] {
  if (fw === "SMART_II") return SMART_II_FIELDS;
  if (fw === "WOOP")     return WOOP_FIELDS;
  if (fw === "legacy")   return LEGACY_FIELDS;
  return SMART_FIELDS;
}

const FRAMEWORK_BADGE: Record<GoalFramework, string> = {
  SMART:    "SMART",
  SMART_II: "SMART + II",
  WOOP:     "WOOP",
  legacy:   "Legacy",
};

// ── Component ───────────────────────────────────────────────────────────────

export type GoalFormModalProps = {
  horizon:  GoalHorizon;
  existing?: GoalRecord;
  onSave:   (goal: GoalRecord) => void;
  onClose:  () => void;
};

export function GoalFormModal({ horizon, existing, onSave, onClose }: GoalFormModalProps) {
  const framework = HORIZON_FRAMEWORK[horizon];
  const fields    = fieldsForFramework(framework);
  const isEdit    = Boolean(existing);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) {
      init[f.key] = (existing?.[f.key as keyof GoalRecord] as string | null) ?? "";
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const requiredField = fields.find((f) => f.required);
  const isValid = requiredField ? Boolean(values[requiredField.key]?.trim()) : true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) { setError(`${requiredField!.label} is required.`); return; }
    setSaving(true);
    setError(null);

    const body: Record<string, unknown> = { horizon };
    for (const f of fields) body[f.key] = values[f.key]?.trim() || null;

    try {
      const url    = isEdit ? `/api/v1/goals/horizons/${existing!.id}` : "/api/v1/goals/horizons";
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { goal?: GoalRecord; message?: string };
      if (!res.ok) { setError(data.message ?? "Could not save goal."); return; }
      if (data.goal) onSave(data.goal);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-cx-text">
                {isEdit ? "Edit" : "Add"} {HORIZON_LABELS[horizon]} goal
              </h2>
              <span className="rounded-full bg-fis-gold/10 px-2 py-0.5 text-[10px] font-medium text-fis-gold">
                {FRAMEWORK_BADGE[framework]}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-cx-text/50">
              {horizon === "3mo" && "Short-term, concrete, outcome-focused."}
              {horizon === "1yr" && "Mid-term with a concrete when/then plan."}
              {horizon === "5yr" && "Obstacle-aware long-range aspiration."}
              {horizon === "10yr" && "Your professional legacy — big-picture identity."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-cx-text"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
          {fields.map((f, i) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium text-cx-text/70">
                {f.label}
                {f.required && <span className="ml-0.5 text-[#C28D6C]">*</span>}
              </label>
              {f.hint && (
                <p className="mb-1.5 text-[10px] text-cx-text/45">{f.hint}</p>
              )}
              {f.multiline ? (
                <textarea
                  ref={i === 0 ? (el) => { firstRef.current = el; } : undefined}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  rows={3}
                  required={f.required}
                  className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm text-cx-text placeholder:text-neutral-400 focus:border-fis-gold focus:outline-none focus:ring-1 focus:ring-fis-gold"
                />
              ) : (
                <input
                  ref={i === 0 ? (el) => { firstRef.current = el; } : undefined}
                  type="text"
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  required={f.required}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-cx-text placeholder:text-neutral-400 focus:border-fis-gold focus:outline-none focus:ring-1 focus:ring-fis-gold"
                />
              )}
            </div>
          ))}

          {error && <p className="text-xs text-[#C28D6C]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-cx-text transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isValid}
              className="rounded-xl bg-fis-gold px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
