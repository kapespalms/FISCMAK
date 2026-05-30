import type { Metadata } from "next";
import { CoachMakDeepDiveSection } from "@/components/marketing/CoachMakDeepDiveSection";
import { CoachMakConversationWidget } from "@/components/marketing/CoachMakConversationWidget";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";

export const metadata: Metadata = {
  title: "Meet Mak — FISCMAK",
  description:
    "Coach Mak — mentorship, career coaching, and the conversations that turn physician work into direction.",
};

export default function MeetMakPage() {
  return (
    <MarketingPageShell>
      <section className="relative px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-futura-bold text-3xl text-white md:text-4xl lg:text-5xl">
            Meet <span className="text-marketing-accent">Mak</span>
          </h1>
          <p className="font-futura-medium mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            Helping you navigate every move — goal-setting, mentorship capture, promotion prep, and
            the longitudinal conversations that keep your career on course.
          </p>

          <MarketingGlassPanel accent className="mt-10 flex justify-center p-6 md:p-10">
            <CoachMakConversationWidget />
          </MarketingGlassPanel>
        </div>
      </section>
      <CoachMakDeepDiveSection />
    </MarketingPageShell>
  );
}
