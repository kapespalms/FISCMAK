"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_NAV } from "@/lib/mak-sections";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAppShell } from "@/components/layout/AppShell";

export function IconSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { section, makOpen, toggleMak } = useAppShell();

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-[60px] shrink-0 flex-col border-r border-fiscmak-border bg-white">
      <div className="flex h-[60px] items-center justify-center border-b border-fiscmak-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fiscmak-green text-xs font-bold text-white">
          ▶
        </div>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1 py-3">
        <button
          type="button"
          title="Coach Mak"
          onClick={toggleMak}
          className={cn(
            "group relative flex h-12 w-full items-center justify-center transition-colors",
            !makOpen && "ring-2 ring-fiscmak-green/30 ring-inset",
            makOpen
              ? "border-l-4 border-fiscmak-green bg-fiscmak-subtle text-fiscmak-green"
              : "border-l-4 border-transparent text-fiscmak-muted hover:bg-fiscmak-green-light hover:text-fiscmak-green",
          )}
        >
          <MessageCircle size={24} strokeWidth={1.75} />
        </button>

        {SECTION_NAV.map(({ section: navSection, href, label, letter }) => {
          const active = section === navSection;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "group relative flex h-12 w-full items-center justify-center transition-colors",
                active
                  ? "border-l-4 border-fiscmak-green bg-fiscmak-subtle text-fiscmak-green"
                  : "border-l-4 border-transparent text-fiscmak-muted hover:bg-fiscmak-green-light hover:text-fiscmak-green",
              )}
            >
              <span className="text-sm font-bold tracking-tight">{letter}</span>
              <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 border-t border-fiscmak-border py-3">
        <Link
          href="/app/profile"
          title="Profile"
          className={cn(
            "flex h-10 w-full items-center justify-center text-fiscmak-muted hover:bg-fiscmak-subtle hover:text-fiscmak-green",
            pathname.startsWith("/app/profile") && "text-fiscmak-green",
          )}
        >
          <User size={20} />
        </Link>
        <Link
          href="/app/settings"
          title="Settings"
          className={cn(
            "flex h-10 w-full items-center justify-center text-fiscmak-muted hover:bg-fiscmak-subtle hover:text-fiscmak-green",
            pathname.startsWith("/app/settings") && "text-fiscmak-green",
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
