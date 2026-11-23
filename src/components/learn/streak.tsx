"use client"

import { Flame } from "lucide-react"
import { streakOf, useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

/*
  Days in a row with some learning: an answer, a decision, a lab or a game. Kept in this browser only.
  It says what keeps it going and never scolds: no lost-streak alarms, no guilt.
*/
export function useStreak() {
  const { state, ready } = useProgress()
  return ready ? streakOf(state.days) : { count: 0, today: false }
}

const days = (n: number) => (n === 1 ? "1 day" : `${n} days`)

/** One line for the end of a check, the home hero and practice. Nothing until there is a streak. */
export function StreakLine({ className }: { className?: string }) {
  const { count, today } = useStreak()
  if (!count) return null
  return (
    <p className={cn("inline-flex items-center gap-1.5 text-base text-muted-foreground", className)}>
      <Flame aria-hidden className="size-4 text-foreground" />
      <span>
        <b className="font-semibold text-foreground tnum">{days(count)} in a row.</b>{" "}
        {today ? "Today counts." : "Answer one question today to keep it going."}
      </span>
    </p>
  )
}

/** The header chip, on wide screens: a flame and the count, as Brilliant and Duolingo show it. */
export function StreakChip({ className }: { className?: string }) {
  const { count, today } = useStreak()
  if (!count) return null
  return (
    <span
      title={today ? `${days(count)} in a row. Today counts.` : `${days(count)} in a row. Do one thing today to keep it.`}
      className={cn("h-10 items-center gap-1.5 rounded-full bg-muted px-3 text-sm font-semibold tnum", !today && "text-muted-foreground", className)}
    >
      <Flame aria-hidden className={cn("size-4", today && "text-signal")} />
      {count}
      <span className="sr-only"> {count === 1 ? "day" : "days"} in a row{today ? ", today counts" : ""}</span>
    </span>
  )
}
