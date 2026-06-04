import { GraduationCap } from "lucide-react";

/**
 * Phase 0 stub — Training dashboard shell.
 * Full content (rotation schedule, milestones, CCC prep) is Phase 3.
 * Conditional visibility (institution-tied trainee accounts only) is Phase 1.
 */
export default function TrainingPage() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fis-gold/10">
          <GraduationCap size={28} className="text-fis-gold" />
        </div>
      </div>
      <h1 className="mb-3 text-2xl font-semibold text-cx-text">Training Dashboard</h1>
      <p className="text-sm text-cx-text/60">
        Your program dashboard — rotations, milestones, and CCC prep — will live here.
        This section is available for institution-tied trainee accounts.
      </p>
    </div>
  );
}
