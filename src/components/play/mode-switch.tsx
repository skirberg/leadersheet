"use client"

import { BookOpen, Gamepad2 } from "lucide-react"
import { m } from "framer-motion"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

/*
  What leads: the lessons or the games. Named for what it puts first, not "Study" and "Play", so it is
  never mistaken for the Play tab beside it. It changes the order of things, never what is there.
  The stored values stay "study" and "play" so saved progress keeps working.
*/
export const ORDER_LABEL = { study: "Lessons first", play: "Games first" } as const

/** Phone version: one button, pressed when games come first. */
export function ModeToggle({ className }: { className?: string }) {
  const { mode, setMode, ready } = useProgress()
  const play = ready && mode === "play"
  return (
    <button
      type="button"
      aria-pressed={play}
      aria-label={ORDER_LABEL.play}
      title={play ? "Games first. Tap for lessons first." : "Lessons first. Tap for games first."}
      onClick={() => setMode(play ? "study" : "play")}
      className={cn(
        "grid size-11 place-items-center rounded-full bg-muted text-muted-foreground transition-colors",
        play && "border-signal bg-signal-soft text-signal-text",
        className
      )}
    >
      <Gamepad2 className="size-[18px]" />
    </button>
  )
}

/** Lessons first or games first. Changes the order, never hides content. */
export function ModeSwitch({ className }: { className?: string }) {
  const { mode, setMode, ready } = useProgress()
  const play = ready && mode === "play"
  return (
    <div role="group" aria-label="What comes first" className={cn("flex h-10 items-center rounded-full bg-muted p-1", className)}>
      {(
        [
          ["study", ORDER_LABEL.study, BookOpen],
          ["play", ORDER_LABEL.play, Gamepad2],
        ] as const
      ).map(([id, label, Icon]) => {
        const on = id === "play" ? play : !play
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => setMode(id)}
            className={cn(
              "relative flex h-full items-center gap-1.5 rounded-full px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-(--dur-ui) hover:text-foreground",
              on && "font-semibold text-background hover:text-background"
            )}
          >
            {/* The pill slides over the other button for a moment; it must not take that button's click. */}
            {on && <m.span layoutId="mode-pill" className="pointer-events-none absolute inset-0 rounded-full bg-foreground" />}
            <Icon className="relative size-4" />
            <span className="relative">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
