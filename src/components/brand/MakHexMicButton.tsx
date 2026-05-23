import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

type MakHexMicButtonProps = {
  recording?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

export function MakHexMicButton({
  recording,
  disabled,
  onClick,
  className,
}: MakHexMicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={recording ? "Recording…" : "Voice input"}
      aria-label={recording ? "Recording" : "Voice input"}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center transition-transform hover:scale-[1.02] disabled:opacity-40",
        className,
      )}
    >
      <svg
        viewBox="0 0 44 48"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <path
          d="M22 2L38.063 10.5V29.5L22 38L5.937 29.5V10.5L22 2Z"
        className={cn(recording ? "fill-fm-attention" : "fill-cx-accent")}
      />
      </svg>
      <Mic
        size={18}
        strokeWidth={2.25}
        className="relative z-10 text-white"
      />
    </button>
  );
}
