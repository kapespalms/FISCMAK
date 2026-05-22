"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAK_SECTION_CONFIG,
  type AppSection,
  type MakFlowIntent,
} from "@/lib/mak-sections";
import { buildDashboardGreeting } from "@/lib/mak-greeting";
import { isClientDemoMode } from "@/lib/demo-mode";
import {
  loadConversation,
  saveConversation,
  seedConversation,
  resetConversationGreeting,
  type MakMessage,
} from "@/lib/mak-conversations";
import { useAppShell } from "@/components/layout/AppShell";

type MakPanelProps = {
  open: boolean;
  pendingFlow: { intent: MakFlowIntent; greeting: string } | null;
  flowNonce: number;
  onFlowHandled: () => void;
};

function greetingForSection(
  section: AppSection,
  displayName: string | null,
): string {
  if (section === "dashboard") {
    return buildDashboardGreeting(displayName);
  }
  return MAK_SECTION_CONFIG[section].greeting;
}

export function MakPanel({
  open,
  pendingFlow,
  flowNonce,
  onFlowHandled,
}: MakPanelProps) {
  const { section, makInputRef, displayName } = useAppShell();
  const config = MAK_SECTION_CONFIG[section];
  const [messages, setMessages] = useState<MakMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<{ action: string; url: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSection = useRef<AppSection | null>(null);

  useEffect(() => {
    if (!open || isClientDemoMode()) return;
    fetch("/api/v1/chat/history?limit=40")
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
  }, [open]);

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
    const next = resetConversationGreeting(section, pendingFlow.greeting);
    setMessages(next);
    setInput("");
    onFlowHandled();
  }, [flowNonce, pendingFlow, section, onFlowHandled]);

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
          context: { section, touchpoint_number: section === "assessment" ? 3 : 1 },
        }),
      });
      const data = await res.json();
      setSuggestedActions(data.suggested_actions ?? []);
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
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden border-fiscmak-border bg-white transition-[width,border-color] duration-200 ease-in-out",
        open ? "w-[320px] border-r shadow-sm" : "pointer-events-none w-0 border-r-0",
      )}
      aria-hidden={!open}
    >
      <div className="flex h-full min-w-[320px] flex-col">
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-[#fafbfc] p-4 pt-5"
        >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] whitespace-pre-line rounded-lg px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-fiscmak-green text-white"
                  : "bg-fiscmak-green-light text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <p className="text-sm text-fiscmak-muted">Mak is thinking…</p>
        )}
        </div>

        <div className="shrink-0 border-t border-fiscmak-border bg-white p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {(suggestedActions.length > 0 ? suggestedActions.map((a) => a.action) : config.quickOptions).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => void sendMessage(option)}
              disabled={loading}
              className="rounded-full border border-fiscmak-border bg-white px-3 py-1 text-xs font-medium text-fiscmak-muted transition-colors hover:border-fiscmak-green hover:bg-fiscmak-green-light hover:text-fiscmak-green-dark disabled:opacity-50"
            >
              {option}
            </button>
          ))}
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
            className="min-h-10 flex-1 rounded-md border border-fiscmak-border px-3 text-sm focus:border-fiscmak-green focus:outline-none"
            aria-label="Message to Coach Mak"
          />
          <button
            type="button"
            onClick={handleVoice}
            disabled={loading}
            title={recording ? "Recording…" : "Voice input"}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white transition-colors ${
              recording ? "bg-fiscmak-red" : "bg-fiscmak-green hover:bg-fiscmak-green-dark"
            }`}
          >
            <Mic size={18} />
          </button>
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={loading || recording || !input.trim()}
            title="Send message"
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#111827] text-white transition-colors hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={18} strokeWidth={2.25} />
          </button>
        </div>
        </div>
      </div>
    </aside>
  );
}
