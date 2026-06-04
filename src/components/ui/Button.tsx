import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "destructive" | "link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-cx-forest-dark text-white hover:bg-cx-forest-dark/90 active:border-2 active:border-[#AC8636]",
  secondary:
    "bg-white text-cx-forest-dark border border-cx-forest-dark/20 hover:bg-cx-forest-dark/5",
  destructive: "bg-fm-attention text-white hover:opacity-90",
  link: "bg-transparent text-cx-forest-dark hover:text-cx-forest-dark/80 hover:underline p-0 min-h-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center px-6 py-3 font-futura-medium text-base font-semibold transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
