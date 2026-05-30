import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const MarketingAuthInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ className, label, id, ...props }, ref) => (
  <div>
    <label htmlFor={id} className="font-futura-bold mb-1.5 block text-xs uppercase tracking-[0.12em] text-gray-400">
      {label}
    </label>
    <input
      ref={ref}
      id={id}
      className={cn(
        "font-futura-book w-full rounded-xl border border-white/10 bg-[#0A0C10] px-4 py-3 text-sm text-white transition-all placeholder:text-gray-600 focus:border-[#A3E635] focus:outline-none",
        className,
      )}
      {...props}
    />
  </div>
));
MarketingAuthInput.displayName = "MarketingAuthInput";
