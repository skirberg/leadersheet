"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Pause, Play } from "lucide-react"
import { HERO } from "./hero-spec"
import { useReducedMotion } from "@/lib/store"
import { cn } from "@/lib/utils"

// Remotion is the largest script on the page, so it loads after the headline has painted and the page can take taps.
const HeroFilmPlayer = dynamic(() => import("./hero-film-player"), { ssr: false })

/** Hero film box. Frame 0 of the film is the empty card, so the box itself is the placeholder until the player arrives. */
export function HeroPlayer({ className }: { className?: string }) {
  const rm = useReducedMotion()
  const [load, setLoad] = React.useState(false)
  const [paused, setPaused] = React.useState(false)

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
    >
      {/* The image role sits on the film alone, so the pause button beside it stays a real control. */}
      <div
        className="absolute inset-0"
        role="img"
        aria-label="Animated drawing: a leader and a team drawn as an org chart, redrawn as functional, divisional, matrix and flat structures"
      >
        {load && <HeroFilmPlayer rm={rm} paused={paused} />}
      </div>
      {load && !rm && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play the animation" : "Pause the animation"}
          aria-pressed={paused}
          className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full border border-border bg-card/90 text-foreground backdrop-blur-sm transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      )}
    </div>
  )
}
