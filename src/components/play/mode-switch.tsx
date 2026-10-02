"use client"

import { BookOpen, Gamepad2 } from "lucide-react"
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
        play && "border-pencil bg-pencil-soft text-pencil",
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
      ).map(([m, label, Icon]) => {
        const on = m === "play" ? play : !play
        return (
          <button
            key={m}
            type="button"
            aria-pressed={on}
            onClick={() => setMode(m)}
            className={cn(
              "flex h-full items-center gap-1.5 rounded-[4px] px-2.5 text-sm text-muted-foreground transition-colors duration-(--dur-ui) hover:text-foreground",
              on && "bg-card font-semibold text-foreground shadow-[0_0_0_1px_var(--rule)]",
              on && m === "play" && "text-pencil"
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sr-only sm:hidden">{label} mode</span>
          </button>
        )
      })}
    </div>
  )
}
