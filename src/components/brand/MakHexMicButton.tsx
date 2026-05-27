import { CoachMakVoiceIcon } from "@/components/brand/CoachMakVoiceIcon";
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
      data-preserve-radius
      onClick={onClick}
      disabled={disabled}
      title={recording ? "Recording…" : "Voice input"}
      aria-label={recording ? "Recording voice message" : "Voice input"}
      aria-pressed={recording}
      className={cn(
        "relative flex h-[50px] w-[50px] shrink-0 items-center justify-center transition-transform hover:scale-[1.03] disabled:opacity-40",
        recording && "ring-2 ring-[#67E151]/60 ring-offset-2 ring-offset-transparent",
        className,
      )}
    >
      <CoachMakVoiceIcon recording={recording} className="h-[50px] w-[50px]" />
    </button>
  );
}
