"use client";

import { useId } from "react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import { openDashboardMeceOption } from "@/lib/v2/dashboard-mak-menu";
import { cn } from "@/lib/utils";

const FOREST = "#243b31";
const LIME = "#5FD65F";
const TICK_COUNT = 72;
/** 6 o'clock — fill ticks clockwise (increasing angle in SVG coordinates). */
const GAUGE_START_ANGLE = Math.PI / 2;

function mixHex(from: string, to: string, t: number): string {
  const pf = parseInt(from.slice(1), 16);
  const pt = parseInt(to.slice(1), 16);
  const r = Math.round(((pf >> 16) & 255) * (1 - t) + ((pt >> 16) & 255) * t);
  const g = Math.round(((pf >> 8) & 255) * (1 - t) + ((pt >> 8) & 255) * t);
  const b = Math.round((pf & 255) * (1 - t) + (pt & 255) * t);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function TrendIcon({ trend }: { trend: DashboardHeaderModel["trend"] }) {
  if (trend === "up") return <ArrowUp className="text-[#5FD65F]" size={14} />;
  if (trend === "down") return <ArrowDown className="text-red-400" size={14} />;
  return <ArrowRight className="text-white/50" size={14} />;
}

function CircularTickGauge({
  score,
  status,
  trend,
  onDiscuss,
}: {
  score: number | null | undefined;
  status?: string | null;
  trend: DashboardHeaderModel["trend"];
  onDiscuss: () => void;
}) {
  const ringId = useId().replace(/:/g, "");
  const cx = 100;
  const cy = 100;
  const innerR = 68;
  const outerR = 86;
  const hasScore = score != null;
  const value = hasScore ? Math.min(100, Math.max(0, score)) : 0;
  const filledTicks = Math.round((value / 100) * TICK_COUNT);
  const tickSpan = (Math.PI * 2) / TICK_COUNT;

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const midAngle = GAUGE_START_ANGLE + i * tickSpan;
    const filled = i < filledTicks;
    const color = filled
      ? mixHex(
          FOREST,
          LIME,
          filledTicks <= 1 ? 1 : i / Math.max(filledTicks - 1, 1),
        )
      : "#ffffff";
    return {
      key: i,
      x1: cx + innerR * Math.cos(midAngle),
      y1: cy + innerR * Math.sin(midAngle),
      x2: cx + outerR * Math.cos(midAngle),
      y2: cy + outerR * Math.sin(midAngle),
      color,
      filled,
    };
  });

  return (
    <button
      type="button"
      onClick={onDiscuss}
      className="group flex w-full flex-col items-center rounded-xl bg-cx-forest-dark px-3 py-4 text-left transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5FD65F]"
      aria-label={
        hasScore
          ? `Health score ${value} out of 100. Discuss with Mak.`
          : "Health score unavailable. Discuss with Mak."
      }
    >
      <svg
        viewBox="0 0 200 200"
        className="h-[148px] w-[148px]"
        role="img"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={innerR - 10}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.5}
        />

        {ticks.map((tick) => (
          <line
            key={tick.key}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.color}
            strokeWidth={tick.filled ? 3.5 : 3}
            strokeLinecap="round"
            opacity={tick.filled ? 1 : 0.95}
          />
        ))}

        <circle
          cx={cx}
          cy={cy}
          r={innerR - 10}
          fill="none"
          stroke={`url(#${ringId}-inner)`}
          strokeWidth={1}
          opacity={0.35}
        />
        <defs>
          <linearGradient id={`${ringId}-inner`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={FOREST} />
            <stop offset="100%" stopColor={LIME} />
          </linearGradient>
        </defs>
      </svg>

      <div className="-mt-[108px] flex h-[108px] w-[108px] flex-col items-center justify-center pointer-events-none">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/65">
          Health score
        </p>
        <p className="mt-0.5 text-3xl font-bold leading-none text-[#5FD65F]">
          {hasScore ? value : "—"}
        </p>
        {status && (
          <p className="mt-1 text-[10px] font-medium capitalize text-white/55">
            {status.replace(/_/g, " ")}
          </p>
        )}
      </div>

      <div className="mt-3 flex w-full items-center justify-between gap-2 px-1">
        <p className="text-[10px] text-white/45 group-hover:text-white/60">
          Tap to discuss with Mak
        </p>
        {hasScore && <TrendIcon trend={trend} />}
      </div>
    </button>
  );
}

export function HealthScoreCard({
  header,
  className,
}: {
  header: DashboardHeaderModel;
  className?: string;
}) {
  const { startMakFlow } = useAppShell();

  return (
    <div className={cn(className)}>
      <CircularTickGauge
        score={header.careerHealthScore}
        status={header.scoreStatus}
        trend={header.trend}
        onDiscuss={() => openDashboardMeceOption(startMakFlow, "profile")}
      />
    </div>
  );
}
