import { cn } from "@/lib/utils";

type NavIconProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

export function NavIcon({ src, alt, size = 22, className }: NavIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      decoding="async"
      draggable={false}
    />
  );
}
