import { cn } from "@/lib/utils";

type CoachMakMarkProps = {
  size?: number;
  className?: string;
};

/** Hex Mak mark — Loveable palette (navy + accent blue). */
export function CoachMakMark({ size = 32, className }: CoachMakMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M16 2L28.062 9V23L16 30L3.938 23V9L16 2Z"
        fill="var(--fm-primary)"
        stroke="var(--fm-primary)"
        strokeWidth="0.5"
      />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="13"
        fontWeight="700"
        fontFamily="var(--font-futura-pt-bold), 'Futura PT', sans-serif"
      >
        C
      </text>
    </svg>
  );
}
