"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SECTION_NAV,
  SECTION_TO_FLOW,
  sectionFromPath,
  type AppSection,
} from "@/lib/mak-sections";
import { useAppShell } from "@/components/layout/AppShell";

const EXTRA_NAV = [{ href: "/app/jobs", shortLabel: "Jobs", match: "/app/jobs" }];

export function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { section, startMakFlow } = useAppShell();
  const current = sectionFromPath(pathname);

  function navigateSection(navSection: AppSection, href: string) {
    if (navSection === "dashboard") {
      router.push(href);
      return;
    }
    const intent = SECTION_TO_FLOW[navSection];
    startMakFlow(intent as "discuss" | "review" | "assess" | "plan" | "create", href);
  }


  return (
    <header className="sticky top-0 z-20 border-b border-cx-border/80 bg-cx-white/90 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4">
        <Link
          href="/app/dashboard"
          className="shrink-0 rounded-full border border-cx-border bg-cx-white px-4 py-2 text-sm font-semibold text-cx-text"
        >
          FISCMAK
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex"
          aria-label="Main"
        >
          {SECTION_NAV.map(({ section: navSection, href, shortLabel }) => {
            const active = current === navSection;
            return (
              <button
                key={href}
                type="button"
                onClick={() => navigateSection(navSection, href)}
                className={cn(
                  "cx-nav-pill shrink-0 whitespace-nowrap",
                  active ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
                )}
              >
                {shortLabel}
              </button>
            );
          })}
          {EXTRA_NAV.map(({ href, shortLabel, match }) => {
            const active = pathname.startsWith(match);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "cx-nav-pill shrink-0 whitespace-nowrap",
                  active ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
                )}
              >
                {shortLabel}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cx-text-secondary hover:bg-cx-cream hover:text-cx-text"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <Link
            href="/app/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cx-text-secondary hover:bg-cx-cream hover:text-cx-text"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
          <Link
            href="/app/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cx-cream text-cx-text-secondary hover:text-cx-text"
            aria-label="Profile"
          >
            <User size={18} />
          </Link>
        </div>
      </div>

      <nav className="mt-3 flex gap-1 overflow-x-auto md:hidden" aria-label="Main mobile">
        {SECTION_NAV.map(({ section: navSection, href, shortLabel }) => {
          const active = section === navSection;
          return (
            <button
              key={href}
              type="button"
              onClick={() => navigateSection(navSection, href)}
              className={cn(
                "cx-nav-pill shrink-0 whitespace-nowrap text-xs",
                active ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
              )}
            >
              {shortLabel}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
