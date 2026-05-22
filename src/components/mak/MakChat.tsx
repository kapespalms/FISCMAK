"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Message = { role: "user" | "assistant"; content: string };

const MAK_GREETING =
  "Hi — I'm Mak. Tell me about your practice right now. What's your specialty, what kind of work fills your days? And what matters most about the work you do?";

export function MakChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: MAK_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/mak/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages }),
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

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col p-0">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-fiscmak-green text-white"
                  : "bg-fiscmak-subtle text-foreground"
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
      <div className="flex gap-2 border-t border-fiscmak-border p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Share what's happening in your career…"
          className="min-h-11 flex-1 rounded-md border border-fiscmak-border px-4 py-2"
          aria-label="Message to Mak"
        />
        <Button onClick={send} disabled={loading}>
          Send
        </Button>
      </div>
    </Card>
  );
}
