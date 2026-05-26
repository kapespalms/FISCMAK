"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { listResidencyPrograms } from "@/lib/v2/programs/registry";

type OnboardingPathSelectProps = {
  loading?: boolean;
  blockLookupLoading?: boolean;
  onSelectPublic: () => void;
  onSelectInstitutional: (programSlug: string, traineeInitials: string) => void;
  onInitialsBlur?: (initials: string, programSlug: string) => void;
};

const PROGRAMS = listResidencyPrograms();

export function OnboardingPathSelect({
  loading,
  blockLookupLoading,
  onSelectPublic,
  onSelectInstitutional,
  onInitialsBlur,
}: OnboardingPathSelectProps) {
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]?.slug ?? "");
  const [traineeInitials, setTraineeInitials] = useState("");

  return (
    <Card>
      <p className="text-cx-label uppercase">Before we begin</p>
      <h1 className="mt-1 text-page-title">How are you joining FISCMAK?</h1>
      <p className="mt-2 text-sm text-cx-forest-dark/80">
        Residents join through their program. Individual physicians set up a personal career workspace.
      </p>

      <div className="mt-8 space-y-4">
        <div className="cx-surface-elevated rounded-2xl border border-cx-forest-dark/10 p-5">
          <p className="font-semibold text-cx-forest-dark">Residency or fellowship program</p>
          <p className="mt-1 text-sm text-cx-forest-dark/70">
            Institutional onboarding — program context, rotation vocabulary, and ILP-ready capture.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="program-select" className="cx-field-label">
                Program
              </label>
              <select
                id="program-select"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="cx-field mt-2 w-full"
              >
                {PROGRAMS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.display_title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="trainee-initials" className="cx-field-label">
                Your initials on the block schedule{" "}
                <span className="font-normal text-cx-forest-dark/60">(optional)</span>
              </label>
              <input
                id="trainee-initials"
                type="text"
                maxLength={8}
                value={traineeInitials}
                onChange={(e) => setTraineeInitials(e.target.value.toUpperCase())}
                onBlur={() => onInitialsBlur?.(traineeInitials, selectedProgram)}
                placeholder="e.g., KP"
                className="cx-field mt-2 w-32 uppercase"
                autoComplete="off"
              />
              {blockLookupLoading && (
                <p className="mt-1 text-xs text-cx-forest-dark/60">Looking up block schedule…</p>
              )}
              <p className="mt-1 text-xs text-cx-forest-dark/60">
                Used to match your block schedule later — not shown to other residents.
              </p>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={loading || !selectedProgram}
              onClick={() => onSelectInstitutional(selectedProgram, traineeInitials.trim())}
            >
              Continue as program resident
            </Button>
          </div>
        </div>

        <div className="cx-surface-elevated rounded-2xl border border-cx-forest-dark/10 p-5">
          <p className="font-semibold text-cx-forest-dark">Individual physician</p>
          <p className="mt-1 text-sm text-cx-forest-dark/70">
            Not affiliated with a residency program on FISCMAK — attending career development,
            promotion evidence, or a personal pivot path.
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full sm:w-auto"
            disabled={loading}
            onClick={onSelectPublic}
          >
            Continue as individual
          </Button>
        </div>
      </div>
    </Card>
  );
}
