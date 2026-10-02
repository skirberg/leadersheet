"use client"

import { useProgress, useReducedMotion } from "@/lib/store"

/**
 * A burst of red-pencil strokes, the brand's version of confetti.
 * Play mode only, and never under reduced motion. Change `fire` to replay.
 */
export function Burst({ fire, className }: { fire: number; className?: string }) {
  const { mode } = useProgress()
  const rm = useReducedMotion()
  if (!fire || mode !== "play" || rm) return null
  const n = 14
  return (
    <span key={fire} aria-hidden className={`pointer-events-none absolute inset-0 grid place-items-center ${className ?? ""}`}>
      <svg viewBox="-100 -100 200 200" className="h-56 w-56 overflow-visible">
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + (i % 2 ? 0.12 : -0.08)
          const r1 = 26 + (i % 3) * 6,
            r2 = r1 + 18 + (i % 4) * 5
          return (
            <path
              key={i}
              d={`M${Math.cos(a) * r1} ${Math.sin(a) * r1}L${Math.cos(a) * r2} ${Math.sin(a) * r2}`}
              stroke={i % 3 === 0 ? "var(--foreground)" : "var(--pencil)"}
              strokeWidth={i % 3 === 0 ? 3 : 4}
              strokeLinecap="round"
              className="burst-stroke"
              style={{ ["--bx" as string]: `${Math.cos(a) * 26}px`, ["--by" as string]: `${Math.sin(a) * 26}px` }}
            />
          )
        })}
      </svg>
    </span>
  )
}
