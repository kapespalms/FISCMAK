/** @deprecated Use POST /api/v1/chat/message — V1 Mak route retained for legacy clients. */
import { NextResponse } from "next/server";
import { MAK_SECTION_CONFIG, type AppSection } from "@/lib/mak-sections";
import { demoMakReply } from "@/lib/mak-demo-replies";

const BASE_SYSTEM = `You are Mak, an empathetic career coach for physicians. Listen first, ask one question at a time, validate before suggesting. Warm and conversational. Do not provide therapy or diagnoses.`;

function systemForSection(section?: string) {
  const key = section as AppSection | undefined;
  if (key && MAK_SECTION_CONFIG[key]) {
    const cfg = MAK_SECTION_CONFIG[key];
    return `${BASE_SYSTEM}\n\nCurrent page: ${key}. Your mode is ${cfg.mode}. Start from: "${cfg.greeting}" Keep responses concise (2-4 sentences).`;
  }
  return BASE_SYSTEM;
}

export async function POST(request: Request) {
  const { message, history, section } = await request.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey?.trim()) {
    return NextResponse.json({
      reply: demoMakReply(message, section as AppSection | undefined),
      demo: true,
    });
  }

  const anthropicKey = apiKey.trim();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 512,
        system: systemForSection(section),
        messages: [
          ...(history ?? []).map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    const reply =
      data.content?.find((b: { type: string }) => b.type === "text")?.text ??
      "I'm here with you. Tell me more.";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      reply: "I couldn't reach Claude right now. Please try again in a moment.",
    });
  }
}
