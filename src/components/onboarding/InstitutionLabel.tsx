import { institutionAccentClass } from "@/lib/v2/programs/institution-brand";
import { cn } from "@/lib/utils";

type InstitutionLabelProps = {
  name: string;
  className?: string;
};

export function InstitutionLabel({ name, className }: InstitutionLabelProps) {
  return (
    <p className={cn("text-sm font-semibold uppercase tracking-wide", institutionAccentClass(name), className)}>
      {name}
    </p>
  );
}
