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
import {
  buildReconcileGreeting,
  buildReconcileMakSystemContext,
  pendingReconciliationCount,
  processReconcileTurn,
} from "@/lib/v2/reconcile-mak-flow";
import { computeTouchpoint1Dashboard, getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { quarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import { annualRefreshStatus } from "@/lib/v2/annual-refresh";
import {
  buildAnnualMakSystemContext,
  initAnnualRefreshSession,
} from "@/lib/v2/annual-mak-flow";
import {
  buildQuarterlyMakSystemContext,
  initQuarterlyPulseSession,
} from "@/lib/v2/quarterly-mak-flow";
import { processAnnualMakTurn, processQuarterlyMakTurn } from "@/lib/v2/touchpoint-mak-orchestrator";
import type { TouchpointSubmitResult } from "@/lib/v2/touchpoint-submit";
import { touchpointsEligible } from "@/lib/v2/touchpoint-eligibility";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import {
  buildOnboardingSuggestedActions,
  buildWelcomeGreeting,
} from "@/lib/v2/onboarding-flow";
import { buildCareerHealthView } from "@/lib/v2/career-health-view";
import { buildCareerRecommendations, recommendationsContextForMak } from "@/lib/v2/career-recommendations";
import { demoMakReply } from "@/lib/mak-demo-replies";
import {
  detectEscalation,
  extractEscalationInputFromMetadata,
  mapEscalationToGlobalState,
  resolveGlobalMakState,
  sectionSystemPrompt,
  resolveChatState,
  careerAlignmentFromHealth,
} from "@/lib/mak-chatbot-states";
import {
  captureActivityFromMak,
  shouldCaptureActivityMessage,
} from "@/lib/v2/activity-capture";
import type { ActivityEntry } from "@/lib/types/database";
import type { AppSection } from "@/lib/mak-sections";

const MAK_SYSTEM = `You are Coach Mak, an empathetic physician career coach. Use MemPalace context and assessment data. No medical advice. One question at a time. Surface invisible work and promotion narrative when relevant. Keep replies under 120 words unless summarizing.

CRITICAL: Speak in career outcomes, not formulas. Never say h-index, RCR, BITS, IWQ, or CDI unless the physician asks for technical detail. Use: Career Health Score, Research Influence, Burnout Risk, Unrecognized Work, Service Citizenship, Advancement Readiness.

When coaching recommendations are provided, prioritize the urgent/high items first. Use plain language and actionable next steps.`;

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

  let reconcileCaptured = false;
  let reconcileCompleteFlag = false;
  let reconcileNextPrompt: string | undefined;

  if (user && message && message !== "__welcome__") {
    const metaForReconcile = getOnboardingMetadata(user);
    const needsReconcile =
      user.cv_uploaded &&
      !user.tier2_complete &&
      pendingReconciliationCount(metaForReconcile) > 0;

    if (needsReconcile) {
      const turn = await processReconcileTurn(
        user,
        auth.userId,
        auth.demo,
        auth.email,
        message,
      );
      reconcileCaptured = turn.captured;
      reconcileCompleteFlag = turn.complete;
      reconcileNextPrompt = turn.nextPrompt;
      pendingCount = turn.pendingCount;
      touchpointComplete = turn.complete;
    } else if (user.tier2_complete && !user.tier3_complete) {
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

  const cvDoc = docs.find((d) => d.document_type === "CV");
  const cvMetricsForCoach =
    cvDoc?.extracted_text && user
      ? computeCvMetrics(cvDoc.extracted_text, refreshedAssessments)
      : null;
  const careerHealth =
    user?.tier1_complete
      ? buildCareerHealthView({ user, cvMetrics: cvMetricsForCoach, assessments: refreshedAssessments })
      : null;
  const coachingBrief = careerHealth
    ? buildCareerRecommendations({ user: user!, careerHealth, cvMetrics: cvMetricsForCoach })
    : null;

  const chatSection = (context?.section ?? "dashboard") as AppSection;
  const onboardingMeta = (user?.onboarding_metadata ?? {}) as Record<string, unknown>;
  const metaParsed = user ? getOnboardingMetadata(user) : {};
  let activeMeta = metaParsed;
  const touchpointReady = user ? touchpointsEligible(user, metaParsed) : false;
  const quarterlyPulseDue = touchpointReady ? quarterlyPulseStatus(metaParsed).due : false;
  const annualRefreshDue = touchpointReady ? annualRefreshStatus(metaParsed).due : false;
  const annualSessionActive = Boolean(
    activeMeta.annual_refresh_session ||
      (annualRefreshDue && context?.annual_refresh === true),
  );
  const quarterlySessionActive = Boolean(
    activeMeta.quarterly_pulse_session ||
      (quarterlyPulseDue && context?.quarterly_pulse === true),
  );

  if (user && context?.annual_refresh && !activeMeta.annual_refresh_session) {
    activeMeta = {
      ...initAnnualRefreshSession(activeMeta),
      touchpoint_session_mode: "annual",
      touchpoint_session_answers: [],
    };
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  if (user && context?.quarterly_pulse && !activeMeta.quarterly_pulse_session) {
    activeMeta = {
      ...initQuarterlyPulseSession(activeMeta),
      touchpoint_session_mode: "quarterly",
      touchpoint_session_answers: [],
    };
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  let touchpointSubmitted: TouchpointSubmitResult | null = null;
  let touchpointNextPrompt: string | null = null;

  if (
    user &&
    message &&
    message !== "__welcome__" &&
    quarterlySessionActive &&
    !annualSessionActive
  ) {
    const turn = await processQuarterlyMakTurn({
      message,
      meta: activeMeta,
      userId: auth.userId,
      email: auth.email,
      demo: auth.demo,
      user,
      setting: user.practice_setting,
    });
    activeMeta = turn.meta;
    touchpointSubmitted = turn.submitted;
    touchpointNextPrompt = turn.nextPrompt;
    if (!turn.submitted) {
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
  } else if (user && message && message !== "__welcome__" && annualSessionActive) {
    const turn = await processAnnualMakTurn({
      message,
      meta: activeMeta,
      userId: auth.userId,
      email: auth.email,
      demo: auth.demo,
      user,
    });
    activeMeta = turn.meta;
    touchpointSubmitted = turn.submitted;
    touchpointNextPrompt = turn.nextPrompt;
    if (!turn.submitted) {
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
  }

  const flowIntent = (context?.flow_intent as string | undefined) ?? null;
  let activityCaptured: ActivityEntry | null = null;

  if (
    user?.tier3_complete &&
    message &&
    message !== "__welcome__" &&
    shouldCaptureActivityMessage(message, flowIntent)
  ) {
    try {
      activityCaptured = await captureActivityFromMak({
        userId: auth.userId,
        demo: auth.demo,
        text: message,
        specialty: user.specialty,
        careerPhase: user.career_stage,
      });
    } catch (e) {
      console.error("Mak activity capture failed:", e);
    }
  }

  const escalationInput = extractEscalationInputFromMetadata(
    message,
    activeMeta as Record<string, unknown>,
  );
  if (careerHealth) {
    if (escalationInput.careerAlignmentPct == null) {
      escalationInput.careerAlignmentPct =
        metaParsed.career_alignment_pct ?? careerAlignmentFromHealth(careerHealth);
    }
    escalationInput.lowAlignmentQuarters =
      activeMeta.low_alignment_quarters ?? escalationInput.lowAlignmentQuarters;
  }

  const escalation =
    message && message !== "__welcome__" ? detectEscalation(escalationInput) : null;

  const escalationGlobalState = escalation
    ? mapEscalationToGlobalState(escalation.trigger)
    : null;

  const globalState = resolveGlobalMakState({
    tier1Complete: user?.tier1_complete,
    tier2Complete: user?.tier2_complete,
    tier3Complete: user?.tier3_complete,
    cvUploaded: user?.cv_uploaded,
    goalsConfirmed: Boolean(onboardingMeta.goals_confirmed),
    section: chatSection,
    escalationState: escalationGlobalState,
    quarterlyPulseDue,
    annualResetDue: annualRefreshDue,
    quarterlyReviewDue: quarterlyPulseDue,
    jobSearchActive: Boolean(metaParsed.job_search_active),
    pendingReconcile:
      Boolean(user?.cv_uploaded) &&
      !user?.tier2_complete &&
      pendingReconciliationCount(metaParsed) > 0,
    newObjectiveItems:
      user?.tier3_complete &&
      (activeMeta.reconciliation ?? []).some(
        (r: { status?: string }) => r.status === "pending",
      ),
  });

  const chatState = resolveChatState({
    section: chatSection,
    burnoutScore: escalationInput.burnoutScore ?? null,
    globalState,
    quarterlyPulseDue,
    annualRefreshDue,
  });

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  let response: string;
  let suggested_actions: { action: string; url: string }[] = [];

  if (message === "__welcome__" && user) {
    const welcomeMeta = getOnboardingMetadata(user);
    if (
      user.cv_uploaded &&
      !user.tier2_complete &&
      pendingReconciliationCount(welcomeMeta) > 0
    ) {
      response = buildReconcileGreeting(welcomeMeta);
      suggested_actions = [
        { action: "Yes, mine", url: "" },
        { action: "Not mine", url: "" },
        { action: "Use form instead", url: "/app/onboarding?step=reconcile" },
      ];
    } else {
      response = buildWelcomeGreeting(user);
      suggested_actions = buildOnboardingSuggestedActions();
    }
  } else if (reconcileCaptured && reconcileNextPrompt) {
    response = reconcileNextPrompt;
    if (reconcileCompleteFlag) {
      response += "\n\nReconciliation complete — let's continue with your self-assessment.";
    }
    suggested_actions = [
      { action: "Continue assessment", url: "/app/onboarding?step=instruments" },
      { action: "Use form instead", url: "/app/onboarding?step=reconcile" },
    ];
  } else if (!apiKey) {
    response = demoMakReply(message, chatSection);
    if (escalation) {
      response = escalation.pauseChatbot
        ? escalation.message
        : `${escalation.message}\n\n${response}`;
    }
    if (escalation?.suggestedActions?.length) {
      suggested_actions = escalation.suggestedActions.map((a) => ({
        action: a.action,
        url: a.url,
      }));
    } else if (onboarding) {
      if (reconcileCaptured && reconcileNextPrompt) {
        response = reconcileNextPrompt;
        if (reconcileCompleteFlag) {
          response += "\n\nReconciliation complete — let's continue with your self-assessment.";
        }
      } else if (reconcileCaptured) {
        response += `\n\n(Got it — item reconciled. ${pendingCount} remaining.)`;
      }
      if (instrumentCaptured.length > 0) {
        response += `\n\n(Got it — captured ${instrumentCaptured.length} assessment detail${instrumentCaptured.length > 1 ? "s" : ""}.)`;
      }
      if (pendingCount > 0 && user?.tier2_complete) {
        const next = nextInstrumentPrompt(user);
        if (next) response += `\n\n${next}`;
      } else if (pendingCount > 0) {
        response += `\n\nTell me about your promotion track or biggest career goal over the next few years.`;
      } else if (touchpointComplete) {
        response += `\n\nYour Career Health snapshot is ready — open the dashboard to see your score in plain language.`;
      }
      suggested_actions = buildOnboardingSuggestedActions();
    } else {
      suggested_actions =
        touchpointSubmitted
          ? [{ action: "View updated dashboard", url: "/app/dashboard" }]
          : annualSessionActive || quarterlySessionActive
            ? [
                { action: "Continue to next module", url: "" },
                { action: "Review goals", url: "/app/plan" },
              ]
            : [{ action: "Begin quarterly check-in", url: "/app/dashboard" }];
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
      coachingBrief ? recommendationsContextForMak(coachingBrief) : "",
      careerHealth ? `Career Health Score: ${careerHealth.career_health_score}/100` : "",
      annualSessionActive ? buildAnnualMakSystemContext(activeMeta) : "",
      quarterlySessionActive ? buildQuarterlyMakSystemContext(activeMeta) : "",
      globalState === "ONBOARDRECONCILE" ? buildReconcileMakSystemContext(activeMeta) : "",
      flowIntent === "capture"
        ? "Activity capture mode: the physician is logging invisible work. Acknowledge what they shared, reflect why it matters for promotion/advancement, confirm domain and track in plain language, and ask one follow-up (energy level or another recent invisible task). Do not repeat raw classification jargon."
        : "",
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
          system: `${MAK_SYSTEM}\n\n${sectionSystemPrompt(chatSection, chatState, globalState)}\n\nContext:\n${contextBlock}`,
          messages,
        }),
      });
      const data = await res.json();
      response = data.content?.[0]?.text ?? demoMakReply(message, chatSection);
      if (escalation) {
        response = escalation.pauseChatbot
          ? escalation.message
          : `${escalation.message}\n\n${response}`;
      }
    } catch {
      response = demoMakReply(message, chatSection);
      if (escalation) {
        response = escalation.pauseChatbot
          ? escalation.message
          : `${escalation.message}\n\n${response}`;
      }
    }

    if (escalation?.suggestedActions?.length) {
      suggested_actions = escalation.suggestedActions.map((a) => ({
        action: a.action,
        url: a.url,
      }));
    } else {
    suggested_actions = onboarding
      ? buildOnboardingSuggestedActions()
      : chatSection === "output"
        ? [
            { action: "Update my CV", url: "/app/output" },
            { action: "Promotion report", url: "/app/output" },
          ]
        : chatSection === "plan"
          ? [{ action: "View goals", url: "/app/plan" }]
          : chatSection === "assessment"
            ? [{ action: "View Career Map", url: "/app/assessment" }]
            : annualSessionActive || quarterlySessionActive
              ? [
                  { action: "Continue to next module", url: "" },
                  { action: "Review goals", url: "/app/plan" },
                ]
              : [{ action: "Capture invisible work", url: "/app/dashboard" }];
    }
  }

  if (touchpointSubmitted) {
    response = `${response}\n\nCheck-in saved:\n${touchpointSubmitted.summary}\n\nYour dashboard and Career Data vault are updated.`;
    suggested_actions = [{ action: "View updated dashboard", url: "/app/dashboard" }];
  } else if (activityCaptured) {
    response = `${response}\n\nLogged to Career Data: "${activityCaptured.raw_text}" → ${activityCaptured.primary_domain} · ${activityCaptured.primary_track}.`;
    suggested_actions = [
      { action: "View activities", url: "/app/objective?tab=activities" },
      { action: "Capture another", url: "/app/dashboard" },
    ];
  } else if (touchpointNextPrompt) {
    response = `${response}\n\n---\n\n${touchpointNextPrompt}`;
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
    escalation: escalation
      ? {
          trigger: escalation.trigger,
          action: escalation.action,
          message: escalation.message,
          pause_chatbot: escalation.pauseChatbot ?? false,
          pause_career_coaching: escalation.pauseCareerCoaching ?? false,
        }
      : null,
    global_state: globalState,
    touchpoint_submitted: Boolean(touchpointSubmitted),
    touchpoint_summary: touchpointSubmitted?.summary ?? null,
    activity_captured: activityCaptured
      ? {
          id: activityCaptured.id,
          raw_text: activityCaptured.raw_text,
          primary_domain: activityCaptured.primary_domain,
          primary_track: activityCaptured.primary_track,
        }
      : null,
  });
}
