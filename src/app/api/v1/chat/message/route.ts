import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import {
  fetchAssessments,
  fetchDocuments,
  fetchLatestMemPalace,
} from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { demoMakReply } from "@/lib/mak-demo-replies";

const MAK_SYSTEM = `You are Coach Mak, an empathetic physician career coach. Use MemPalace context and assessment data. No medical advice. One question at a time. Surface invisible work and promotion narrative when relevant.`;

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { message, context } = await request.json();
  const user = await getAppUser(auth.userId, auth.demo);
  const mp = await fetchLatestMemPalace(auth.userId, auth.demo);
  const assessments = await fetchAssessments(auth.userId, auth.demo);
  const docs = await fetchDocuments(auth.userId, auth.demo);
  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  let response: string;
  let suggested_actions: { action: string; url: string }[] = [];

  if (!apiKey) {
    response = demoMakReply(message, "dashboard");
    suggested_actions = [{ action: "Start assessment", url: "/app/assessment" }];
  } else {
    const contextBlock = [
      user ? `Specialty: ${user.specialty}, Stage: ${user.career_stage}` : "",
      mp?.coaching_summary ? `Memory: ${mp.coaching_summary}` : "",
      assessments.length
        ? `Completed touchpoints: ${assessments.filter((a) => a.completed_at).length}`
        : "",
      docs.length ? `Documents: ${docs.length} uploaded` : "",
    ]
      .filter(Boolean)
      .join("\n");
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
          system: `${MAK_SYSTEM}\n\nContext:\n${contextBlock}`,
          messages: [{ role: "user", content: message }],
        }),
      });
      const data = await res.json();
      response = data.content?.[0]?.text ?? demoMakReply(message, "dashboard");
    } catch {
      response = demoMakReply(message, "dashboard");
    }
    if (message.toLowerCase().includes("burnout") || message.toLowerCase().includes("energy")) {
      suggested_actions.push({ action: "Take wellbeing assessment", url: "/app/assessment" });
    }
  }

  const userMsg = {
    message_id: crypto.randomUUID(),
    user_id: auth.userId,
    role: "user" as const,
    content: message,
    created_at: now,
  };
  const assistantMsg = {
    message_id: messageId,
    user_id: auth.userId,
    role: "assistant" as const,
    content: response,
    suggested_actions,
    created_at: new Date().toISOString(),
  };

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    state.chatMessages.push(userMsg, assistantMsg);
  } else {
    const supabase = await createClient();
    await supabase.from("chat_messages").insert([userMsg, assistantMsg]);
  }

  return jsonOk({
    message_id: messageId,
    response,
    sentiment: "empathetic",
    suggested_actions,
    memory_updated: Boolean(mp),
    context,
  });
}
