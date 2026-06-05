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
  variant?: "default" | "luxury";
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
  variant = "default",
}: TagTypeaheadInputProps) {
  const luxury = variant === "luxury";
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
      {luxury ? (
        <h3 className="font-futura-bold text-xs uppercase tracking-[0.15em] text-[#D4AF37]">{label}</h3>
      ) : (
        <OnboardingFieldLabel htmlFor={inputId}>{label}</OnboardingFieldLabel>
      )}

      <div
        className={cn(
          "mt-2 flex min-h-[3.5rem] flex-wrap items-center gap-2 px-3 py-2",
          luxury
            ? "rounded-xl border border-cx-forest-dark/20 bg-white"
            : "min-h-[2.75rem] rounded-lg border border-cx-forest-dark/20 bg-white",
          disabled && "opacity-60",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-futura-medium tracking-wide",
              luxury
                ? "rounded-lg border border-fis-gold/30 bg-fis-gold/8 text-fis-gold"
                : "rounded-full border border-cx-forest-dark bg-cx-forest-dark/10 text-sm text-black",
            )}
          >
            {formatSuggestion(tag)}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className={cn(
                  "rounded-full p-0.5 transition-colors",
                  luxury
                    ? "text-fis-gold hover:text-cx-text"
                    : "text-cx-text/70 hover:bg-cx-forest-dark/10 hover:text-cx-text",
                )}
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
            className={cn(
              "min-w-[8rem] flex-1 border-0 bg-transparent p-1 py-1 outline-none focus:ring-0",
              luxury
                ? "text-sm text-cx-text placeholder:text-cx-text/40"
                : "text-base text-black placeholder:text-cx-text/45",
            )}
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
          className={cn(
            "absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md",
            luxury
              ? "border-cx-forest-dark/15 bg-white"
              : "border-cx-forest-dark/15 bg-white",
          )}
        >
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion} role="option">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(suggestion)}
                className={cn(
                  "font-futura-book w-full px-4 py-2.5 text-left text-base hover:bg-white/5",
                  luxury ? "text-gray-200" : "text-black hover:bg-cx-forest-dark/5",
                )}
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
                className={cn(
                  "font-futura-book w-full px-4 py-2.5 text-left text-base hover:bg-white/5",
                  luxury ? "text-gray-200" : "text-black hover:bg-cx-forest-dark/5",
                )}
              >
                Add &ldquo;{formatTag(trimmedQuery)}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}

      {maxTags > 1 && (
        <p className={cn("mt-1.5 text-sm", luxury ? "text-gray-500" : "text-black")}>
          {value.length} of {maxTags} selected
        </p>
      )}
    </div>
  );
}
