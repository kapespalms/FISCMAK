"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ContactFormCard } from "@/components/marketing/ContactFormCard";
import { cn } from "@/lib/utils";

type ContactFormPopoverProps = {
  className?: string;
};

/** Collapsible contact drawer — lime tab flush on card top edge; card hidden until opened. */
export function ContactFormPopover({ className }: ContactFormPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative flex justify-start md:justify-end", className)}>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="contact-form-drawer"
          aria-label={open ? "Close contact form" : "Open contact form"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center self-start md:self-end",
            "border border-marketing-accent bg-[#1a2419] text-marketing-accent",
            "transition hover:bg-[#243028]",
            open ? "rounded-t-md rounded-b-none border-b-0" : "rounded-md",
          )}
        >
          <ChevronDown
            size={15}
            strokeWidth={2.5}
            className={cn("transition-transform duration-200", open && "rotate-180")}
            aria-hidden
          />
        </button>

        {open ? (
          <ContactFormCard
            id="contact-form-drawer"
            className={cn(
              "-mt-px self-start rounded-tl-2xl rounded-tr-md border border-t-0 border-marketing-accent/50 md:self-end md:rounded-tl-md md:rounded-tr-2xl",
              "relative z-10 shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/10",
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
