"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";
import { MAK_DISPLAY_NAME } from "@/lib/brand-assets";
import { MakHexMicButton } from "@/components/brand/MakHexMicButton";
import { MakAssistantBubble, MakUserBubble } from "@/components/mak/MakMessageBubble";
import { MakMiniChatPreview } from "@/components/marketing/MakMiniChatPreview";
import { MAK_INPUT_PLACEHOLDER } from "@/lib/mak-sections";
import { cn } from "@/lib/utils";

type GuideTopic = "mak" | "flow" | "name" | null;

type Message =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "mak"; text: ReactNode };

const MAK_REPLY_DELAY_MS = 420;

const TOPIC_OPTIONS = [
  { id: "mak" as const, label: "Who is Mak?" },
  { id: "flow" as const, label: "Show how FISCMAK works" },
  { id: "name" as const, label: "What's a FISCMAK?" },
];

function InfoCard({
  label,
  labelClass,
  children,
}: {
  label: string;
  labelClass?: string;
  children: ReactNode;
}) {
  return (
    <div className="landing-mak-info-card rounded-lg border border-white/10 bg-cx-forest-dark p-3">
      <p
        className={cn(
          "font-mono text-[10px] uppercase tracking-wider text-white/75",
          labelClass,
        )}
      >
        {label}
      </p>
      <div className="mt-1.5 font-futura-medium text-xs leading-relaxed text-white">
        {children}
      </div>
    </div>
  );
}

function PageLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="landing-mak-page-link-btn font-futura-bold shrink-0 self-center rounded-md border border-marketing-accent bg-[#1a2419] px-5 py-2.5 text-sm text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition hover:bg-[#243028]"
    >
      {children}
    </Link>
  );
}

function CardsWithLink({
  children,
  href,
  linkLabel,
}: {
  children: ReactNode;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col items-end gap-2.5 sm:flex-row sm:items-center">
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3">{children}</div>
      <PageLinkButton href={href}>{linkLabel}</PageLinkButton>
    </div>
  );
}

const messageBody = "font-futura-medium text-sm leading-relaxed text-cx-forest-dark";
const messageLead = "font-futura-medium text-sm leading-relaxed text-cx-forest-dark";

function MakOverview() {
  return (
    <div className={`space-y-3 ${messageBody}`}>
      <p className={messageLead}>Great question!</p>
      <p>
        I remember context, ask the questions that recognize your hidden work, weigh major career
        decisions, and empower you to build the career you want.
      </p>
      <CardsWithLink href="/meet-mak" linkLabel="Meet Mak">
        <InfoCard label="You bring">
          <ul className="space-y-0.5">
            <li>Your expertise &amp; instincts</li>
            <li>Goals, doubts, real situations</li>
            <li>Decisions — always yours</li>
          </ul>
        </InfoCard>
        <InfoCard label="Mak returns">
          <ul className="space-y-0.5">
            <li>Structured capture &amp; reflection</li>
            <li>Promotion &amp; mentorship prep</li>
            <li>Direction when the path is unclear</li>
          </ul>
        </InfoCard>
        <MakMiniChatPreview />
      </CardsWithLink>
    </div>
  );
}

function FlowOverview() {
  return (
    <div className={`space-y-3 ${messageBody}`}>
      <p className={messageLead}>Capture → Map → Build → Claim.</p>
      <p>
        Discuss or upload CVs, dossiers, and work that shows up when you&apos;re up for review. Chat
        about goals and major career moves. FISCMAK will map to a career lattice composed of career
        tracks, skills, and tasks every physician completes.
      </p>
      <p>
        FISCMAK finds patterns in your arc, turns evidence into narrative, and helps you claim the
        career direction you&apos;ve been building.
      </p>
      <CardsWithLink href="/how-it-works" linkLabel="How It Works">
        <InfoCard label="Major inputs">
          <ul className="space-y-0.5">
            <li>CVs, dossiers, review materials</li>
            <li>Goals &amp; major career moves</li>
            <li>Everyday clinical &amp; admin work</li>
          </ul>
        </InfoCard>
        <InfoCard label="Career lattice">
          <ul className="space-y-0.5">
            <li>Career tracks &amp; skills</li>
            <li>Tasks physicians complete</li>
            <li>Patterns across your arc</li>
          </ul>
        </InfoCard>
        <InfoCard label="Major outputs">
          <ul className="space-y-0.5">
            <li>Career evidence &amp; narrative</li>
            <li>Promotion-ready portfolio</li>
            <li>Direction you can claim</li>
          </ul>
        </InfoCard>
      </CardsWithLink>
    </div>
  );
}

function NameOverview() {
  return (
    <div className={`space-y-3 ${messageBody}`}>
      <p className={messageLead}>Pronounced [FIZZ-MAK]</p>
      <div className="space-y-1">
        <p>Standard grammar rules? Yes, we should say FISK-MAK.</p>
        <p>We were too busy illuminating the C in your career.</p>
      </div>
      <p>
        <span className="text-cx-forest-dark">FISC</span> (fiscus) — the hidden treasury of
        expertise, dedication, and time.
      </p>
      <p>
        <span className="text-cx-forest-dark">Silent C</span> — the invisible work that never makes
        the CV.
      </p>
      <p>
        <span className="text-cx-forest-dark">MAK</span> (mahk) — maximus: professional agency,
        fully realized.
      </p>
      <div className="flex flex-col items-end gap-2.5 sm:flex-row sm:items-center">
        <InfoCard label="What you get">
          <p>
            A system that captures what institutions miss, synthesizes personal insight, and restores
            structural leverage to your career.
          </p>
        </InfoCard>
        <PageLinkButton href="/our-narrative">Our Narrative</PageLinkButton>
      </div>
    </div>
  );
}

function topicContent(topic: GuideTopic): React.ReactNode {
  if (topic === "flow") return <FlowOverview />;
  if (topic === "mak") return <MakOverview />;
  if (topic === "name") return <NameOverview />;
  return null;
}

type LandingMakConsoleProps = {
  visible: boolean;
  className?: string;
};

export function LandingMakConsole({ visible, className }: LandingMakConsoleProps) {
  const [activeTopic, setActiveTopic] = useState<GuideTopic>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom(chatScrollRef.current);
  }, [messages.length, scrollToBottom]);

  const selectTopic = useCallback((topic: GuideTopic, label: string) => {
    setActiveTopic(topic);
    const content = topicContent(topic);
    if (!content) return;

    const ts = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `user-${topic}-${ts}`, role: "user", text: label },
    ]);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `mak-${topic}-${ts}`, role: "mak", text: content },
      ]);
    }, MAK_REPLY_DELAY_MS);
  }, []);

  return (
    <div
      className={cn(
        "landing-mak-console cx-mak-panel flex flex-col overflow-hidden bg-[#0a0c10] transition-all duration-700 ease-out",
        visible ? "max-h-[2400px] opacity-100" : "max-h-0 opacity-0",
        className,
      )}
      aria-hidden={!visible}
    >
      <header className="landing-mak-panel-header shrink-0 border-b border-zinc-800/80 bg-gradient-to-b from-[#1a1f28] to-[#0a0c10]">
        <div className="flex h-12 items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <CoachMakAvatar size={36} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-white">{MAK_DISPLAY_NAME}</p>
              <p className="truncate text-[10px] text-white/50">Your co-pilot on the journey</p>
            </div>
          </div>
          <Link
            href="/login?next=%2Fapp%2Fonboarding"
            className="font-futura-bold cx-btn shrink-0 bg-marketing-accent px-4 py-2 text-xs text-black transition hover:bg-white sm:text-sm"
          >
            Start Building
          </Link>
        </div>
      </header>

      <div className="landing-mak-panel-body flex min-h-[min(68vh,480px)] flex-1 bg-[#0a0c10]">
        <div className="landing-mak-panel-rail w-3 shrink-0 border-r border-zinc-800/80 sm:w-5" aria-hidden />

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="h-2 shrink-0 bg-gradient-to-b from-[#0a0c10] to-[#fafbfa]"
            aria-hidden
          />

          <div
            ref={chatScrollRef}
            className="landing-mak-panel-chat cx-mak-panel-chat flex flex-1 flex-col space-y-4 overflow-y-auto bg-[#fafbfa] px-3 py-4 sm:px-4"
          >
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex justify-end mak-convo-fade-in">
              <MakUserBubble variant="app" className="max-w-[88%] font-futura-medium text-sm">
                {msg.text}
              </MakUserBubble>
            </div>
          ) : (
            <div key={msg.id} className="flex gap-3 mak-convo-fade-in">
              <CoachMakAvatar size={32} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <MakAssistantBubble variant="app" className="landing-mak-bubble w-fit max-w-[95%]">
                  {msg.text}
                </MakAssistantBubble>
              </div>
            </div>
          ),
        )}

        <div className="flex gap-3">
          <CoachMakAvatar size={32} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <MakAssistantBubble variant="app" className="landing-mak-bubble w-fit max-w-full">
              <p className="font-futura-medium text-sm leading-relaxed">
                Hi — I&apos;m <span className="text-cx-forest-dark">Mak</span>. I&apos;m the co-pilot
                on your journey through medicine.
              </p>
              <p className="mt-2 font-futura-medium text-sm opacity-80">
                Choose an option below:
              </p>
              <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto">
                {TOPIC_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    data-no-glass
                    onClick={() => selectTopic(opt.id, opt.label)}
                    disabled={!visible}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 font-futura-bold text-[11px] uppercase tracking-wide transition sm:text-xs",
                      activeTopic === opt.id
                        ? "border-cx-forest-dark bg-cx-forest-dark text-white shadow-sm"
                        : "border-cx-forest-dark/20 bg-white text-cx-forest-dark shadow-sm hover:border-cx-forest-dark/35 hover:bg-[#eef0ee]",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[9px]",
                        activeTopic === opt.id ? "text-white/60" : "text-cx-forest-dark/45",
                      )}
                    >
                      &gt;
                    </span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </MakAssistantBubble>
          </div>
        </div>
          </div>
        </div>

        <div className="landing-mak-panel-rail w-3 shrink-0 border-l border-zinc-800/80 sm:w-5" aria-hidden />
      </div>

      <div className="landing-mak-panel-footer cx-mak-panel-footer shrink-0 border-t border-zinc-800/80 bg-[#0a0c10] px-3 py-2.5">
        <div className="flex items-end gap-2">
          <button
            type="button"
            disabled
            data-no-glass
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#e8eaec] text-cx-forest-dark opacity-50"
          >
            <Plus size={16} />
          </button>
          <input
            readOnly
            disabled
            value=""
            placeholder={MAK_INPUT_PLACEHOLDER}
            className="cx-mak-panel-input h-9 min-h-9 flex-1 rounded-[20px] border border-cx-forest-dark/10 bg-white px-3 text-xs text-cx-forest-dark shadow-sm opacity-70 sm:h-10 sm:min-h-10 sm:px-4 sm:text-sm"
            aria-label={`Message to ${MAK_DISPLAY_NAME}`}
          />
          <MakHexMicButton
            disabled
            iconVariant="dark-accent"
            className="!h-10 !w-10 [&_svg]:h-10 [&_svg]:w-10"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
