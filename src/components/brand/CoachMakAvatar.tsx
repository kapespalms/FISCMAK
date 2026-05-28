import { cn } from "@/lib/utils";
import { MAK_AVATAR_SRC } from "@/lib/brand-assets";

type CoachMakAvatarProps = {
  size?: number;
  className?: string;
  /** Glass ring — marketing / hero contexts */
  framed?: boolean;
};

export function CoachMakAvatar({ size = 32, className, framed = false }: CoachMakAvatarProps) {
  const img = (
    // Native img avoids Next/Image issues with uploaded brand assets
    <img
      src={MAK_AVATAR_SRC}
      alt="Coach Mak"
      width={size}
      height={size}
      className={cn(
        "shrink-0 object-contain",
        !framed && className,
      )}
      decoding="async"
    />
  );

  if (!framed) return img;

  return (
    <div
      className={cn(
        "marketing-glass flex shrink-0 items-center justify-center rounded-2xl p-2.5",
        className,
      )}
      style={{ width: size + 20, height: size + 20 }}
    >
      {img}
    </div>
  );
}
