"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { ITEM_TYPE_LABELS, type ProfileSection } from "@/lib/v2/profile-cells";
import type { BankItem, CvItemType } from "@/lib/v2/output-studio-bank";

// ── Field groups by section ─────────────────────────────────────────────────

type FieldKey =
  | "title" | "journal" | "year" | "authors"
  | "venue" | "city"
  | "organization" | "role" | "start_date" | "end_date"
  | "notes";

type FieldDef = { key: FieldKey; label: string; required?: boolean; multiline?: boolean };

const PUBLICATION_TYPES: CvItemType[] = [
  "CV-PUB-ORIG", "CV-PUB-REV", "CV-PUB-CASE", "CV-PUB-CHAP", "CV-PUB-EDIT", "CV-PUB-ABS",
];

const PRESENTATION_TYPES: CvItemType[] = [
  "CV-PRES-NATL", "CV-PRES-REG", "CV-PRES-INST", "CV-PRES-POST", "CV-PRES-INV",
];

function fieldsForType(type: CvItemType): FieldDef[] {
  if ((PUBLICATION_TYPES as string[]).includes(type)) {
    return [
      { key: "title",    label: "Title",          required: true },
      { key: "journal",  label: "Journal / Book" },
      { key: "authors",  label: "Authors (comma-separated)" },
      { key: "year",     label: "Year" },
      { key: "notes",    label: "Notes", multiline: true },
    ];
  }
  if ((PRESENTATION_TYPES as string[]).includes(type)) {
    return [
      { key: "title",  label: "Presentation Title", required: true },
      { key: "venue",  label: "Conference / Venue" },
      { key: "city",   label: "City / Location" },
      { key: "year",   label: "Year" },
      { key: "notes",  label: "Notes", multiline: true },
    ];
  }
  // Universal fallback for all other types
  return [
    { key: "title",        label: "Title / Name",          required: true },
    { key: "organization", label: "Institution / Organization" },
    { key: "role",         label: "Your Role" },
    { key: "start_date",   label: "Start Date (YYYY)" },
    { key: "end_date",     label: "End Date (YYYY or Present)" },
    { key: "notes",        label: "Notes", multiline: true },
  ];
}

function sdToFields(sd: Record<string, unknown>, type: CvItemType): Record<FieldKey, string> {
  if ((PUBLICATION_TYPES as string[]).includes(type)) {
    const authors = Array.isArray(sd.authors) ? (sd.authors as string[]).join(", ") : (sd.authors as string ?? "");
    return {
      title:        String(sd.title ?? sd.name_or_title ?? ""),
      journal:      String(sd.journal_or_book ?? ""),
      year:         String(sd.year ?? ""),
      authors,
      venue: "", city: "", organization: "", role: "", start_date: "", end_date: "",
      notes:        String(sd.notes ?? ""),
    };
  }
  if ((PRESENTATION_TYPES as string[]).includes(type)) {
    return {
      title:   String(sd.title ?? ""),
      venue:   String(sd.venue ?? ""),
      city:    String(sd.city ?? ""),
      year:    String(sd.year ?? ""),
      journal: "", authors: "", organization: "", role: "", start_date: "", end_date: "",
      notes:   String(sd.notes ?? ""),
    };
  }
  return {
    title:        String(sd.title ?? sd.name_or_title ?? sd.role_title ?? sd.committee_name ?? sd.course_name ?? sd.project_title ?? sd.name ?? ""),
    organization: String(sd.institution_or_org ?? sd.institution ?? sd.organization ?? sd.agency ?? ""),
    role:         String(sd.role ?? sd.your_role ?? ""),
    start_date:   String(sd.start_date ?? sd.year_start ?? ""),
    end_date:     String(sd.end_date ?? sd.year_end ?? ""),
    notes:        String(sd.notes ?? ""),
    journal: "", authors: "", venue: "", city: "", year: String(sd.year ?? ""),
  };
}

function fieldsToSd(fields: Record<FieldKey, string>, type: CvItemType): Record<string, unknown> {
  if ((PUBLICATION_TYPES as string[]).includes(type)) {
    return {
      title:          fields.title,
      journal_or_book: fields.journal,
      year:           fields.year ? Number(fields.year) : undefined,
      authors:        fields.authors ? fields.authors.split(",").map((a) => a.trim()).filter(Boolean) : [],
      notes:          fields.notes || undefined,
    };
  }
  if ((PRESENTATION_TYPES as string[]).includes(type)) {
    return {
      title: fields.title,
      venue: fields.venue,
      city:  fields.city,
      year:  fields.year ? Number(fields.year) : undefined,
      notes: fields.notes || undefined,
    };
  }
  return {
    name_or_title:    fields.title,
    institution_or_org: fields.organization,
    role:             fields.role || undefined,
    start_date:       fields.start_date || undefined,
    end_date:         fields.end_date || undefined,
    year:             fields.year || undefined,
    notes:            fields.notes || undefined,
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export type ItemFormModalProps = {
  section: ProfileSection;
  /** If provided, the modal is in edit mode; otherwise add mode. */
  item?: BankItem;
  /** Initial item_type pre-selected (e.g. from drop target). */
  initialType?: CvItemType;
  onSave: (item: BankItem) => void;
  onClose: () => void;
};

const emptyFields: Record<FieldKey, string> = {
  title: "", journal: "", year: "", authors: "",
  venue: "", city: "", organization: "", role: "",
  start_date: "", end_date: "", notes: "",
};

export function ItemFormModal({ section, item, initialType, onSave, onClose }: ItemFormModalProps) {
  const isEdit = Boolean(item);
  const defaultType = item?.item_type ?? initialType ?? section.types[0]!;

  const [selectedType, setSelectedType] = useState<CvItemType>(defaultType);
  const [displayLabel, setDisplayLabel] = useState(item?.display_label ?? "");
  const [fields, setFields] = useState<Record<FieldKey, string>>(
    item ? sdToFields(item.structured_data, item.item_type) : emptyFields,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // When type changes in add mode, reset fields
  function handleTypeChange(t: CvItemType) {
    setSelectedType(t);
    if (!isEdit) setFields(emptyFields);
  }

  function fieldVal(key: FieldKey) {
    return fields[key] ?? "";
  }

  function setField(key: FieldKey, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  // Auto-generate display_label from title field if user hasn't typed one
  function handleTitleChange(value: string) {
    setField("title", value);
    if (!displayLabel || displayLabel === fields.title) {
      setDisplayLabel(value);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayLabel.trim()) {
      setError("Title / display label is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const structured_data = fieldsToSd(fields, selectedType);

    try {
      const url = isEdit ? `/api/v1/profile/items/${item!.id}` : "/api/v1/profile/items";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { display_label: displayLabel.trim(), structured_data }
        : { item_type: selectedType, display_label: displayLabel.trim(), structured_data };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { item?: BankItem; message?: string };

      if (!res.ok) {
        setError(data.message ?? "Could not save item.");
        return;
      }
      if (data.item) onSave(data.item);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  const currentFields = fieldsForType(selectedType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-base font-semibold text-cx-text">
            {isEdit ? "Edit item" : `Add to ${section.title}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-cx-text"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-6 py-5">
          {/* Type selector */}
          {!isEdit && section.types.length > 1 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-cx-text/70">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value as CvItemType)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-cx-text focus:border-fis-gold focus:outline-none focus:ring-1 focus:ring-fis-gold"
              >
                {section.types.map((t) => (
                  <option key={t} value={t}>
                    {ITEM_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display label */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-cx-text/70">
              Display label <span className="text-[#C28D6C]">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              placeholder="Short title shown on your profile"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-cx-text placeholder:text-neutral-400 focus:border-fis-gold focus:outline-none focus:ring-1 focus:ring-fis-gold"
              required
            />
          </div>

          {/* Type-specific fields */}
          {currentFields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium text-cx-text/70">
                {f.label} {f.required && <span className="text-[#C28D6C]">*</span>}
              </label>
              {f.multiline ? (
                <textarea
                  value={fieldVal(f.key)}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm text-cx-text placeholder:text-neutral-400 focus:border-fis-gold focus:outline-none focus:ring-1 focus:ring-fis-gold"
                />
              ) : (
                <input
                  type="text"
                  value={fieldVal(f.key)}
                  onChange={(e) => {
                    if (f.key === "title") handleTitleChange(e.target.value);
                    else setField(f.key, e.target.value);
                  }}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-cx-text placeholder:text-neutral-400 focus:border-fis-gold focus:outline-none focus:ring-1 focus:ring-fis-gold"
                  required={f.required}
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-xs text-[#C28D6C]">{error}</p>
          )}

          {/* Actions */}
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
              disabled={saving}
              className="rounded-xl bg-fis-gold px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
