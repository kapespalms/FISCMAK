"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-media-query";
import {
  MAK_SECTION_CONFIG,
  type AppSection,
  type MakFlowIntent,
} from "@/lib/mak-sections";
import { buildDashboardGreeting } from "@/lib/mak-greeting";
import { buildSectionGateGreeting } from "@/lib/mak-chatbot-states";
import { isClientDemoMode } from "@/lib/demo-mode";
import {
  loadConversation,
  saveConversation,
  seedConversation,
  resetConversationGreeting,
  type MakMessage,
} from "@/lib/mak-conversations";
import { EscalationResourcesPanel } from "@/components/layout/EscalationResourcesPanel";
import type { MakEscalation } from "@/lib/v2/escalation-protocols";
import { useAppShell } from "@/components/layout/AppShell";

type MakPanelProps = {
  open: boolean;
  pendingFlow: {
    intent: MakFlowIntent;
    greeting: string;
    touchpoint?: import("@/components/layout/AppShell").MakFlowTouchpoint;
  } | null;
  flowNonce: number;
  onFlowHandled: () => void;
  onClose: () => void;
  onboardingActive?: boolean;
  onOpenTour?: () => void;
  initialMessage?: string | null;
  onInitialMessageHandled?: () => void;
};

function greetingForSection(
  section: AppSection,
  displayName: string | null,
): string {
  if (section === "dashboard") {
    return buildDashboardGreeting(displayName);
  }
  return buildSectionGateGreeting({ section, displayName });
}

export function MakPanel({
  open,
  pendingFlow,
  flowNonce,
  onFlowHandled,
  onClose,
  onboardingActive = false,
  onOpenTour,
  initialMessage,
  onInitialMessageHandled,
}: MakPanelProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { section, makInputRef, displayName } = useAppShell();
  const config = MAK_SECTION_CONFIG[section];
  const [messages, setMessages] = useState<MakMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<{ action: string; url: string }[]>([]);
  const [activeEscalation, setActiveEscalation] = useState<MakEscalation | null>(null);
  const [touchpointMode, setTouchpointMode] = useState<
    import("@/components/layout/AppShell").MakFlowTouchpoint | null
  >(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSection = useRef<AppSection | null>(null);

  useEffect(() => {
    if (!open || isClientDemoMode()) return;
    fetch(`/api/v1/chat/history?limit=40&section=${section}`)
      .then((r) => r.json())
      .then((d) => {
        const apiMessages = (d.messages ?? []) as {
          role: "user" | "assistant";
          content: string;
        }[];
        if (apiMessages.length > 0) {
          setMessages(apiMessages);
        }
      })
      .catch(() => undefined);
  }, [open, section]);

  useEffect(() => {
    const greeting = greetingForSection(section, displayName);
    if (prevSection.current !== section) {
      prevSection.current = section;
      if (isClientDemoMode()) {
        const stored = loadConversation(section);
        if (stored.length > 0) {
          setMessages(stored);
        } else {
          setMessages(seedConversation(section, greeting));
        }
      } else {
        setMessages((current) =>
          current.length === 0
            ? [{ role: "assistant", content: greeting }]
            : current,
        );
      }
      setInput("");
    } else if (section === "dashboard" && displayName && isClientDemoMode()) {
      setMessages((current) => {
        if (current.length === 0) {
          return seedConversation(section, greeting);
        }
        if (current[0]?.role === "assistant") {
          const next = [{ role: "assistant" as const, content: greeting }, ...current.slice(1)];
          saveConversation(section, next);
          return next;
        }
        return current;
      });
    }
  }, [section, displayName]);

  useEffect(() => {
    if (!pendingFlow) return;
    if (pendingFlow.greeting === "__welcome__") {
      setLoading(true);
      fetch("/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__welcome__",
          context: { section, onboarding: true, touchpoint_number: 1 },
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          setMessages([{ role: "assistant", content: data.response }]);
          setSuggestedActions(data.suggested_actions ?? []);
        })
        .catch(() => {
          setMessages([{ role: "assistant", content: "Welcome — I'm Coach Mak." }]);
        })
        .finally(() => {
          setLoading(false);
          onFlowHandled();
        });
      setInput("");
      return;
    }
    const next = resetConversationGreeting(section, pendingFlow.greeting);
    setMessages(next);
    setTouchpointMode(pendingFlow.touchpoint ?? null);
    setInput("");
    onFlowHandled();
  }, [flowNonce, pendingFlow, section, onFlowHandled]);

  useEffect(() => {
    if (!open || !initialMessage?.trim()) return;
    const msg = initialMessage.trim();
    onInitialMessageHandled?.();
    void sendMessage(msg);
  }, [initialMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length > 0 && isClientDemoMode()) {
      saveConversation(section, messages);
    }
  }, [messages, section]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput("");
    const history = messages;
    const nextMessages: MakMessage[] = [
      ...history,
      { role: "user", content: userMsg },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: history.slice(-8),
          context: {
            section,
            touchpoint_number: section === "assessment" ? 3 : 1,
            onboarding: onboardingActive,
            annual_refresh: touchpointMode === "annual",
            quarterly_pulse: touchpointMode === "quarterly",
          },
        }),
      });
      const data = await res.json();
      setSuggestedActions(data.suggested_actions ?? []);
      if (data.touchpoint_submitted) {
        setTouchpointMode(null);
        window.dispatchEvent(new CustomEvent("fiscmak:touchpoint-complete"));
      }
      if (data.escalation?.trigger) {
        setActiveEscalation({
          trigger: data.escalation.trigger,
          action: data.escalation.action,
          pauseChatbot: data.escalation.pause_chatbot,
          pauseCareerCoaching: data.escalation.pause_career_coaching,
          message: data.escalation.message ?? "Professional support resources are available.",
          suggestedActions: data.suggested_actions,
        });
      } else {
        setActiveEscalation(null);
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.response ??
            "Thanks for sharing. I'm here to help with your career journey.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I heard you. For now I'm in demo mode — add ANTHROPIC_API_KEY to enable Claude-powered Mak.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleVoice() {
    type SpeechCtor = new () => {
      lang: string;
      interimResults: boolean;
      onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };

    const win = window as Window & {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };

    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      void sendMessage("I'd like to share how I'm feeling today.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    setRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setRecording(false);
      if (transcript) void sendMessage(transcript);
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognition.start();
  }

  return (
    <>
      {open && isMobile && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close Coach Mak"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-fiscmak-border bg-white transition-[width,transform] duration-200 ease-in-out",
          isMobile
            ? cn(
                "fixed inset-0 z-50 w-full border-r-0 shadow-xl",
                open ? "translate-x-0" : "pointer-events-none translate-x-full",
              )
            : cn(
                "relative h-full",
                open ? "w-[320px] border-r shadow-sm" : "pointer-events-none w-0 border-r-0",
              ),
        )}
        aria-hidden={!open}
      >
        <div className={cn("flex h-full flex-col", !isMobile && "min-w-[320px]")}>
          <div className="flex shrink-0 items-center justify-between border-b border-cx-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-cx-text">Coach Mak</p>
              <p className="flex items-center gap-1.5 text-cx-label text-cx-text-secondary">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden />
                Active · {config.mode}
              </p>
            </div>
            {isMobile && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-cx-border text-cx-text-secondary hover:bg-cx-cream"
                aria-label="Close Coach Mak"
              >
                <X size={18} />
              </button>
            )}
          </div>
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-cx-white p-4"
        >
        {activeEscalation && <EscalationResourcesPanel escalation={activeEscalation} />}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={cn(
                "max-w-[90%] whitespace-pre-line rounded-xl px-4 py-3 text-sm leading-relaxed text-cx-text",
                msg.role === "user" ? "bg-cx-user-bubble" : "bg-cx-mak-bubble",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <p className="text-sm text-cx-text-secondary">Mak is thinking…</p>
        )}
        </div>

        <div className="shrink-0 border-t border-cx-border bg-cx-white p-4">
        <p className="mb-2 text-cx-label font-medium text-cx-text-secondary">Quick actions</p>
        <div className="mb-3 space-y-1">
          {(suggestedActions.length > 0 ? suggestedActions : config.quickOptions.map((a) => ({ action: a, url: "" }))).map((item) => {
            const label = typeof item === "string" ? item : item.action;
            const url = typeof item === "string" ? "" : item.url;
            return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (url === "#tour" || label.includes("Lay of the Land")) {
                  onOpenTour?.();
                  return;
                }
                if (url && url.startsWith("/")) {
                  router.push(url);
                  return;
                }
                void sendMessage(label.replace(/^[🎯⚡📋📤🗺️]\s*/, ""));
              }}
              disabled={loading}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-cx-label text-cx-text transition-colors hover:bg-[#F9F7F3] disabled:opacity-50"
            >
              {label}
            </button>
          );
          })}
        </div>
        <div className="flex gap-2">
          <input
            ref={makInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder={config.placeholder}
            disabled={loading || recording}
            className="h-12 min-h-12 flex-1 rounded-xl border border-cx-border px-4 text-sm text-cx-text focus:border-cx-primary focus:outline-none focus:ring-2 focus:ring-cx-primary/30"
            aria-label="Message to Coach Mak"
          />
          <button
            type="button"
            onClick={handleVoice}
            disabled={loading}
            title={recording ? "Recording…" : "Voice input"}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white transition-colors",
              recording ? "bg-red-500" : "bg-cx-text-secondary hover:bg-cx-text",
            )}
          >
            <Mic size={18} />
          </button>
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={loading || recording || !input.trim()}
            title="Send message"
            aria-label="Send message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cx-primary text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={18} strokeWidth={2.25} />
          </button>
        </div>
        </div>
        </div>
      </aside>
    </>
  );
}
