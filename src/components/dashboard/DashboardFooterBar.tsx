"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useIsMobile } from "@/lib/use-media-query";
import type { DashboardQuickAction } from "@/lib/v2/dashboard-architecture";

type DashboardFooterBarProps = {
  quickActions: DashboardQuickAction[];
  onQuickAction: (action: DashboardQuickAction) => void;
  onSendMessage: (message: string) => void;
  onOpenChat?: () => void;
};

export function DashboardFooterBar({
  quickActions,
  onQuickAction,
  onSendMessage,
  onOpenChat,
}: DashboardFooterBarProps) {
  const [input, setInput] = useState("");
  const isMobile = useIsMobile();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  }

  return (
    <footer className="sticky bottom-0 z-10 border-t border-fiscmak-border bg-white/95 py-3 backdrop-blur-sm md:z-10">
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            if (isMobile) onOpenChat?.();
          }}
          placeholder="Ask anything about your career profile, or tell the platform what you need"
          className="min-h-11 flex-1 rounded-lg border border-fiscmak-border px-4 text-sm focus:border-fm-primary focus:outline-none"
          aria-label="Ask Coach Mak"
        />
        <Button type="submit" className="shrink-0 px-4" aria-label="Send">
          <ArrowUp size={18} />
        </Button>
      </form>
      <div className="mt-2 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onQuickAction(action)}
            className="rounded-full border border-fiscmak-border bg-fm-background px-3 py-1 text-xs font-medium text-fiscmak-ink hover:border-fm-primary"
          >
            {action.label}
          </button>
        ))}
      </div>
    </footer>
  );
}
