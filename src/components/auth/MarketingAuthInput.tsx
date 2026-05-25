import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const MarketingAuthInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ className, label, id, ...props }, ref) => (
  <div>
    <label htmlFor={id} className="font-futura-condensed mb-1.5 block text-xs text-white">
      {label}
    </label>
    <input
      ref={ref}
      id={id}
      className={cn(
        "w-full rounded-lg border border-white/20 bg-[#0f1410] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  </div>
));
MarketingAuthInput.displayName = "MarketingAuthInput";
