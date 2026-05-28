"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";
import { MakAssistantBubble, MakUserBubble } from "@/components/mak/MakMessageBubble";
import { cn } from "@/lib/utils";

type MiniTurn = { from: "mak" | "you"; text: string };

const MINI_CONVERSATIONS: MiniTurn[][] = [
  [
    { from: "mak", text: "What's one career move you're weighing?" },
    { from: "you", text: "Chief year — academic vs community." },
    { from: "mak", text: "You fly the plane. I'll read the instruments." },
  ],
  [
    { from: "mak", text: "Does your mentorship show up anywhere?" },
    { from: "you", text: "Nowhere on paper." },
    { from: "mak", text: "Let's capture it — evidence, not memory." },
  ],
  [
    { from: "mak", text: "Promotion in 18 months. What feels furthest?" },
    { from: "you", text: "Scholarship — quiet for two years." },
    { from: "mak", text: "One submission, one review, one talk. We'll map it." },
  ],
];

const STEP_MS = 1500;
const HOLD_MS = 2800;

type MakMiniChatPreviewProps = {
  className?: string;
  /** Compact card for landing grids; featured for Meet Mak page. */
  size?: "compact" | "featured";
};

export function MakMiniChatPreview({
  className,
  size = "compact",
}: MakMiniChatPreviewProps) {
  const [scriptIdx, setScriptIdx] = useState(0);
  const [step, setStep] = useState(1);
  const chatRef = useRef<HTMLDivElement>(null);
  const turns = MINI_CONVERSATIONS[scriptIdx];
  const visible = turns.slice(0, step);

  const scrollToBottom = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setStep(1);
  }, [scriptIdx]);

  useEffect(() => {
    scrollToBottom(chatRef.current);
  }, [step, scriptIdx, scrollToBottom]);

  useEffect(() => {
    if (step < turns.length) {
      const timer = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setStep(1);
      setScriptIdx((i) => (i + 1) % MINI_CONVERSATIONS.length);
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [step, turns.length]);

  const isFeatured = size === "featured";
  const avatarSize = isFeatured ? 24 : 18;
  const bubbleText = isFeatured ? "text-[11px]" : "text-[9px] leading-snug";

  return (
    <div
      className={cn(
        "mak-mini-chat-preview flex flex-col overflow-hidden rounded-lg border border-white/10 bg-cx-forest-dark",
        isFeatured ? "min-h-[260px] w-full max-w-md" : "min-h-[168px]",
        className,
      )}
      aria-label="Coach Mak conversation preview"
    >
      <div
        ref={chatRef}
        className={cn(
          "flex flex-1 flex-col gap-1.5 overflow-y-auto bg-[#fafbfa] px-2 py-2",
          isFeatured ? "min-h-[180px]" : "min-h-[108px] max-h-[108px]",
        )}
      >
        {visible.map((turn, i) =>
          turn.from === "mak" ? (
            <div key={`${scriptIdx}-${i}`} className="flex gap-1.5 mak-convo-fade-in">
              <CoachMakAvatar size={avatarSize} className="mt-0.5 shrink-0" />
              <MakAssistantBubble
                variant="app"
                className={cn("landing-mak-bubble max-w-[92%] px-2 py-1.5", bubbleText)}
              >
                {turn.text}
              </MakAssistantBubble>
            </div>
          ) : (
            <div key={`${scriptIdx}-${i}`} className="flex justify-end mak-convo-fade-in">
              <MakUserBubble variant="app" className={cn("max-w-[88%] px-2 py-1.5", bubbleText)}>
                {turn.text}
              </MakUserBubble>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
