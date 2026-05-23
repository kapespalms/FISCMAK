import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchAssessments, fetchDocuments, fetchLatestMemPalace } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  buildConversationalPrompt,
  getPendingQuestions,
} from "@/lib/v2/conversational-assessment";
import { processConversationalTurn } from "@/lib/v2/conversational-assessment-service";
import {
  nextInstrumentPrompt,
  processInstrumentTurn,
} from "@/lib/v2/instrument-conversation-service";
import { computeTouchpoint1Dashboard } from "@/lib/v2/onboarding-compute";
import {
  buildOnboardingSuggestedActions,
  buildWelcomeGreeting,
} from "@/lib/v2/onboarding-flow";
import { demoMakReply } from "@/lib/mak-demo-replies";

const MAK_SYSTEM = `You are Coach Mak, an empathetic physician career coach. Use MemPalace context and assessment data. No medical advice. One question at a time. Surface invisible work and promotion narrative when relevant. Keep replies under 120 words unless summarizing.`;

type HistoryTurn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { message, context, history } = await request.json();
  const user = await getAppUser(auth.userId, auth.demo);
  const mp = await fetchLatestMemPalace(auth.userId, auth.demo);
  const assessments = await fetchAssessments(auth.userId, auth.demo);
  const docs = await fetchDocuments(auth.userId, auth.demo);
  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  const onboarding =
    context?.onboarding === true ||
    (user?.tier1_complete && !user?.tier3_complete) ||
    message === "__welcome__";

  let autoAnswered: string[] = [];
  let pendingCount = 0;
  let touchpointComplete = false;
  let instrumentCaptured: string[] = [];

  if (user && message && message !== "__welcome__") {
    if (user.tier2_complete && !user.tier3_complete) {
      const inst = await processInstrumentTurn(user, auth.userId, auth.demo, message);
      instrumentCaptured = inst.captured;
      pendingCount = inst.pendingCluster ? 1 : 0;
      touchpointComplete = inst.instrumentsComplete;
    } else if (!user.tier3_complete) {
      const turn = await processConversationalTurn(
        user,
        auth.userId,
        auth.demo,
        message,
        context?.touchpoint_number ?? 1,
      );
      autoAnswered = turn.autoAnswered;
      pendingCount = turn.pendingCount;
      touchpointComplete = turn.touchpointComplete;
    }

    if (touchpointComplete && onboarding) {
      const refreshedUser = await getAppUser(auth.userId, auth.demo);
      if (refreshedUser) {
        const cv = docs.find((d) => d.document_type === "CV");
        const computed = computeTouchpoint1Dashboard(refreshedUser, cv?.extracted_text);
        await upsertAppUser(
          auth.userId,
          auth.email,
          {
            tier3_complete: true,
            onboarding_metadata: {
              ...(refreshedUser.onboarding_metadata ?? {}),
              ...computed,
            } as Record<string, unknown>,
          },
          auth.demo,
        );
      } else {
        await upsertAppUser(auth.userId, auth.email, { tier3_complete: true }, auth.demo);
      }
    }
  }

  const refreshedAssessments = await fetchAssessments(auth.userId, auth.demo);
  const pendingTp1 = user ? getPendingQuestions(1, refreshedAssessments) : [];

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  let response: string;
  let suggested_actions: { action: string; url: string }[] = [];

  if (message === "__welcome__" && user) {
    response = buildWelcomeGreeting(user);
    suggested_actions = buildOnboardingSuggestedActions();
  } else if (!apiKey) {
    response = demoMakReply(message, context?.section ?? "dashboard");
    if (onboarding) {
      if (instrumentCaptured.length > 0) {
        response += `\n\n(Got it — captured ${instrumentCaptured.length} assessment detail${instrumentCaptured.length > 1 ? "s" : ""}.)`;
      }
      if (pendingCount > 0 && user?.tier2_complete) {
        const next = nextInstrumentPrompt(user);
        if (next) response += `\n\n${next}`;
      } else if (pendingCount > 0) {
        response += `\n\nTell me about your promotion track or biggest career goal over the next few years.`;
      } else if (touchpointComplete) {
        response += `\n\nYour Touchpoint 1 dashboard is ready — CDI baseline and wellbeing scores are live.`;
      }
      suggested_actions = buildOnboardingSuggestedActions();
    } else {
      suggested_actions = [{ action: "Discuss my energy", url: "/app/subjective" }];
    }
  } else {
    const contextBlock = [
      user ? `Physician: ${user.name}, ${user.specialty}, ${user.career_stage}` : "",
      mp?.coaching_summary ? `Memory: ${mp.coaching_summary}` : "",
      assessments.length
        ? `Completed touchpoints: ${assessments.filter((a) => a.completed_at).length}`
        : "",
      docs.length ? `Documents: ${docs.length} uploaded` : "",
      autoAnswered.length ? `Auto-captured this turn: ${autoAnswered.join(", ")}` : "",
      instrumentCaptured.length ? `Instrument clusters captured: ${instrumentCaptured.join(", ")}` : "",
      user?.tier2_complete && !user?.tier3_complete && nextInstrumentPrompt(user)
        ? `Next instrument prompt: ${nextInstrumentPrompt(user)}`
        : "",
      pendingTp1.length ? `Still to learn in conversation: ${pendingTp1.map((q) => q.q_id).join(", ")}` : "",
      user ? buildConversationalPrompt(user, pendingTp1, onboarding) : "",
    ]
      .filter(Boolean)
      .join("\n");

    const prior: HistoryTurn[] = Array.isArray(history) ? history.slice(-8) : [];
    const messages = [
      ...prior.filter((h) => h.role === "user" || h.role === "assistant"),
      { role: "user" as const, content: message },
    ];

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
          messages,
        }),
      });
      const data = await res.json();
      response = data.content?.[0]?.text ?? demoMakReply(message, context?.section ?? "dashboard");
    } catch {
      response = demoMakReply(message, context?.section ?? "dashboard");
    }

    suggested_actions = onboarding
      ? buildOnboardingSuggestedActions()
      : [{ action: "Capture invisible work", url: "/app/dashboard" }];
  }

  const userMsg =
    message === "__welcome__"
      ? null
      : {
          message_id: crypto.randomUUID(),
          user_id: auth.userId,
          role: "user" as const,
          content: message,
          section: context?.section ?? null,
          created_at: now,
        };
  const assistantMsg = {
    message_id: messageId,
    user_id: auth.userId,
    role: "assistant" as const,
    content: response,
    section: context?.section ?? null,
    suggested_actions,
    created_at: new Date().toISOString(),
  };

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    if (userMsg) state.chatMessages.push(userMsg);
    state.chatMessages.push(assistantMsg);
  } else {
    const supabase = await createClient();
    const rows = userMsg ? [userMsg, assistantMsg] : [assistantMsg];
    await supabase.from("chat_messages").insert(rows);
  }

  return jsonOk({
    message_id: messageId,
    response,
    sentiment: "empathetic",
    suggested_actions,
    memory_updated: Boolean(mp),
    auto_answered: autoAnswered,
    instrument_captured: instrumentCaptured,
    pending_questions: pendingCount,
    touchpoint_complete: touchpointComplete,
    context,
  });
}
