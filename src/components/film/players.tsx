"use client"

import * as React from "react"
import { Player, type PlayerRef } from "@remotion/player"
import { Play } from "lucide-react"
import { SESSION_FILM, SessionFilm, type SessionFilmProps } from "./session-film"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

function useMounted() {
  const [m, setM] = React.useState(false)
  React.useEffect(() => setM(true), [])
  return m
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
