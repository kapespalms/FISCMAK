import { cn } from "@/lib/utils";

type ConnectWithFiscmakHeadingProps = {
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  size?: "xs" | "sm" | "md" | "lg";
};

const sizeClass = {
  xs: "text-base whitespace-nowrap md:text-lg",
  sm: "text-sm tracking-[0.2em] whitespace-nowrap",
  md: "text-3xl whitespace-nowrap md:text-4xl lg:text-5xl",
  lg: "text-4xl whitespace-nowrap md:text-5xl lg:text-6xl",
};

export function ConnectWithFiscmakHeading({
  className,
  as: Tag = "h2",
  size = "md",
}: ConnectWithFiscmakHeadingProps) {
  return (
    <Tag className={cn("font-futura-bold uppercase leading-tight", sizeClass[size], className)}>
      <span className="text-white">Connect with FISC</span>
      <span className="text-marketing-accent">MAK</span>
    </Tag>
  );
}
