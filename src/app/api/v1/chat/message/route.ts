import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
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
import { onboardingPathFromMetadata } from "@/lib/v2/onboarding-path";
import { buildProgramMakContext } from "@/lib/v2/programs/registry";
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
import {
  buildGoalSettingMakSystemContext,
  getGoalSettingSession,
  initGoalSettingSession,
  processGoalSettingTurn,
  type GoalSettingTurnResult,
} from "@/lib/v2/goal-setting-mak-flow";
import { processAnnualMakTurn, processQuarterlyMakTurn } from "@/lib/v2/touchpoint-mak-orchestrator";
import type { TouchpointSubmitResult } from "@/lib/v2/touchpoint-submit";
import { touchpointsEligible } from "@/lib/v2/touchpoint-eligibility";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { buildMakInternalCoachingBundle } from "@/lib/v2/mak-coaching-engine";
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
import { shouldCaptureActivityMessage } from "@/lib/v2/activity-capture";
import {
  classifyChatMessage,
  persistClassificationActivity,
  type ChatClassification,
} from "@/lib/v2/classify-chat-message";
import { hasActiveSubscription, isStripeConfigured } from "@/lib/v2/stripe-config";
import type { ActivityEntry } from "@/lib/types/database";
import type { AppSection, MakFlowIntent } from "@/lib/mak-sections";
import {
  buildConversationModelContext,
  buildMakSystemPrompt,
  buildNarrativeAnchorIntro,
  buildStageAwareCapturePrompt,
} from "@/lib/v2/mak-conversation-models";
import {
  buildAttendingQuarterlyIntro,
  buildPromotionContextIntro,
  buildPromotionReadinessIntro,
} from "@/lib/v2/mak-conversation-models";
import {
  buildRotationDebriefIntro,
  initNarrativeAnchorSession,
  initRotationDebriefSession,
  processNarrativeAnchorTurn,
  processRotationDebriefTurn,
} from "@/lib/v2/rotation-debrief-mak-flow";
import {
  buildAttendingQuarterlyMakSystemContext,
  buildPromotionContextMakSystemContext,
  buildPromotionReadinessMakSystemContext,
  initAttendingQuarterlySession,
  initImpactTranslationSession,
  initPromotionContextSession,
  processAttendingQuarterlyTurn,
  processImpactTranslationTurn,
  processPromotionContextTurn,
} from "@/lib/v2/early-attending-mak-flow";
import {
  buildCareerPivotMakSystemContext,
  buildCareerTranslationFollowUp,
  buildPivotQuarterlyMakSystemContext,
  initCareerPivotSession,
  initCareerTranslationSession,
  initIdentityNavigationSession,
  initPivotQuarterlySession,
  processCareerPivotTurn,
  processCareerTranslationTurn,
  processIdentityNavigationTurn,
  processPivotQuarterlyTurn,
} from "@/lib/v2/non-traditional-career-mak-flow";
import { buildCareerPivotIntro } from "@/lib/v2/non-traditional-career-models";

const API_GREETING_TOKENS = new Set([
  "__welcome__",
  "__rotation_debrief__",
  "__narrative_anchor__",
  "__promotion_context__",
  "__attending_quarterly__",
  "__attending_deep_reflection__",
  "__promotion_readiness__",
  "__career_pivot_onboarding__",
  "__pivot_quarterly__",
  "__identity_navigation__",
]);

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

  const goalModifyId =
    typeof context?.goal_modify_id === "string" ? context.goal_modify_id : undefined;
  const goalSettingRequested =
    context?.goal_setting === true || context?.goal_flow === "set" || context?.goal_flow === "modify";
  let goalSettingActive = Boolean(
    activeMeta.goal_setting_session || goalSettingRequested,
  );

  if (
    user &&
    goalSettingRequested &&
    !activeMeta.goal_setting_session &&
    message !== "__welcome__"
  ) {
    activeMeta = initGoalSettingSession(
      activeMeta,
      context?.goal_flow === "modify" || goalModifyId ? "modify" : "initial",
      goalModifyId,
    );
    goalSettingActive = true;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  const flowIntent = (context?.flow_intent as MakFlowIntent | undefined) ?? null;
  const rotationName =
    typeof context?.rotation_name === "string" ? context.rotation_name : undefined;

  if (
    user &&
    flowIntent === "rotation_debrief" &&
    !activeMeta.rotation_debrief_session &&
    message !== "__welcome__" &&
    message !== "__rotation_debrief__"
  ) {
    activeMeta = initRotationDebriefSession(activeMeta, rotationName);
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  if (
    user &&
    flowIntent === "narrative_anchor" &&
    !activeMeta.narrative_anchor_session &&
    message !== "__welcome__" &&
    message !== "__narrative_anchor__"
  ) {
    activeMeta = initNarrativeAnchorSession(activeMeta);
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  let debriefTurn: { response: string; suggested_actions: { action: string; url: string }[]; meta: typeof activeMeta; complete: boolean } | null = null;

  if (
    user &&
    message &&
    message !== "__welcome__" &&
    message !== "__rotation_debrief__" &&
    message !== "__narrative_anchor__" &&
    flowIntent === "rotation_debrief" &&
    activeMeta.rotation_debrief_session
  ) {
    const turn = processRotationDebriefTurn({
      message,
      meta: activeMeta,
      careerStage: user.career_stage,
    });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    message !== "__welcome__" &&
    message !== "__narrative_anchor__" &&
    flowIntent === "narrative_anchor" &&
    activeMeta.narrative_anchor_session
  ) {
    const turn = processNarrativeAnchorTurn({
      message,
      meta: activeMeta,
      careerStage: user.career_stage,
    });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  if (
    user &&
    flowIntent === "promotion_context" &&
    !activeMeta.promotion_context_session &&
    message &&
    !API_GREETING_TOKENS.has(message)
  ) {
    activeMeta = initPromotionContextSession(activeMeta);
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  if (
    user &&
    (flowIntent === "attending_quarterly" || flowIntent === "attending_deep_reflection") &&
    !activeMeta.attending_quarterly_session &&
    message &&
    !API_GREETING_TOKENS.has(message)
  ) {
    activeMeta = initAttendingQuarterlySession(
      activeMeta,
      flowIntent === "attending_deep_reflection",
    );
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "promotion_context" &&
    activeMeta.promotion_context_session
  ) {
    const turn = processPromotionContextTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    (flowIntent === "attending_quarterly" || flowIntent === "attending_deep_reflection") &&
    activeMeta.attending_quarterly_session
  ) {
    const turn = processAttendingQuarterlyTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "impact_translation" &&
    activeMeta.impact_translation_session
  ) {
    const turn = processImpactTranslationTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "impact_translation" &&
    !activeMeta.impact_translation_session
  ) {
    activeMeta = initImpactTranslationSession(activeMeta, message);
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    flowIntent === "career_pivot_onboarding" &&
    !activeMeta.career_pivot_session &&
    message &&
    !API_GREETING_TOKENS.has(message)
  ) {
    activeMeta = initCareerPivotSession(activeMeta);
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
    const turn = processCareerPivotTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "career_pivot_onboarding" &&
    activeMeta.career_pivot_session
  ) {
    const turn = processCareerPivotTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    flowIntent === "pivot_quarterly" &&
    !activeMeta.pivot_quarterly_session &&
    message &&
    !API_GREETING_TOKENS.has(message)
  ) {
    activeMeta = initPivotQuarterlySession(
      activeMeta,
      activeMeta.career_pivot_context?.target_path ?? "exploring",
    );
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
    const turn = processPivotQuarterlyTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "pivot_quarterly" &&
    activeMeta.pivot_quarterly_session
  ) {
    const turn = processPivotQuarterlyTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    flowIntent === "identity_navigation" &&
    !activeMeta.identity_navigation_session &&
    message &&
    !API_GREETING_TOKENS.has(message)
  ) {
    activeMeta = initIdentityNavigationSession(activeMeta);
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
    const turn = processIdentityNavigationTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "identity_navigation" &&
    activeMeta.identity_navigation_session
  ) {
    const turn = processIdentityNavigationTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "career_translation" &&
    activeMeta.career_translation_session
  ) {
    const turn = processCareerTranslationTurn({ message, meta: activeMeta });
    debriefTurn = turn;
    activeMeta = turn.meta;
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  } else if (
    user &&
    message &&
    !API_GREETING_TOKENS.has(message) &&
    flowIntent === "career_translation" &&
    !activeMeta.career_translation_session
  ) {
    activeMeta = initCareerTranslationSession(activeMeta, message);
    const path = activeMeta.career_pivot_context?.target_path ?? "industry_pharma";
    debriefTurn = {
      meta: activeMeta,
      response: buildCareerTranslationFollowUp(message, path),
      suggested_actions: [],
      complete: false,
    };
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: activeMeta as Record<string, unknown> },
      auth.demo,
    );
  }

  let goalSettingTurn: GoalSettingTurnResult | null = null;

  if (user && message && message !== "__welcome__" && goalSettingActive) {
    goalSettingTurn = processGoalSettingTurn({ message, meta: activeMeta });
    activeMeta = goalSettingTurn.meta;
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

  let activityCaptured: ActivityEntry | null = null;
  let chatClassification: ChatClassification | null = null;

  const supabaseClient =
    !auth.demo && isSupabaseConfigured() ? await createClient() : null;
  const isPremium = supabaseClient
    ? await hasActiveSubscription(supabaseClient, auth.userId)
    : false;

  if (
    user?.tier3_complete &&
    message &&
    message !== "__welcome__" &&
    shouldCaptureActivityMessage(message, flowIntent)
  ) {
    try {
      if (supabaseClient) {
        chatClassification = await classifyChatMessage(supabaseClient, isPremium, {
          userId: auth.userId,
          rawText: message,
          userSpecialty: user.specialty,
          userRole: user.career_stage,
        });
        await persistClassificationActivity(
          supabaseClient,
          chatClassification.activity_entry,
        );
        activityCaptured = {
          id: crypto.randomUUID(),
          user_id: auth.userId,
          created_at: new Date().toISOString(),
          activity_date: new Date().toISOString().slice(0, 10),
          raw_text: message.trim(),
          input_source: "mak_capture",
          energy_valence: null,
          primary_domain: chatClassification.activity_key ?? null,
          primary_track: chatClassification.detected_signals[0] ?? null,
          primary_domain_confidence: 0.7,
          primary_track_confidence: 0.7,
          scope: null,
          evidence_strength: null,
          confidence_score: 0.7,
        };
      }
    } catch (e) {
      console.error("Mak activity classification failed:", e);
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
    goalSettingMode: Boolean(getGoalSettingSession(activeMeta)),
    goalModify: context?.goal_flow === "modify",
    flowIntent,
    careerStage: user?.career_stage,
    outputFlow:
      flowIntent === "personal_statement_arc" || flowIntent === "promotion_dossier"
        ? "personal_statement"
        : flowIntent === "pivot_narrative"
          ? "cover_letter"
          : undefined,
  });

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  let response: string;
  let suggested_actions: { action: string; url: string }[] = [];
  let upgrade_prompt: string | null = null;

  if (message === "__rotation_debrief__" && user) {
    if (!activeMeta.rotation_debrief_session) {
      activeMeta = initRotationDebriefSession(activeMeta, rotationName);
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    response = buildRotationDebriefIntro(rotationName ?? activeMeta.rotation_debrief_session?.rotation_name);
    suggested_actions = [{ action: "Set narrative anchor first", url: "/app/subjective" }];
  } else if (message === "__narrative_anchor__" && user) {
    if (!activeMeta.narrative_anchor_session) {
      activeMeta = initNarrativeAnchorSession(activeMeta);
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    response = buildNarrativeAnchorIntro(user.career_stage);
    suggested_actions = [];
  } else if (message === "__promotion_context__" && user) {
    if (!activeMeta.promotion_context_session) {
      activeMeta = initPromotionContextSession(activeMeta);
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    response = buildPromotionContextIntro();
    suggested_actions = [];
  } else if (message === "__attending_quarterly__" && user) {
    if (!activeMeta.attending_quarterly_session) {
      activeMeta = initAttendingQuarterlySession(activeMeta, false);
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    response = buildAttendingQuarterlyIntro(false);
    suggested_actions = [{ action: "Deep year-end reflection", url: "/app/subjective" }];
  } else if (message === "__attending_deep_reflection__" && user) {
    if (!activeMeta.attending_quarterly_session) {
      activeMeta = initAttendingQuarterlySession(activeMeta, true);
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    response = buildAttendingQuarterlyIntro(true);
    suggested_actions = [];
  } else if (message === "__promotion_readiness__" && user) {
    response = buildPromotionReadinessIntro();
    suggested_actions = [
      { action: "Set promotion context", url: "/app/profile" },
      { action: "Open promotion narrative", url: "/app/output" },
    ];
  } else if (message === "__career_pivot_onboarding__" && user) {
    if (!activeMeta.career_pivot_session) {
      activeMeta = initCareerPivotSession(activeMeta);
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    response = buildCareerPivotIntro();
    suggested_actions = [{ action: "Identity navigation", url: "/app/subjective" }];
  } else if (message === "__pivot_quarterly__" && user) {
    if (!activeMeta.pivot_quarterly_session) {
      activeMeta = initPivotQuarterlySession(
        activeMeta,
        activeMeta.career_pivot_context?.target_path ?? "exploring",
      );
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    const turn = processPivotQuarterlyTurn({ message: "", meta: activeMeta });
    response = turn.response;
    suggested_actions = turn.suggested_actions;
  } else if (message === "__identity_navigation__" && user) {
    if (!activeMeta.identity_navigation_session) {
      activeMeta = initIdentityNavigationSession(activeMeta);
      await upsertAppUser(
        auth.userId,
        auth.email,
        { onboarding_metadata: activeMeta as Record<string, unknown> },
        auth.demo,
      );
    }
    const turn = processIdentityNavigationTurn({ message: "", meta: activeMeta });
    response = turn.response;
    suggested_actions = turn.suggested_actions;
  } else if (message === "__welcome__" && user) {
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
  } else if (debriefTurn) {
    response = debriefTurn.response;
    suggested_actions = debriefTurn.suggested_actions;
  } else if (goalSettingTurn) {
    response = goalSettingTurn.response;
    suggested_actions = goalSettingTurn.suggested_actions;
  } else if (!apiKey || !isPremium) {
    if (chatClassification?.mak_response) {
      response = chatClassification.mak_response;
    } else if (message && message !== "__welcome__" && flowIntent === "capture" && supabaseClient) {
      chatClassification = await classifyChatMessage(supabaseClient, isPremium, {
        userId: auth.userId,
        rawText: message,
        userSpecialty: user?.specialty,
        userRole: user?.career_stage,
      });
      await persistClassificationActivity(supabaseClient, chatClassification.activity_entry);
      response = chatClassification.mak_response;
    } else {
      response = demoMakReply(message, chatSection);
    }
    if (!isPremium && isStripeConfigured()) {
      upgrade_prompt = "Upgrade to Premium for AI-powered coaching with Mak ($9/month).";
      suggested_actions = [{ action: "Upgrade to Premium", url: "/app/settings" }];
    }
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
        response += `\n\nYour dashboard is ready — open Perspective and Insights to continue with Coach Mak.`;
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
    const debriefSummary =
      activeMeta.rotation_debrief_entries?.length
        ? `Rotation debriefs on file: ${activeMeta.rotation_debrief_entries
            .slice(-3)
            .map((e) => `${e.rotation_name}${e.theme_tags?.length ? ` (${e.theme_tags.join(", ")})` : ""}`)
            .join("; ")}`
        : "";

    const pivotActive = Boolean(
      activeMeta.career_pivot_context?.target_path ||
        flowIntent?.startsWith("career_") ||
        flowIntent?.startsWith("pivot_") ||
        flowIntent === "identity_navigation",
    );
    const pathCtx = onboardingPathFromMetadata(activeMeta);
    const programMakContext = pathCtx?.program
      ? buildProgramMakContext({
          program: pathCtx.program,
          trainee_initials: activeMeta.trainee_initials ?? null,
          current_rotation: user?.current_rotation,
          pgy_level: user?.pgy_level,
        })
      : "";

    const contextBlock = [
      user ? `Physician: ${user.name}, ${user.specialty}, ${user.career_stage}` : "",
      buildConversationModelContext({
        careerStage: user?.career_stage,
        specialty: user?.specialty,
        baseSpecialty: user?.base_specialty,
        subspecialty: user?.subspecialty,
        specialtyOrigin: user?.specialty_origin,
        pgyLevel: user?.pgy_level,
        currentRotation: user?.current_rotation,
        practiceSetting: user?.practice_setting,
        flowIntent,
        narrativeAnchor: activeMeta.narrative_anchor,
        promotionContext: activeMeta.promotion_context,
        careerPivotContext: activeMeta.career_pivot_context,
        rotationName: activeMeta.rotation_debrief_session?.rotation_name ?? rotationName,
        debriefLayer: activeMeta.rotation_debrief_session?.layer,
      }),
      debriefSummary,
      activeMeta.promotion_context_session
        ? buildPromotionContextMakSystemContext(activeMeta)
        : "",
      activeMeta.career_pivot_session
        ? buildCareerPivotMakSystemContext(activeMeta)
        : "",
      activeMeta.pivot_quarterly_session
        ? buildPivotQuarterlyMakSystemContext(activeMeta)
        : "",
      activeMeta.attending_quarterly_session
        ? buildAttendingQuarterlyMakSystemContext(activeMeta)
        : "",
      flowIntent === "promotion_readiness"
        ? buildPromotionReadinessMakSystemContext(activeMeta)
        : "",
      activeMeta.impact_translations?.length
        ? `Impact translations: ${activeMeta.impact_translations
            .slice(-3)
            .map((e) => e.impact_narrative)
            .join(" | ")}`
        : "",
      activeMeta.pivot_translations?.length
        ? `Pivot translations: ${activeMeta.pivot_translations
            .slice(-3)
            .map((e) => `${e.clinical_experience} → ${e.translated_framing}`)
            .join(" | ")}`
        : "",
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
      buildMakInternalCoachingBundle(cvDoc?.extracted_text, refreshedAssessments, activeMeta)
        .context_block,
      annualSessionActive ? buildAnnualMakSystemContext(activeMeta) : "",
      quarterlySessionActive ? buildQuarterlyMakSystemContext(activeMeta) : "",
      getGoalSettingSession(activeMeta)
        ? buildGoalSettingMakSystemContext(activeMeta)
        : "",
      globalState === "ONBOARDRECONCILE" ? buildReconcileMakSystemContext(activeMeta) : "",
      flowIntent === "capture"
        ? buildStageAwareCapturePrompt(user?.career_stage, user?.practice_setting, pivotActive)
        : "",
      user ? buildConversationalPrompt(user, pendingTp1, onboarding) : "",
    ]
      .filter(Boolean)
      .join("\n");

    const makSystem = buildMakSystemPrompt(
      user?.career_stage,
      user?.practice_setting,
      pivotActive,
    );

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
          system: `${makSystem}\n\n${sectionSystemPrompt(chatSection, chatState, globalState, user?.career_stage)}\n\nContext:\n${contextBlock}`,
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
    const supabase = supabaseClient ?? (await createClient());
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
    goals_updated: Boolean(
      goalSettingTurn?.completed ||
        goalSettingTurn?.goals?.length ||
        goalSettingTurn?.meta.stored_goals?.length,
    ),
    goals: goalSettingTurn?.goals ?? null,
    tier: isPremium ? "premium" : "free",
    upgrade_prompt,
    analysis: chatClassification
      ? {
          detected_signals: chatClassification.detected_signals,
          activity_type: chatClassification.activity_key,
          development_level: chatClassification.development_level,
        }
      : null,
  });
}
