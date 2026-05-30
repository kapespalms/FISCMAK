import Link from "next/link";
import { CoachMakConversationWidget } from "@/components/marketing/CoachMakConversationWidget";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";

export function MeetMakLandingSection() {
  return (
    <section id="meet-mak" aria-label="Meet Mak" className="relative px-6 py-10 md:px-10 md:py-12">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-futura-bold text-2xl text-white md:text-3xl">
              Meet <span className="text-marketing-accent">Mak</span>
            </h2>
            <p className="font-futura-bold mt-1 max-w-xl text-sm text-white md:text-base">
              Helping you navigate every move — goal-setting, mentorship, and career direction.
            </p>
          </div>
          <Link
            href="/meet-mak"
            className="font-futura-bold cx-btn shrink-0 self-start bg-marketing-accent px-5 py-2.5 text-sm text-black shadow-[0_0_24px_rgba(169,255,92,0.25)] transition hover:bg-white hover:shadow-none sm:self-auto"
          >
            Meet Mak
          </Link>
        </div>

        <MarketingGlassPanel accent className="mt-5 flex justify-center p-5 md:p-8">
          <CoachMakConversationWidget />
        </MarketingGlassPanel>
      </div>
    </section>
  );
}
