"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type OnboardingResumeBannerProps = {
  message: string;
  className?: string;
  storageKey?: string;
};

export function OnboardingResumeBanner({
  message,
  className,
  storageKey,
}: OnboardingResumeBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (!storageKey || typeof window === "undefined") return false;
    return sessionStorage.getItem(storageKey) === "1";
  });

  if (dismissed) return null;

  function dismiss() {
    if (storageKey && typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "1");
    }
    setDismissed(true);
  }

  return (
    <div
      role="status"
      className={cn(
        "mb-4 flex items-start justify-between gap-3 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.04] px-4 py-3 text-sm text-cx-text/90",
        className,
      )}
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-md p-1 text-cx-text/60 hover:bg-cx-forest-dark/10 hover:text-cx-text"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
