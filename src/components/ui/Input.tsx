import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label htmlFor={id} className="text-sm font-semibold text-cx-forest-dark">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        "min-h-11 rounded-xl border border-cx-forest-dark/20 bg-white px-4 py-3 text-base text-cx-forest-dark focus:border-cx-forest-dark focus:outline-none",
        className,
      )}
      {...props}
    />
  </div>
));
Input.displayName = "Input";
