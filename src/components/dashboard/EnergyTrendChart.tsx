"use client";

import { cn } from "@/lib/utils";

type EnergyTrendChartProps = {
  history: { date: string; level: number; label: string }[];
  className?: string;
};

export function EnergyTrendChart({ history, className }: EnergyTrendChartProps) {
  const width = 280;
  const height = 100;
  const padX = 12;
  const padY = 10;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = history.map((h, i) => {
    const x = padX + (i / Math.max(history.length - 1, 1)) * chartW;
    const y = padY + chartH - (h.level / 10) * chartH;
    return { x, y, ...h };
  });

  const linePoints = points
    .filter((p) => p.level > 0)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[100px] w-full max-w-[300px]"
        role="img"
        aria-label="7-day energy trend"
      >
        {[0, 5, 10].map((tick) => {
          const y = padY + chartH - (tick / 10) * chartH;
          return (
            <line
              key={tick}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}
        {linePoints && (
          <polyline
            fill="none"
            stroke="#5FD65F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />
        )}
        {points.map((p) =>
          p.level > 0 ? (
            <circle
              key={p.date}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#5FD65F"
            >
              <title>
                {p.date}: Energy {p.level}/10
              </title>
            </circle>
          ) : null,
        )}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] font-medium text-fiscmak-muted">
        {history.map((h) => (
          <span key={h.date}>{h.label}</span>
        ))}
      </div>
    </div>
  );
}
