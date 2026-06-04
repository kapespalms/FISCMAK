"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  GraduationCap,
  Grid3X3,
  HeartPulse,
  LayoutDashboard,
  MessageCircle,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";
import { MAK_DISPLAY_NAME } from "@/lib/brand-assets";

const MAIN_NAV = [
  { id: "dashboard", href: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "lattice",   href: "/app/lattice",    icon: Grid3X3,         label: "Lattice" },
  { id: "wellbeing", href: "/app/wellbeing",  icon: HeartPulse,      label: "Well-being" },
  { id: "goals",     href: "/app/goals",      icon: Target,          label: "Goals" },
  { id: "output",    href: "/app/output",     icon: FileText,        label: "Output Studio" },
] as const;

export function NavRail() {
  const pathname = usePathname();
  const { makOpen, toggleMak } = useAppShell();
  const [showProgram, setShowProgram] = useState(false);
  const [showTraining, setShowTraining] = useState(false);

  useEffect(() => {
    fetch("/api/v1/programs/my-staff-context")
      .then((r) => r.json())
      .then((data: { is_staff?: boolean; is_trainee?: boolean }) => {
        if (data.is_staff) setShowProgram(true);
        if (data.is_trainee) setShowTraining(true);
      })
      .catch(() => undefined);
  }, []);

  function isActive(href: string): boolean {
    if (href === "/app/dashboard") {
      return (
        pathname === "/app" ||
        pathname === "/app/dashboard" ||
        pathname.startsWith("/app/dashboard/")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className="cx-nav-rail"
      aria-label="Main navigation"
    >
      {/* Logo mark */}
      <div className="flex h-14 w-full shrink-0 items-center justify-center border-b border-rail-border">
        <Link
          href="/"
          aria-label="FISCMAK home"
          className="select-none font-bold tracking-widest"
          style={{ fontSize: "11px", letterSpacing: "0.12em" }}
        >
          <span className="text-cx-text">F</span>
          <span className="text-fis-gold">M</span>
        </Link>
      </div>

      {/* Training — conditional, pinned top with divider */}
      {showTraining && (
        <>
          <div className="mt-3 flex w-full flex-col items-center gap-1 px-2">
            <RailItem
              href="/app/training"
              icon={GraduationCap}
              label="Training"
              active={isActive("/app/training")}
            />
          </div>
          <div className="cx-nav-rail-divider" />
        </>
      )}

      {/* Program — conditional, pinned top with divider, program-staff roles only */}
      {showProgram && (
        <>
          <div className="mt-3 flex w-full flex-col items-center gap-1 px-2">
            <RailItem
              href="/app/program"
              icon={Users}
              label="Program"
              active={isActive("/app/program")}
            />
          </div>
          <div className="cx-nav-rail-divider" />
        </>
      )}

      {/* Main sections */}
      <div className="mt-3 flex flex-1 flex-col items-center gap-1 px-2">
        {MAIN_NAV.map(({ id, href, icon: Icon, label }) => (
          <RailItem
            key={id}
            href={href}
            icon={Icon}
            label={label}
            active={isActive(href)}
          />
        ))}
      </div>

      {/* Mak dock + Profile */}
      <div className="mb-3 flex flex-col items-center gap-2 px-2">
        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          aria-label={makOpen ? `Close ${MAK_DISPLAY_NAME}` : `Open ${MAK_DISPLAY_NAME}`}
          title={MAK_DISPLAY_NAME}
          className={cn(
            "cx-nav-rail-item",
            makOpen && "cx-nav-rail-item-active",
          )}
        >
          <CoachMakAvatar size={22} />
        </button>
        <ProfileMenu />
      </div>
    </nav>
  );
}

function RailItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        "cx-nav-rail-item",
        active && "cx-nav-rail-item-active",
      )}
    >
      <Icon size={18} strokeWidth={1.75} />
      <span className="sr-only">{label}</span>
    </Link>
  );
}
