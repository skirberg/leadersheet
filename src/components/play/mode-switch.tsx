"use client"

import { BookOpen, Gamepad2 } from "lucide-react"
import { m } from "framer-motion"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

/** Phone version: one button, pressed when Play mode is on. */
export function ModeToggle({ className }: { className?: string }) {
  const { mode, setMode, ready } = useProgress()
  const play = ready && mode === "play"
  return (
    <button
      type="button"
      aria-pressed={play}
      aria-label="Play mode"
      onClick={() => setMode(play ? "study" : "play")}
      className={cn(
        "grid size-11 place-items-center rounded-md border border-rule/50 bg-card text-muted-foreground transition-colors",
        play && "border-signal bg-signal-soft text-signal-text",
        className
      )}
    >
      <Gamepad2 className="size-[18px]" />
    </button>
  )
}

/** Study or Play. Changes emphasis, never hides content. */
export function ModeSwitch({ className }: { className?: string }) {
  const { mode, setMode, ready } = useProgress()
  const play = ready && mode === "play"
  return (
    <div role="group" aria-label="Mode" className={cn("flex h-11 items-center rounded-md border border-rule/50 bg-muted p-1", className)}>
      {(
        [
          ["study", "Study", BookOpen],
          ["play", "Play", Gamepad2],
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
              "relative flex h-full items-center gap-1.5 rounded-[4px] px-2.5 text-sm text-muted-foreground transition-colors duration-(--dur-ui) hover:text-foreground",
              on && "font-semibold text-foreground",
              on && id === "play" && "text-signal-text"
            )}
          >
            {on && <m.span layoutId="mode-pill" className="absolute inset-0 rounded-[4px] bg-card shadow-[0_0_0_1px_var(--rule)]" />}
            <Icon className="relative size-4" />
            <span className="relative hidden sm:inline">{label}</span>
            <span className="sr-only sm:hidden">{label} mode</span>
          </button>
        )
      })}
    </div>
  )
}
