"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SECTION_NAV,
  SECTION_TO_FLOW,
  sectionFromPath,
  sectionNavShortLabel,
  type AppSection,
} from "@/lib/mak-sections";
import { useAppShell } from "@/components/layout/AppShell";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { getPreferredTheme, setTheme, type ThemeMode } from "@/lib/theme-preference";

export function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { startMakFlow, displayName } = useAppShell();
  const current = sectionFromPath(pathname);
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    setThemeState(getPreferredTheme());
  }, []);

  function toggleDarkMode() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  function navigateSection(navSection: AppSection, href: string) {
    if (navSection === "dashboard") {
      router.push(href);
      return;
    }
    const intent = SECTION_TO_FLOW[navSection];
    startMakFlow(intent as "discuss" | "review" | "assess" | "plan" | "create", href);
  }

  return (
    <header className="cx-app-top-bar sticky top-0 z-20 px-4 py-3 md:px-5 md:py-3.5">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 md:gap-3">
        <nav className="cx-top-nav-strip" aria-label="Main">
          {SECTION_NAV.map(({ section: navSection, href }) => {
            const active = current === navSection;
            const label = sectionNavShortLabel(navSection, displayName);
            return (
              <button
                key={href}
                type="button"
                onClick={() => navigateSection(navSection, href)}
                aria-current={active ? "page" : undefined}
                title={navSection === "subjective" && displayName ? label : undefined}
                className={cn(
                  "cx-top-nav-tab",
                  active ? "cx-top-nav-tab-active" : "cx-top-nav-tab-inactive",
                  navSection === "subjective" && displayName && "max-w-[7.5rem] truncate",
                )}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => router.push("/app/documents")}
            aria-current={pathname.startsWith("/app/documents") ? "page" : undefined}
            className={cn(
              "cx-top-nav-tab",
              pathname.startsWith("/app/documents")
                ? "cx-top-nav-tab-active"
                : "cx-top-nav-tab-inactive",
            )}
          >
            Documents
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
          <button
            type="button"
            className="cx-app-top-bar-icon-btn flex h-9 w-9 items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="cx-app-top-bar-icon-btn flex h-9 w-9 items-center justify-center"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
