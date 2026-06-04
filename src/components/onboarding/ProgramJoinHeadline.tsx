import { cn } from "@/lib/utils";
import {
  programJoinHeadline,
  type ProgramJoinHeadline as Headline,
} from "@/lib/v2/programs/program-join-display";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

type ProgramJoinHeadlineProps = {
  program: Pick<ResidencyProgram, "institution_name" | "program_name" | "display_title">;
  className?: string;
  /** Marketing join pages — large white + red */
  variant?: "marketing" | "onboarding";
};

function renderHeadline(parts: Headline, variant: "marketing" | "onboarding") {
  const isMarketing = variant === "marketing";
  const suffixClass = isMarketing ? "text-white" : "text-cx-text";

  if (parts.isUh) {
    return (
      <>
        <span className="text-uh-red">{parts.institutionShort}</span>
        <span className={suffixClass}> — {parts.programName}</span>
      </>
    );
  }

  return <span className={suffixClass}>{parts.title}</span>;
}

export function ProgramJoinHeadline({
  program,
  className,
  variant = "marketing",
}: ProgramJoinHeadlineProps) {
  const parts = programJoinHeadline(program);
  const isMarketing = variant === "marketing";

  if (isMarketing) {
    return (
      <h1 className={cn("font-futura-bold text-4xl md:text-5xl", className)}>
        {renderHeadline(parts, variant)}
      </h1>
    );
  }

  return (
    <h1 className={cn("text-page-title", className)}>{renderHeadline(parts, variant)}</h1>
  );
}
