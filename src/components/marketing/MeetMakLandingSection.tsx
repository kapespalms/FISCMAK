import Link from "next/link";
import { CoachMakConversationWidget } from "@/components/marketing/CoachMakConversationWidget";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";

export function MeetMakLandingSection() {
  return (
    <section id="meet-mak" aria-label="Meet Coach Mak" className="relative px-6 py-10 md:px-10 md:py-12">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-futura-bold text-2xl text-cx-text md:text-3xl">
              Meet <span className="text-marketing-accent">Mak</span>
            </h2>
            <p className="font-futura-medium mt-1 max-w-xl text-sm text-cx-text/55 md:text-base">
              Conversational coaching — goal-setting, evidence capture, and career direction in
              one place.
            </p>
          </div>
          <Link
            href="/meet-mak"
            className="font-futura-bold cx-btn shrink-0 self-start bg-marketing-accent px-5 py-2.5 text-sm text-white shadow-[0_4px_16px_rgba(172,134,54,0.3)] transition hover:bg-fis-gold/90 hover:shadow-none sm:self-auto"
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
