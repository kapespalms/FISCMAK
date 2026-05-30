import { CoachMakConversationWidget } from "@/components/marketing/CoachMakConversationWidget";
import {
  MarketingGlassPanel,
  MarketingSection,
} from "@/components/marketing/MarketingGlass";

const COACH_PILLARS = [
  {
    title: "Career coaching",
    body: "Set goals, name gaps, and build a cadence — promotion prep, scholarship, leadership, or a pivot. Mak asks sharp questions and keeps the plan tied to your real work.",
  },
  {
    title: "Mentorship, made visible",
    body: "The residents you precept, the colleagues you sponsor, the teaching that never hits a CV — Mak helps you capture it so mentorship becomes evidence, not memory.",
  },
  {
    title: "Longitudinal partner",
    body: "Mak remembers your arc across conversations: patterns in your work, progress on goals, and the through-line that connects today's shift to where you're headed.",
  },
] as const;

export function CoachMakDeepDiveSection() {
  return (
    <MarketingSection
      title={
        <>
          Mentorship and coaching —{" "}
          <span className="text-marketing-accent">built in</span>
        </>
      }
      description="Coach Mak is the guide inside the loop: coaching conversations when you need direction, and a lens on the mentoring you already do."
      className="border-t border-white/[0.06] bg-white/[0.01]"
    >
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-5">
          {COACH_PILLARS.map((pillar) => (
            <MarketingGlassPanel key={pillar.title} accent className="p-6 md:p-7">
              <h3 className="font-futura-bold text-lg text-white">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{pillar.body}</p>
            </MarketingGlassPanel>
          ))}

          <MarketingGlassPanel className="p-6 md:p-7">
            <p className="font-futura-medium text-sm leading-relaxed text-white/65 md:text-base">
              Mak supplements your real mentors, sponsors, and coaches — it doesn&apos;t replace
              them. Think interim guidance and a private record until your board is full.
            </p>
          </MarketingGlassPanel>
        </div>

        <div className="flex justify-center lg:sticky lg:top-24">
          <CoachMakConversationWidget />
        </div>
      </div>
    </MarketingSection>
  );
}
