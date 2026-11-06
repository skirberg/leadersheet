"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { HERO } from "./hero-spec"
import { useReducedMotion } from "@/lib/store"
import { cn } from "@/lib/utils"

// The live hero loads after the headline has painted and the page can take taps.
const HeroLive = dynamic(() => import("./hero-live"), { ssr: false })

/** Hero box. The drawing starts from an empty card, so the box itself is the placeholder until the live hero arrives. */
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
      className={cn("relative overflow-hidden rounded-[28px] bg-card", className)}
      style={{ aspectRatio: `${HERO.width} / ${HERO.height}` }}
    >
      <div className="absolute inset-0" role="group" aria-label="An org chart you can redraw: a leader and three teams, as functional, divisional, matrix and flat structures">
        {load && <HeroLive rm={rm} />}
      </div>
    </div>
  )
}
