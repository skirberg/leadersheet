"use client"

import * as React from "react"
import { Player, type PlayerRef } from "@remotion/player"
import { HERO, HeroFilm } from "./hero-film"
import { SESSION_FILM, SessionFilm, type SessionFilmProps } from "./session-film"
import { useProgress, useReducedMotion } from "@/lib/store"
import { cn } from "@/lib/utils"

function useMounted() {
  const [m, setM] = React.useState(false)
  React.useEffect(() => setM(true), [])
  return m
}

/** Hero: plays muted on loop while on screen; a still frame for reduced motion. */
export function HeroPlayer({ className }: { className?: string }) {
  const mounted = useMounted()
  const rm = useReducedMotion()
  const ref = React.useRef<PlayerRef>(null)
  const box = React.useRef<HTMLDivElement>(null)

  // Reduced motion: hold a still, fully drawn frame even if the setting changes while open.
  React.useEffect(() => {
    if (mounted && rm) {
      ref.current?.pause()
      ref.current?.seekTo(100)
    }
  }, [mounted, rm])

  React.useEffect(() => {
    if (!mounted || rm || !box.current) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) ref.current?.play()
      else ref.current?.pause()
    })
    io.observe(box.current)
    return () => io.disconnect()
  }, [mounted, rm])

  return (
    <div
      ref={box}
      className={cn("corners relative overflow-hidden border border-border bg-card", className)}
      style={{ aspectRatio: `${HERO.width} / ${HERO.height}` }}
      role="img"
      aria-label="Animated drawing: a leader and a team drawn as an org chart, redrawn as functional, divisional, matrix and flat structures"
    >
      {mounted && (
        <Player
          ref={ref}
          component={HeroFilm}
          durationInFrames={HERO.durationInFrames}
          fps={HERO.fps}
          compositionWidth={HERO.width}
          compositionHeight={HERO.height}
          style={{ width: "100%", height: "100%" }}
          loop
          autoPlay={!rm}
          initialFrame={rm ? 100 : 0}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
        />
      )}
    </div>
  )
}

/** Per-session recap film with controls. Starts on its title card; plays on request. */
export function SessionFilmPlayer({ data, className }: { data: SessionFilmProps; className?: string }) {
  const mounted = useMounted()
  const { classMode } = useProgress()
  const props = React.useMemo(() => ({ ...data, date: classMode ? data.date : "" }), [data, classMode])
  return (
    <div
      className={cn("corners relative overflow-hidden border border-border bg-card", className)}
      style={{ aspectRatio: `${SESSION_FILM.width} / ${SESSION_FILM.height}` }}
    >
      {mounted && (
        <Player
          component={SessionFilm}
          inputProps={props}
          durationInFrames={SESSION_FILM.durationInFrames}
          fps={SESSION_FILM.fps}
          compositionWidth={SESSION_FILM.width}
          compositionHeight={SESSION_FILM.height}
          style={{ width: "100%", height: "100%" }}
          controls
          initialFrame={60}
          clickToPlay
          showVolumeControls={false}
          allowFullscreen
          acknowledgeRemotionLicense
        />
      )}
    </div>
  )
}
