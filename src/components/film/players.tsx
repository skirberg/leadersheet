"use client"

import * as React from "react"
import { Player, type PlayerRef } from "@remotion/player"
import { Play } from "lucide-react"
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

/** Per-session recap film. Starts on its title card with one play button; the player's controls appear once it plays. */
export function SessionFilmPlayer({ data, className }: { data: SessionFilmProps; className?: string }) {
  const mounted = useMounted()
  const { classMode } = useProgress()
  const props = React.useMemo(() => ({ ...data, date: classMode ? data.date : "" }), [data, classMode])
  const ref = React.useRef<PlayerRef>(null)
  const [started, setStarted] = React.useState(false)
  const seconds = Math.round(SESSION_FILM.durationInFrames / SESSION_FILM.fps)
  return (
    <div
      className={cn("corners relative overflow-hidden border border-border bg-card", className)}
      style={{ aspectRatio: `${SESSION_FILM.width} / ${SESSION_FILM.height}` }}
    >
      {mounted && (
        <Player
          ref={ref}
          component={SessionFilm}
          inputProps={props}
          durationInFrames={SESSION_FILM.durationInFrames}
          fps={SESSION_FILM.fps}
          compositionWidth={SESSION_FILM.width}
          compositionHeight={SESSION_FILM.height}
          style={{ width: "100%", height: "100%" }}
          controls={started}
          initiallyMuted
          initialFrame={60}
          clickToPlay={started}
          showVolumeControls={false}
          allowFullscreen
          acknowledgeRemotionLicense
        />
      )}
      {mounted && !started && (
        <button
          type="button"
          onClick={() => {
            setStarted(true)
            ref.current?.seekTo(0)
            ref.current?.play()
          }}
          className="group absolute inset-0 flex items-end justify-end p-[3%] outline-none sm:p-[4.5%]"
          aria-label={`Play the ${seconds} second recap`}
        >
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground pr-3.5 pl-3 text-[13px] font-semibold sm:h-10 sm:pr-4 sm:pl-3.5 sm:text-sm text-background ring-offset-2 ring-offset-card transition-transform duration-(--dur-press) group-hover:scale-[1.03] group-focus-visible:ring-2 group-focus-visible:ring-signal group-active:scale-[0.97]">
            <Play className="size-3.5 fill-current" aria-hidden />
            Recap <span className="font-mono text-xs font-medium opacity-70 tnum">0:{String(seconds).padStart(2, "0")}</span>
          </span>
        </button>
      )}
    </div>
  )
}
