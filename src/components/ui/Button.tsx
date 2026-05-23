import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "destructive" | "link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-fm-primary text-white hover:bg-fiscmak-green-dark active:border-2 active:border-fm-accent",
  secondary:
    "bg-fm-surface text-foreground border border-fiscmak-border hover:bg-fm-background",
  destructive: "bg-fm-attention text-white hover:opacity-90",
  link: "bg-transparent text-fm-accent hover:underline p-0 min-h-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors disabled:opacity-50",
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
