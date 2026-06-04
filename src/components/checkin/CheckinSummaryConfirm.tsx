"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  bullets: string[];
  loading?: boolean;
  onConfirm: () => void;
  onChangeWithMak?: () => void;
  onNotQuite: () => void;
};

export function CheckinSummaryConfirm({
  bullets,
  loading,
  onConfirm,
  onChangeWithMak,
  onNotQuite,
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-cx-text/80">
        Here&apos;s what I&apos;m saving from this check-in:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-cx-text">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <p className="text-sm font-semibold text-cx-text">Does this summary sound right?</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Confirm check-in summary">
        <Button onClick={onConfirm} disabled={loading} aria-label="Yes, save this check-in summary">
          {loading ? "Saving…" : "Yes, save this"}
        </Button>
        {onChangeWithMak && (
          <Button
            variant="secondary"
            onClick={onChangeWithMak}
            disabled={loading}
            aria-label="Change summary with Mak"
          >
            Change with Mak
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={onNotQuite}
          disabled={loading}
          aria-label="Summary is not quite right"
        >
          Not quite
        </Button>
      </div>
    </div>
  );
}
