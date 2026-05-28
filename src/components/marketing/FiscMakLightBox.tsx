"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LANDING_HERO_LOGO_SRC } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

type LightState = "off" | "warming" | "on";

/**
 * Safe tube warm-up — brightness ramps only, never full black-out flashes.
 * Stays well under WCAG 2.3.1 flash limits (no >3 flashes/sec).
 */
const WARMUP_RAMP: { level: number; delay: number }[] = [
  { level: 0.1, delay: 250 },
  { level: 0.22, delay: 600 },
  { level: 0.16, delay: 900 },
  { level: 0.34, delay: 1250 },
  { level: 0.3, delay: 1550 },
  { level: 0.52, delay: 1900 },
  { level: 0.46, delay: 2200 },
  { level: 0.72, delay: 2550 },
  { level: 0.88, delay: 2850 },
  { level: 1, delay: 3100 },
];

const WARMUP_SETTLE_MS = 3200;
const BOOT_DELAY_MS = 1600;
const REDUCED_MOTION_FADE_MS = 600;
const TAGLINE = "The longitudinal physician career platform.";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

const KEYPAD_KEYS = Array.from({ length: 12 });

const KEYPAD_SWATCH = {
  lime: "border-[#a9ff5c]/40 bg-gradient-to-b from-zinc-800 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_7px_rgba(169,255,92,0.55),0_1px_2px_rgba(0,0,0,0.65)]",
  teal: "border-teal-400/40 bg-gradient-to-b from-zinc-800 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_7px_rgba(45,212,191,0.5),0_1px_2px_rgba(0,0,0,0.65)]",
  pink: "border-pink-400/40 bg-gradient-to-b from-zinc-800 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_7px_rgba(244,114,182,0.5),0_1px_2px_rgba(0,0,0,0.65)]",
  black:
    "border-zinc-700/70 bg-gradient-to-b from-zinc-800 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.75)]",
} as const;

/** 4×3 keypad — irregular mix, heavier on black (5×) */
const KEYPAD_COLOR_KEYS = [
  "black",
  "lime",
  "black",
  "teal",
  "pink",
  "black",
  "black",
  "teal",
  "lime",
  "pink",
  "black",
  "teal",
] as const;

function CornerRivet({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute h-2 w-2 rounded-full border border-zinc-700 bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]",
        className,
      )}
      aria-hidden
    />
  );
}

function FilmClip({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "absolute top-1/2 z-30 -translate-y-1/2",
        side === "left" ? "left-0" : "right-0",
      )}
      aria-hidden
    >
      <div className="flex flex-col items-center">
        <div className="h-9 w-3 rounded-sm bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-800 shadow-[2px_0_6px_rgba(0,0,0,0.5)]" />
        <div className="mt-0.5 h-4 w-5 rounded-sm border border-zinc-600 bg-gradient-to-b from-zinc-500 to-zinc-800" />
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-zinc-900 ring-1 ring-zinc-600" />
      </div>
    </div>
  );
}

export function FiscMakLightBox({
  embedded = false,
  onIlluminated,
}: {
  embedded?: boolean;
  onIlluminated?: () => void;
} = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lightState, setLightState] = useState<LightState>("off");
  const [glowLevel, setGlowLevel] = useState(0);
  const [powered, setPowered] = useState(false);
  const [tagline, setTagline] = useState("");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bootStartedRef = useRef(false);
  const illuminatedFiredRef = useRef(false);

  const fireIlluminated = useCallback(() => {
    if (illuminatedFiredRef.current) return;
    illuminatedFiredRef.current = true;
    onIlluminated?.();
  }, [onIlluminated]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const queueTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const runWarmupSequence = useCallback(
    (onSettled?: () => void) => {
      clearTimers();
      setLightState("warming");
      setGlowLevel(0);

      if (prefersReducedMotion) {
        queueTimer(() => setGlowLevel(1), 80);
        queueTimer(() => {
          setLightState("on");
          fireIlluminated();
          onSettled?.();
        }, REDUCED_MOTION_FADE_MS + 80);
        return;
      }

      WARMUP_RAMP.forEach((step) => {
        queueTimer(() => setGlowLevel(step.level), step.delay);
      });

      queueTimer(() => {
        setGlowLevel(1);
        setLightState("on");
        fireIlluminated();
        onSettled?.();
      }, WARMUP_SETTLE_MS);
    },
    [clearTimers, fireIlluminated, prefersReducedMotion, queueTimer],
  );

  const powerOn = useCallback(() => {
    setPowered(true);
    runWarmupSequence();
  }, [runWarmupSequence]);

  const powerOff = useCallback(() => {
    clearTimers();
    setPowered(false);
    setLightState("off");
    setGlowLevel(0);
  }, [clearTimers]);

  const handlePowerClick = () => {
    if (lightState === "warming") return;
    if (powered) powerOff();
    else powerOn();
  };

  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

    queueTimer(() => powerOn(), BOOT_DELAY_MS);
    return clearTimers;
  }, [clearTimers, powerOn, queueTimer]);

  useEffect(() => {
    if (lightState !== "on") {
      setTagline("");
      return;
    }

    if (prefersReducedMotion) {
      setTagline(TAGLINE);
      return;
    }

    setTagline("");
    let index = 0;
    const typeTimer = setInterval(() => {
      index += 1;
      setTagline(TAGLINE.slice(0, index));
      if (index >= TAGLINE.length) clearInterval(typeTimer);
    }, 38);

    return () => clearInterval(typeTimer);
  }, [lightState, prefersReducedMotion]);

  const isLit = glowLevel > 0;
  const glowTransitionMs = prefersReducedMotion ? 400 : 280;
  const logoOpacity = glowLevel < 0.15 ? 0 : Math.min(1, 0.25 + glowLevel * 0.75);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "relative flex min-h-[540px] w-full flex-col overflow-hidden bg-gradient-to-b from-[#141820] via-[#0c0f14] to-[#080a0d]",
          embedded
            ? "rounded-none border-0 shadow-none"
            : "rounded-[10px] border border-zinc-800/80 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)]",
        )}
      >
        <CornerRivet className="left-2 top-2" />
        <CornerRivet className="right-2 top-2" />
        <CornerRivet className="bottom-[4.75rem] left-2" />
        <CornerRivet className="bottom-[4.75rem] right-2" />

        {/* Side grip */}
        <div
          className="absolute right-0 top-1/2 z-20 hidden h-24 w-3 -translate-y-1/2 rounded-l-sm bg-gradient-to-r from-[#3d342c] to-[#2a241e] shadow-[-2px_0_6px_rgba(0,0,0,0.6)] md:block"
          aria-hidden
        />

        {/* Viewport housing */}
        <div className="relative flex min-h-0 flex-1 flex-col p-4 pb-3 pt-5 sm:p-5">
          <div className="relative flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-md border border-zinc-900/90 bg-[#030405] shadow-[inset_0_10px_40px_rgba(0,0,0,0.95)]">
            {/* Diffuser panel lip */}
            <div
              className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-zinc-800/60"
              aria-hidden
            />

            {/* Glowing inner bezel */}
            <div
              className="pointer-events-none absolute inset-[10px] rounded-sm border-[5px] transition-all"
              style={{
                transitionDuration: `${glowTransitionMs}ms`,
                borderColor: `rgba(255,255,255,${0.12 + glowLevel * 0.83})`,
                boxShadow:
                  glowLevel > 0
                    ? `0 0 ${24 + glowLevel * 32}px rgba(255,255,255,${0.08 + glowLevel * 0.32}), inset 0 0 ${12 + glowLevel * 20}px rgba(255,255,255,${glowLevel * 0.1})`
                    : "none",
              }}
              aria-hidden
            />

            <FilmClip side="left" />
            <FilmClip side="right" />

            {/* Film glass */}
            <div className="relative m-5 flex flex-1 items-center justify-center overflow-hidden rounded-sm bg-[#020203]">
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_40%,rgba(0,0,0,0.4)_100%)]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 shadow-[inset_0_6px_36px_rgba(0,0,0,0.98)]"
                aria-hidden
              />

              {/* Localized backlight — sits behind logo, not over it */}
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <div
                  className="h-32 w-[min(72vw,300px)] max-w-[300px] rounded-full blur-3xl sm:h-36"
                  style={{
                    opacity: glowLevel * 0.5,
                    background:
                      "radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(169,255,92,0.08) 45%, transparent 72%)",
                    transition: `opacity ${glowTransitionMs}ms ease-out`,
                  }}
                />
              </div>

              {/* Edge wash — subtle, keeps screen dark */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: glowLevel * 0.18,
                  background:
                    "radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, transparent 68%)",
                  transition: `opacity ${glowTransitionMs}ms ease-out`,
                }}
                aria-hidden
              />

              <div className="relative z-10 flex flex-col items-center px-4">
                <div
                  style={{
                    opacity: logoOpacity,
                    transform: `scale(${0.98 + glowLevel * 0.02})`,
                    transition: `opacity ${glowTransitionMs}ms ease-out, transform ${glowTransitionMs}ms ease-out`,
                    filter:
                      glowLevel > 0.5
                        ? `drop-shadow(0 2px 8px rgba(0,0,0,0.85)) drop-shadow(0 0 ${12 + glowLevel * 16}px rgba(169,255,92,0.25))`
                        : "none",
                  }}
                >
                  <Image
                    src={LANDING_HERO_LOGO_SRC}
                    alt="FISCMAK"
                    width={480}
                    height={120}
                    className="h-auto w-[min(78vw,320px)] max-w-[320px] object-contain"
                    priority
                  />
                </div>
                {tagline ? (
                  <p className="font-futura-medium mt-4 max-w-[280px] text-center text-[11px] leading-relaxed tracking-wide text-white/75 sm:text-xs">
                    {tagline}
                    {tagline.length < TAGLINE.length ? (
                      <span className="ml-0.5 inline-block h-[0.9em] w-[2px] animate-pulse bg-marketing-accent/80 align-middle" />
                    ) : null}
                  </p>
                ) : null}
              </div>

              {/* Glass scratch / wear */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay transition-opacity duration-500",
                  isLit ? "opacity-[0.12]" : "opacity-[0.04]",
                )}
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(118deg, transparent, transparent 18px, rgba(255,255,255,0.15) 19px, transparent 20px)",
                }}
                aria-hidden
              />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "relative z-10 flex h-[4.75rem] items-center gap-2.5 border-t border-zinc-800/80 bg-gradient-to-b from-[#1a1f28] to-[#10141b] px-3 shadow-[inset_0_2px_0_rgba(255,255,255,0.04)] sm:gap-3 sm:px-4",
            embedded ? "mx-0 mb-0" : "mx-3 mb-3 rounded-md shadow-[0_8px_20px_rgba(0,0,0,0.65)]",
          )}
        >
          <div className="hidden shrink-0 grid-cols-3 gap-1 sm:grid" aria-hidden>
            {KEYPAD_KEYS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-3 w-4 rounded-[3px] border",
                  KEYPAD_SWATCH[KEYPAD_COLOR_KEYS[i]],
                )}
              />
            ))}
          </div>

          <div className="flex h-11 min-w-0 flex-1 items-center overflow-hidden rounded-sm border border-[#141b26] bg-[#04060b] px-3 shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)]">
            <span
              className={cn(
                "truncate font-mono text-[8px] uppercase tracking-[0.16em] transition-all duration-300 sm:text-[9px]",
                lightState === "on" && "text-marketing-accent drop-shadow-[0_0_5px_#a9ff5c]",
                lightState === "warming" && "text-amber-400",
                lightState === "off" && "text-zinc-700",
              )}
            >
              {lightState === "on"
                ? "[ CAREER_STATUS // ILLUMINATED ]"
                : lightState === "warming"
                  ? "[ LAMP_VOLTAGE // STABILIZING ]"
                  : "[ STANDBY // POWER_OFF ]"}
            </span>
          </div>

          <button
            type="button"
            data-no-glass
            onClick={handlePowerClick}
            disabled={lightState === "warming"}
            aria-label={powered ? "Turn light box off" : "Turn light box on"}
            aria-pressed={powered}
            className={cn(
              "group relative flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-wait sm:h-14 sm:w-14",
              powered
                ? "translate-y-1"
                : "translate-y-0 hover:brightness-110",
            )}
          >
            {/* Metal bezel ring */}
            <span
              className={cn(
                "absolute inset-0 rounded-full border-2 bg-gradient-to-b shadow-md transition-all duration-200",
                powered
                  ? "border-zinc-600 from-zinc-600 to-zinc-800 shadow-[inset_0_5px_12px_rgba(0,0,0,0.85)]"
                  : "border-zinc-500 from-zinc-500 to-zinc-800 shadow-[0_5px_10px_rgba(0,0,0,0.55)] group-active:translate-y-0.5 group-active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]",
              )}
            />
            {/* Lens / lamp indicator */}
            <span
              className={cn(
                "relative h-9 w-9 rounded-full border-2 transition-all duration-300 sm:h-10 sm:w-10",
                powered
                  ? "border-marketing-accent/70 bg-marketing-accent shadow-[0_0_18px_#a9ff5c,inset_0_1px_3px_rgba(255,255,255,0.4)]"
                  : "border-zinc-600/80 bg-zinc-800/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]",
              )}
              style={{
                opacity: powered ? 0.7 + glowLevel * 0.3 : 1,
                transition: `opacity ${glowTransitionMs}ms ease-out`,
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
