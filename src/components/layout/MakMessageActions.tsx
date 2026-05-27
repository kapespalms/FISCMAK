"use client";

import { useState } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppSection } from "@/lib/mak-sections";

type MakMessageActionsProps = {
  content: string;
  section: AppSection;
};

export function MakMessageActions({ content, section }: MakMessageActionsProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitFeedback(rating: "up" | "down") {
    if (submitting || feedback) return;
    setSubmitting(true);
    setFeedback(rating);
    try {
      await fetch("/api/v1/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content, section }),
      });
    } catch {
      setFeedback(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex items-center gap-1 pl-1">
      <button
        type="button"
        onClick={() => void copyMessage()}
        className="cx-mak-panel-icon-btn flex h-7 w-7 items-center justify-center rounded-md text-cx-forest-dark/45 transition-colors hover:text-cx-forest-dark/70"
        aria-label="Copy message"
        title="Copy"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <button
        type="button"
        disabled={submitting || feedback != null}
        onClick={() => void submitFeedback("up")}
        className={cn(
          "cx-mak-panel-icon-btn flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          feedback === "up"
            ? "text-cx-forest-dark"
            : "text-cx-forest-dark/45 hover:text-cx-forest-dark/70",
        )}
        aria-label="Helpful"
        title="Helpful"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        type="button"
        disabled={submitting || feedback != null}
        onClick={() => void submitFeedback("down")}
        className={cn(
          "cx-mak-panel-icon-btn flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          feedback === "down"
            ? "text-cx-forest-dark"
            : "text-cx-forest-dark/45 hover:text-cx-forest-dark/70",
        )}
        aria-label="Not helpful"
        title="Not helpful"
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
}
