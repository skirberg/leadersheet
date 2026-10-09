"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { HERO } from "./hero-spec"
import { useReducedMotion } from "@/lib/store"
import { cn } from "@/lib/utils"

// Remotion is the largest script on the page, so it loads after the headline has painted and the page can take taps.
const HeroFilmPlayer = dynamic(() => import("./hero-film-player"), { ssr: false })

/** Hero film box. Frame 0 of the film is the empty card, so the box itself is the placeholder until the player arrives. */
export function HeroPlayer({ className }: { className?: string }) {
  const rm = useReducedMotion()
  const [load, setLoad] = React.useState(false)

  React.useEffect(() => {
    // Safari has no requestIdleCallback; a short timeout does the same job there.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setLoad(true), { timeout: 1000 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(() => setLoad(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={cn("corners relative overflow-hidden border border-border bg-card", className)}
      style={{ aspectRatio: `${HERO.width} / ${HERO.height}` }}
      role="img"
      aria-label="Animated drawing: a leader and a team drawn as an org chart, redrawn as functional, divisional, matrix and flat structures"
    >
      {load && <HeroFilmPlayer rm={rm} />}
    </div>
  )
}
