import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        "min-h-11 rounded-md border border-fiscmak-border px-4 py-3 text-base focus:border-fiscmak-green",
        className,
      )}
      {...props}
    />
  </div>
));
Input.displayName = "Input";
