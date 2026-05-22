import { cn } from "@/lib/utils";

const ICON_SRC = "/brand/nav/coach-mak.png";

type CoachMakAvatarProps = {
  size?: number;
  className?: string;
};

export function CoachMakAvatar({ size = 32, className }: CoachMakAvatarProps) {
  return (
    // Native img avoids Next/Image issues with uploaded brand assets
    <img
      src={ICON_SRC}
      alt="Coach Mak"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      decoding="async"
    />
  );
}
