"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ContactFormCard } from "@/components/marketing/ContactFormCard";
import { cn } from "@/lib/utils";

type ContactFormPopoverProps = {
  className?: string;
};

/** Fixed bottom-right contact drawer — collapsed tab shows "Connect with FISCMAK". */
export function ContactFormPopover({ className }: ContactFormPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end md:bottom-6 md:right-6",
        className,
      )}
    >
      <div className="pointer-events-auto flex flex-col items-end">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="contact-form-drawer"
          aria-label={open ? "Close contact form" : "Connect with FISCMAK"}
          className={cn(
            "flex items-center gap-2 border border-marketing-accent bg-[#1a2419] text-marketing-accent",
            "transition hover:bg-[#243028]",
            open
              ? "rounded-t-md rounded-b-none border-b-0 px-2 py-1.5"
              : "rounded-md px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          )}
        >
          {!open ? (
            <span className="font-futura-bold text-[11px] uppercase leading-none tracking-wide sm:text-xs">
              <span className="text-white">Connect with FISC</span>
              <span className="text-marketing-accent">MAK</span>
            </span>
          ) : null}
          <ChevronDown
            size={15}
            strokeWidth={2.5}
            className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
            aria-hidden
          />
        </button>

        {open ? (
          <ContactFormCard
            id="contact-form-drawer"
            className={cn(
              "-mt-px rounded-tl-2xl rounded-tr-md border border-t-0 border-marketing-accent/50",
              "shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/10",
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
