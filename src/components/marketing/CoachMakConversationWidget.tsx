"use client";

import { useEffect, useState } from "react";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";
import { MakAssistantBubble, MakUserBubble } from "@/components/mak/MakMessageBubble";
import { cn } from "@/lib/utils";

type Turn = { from: "mak" | "you"; text: string };

export type MakConversationPreview = {
  id: string;
  topic: string;
  turns: Turn[];
};

export const MAK_CONVERSATION_PREVIEWS: MakConversationPreview[] = [
  {
    id: "goals",
    topic: "Goal-setting",
    turns: [
      {
        from: "mak",
        text: "What's the one thing you'd want on your CV a year from now that isn't there today?",
      },
      { from: "you", text: "Honestly? A leadership role in our residency program." },
      {
        from: "mak",
        text: "Good. Let's name what you already do that points there — then we'll plan the rest.",
      },
    ],
  },
  {
    id: "promotion",
    topic: "Promotion prep",
    turns: [
      { from: "mak", text: "Promotion in 18 months. What feels furthest from ready?" },
      { from: "you", text: "Scholarship. I haven't published in two years." },
      {
        from: "mak",
        text: "We'll build a quarterly cadence — one submission, one review, one talk. You'll see the shape.",
      },
    ],
  },
  {
    id: "mentorship",
    topic: "Mentorship",
    turns: [
      { from: "mak", text: "You mentor four residents weekly. Does that show up anywhere?" },
      { from: "you", text: "Nowhere on paper." },
      {
        from: "mak",
        text: "Then it's our first capture. By next week it'll be evidence — not memory.",
      },
    ],
  },
];

type CoachMakConversationWidgetProps = {
  /** Show topic tabs for manual selection (landing + deep dive). */
  showTopics?: boolean;
  className?: string;
};

export function CoachMakConversationWidget({
  showTopics = true,
  className,
}: CoachMakConversationWidgetProps) {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(1);
  const preview = MAK_CONVERSATION_PREVIEWS[idx];
  const turns = preview.turns;

  useEffect(() => {
    setStep(1);
  }, [idx]);

  useEffect(() => {
    if (step < turns.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 1800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setStep(1);
      setIdx((i) => (i + 1) % MAK_CONVERSATION_PREVIEWS.length);
    }, 3500);
    return () => clearTimeout(t);
  }, [step, turns.length]);

  return (
    <div
      className={cn(
        "marketing-glass flex h-[440px] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.45)]",
        className,
      )}
      aria-label="Coach Mak conversation preview"
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-4">
        <div className="flex items-center gap-2.5">
          <CoachMakAvatar size={36} />
          <span className="text-[14px] font-semibold text-white">Coach Mak</span>
        </div>
        <span className="rounded-full border border-marketing-accent/30 bg-marketing-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-marketing-accent">
          Preview
        </span>
      </div>

      {showTopics ? (
        <div className="flex shrink-0 gap-1 border-b border-white/10 p-2">
          {MAK_CONVERSATION_PREVIEWS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "font-futura-medium flex-1 rounded-md px-2 py-1.5 text-[10px] uppercase tracking-wide transition sm:text-xs",
                i === idx
                  ? "bg-marketing-accent/15 text-marketing-accent"
                  : "text-white/45 hover:bg-white/5 hover:text-white/70",
              )}
            >
              {item.topic}
            </button>
          ))}
        </div>
      ) : (
        <div className="shrink-0 border-b border-white/10 py-1.5 text-center text-xs text-white/50">
          {preview.topic}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-5">
        {turns.slice(0, step).map((t, i) => (
          <div
            key={`${preview.id}-${i}`}
            className={cn(
              "flex w-full mak-convo-fade-in",
              t.from === "you" ? "justify-end" : "justify-start",
            )}
          >
            {t.from === "mak" ? (
              <div className="flex max-w-[88%] gap-3">
                <CoachMakAvatar size={32} className="mt-0.5 shrink-0" />
                <MakAssistantBubble variant="marketing">{t.text}</MakAssistantBubble>
              </div>
            ) : (
              <div className="max-w-[82%]">
                <MakUserBubble variant="marketing">{t.text}</MakUserBubble>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
