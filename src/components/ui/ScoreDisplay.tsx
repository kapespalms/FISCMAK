"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ScoreDisplay({
  value,
  previousValue,
  className,
}: {
  value: number;
  previousValue?: number | null;
  className?: string;
}) {
  const [display, setDisplay] = useState(previousValue ?? value);
  const [pulse, setPulse] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setDisplay(value);
      return;
    }
    if (previousValue != null && value !== previousValue) {
      setPulse(true);
      const start = previousValue;
      const end = value;
      const duration = 600;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setDisplay(Math.round(start + (end - start) * p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      const t = setTimeout(() => setPulse(false), 700);
      return () => clearTimeout(t);
    }
    setDisplay(value);
  }, [value, previousValue]);

  return (
    <span
      className={cn("text-score-hero", pulse && "animate-score-pulse", className)}
      aria-live="polite"
    >
      {display}
    </span>
  );
}
