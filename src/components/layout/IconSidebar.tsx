"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_NAV, SECTION_TO_FLOW, type AppSection } from "@/lib/mak-sections";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAppShell } from "@/components/layout/AppShell";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";
import { NavIcon } from "@/components/brand/NavIcon";

export function IconSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { section, makOpen, toggleMak, startMakFlow } = useAppShell();

  function navigateSection(navSection: AppSection, href: string) {
    if (navSection === "dashboard") {
      router.push(href);
      return;
    }
    const intent = SECTION_TO_FLOW[navSection];
    startMakFlow(intent as "discuss" | "review" | "assess" | "plan" | "create", href);
  }

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="relative flex w-[60px] shrink-0 flex-col border-r border-fiscmak-border bg-white">
      <div className="relative flex h-[60px] shrink-0 items-center border-b border-fiscmak-border">
        <div
          className={cn(
            "flex h-full w-[60px] items-center justify-center",
            makOpen && "ring-2 ring-inset ring-fiscmak-green/25",
          )}
          title="Coach Mak"
        >
          <CoachMakAvatar size={34} className={cn(!makOpen && "opacity-90")} />
        </div>

        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          aria-label={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          className={cn(
            "absolute left-[60px] top-1/2 z-50 flex h-11 w-8 -translate-y-1/2 items-center justify-center",
            "rounded-r-md border border-l-0 border-fiscmak-border bg-white text-fiscmak-muted shadow-sm",
            "transition-colors hover:bg-fiscmak-subtle hover:text-fiscmak-ink",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiscmak-green",
            !makOpen && "border-l-2 border-l-fm-primary text-fm-primary",
          )}
        >
          {makOpen ? (
            <ChevronLeft size={18} strokeWidth={2.25} />
          ) : (
            <ChevronRight size={18} strokeWidth={2.25} />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1 py-3">
        {SECTION_NAV.map(({ section: navSection, href, label, icon, iconSize }) => {
          const active = section === navSection;
          return (
            <button
              key={href}
              type="button"
              title={label}
              onClick={() => navigateSection(navSection, href)}
              className={cn(
                "group relative flex h-12 w-full items-center justify-center transition-colors",
                active
                  ? "border-l-4 border-fm-primary bg-fm-background text-fm-primary"
                  : "border-l-4 border-transparent text-fiscmak-muted hover:bg-fm-background hover:text-fm-primary",
              )}
            >
              <NavIcon
                src={icon}
                alt={label}
                size={iconSize ?? 22}
                className={cn(
                  "transition-opacity",
                  active ? "opacity-100" : "opacity-75 group-hover:opacity-100",
                )}
              />
              <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-fiscmak-ink px-2 py-1 text-xs text-white group-hover:block">
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 border-t border-fiscmak-border py-3">
        <Link
          href="/app/profile"
          title="Profile"
          className={cn(
            "flex h-10 w-full items-center justify-center text-fiscmak-muted hover:bg-fiscmak-subtle hover:text-fiscmak-ink",
            pathname.startsWith("/app/profile") && "text-fiscmak-green-dark",
          )}
        >
          <User size={20} />
        </Link>
        <Link
          href="/app/settings"
          title="Settings"
          className={cn(
            "flex h-10 w-full items-center justify-center text-fiscmak-muted hover:bg-fiscmak-subtle hover:text-fiscmak-ink",
            pathname.startsWith("/app/settings") && "text-fiscmak-green-dark",
          )}
        >
          <Settings size={20} />
        </Link>
        <button
          type="button"
          title="Sign out"
          onClick={signOut}
          className="flex h-10 w-full items-center justify-center text-fiscmak-muted hover:bg-fiscmak-subtle hover:text-fiscmak-red"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
