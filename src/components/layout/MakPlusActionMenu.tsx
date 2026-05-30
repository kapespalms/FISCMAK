"use client";

import { useEffect, useRef } from "react";
import {
  Briefcase,
  FileText,
  ImagePlus,
  Paperclip,
  Plus,
  Sparkles,
  Target,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAK_DISPLAY_NAME } from "@/lib/brand-assets";
import { ACCEPTED_CV_ACCEPT } from "@/lib/v2/document-upload-types";
import { DASHBOARD_MECE_OPTIONS } from "@/lib/v2/dashboard-mak-menu";

export type MakActionMenuItem = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
};

const MECE_ICONS: Record<string, LucideIcon> = {
  profile: UserCircle,
  capture: Sparkles,
  upload: Paperclip,
  goals: Target,
};

type MakPlusActionMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MakActionMenuItem[];
  disabled?: boolean;
  onAttachDocument?: (file: File) => void;
  onAttachImage?: (file: File) => void;
};

export function buildDefaultMakMenuItems(
  handlers: Record<string, () => void>,
): MakActionMenuItem[] {
  const mece = DASHBOARD_MECE_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    description: option.message.split(".")[0] ?? option.message,
    icon: MECE_ICONS[option.id] ?? Sparkles,
    onClick: handlers[option.id] ?? (() => undefined),
  }));

  return [
    ...mece,
    {
      id: "vault",
      label: "Career data vault",
      description: "Open evals, CV, and portfolio evidence",
      icon: Briefcase,
      onClick: handlers.vault ?? (() => undefined),
    },
  ];
}

export function MakPlusActionMenu({
  open,
  onOpenChange,
  items,
  disabled,
  onAttachDocument,
  onAttachImage,
}: MakPlusActionMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onOpenChange]);

  const attachItems: MakActionMenuItem[] = [];
  if (onAttachDocument) {
    attachItems.push({
      id: "attach-document",
      label: "Attach file",
      description: "Upload a CV, PDF, or document",
      icon: FileText,
      onClick: () => documentInputRef.current?.click(),
    });
  }
  if (onAttachImage) {
    attachItems.push({
      id: "attach-image",
      label: "Attach photo",
      description: "Share an image in the conversation",
      icon: ImagePlus,
      onClick: () => imageInputRef.current?.click(),
    });
  }

  const menuItems = [...attachItems, ...items];

  return (
    <div ref={rootRef} className="relative shrink-0">
      {onAttachDocument ? (
        <input
          ref={documentInputRef}
          type="file"
          accept={ACCEPTED_CV_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) {
              onOpenChange(false);
              onAttachDocument(file);
            }
          }}
        />
      ) : null}
      {onAttachImage ? (
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) {
              onOpenChange(false);
              onAttachImage(file);
            }
          }}
        />
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0A0C10] text-gray-300 transition-colors",
          "hover:border-[#A3E635]/30 hover:text-white disabled:opacity-50",
          open && "border-[#A3E635]/40 bg-[#141722] text-white ring-1 ring-[#A3E635]/20",
        )}
        aria-label={open ? "Close actions menu" : "Open actions menu"}
        aria-expanded={open}
      >
        <Plus size={18} className={cn("transition-transform", open && "rotate-45")} />
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 w-[min(280px,calc(100vw-4rem))] overflow-hidden rounded-xl border border-white/10 bg-[#141722] shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          role="menu"
        >
          <p className="border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {MAK_DISPLAY_NAME}
          </p>
          <ul className="max-h-64 overflow-y-auto py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#1C2030]"
                    onClick={() => {
                      if (item.id.startsWith("attach-")) {
                        item.onClick();
                        return;
                      }
                      onOpenChange(false);
                      item.onClick();
                    }}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0A0C10] text-[#A3E635]">
                      <Icon size={16} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-gray-400">
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
