import type { ReactNode } from "react";
import { UhProgramServerGate } from "@/components/uh-psych/UhProgramServerGate";

export default function EducationLayout({ children }: { children: ReactNode }) {
  return (
    <UhProgramServerGate title="UH Psychiatry education hub">{children}</UhProgramServerGate>
  );
}
