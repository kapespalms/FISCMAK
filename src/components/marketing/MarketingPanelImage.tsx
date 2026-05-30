import { cn } from "@/lib/utils";

type MarketingPanelImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Tighter crop for button tiles vs hero display */
  variant?: "tile" | "hero";
};

/**
 * Canva panel exports often ship with a light matte — multiply blends white into the dark canvas.
 */
export function MarketingPanelImage({
  src,
  alt,
  className,
  variant = "tile",
}: MarketingPanelImageProps) {
  return (
    <div
      className={cn(
        "marketing-panel-art-frame isolate overflow-hidden bg-[#030303]",
        variant === "hero" ? "rounded-xl" : "rounded-lg",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "marketing-panel-art mx-auto w-full object-contain object-center",
          variant === "hero" ? "aspect-[5/4]" : "aspect-[4/5]",
        )}
        decoding="async"
      />
    </div>
  );
}
