"use client";

import { useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeTagLabel, tagMatchesQuery } from "@/lib/v2/tag-typeahead";
import { OnboardingFieldLabel } from "@/components/onboarding/OnboardingProfileSection";

type TagTypeaheadInputProps = {
  id?: string;
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  maxTags?: number;
  formatTag?: (raw: string) => string;
  formatSuggestion?: (raw: string) => string;
  disabled?: boolean;
  className?: string;
};

export function TagTypeaheadInput({
  id: idProp,
  label,
  placeholder = "Type to search or add…",
  value,
  onChange,
  suggestions,
  maxTags = 3,
  formatTag = normalizeTagLabel,
  formatSuggestion = (raw) => raw,
  disabled = false,
  className,
}: TagTypeaheadInputProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const listId = `${inputId}-suggestions`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const atMax = value.length >= maxTags;

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions
      .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
      .filter((s) => tagMatchesQuery(s, q))
      .slice(0, 12);
  }, [query, suggestions, value]);

  const trimmedQuery = query.trim();
  const canAddCustom =
    trimmedQuery.length > 0 &&
    !atMax &&
    !value.some((v) => v.toLowerCase() === trimmedQuery.toLowerCase()) &&
    !suggestions.some((s) => s.toLowerCase() === trimmedQuery.toLowerCase());

  function addTag(raw: string) {
    const normalized = formatTag(raw);
    if (!normalized) return;
    if (value.some((v) => v.toLowerCase() === normalized.toLowerCase())) return;
    if (maxTags === 1) {
      onChange([normalized]);
    } else if (!atMax) {
      onChange([...value, normalized]);
    } else {
      return;
    }
    setQuery("");
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions[0]) {
        addTag(filteredSuggestions[0]!);
      } else if (canAddCustom) {
        addTag(trimmedQuery);
      }
    } else if (e.key === "Backspace" && !query && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative font-futura-book", className)}>
      <OnboardingFieldLabel htmlFor={inputId}>{label}</OnboardingFieldLabel>

      <div
        className={cn(
          "mt-2 flex min-h-[2.75rem] flex-wrap items-center gap-2 rounded-lg border border-cx-forest-dark/20 bg-white px-3 py-2",
          disabled && "opacity-60",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="font-futura-medium inline-flex items-center gap-1 rounded-full border border-cx-forest-dark bg-cx-forest-dark/10 px-2.5 py-1 text-sm text-black"
          >
            {formatSuggestion(tag)}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="rounded-full p-0.5 text-cx-forest-dark/70 hover:bg-cx-forest-dark/10 hover:text-cx-forest-dark"
                aria-label={`Remove ${tag}`}
              >
                <X size={14} aria-hidden />
              </button>
            )}
          </span>
        ))}
        {!atMax && (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[8rem] flex-1 border-0 bg-transparent py-1 text-base text-black outline-none placeholder:text-cx-forest-dark/45"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
          />
        )}
      </div>

      {open && !disabled && !atMax && (filteredSuggestions.length > 0 || canAddCustom) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-cx-forest-dark/15 bg-white shadow-md"
        >
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion} role="option">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(suggestion)}
                className="font-futura-book w-full px-4 py-2.5 text-left text-base text-black hover:bg-cx-forest-dark/5"
              >
                {formatSuggestion(suggestion)}
              </button>
            </li>
          ))}
          {canAddCustom && (
            <li role="option">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(trimmedQuery)}
                className="font-futura-book w-full px-4 py-2.5 text-left text-base text-black hover:bg-cx-forest-dark/5"
              >
                Add &ldquo;{formatTag(trimmedQuery)}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}

      {maxTags > 1 && (
        <p className="mt-1.5 text-sm text-black">
          {value.length} of {maxTags} selected
        </p>
      )}
    </div>
  );
}
