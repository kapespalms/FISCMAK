import { cn } from "@/lib/utils";

type MarketingPanelImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Tighter crop for button tiles vs hero display */
  variant?: "tile" | "hero";
};

/** Canva panel art — use transparent PNGs from `npm run brand:panels`. */
export function MarketingPanelImage({
  src,
  alt,
  className,
  variant = "tile",
}: MarketingPanelImageProps) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-transparent",
        variant === "hero" ? "rounded-xl" : "rounded-lg",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "mx-auto block w-full object-contain object-center",
          variant === "hero" ? "aspect-[5/4]" : "aspect-[4/5] min-h-[200px]",
        )}
        decoding="async"
      />
    </div>
  );
}
