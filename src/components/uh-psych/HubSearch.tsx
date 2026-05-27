"use client";

type HubSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
};

export function HubSearch({
  value,
  onChange,
  placeholder = "Search…",
  id = "hub-search",
}: HubSearchProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-cx-forest-dark/15 bg-white px-4 py-2.5 text-sm text-cx-forest-dark placeholder:text-cx-forest-dark/40 focus:border-cx-forest-dark/30 focus:outline-none focus:ring-2 focus:ring-[#5FD65F]/30"
      />
    </div>
  );
}
