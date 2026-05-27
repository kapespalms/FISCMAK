import type { ReactNode } from "react";
import { UhProgramServerGate } from "@/components/uh-psych/UhProgramServerGate";

export default function ResidencyLayout({ children }: { children: ReactNode }) {
  return (
    <UhProgramServerGate title="UH Psychiatry residency hub">{children}</UhProgramServerGate>
  );
}
