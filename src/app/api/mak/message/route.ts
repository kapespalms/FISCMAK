import { NextResponse } from "next/server";

const MAK_SYSTEM = `You are Mak, an empathetic career coach for physicians. Listen first, ask one question at a time, validate before suggesting. Warm and conversational. Do not provide therapy or diagnoses.`;

export async function POST(request: Request) {
  const { message, history } = await request.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply: `Thanks for sharing: "${message.slice(0, 120)}${message.length > 120 ? "…" : ""}". Add ANTHROPIC_API_KEY to .env.local to enable Claude-powered Mak.`,
    });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 512,
        system: MAK_SYSTEM,
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
