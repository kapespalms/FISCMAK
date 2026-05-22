"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Grid3X3,
  MessageCircle,
  ClipboardList,
  FileText,
  Upload,
  Target,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/lattice", label: "Lattice", icon: Grid3X3 },
  { href: "/app/mak", label: "Mak", icon: MessageCircle },
  { href: "/app/activities", label: "Activities", icon: ClipboardList },
  { href: "/app/documents", label: "Documents", icon: Upload },
  { href: "/app/studio", label: "Output Studio", icon: FileText },
  { href: "/app/goals", label: "Goals", icon: Target },
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-fiscmak-border bg-white">
      <div className="flex items-center gap-2 border-b border-fiscmak-border px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-fiscmak-green text-white">
          <span className="text-lg font-bold">▶</span>
        </div>
        <span className="text-lg font-bold tracking-tight">FISCMAK</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/app" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-fiscmak-green-light text-fiscmak-green-dark"
                  : "text-fiscmak-muted hover:bg-fiscmak-subtle",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={signOut}
        className="m-3 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-fiscmak-muted hover:bg-fiscmak-subtle"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}
