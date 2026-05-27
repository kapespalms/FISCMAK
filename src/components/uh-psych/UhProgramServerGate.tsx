import type { ReactNode } from "react";
import { userHasUhPsychProgramAccess } from "@/lib/v2/programs/uh-program-access-server";
import { UhProgramUnauthorized } from "@/components/uh-psych/UhProgramUnauthorized";

type UhProgramServerGateProps = {
  children: ReactNode;
  title?: string;
};

export async function UhProgramServerGate({
  children,
  title = "UH Psychiatry",
}: UhProgramServerGateProps) {
  const allowed = await userHasUhPsychProgramAccess();
  if (!allowed) {
    return <UhProgramUnauthorized title={title} />;
  }
  return <>{children}</>;
}
