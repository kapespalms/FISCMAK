"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Maximize2, Minimize2, Paperclip, PanelRightClose, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-media-query";
import {
  MAK_SECTION_CONFIG,
  MAK_INPUT_PLACEHOLDER,
  makContextLabel,
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
import {
  DASHBOARD_MECE_OPTIONS,
} from "@/lib/v2/dashboard-mak-menu";
import { resolveSectionQuickAction, type SectionQuickAction } from "@/lib/v2/section-mak-routes";
import { buildGoalSettingIntro, goalSettingSuggestedActions, planMakQuickActions } from "@/lib/v2/goal-setting-mak-flow";
import { PLAN_MAK } from "@/lib/card-mak-prompts";
import { CoachMakMark } from "@/components/brand/CoachMakMark";
import { MakHexMicButton } from "@/components/brand/MakHexMicButton";

type MakPanelProps = {
  open: boolean;
  pendingFlow: {
    intent: MakFlowIntent;
    greeting: string;
    touchpoint?: import("@/components/layout/AppShell").MakFlowTouchpoint;
    goalFlow?: "set" | "modify";
    goalModifyId?: string;
  } | null;
  flowNonce: number;
  onFlowHandled: () => void;
  onClose: () => void;
  onboardingActive?: boolean;
  onOpenTour?: () => void;
  initialMessage?: string | null;
  onInitialMessageHandled?: () => void;
};

function formatMessageTime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isLastInAssistantRun(messages: MakMessage[], index: number): boolean {
  const msg = messages[index];
  if (msg.role !== "assistant") return false;
  return messages[index + 1]?.role !== "assistant";
}
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
  const { section, makInputRef, displayName, startMakFlow, focusMakInput } = useAppShell();
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
  const [activeFlowIntent, setActiveFlowIntent] = useState<MakFlowIntent | null>(null);
  const [goalFlowActive, setGoalFlowActive] = useState<"set" | "modify" | null>(null);
  const [goalModifyId, setGoalModifyId] = useState<string | null>(null);
  const [goalsConfirmed, setGoalsConfirmed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSection = useRef<AppSection | null>(null);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  function handleClose() {
    setExpanded(false);
    onClose();
  }

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
    if (section !== "plan" || isClientDemoMode()) return;
    fetch("/api/v1/goals")
      .then((r) => r.json())
      .then((d) => setGoalsConfirmed(Boolean(d.goals_confirmed)))
      .catch(() => undefined);

    const onGoalsUpdated = () => {
      fetch("/api/v1/goals")
        .then((r) => r.json())
        .then((d) => setGoalsConfirmed(Boolean(d.goals_confirmed)))
        .catch(() => undefined);
    };
    window.addEventListener("fiscmak:goals-updated", onGoalsUpdated);
    return () => window.removeEventListener("fiscmak:goals-updated", onGoalsUpdated);
  }, [section]);

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
      setSuggestedActions([]);
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
    const apiGreetingFlows = [
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
      "__board_awareness__",
      "__board_building__",
      "__grow_exploration__",
    ];
    if (apiGreetingFlows.includes(pendingFlow.greeting)) {
      setLoading(true);
      setActiveFlowIntent(pendingFlow.intent);
      fetch("/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: pendingFlow.greeting,
          context: {
            section,
            onboarding: pendingFlow.greeting === "__welcome__",
            touchpoint_number: 1,
            flow_intent: pendingFlow.intent,
          },
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
    setActiveFlowIntent(pendingFlow.intent);
    setGoalFlowActive(pendingFlow.goalFlow ?? null);
    setGoalModifyId(pendingFlow.goalModifyId ?? null);
    if (section === "plan" && pendingFlow.goalFlow === "set") {
      setSuggestedActions(goalSettingSuggestedActions(null, 0));
    } else if (section === "plan" && pendingFlow.goalFlow === "modify") {
      setSuggestedActions(goalSettingSuggestedActions(
        { mode: "modify", step_index: 1, started_at: new Date().toISOString(), modify_goal_id: pendingFlow.goalModifyId },
        1,
      ));
    } else if (section === "plan" && pendingFlow.touchpoint) {
      setSuggestedActions(planMakQuickActions(true));
    } else if (section === "plan") {
      setSuggestedActions([]);
    }
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
    const now = new Date().toISOString();
    const nextMessages: MakMessage[] = [
      ...history,
      { role: "user", content: userMsg, at: now },
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
            flow_intent: activeFlowIntent ?? undefined,
            goal_setting: goalFlowActive != null,
            goal_flow: goalFlowActive ?? undefined,
            goal_modify_id: goalModifyId ?? undefined,
          },
        }),
      });
      const data = await res.json();
      setSuggestedActions(data.suggested_actions ?? []);
      if (data.touchpoint_submitted) {
        setTouchpointMode(null);
        window.dispatchEvent(new CustomEvent("fiscmak:touchpoint-complete"));
      }
      if (data.activity_captured) {
        window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
        if (activeFlowIntent === "capture") {
          setActiveFlowIntent(null);
        }
      }
      if (data.goals_updated) {
        window.dispatchEvent(new CustomEvent("fiscmak:goals-updated"));
        if (goalFlowActive && data.goals) {
          setGoalFlowActive(null);
          setGoalModifyId(null);
          setGoalsConfirmed(true);
        }
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
          at: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I heard you. For now I'm in demo mode — add ANTHROPIC_API_KEY to enable Claude-powered Mak.",
          at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function transcribeWithWhisper(blob: Blob): Promise<string | null> {
    try {
      const form = new FormData();
      form.append("audio", blob, "capture.webm");
      const res = await fetch("/api/v1/voice/transcribe", { method: "POST", body: form });
      if (!res.ok) return null;
      const data = (await res.json()) as { text?: string };
      return data.text?.trim() || null;
    } catch {
      return null;
    }
  }

  async function recordWithWhisper(): Promise<string | null> {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      return await new Promise((resolve) => {
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          resolve(await transcribeWithWhisper(blob));
        };
        recorder.onerror = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(null);
        };
        setRecording(true);
        recorder.start();
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
          setRecording(false);
        }, 5000);
      });
    } catch {
      return null;
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

    void (async () => {
      const whisperText = await recordWithWhisper();
      if (whisperText) {
        void sendMessage(whisperText);
        return;
      }

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
    })();
  }

  function applySectionQuickAction(action: SectionQuickAction) {
    startMakFlow(
      action.intent,
      action.href,
      action.message,
      action.touchpoint,
    );
    if (action.href && action.href !== "/app/dashboard") {
      router.push(action.href);
    }
    if (action.focusInput) {
      focusMakInput();
    }
  }

  function handleDashboardMeceOption(option: (typeof DASHBOARD_MECE_OPTIONS)[number]) {
    applySectionQuickAction({
      intent: option.intent,
      message: option.message,
      href: option.href,
      focusInput: option.focusInput,
    });
  }

  function startPlanGoalSetup() {
    setGoalFlowActive("set");
    setGoalModifyId(null);
    setTouchpointMode(null);
    setActiveFlowIntent("plan");
    const intro = buildGoalSettingIntro();
    setMessages(resetConversationGreeting(section, intro));
    setSuggestedActions(goalSettingSuggestedActions(null, 0));
  }

  function startPlanReview(quarterly: boolean) {
    startMakFlow(
      "plan",
      undefined,
      quarterly
        ? "Let's review milestone progress on your three career goals this quarter."
        : "Let's review your annual goals and reset for the year ahead.",
      quarterly ? "quarterly" : "annual",
      undefined,
      undefined,
      quarterly ? PLAN_MAK.review.autoMessage : "Begin annual goal review.",
    );
  }

  function handleQuickOptionClick(label: string, url = "") {
    if (url === "#tour" || label.includes("Lay of the Land")) {
      onOpenTour?.();
      return;
    }
    if (url && url.startsWith("/")) {
      router.push(url);
      return;
    }
    if (section === "plan") {
      if (
        label === "Set up with Mak" ||
        label === "Set goals with Mak" ||
        label === "Begin Development Goal"
      ) {
        startPlanGoalSetup();
        if (label === "Begin Development Goal") {
          void sendMessage(label);
        }
        return;
      }
      if (
        label === "Review with Mak" ||
        label === "Review goal progress" ||
        label === "Begin quarterly review"
      ) {
        startPlanReview(true);
        return;
      }
      if (label === "Edit in template") {
        router.push("/app/plan");
        return;
      }
    }
    const routed = resolveSectionQuickAction(section, label);
    if (routed) {
      applySectionQuickAction(routed);
      return;
    }
    void sendMessage(label);
  }

  const planQuickActions =
    section === "plan"
      ? suggestedActions.length > 0
        ? suggestedActions
        : goalFlowActive
          ? goalSettingSuggestedActions(null, 0)
          : planMakQuickActions(goalsConfirmed)
      : [];

  const quickActionItems =
    section === "dashboard"
      ? DASHBOARD_MECE_OPTIONS.map((o) => ({
          key: o.id,
          label: o.label,
          onClick: () => handleDashboardMeceOption(o),
        }))
      : section === "plan"
        ? planQuickActions.map((item) => ({
            key: item.action,
            label: item.action,
            onClick: () => handleQuickOptionClick(item.action, item.url),
          }))
        : suggestedActions.length > 0
          ? suggestedActions.map((item) => ({
              key: item.action,
              label: item.action,
              onClick: () => handleQuickOptionClick(item.action, item.url),
            }))
          : config.quickOptions.map((label) => ({
              key: label,
              label,
              onClick: () => handleQuickOptionClick(label),
            }));

  const makQuickPillClass =
    "cx-forest-pill disabled:opacity-50";

  return (
    <>
      {open && isMobile && !expanded && (
        <button
          type="button"
          className="fixed inset-y-0 right-0 z-40 bg-black/40 md:hidden"
          style={{ left: "min(calc(3.5rem + 320px), 100vw)" }}
          aria-label="Close Coach Mak"
          onClick={handleClose}
        />
      )}
      {open && expanded && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40"
          aria-label="Close Coach Mak"
          onClick={handleClose}
        />
      )}
      <aside
        className={cn(
          "cx-mak-panel flex shrink-0 flex-col overflow-hidden border-r transition-[width,transform] duration-200 ease-in-out",
          expanded
            ? cn(
                "fixed inset-0 z-50 w-full border-r-0 shadow-2xl",
                open ? "translate-x-0" : "pointer-events-none translate-x-full",
              )
            : isMobile
              ? cn(
                  "fixed left-14 top-0 z-50 h-full w-[320px] max-w-[calc(100vw-3.5rem)]",
                  open ? "translate-x-0" : "pointer-events-none -translate-x-full",
                )
              : cn(
                  "relative h-full border-l border-white/10",
                  open ? "w-[320px]" : "pointer-events-none w-0 border-l-0",
                ),
        )}
        aria-hidden={!open}
      >
        <div className={cn("flex h-full flex-col", !expanded && !isMobile && "min-w-[320px]", expanded && "min-w-0")}>
          <header className="cx-mak-panel-header shrink-0 border-b border-white/10">
            <div className="flex h-14 items-center justify-between gap-2 px-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-1 ring-1 ring-white/15">
                  <CoachMakMark size={28} />
                </div>
                <p className="truncate text-base font-semibold text-white">Coach Mak</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="cx-mak-panel-icon-btn flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                  aria-label={expanded ? "Exit full screen" : "Full screen"}
                  title={expanded ? "Exit full screen" : "Full screen"}
                >
                  {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="cx-mak-panel-icon-btn flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                  aria-label="Close Coach Mak"
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="cx-mak-panel-icon-btn flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                  aria-label="Collapse Coach Mak panel"
                >
                  <PanelRightClose size={18} />
                </button>
              </div>
            </div>
            <p className="cx-mak-panel-context text-center text-xs">
              {makContextLabel(section)}
            </p>
          </header>

        <div
          ref={scrollRef}
          className="cx-mak-panel-chat flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
        {activeEscalation && (
          <EscalationResourcesPanel
            escalation={activeEscalation}
            preferOhio={activeEscalation.preferOhioResources}
          />
        )}
        {messages.map((msg, i) => {
          const showAvatar =
            msg.role === "assistant" && messages[i - 1]?.role !== "assistant";
          const showTimestamp = isLastInAssistantRun(messages, i);

          if (msg.role === "assistant") {
            return (
              <div key={`${i}-${msg.content.slice(0, 12)}`} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  {showAvatar ? (
                    <div className="mt-0.5 shrink-0">
                      <CoachMakMark size={28} />
                    </div>
                  ) : (
                    <div className="w-7 shrink-0" aria-hidden />
                  )}
                  <div className="max-w-[calc(100%-2.25rem)] whitespace-pre-line rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm leading-relaxed text-cx-forest-dark shadow-sm">
                    {msg.content}
                  </div>
                </div>
                {showTimestamp && (
                  <p className="ml-9 font-mono text-[11px] tracking-wide text-white/65">
                    {formatMessageTime(msg.at)}
                  </p>
                )}
              </div>
            );
          }

          return (
            <div key={`${i}-${msg.content.slice(0, 12)}`} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-line rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-sm leading-relaxed text-cx-forest-dark">
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-2.5">
            <CoachMakMark size={28} />
            <p className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-cx-forest-dark/70 shadow-sm">
              Mak is thinking…
            </p>
          </div>
        )}
        </div>

        <div className="cx-mak-panel-footer shrink-0 border-t px-3 py-3">
        {quickActionItems.length > 0 && (
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {quickActionItems.slice(0, 6).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                disabled={loading}
                className={makQuickPillClass}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/app/objective?tab=documents&upload=1")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Attach document"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/app/objective?tab=vault")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Career data vault"
          >
            <Briefcase size={18} />
          </button>
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
            placeholder={MAK_INPUT_PLACEHOLDER}
            disabled={loading || recording}
            className="cx-mak-panel-input h-11 min-h-11 flex-1 border-0 bg-transparent px-1 text-sm focus:outline-none"
            aria-label="Message to Coach Mak"
          />
          <MakHexMicButton
            recording={recording}
            disabled={loading}
            onClick={() => {
              if (input.trim()) {
                void sendMessage(input);
              } else {
                handleVoice();
              }
            }}
          />
        </div>
        </div>
        </div>
      </aside>
    </>
  );
}
