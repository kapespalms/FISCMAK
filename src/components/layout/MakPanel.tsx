"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  MAK_SECTION_CONFIG,
  type AppSection,
  type MakFlowIntent,
} from "@/lib/mak-sections";
import { buildDashboardGreeting } from "@/lib/mak-greeting";
import {
  loadConversation,
  saveConversation,
  seedConversation,
  resetConversationGreeting,
  type MakMessage,
} from "@/lib/mak-conversations";
import { useAppShell } from "@/components/layout/AppShell";

type MakPanelProps = {
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
  pendingFlow,
  flowNonce,
  onFlowHandled,
}: MakPanelProps) {
  const { section, setMakOpen, makInputRef, displayName } = useAppShell();
  const config = MAK_SECTION_CONFIG[section];
  const [messages, setMessages] = useState<MakMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSection = useRef<AppSection | null>(null);

  useEffect(() => {
    const greeting = greetingForSection(section, displayName);
    if (prevSection.current !== section) {
      prevSection.current = section;
      const stored = loadConversation(section);
      if (stored.length > 0) {
        setMessages(stored);
      } else {
        setMessages(seedConversation(section, greeting));
      }
      setInput("");
    } else if (section === "dashboard" && displayName) {
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
    if (messages.length > 0) {
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
      const res = await fetch("/api/mak/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history,
          section,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ??
            "Thanks for sharing. Connect your Claude API key in .env.local to enable full Mak conversations.",
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
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-fiscmak-border bg-white">
      <header className="flex h-[60px] shrink-0 items-center justify-between bg-fiscmak-green px-4 text-white">
        <div>
          <p className="text-lg font-semibold leading-tight">Coach Mak</p>
          <p className="text-xs opacity-90">{config.mode} mode</p>
        </div>
        <button
          type="button"
          onClick={() => setMakOpen(false)}
          className="rounded-md p-1 hover:bg-white/20"
          aria-label="Close Mak panel"
        >
          <X size={18} />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-[#fafbfc] p-4"
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
          {config.quickOptions.map((option) => (
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
          <Button
            onClick={() => void sendMessage(input)}
            disabled={loading || recording}
            className="shrink-0 px-3"
          >
            Send
          </Button>
        </div>
      </div>
    </aside>
  );
}
