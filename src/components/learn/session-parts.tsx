"use client"

import { track } from "@vercel/analytics"
import * as React from "react"
import { Question } from "./quiz"
import { Burst } from "@/components/play/burst"
import { StreakLine } from "./streak"
import { useProgress } from "@/lib/store"
import type { Session } from "@/data/course"
import { cn } from "@/lib/utils"

export function SeenMarker({ id }: { id: string }) {
  const { markSeen, ready } = useProgress()
  React.useEffect(() => {
    if (ready) markSeen(id)
  }, [id, ready, markSeen])
  return null
}

export function SessionQuiz({ s }: { s: Session }) {
  const { setBest, markMiss, state } = useProgress()
  const [answers, setAnswers] = React.useState<Record<number, boolean>>({})
  const [round, setRound] = React.useState(0)
  const done = Object.keys(answers).length === s.checks.length
  const score = Object.values(answers).filter(Boolean).length
  const total = s.checks.length
  React.useEffect(() => {
    if (done) {
      setBest(s.id, score)
      track("Check finished", { sheet: s.id, score: `${score}/${s.checks.length}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])
  const best = state.best[s.id]
  return (
    <div className="grid gap-8">
      {s.checks.map((q, i) => (
        <Question
          key={`${round}-${i}`}
          q={q}
          qid={`${s.id}-${i}`}
          index={i}
          onAnswer={(ok, sure) => {
            markMiss(`${s.id}-${i}`, ok, sure)
            setAnswers((a) => ({ ...a, [i]: ok }))
          }}
        />
      ))}
      <div className="relative flex flex-wrap items-center gap-4 pt-2" role="status">
        <Burst fire={done && score === total ? round + 1 : 0} className="!place-items-start" />
        {/* The count shows once it is a score; until then each question's mark says it, and only a screen reader hears it. */}
        <span className={cn("font-mono text-sm font-medium tnum", !done && "sr-only")}>
          {done ? `${score} of ${total}.` : `${Object.keys(answers).length} of ${total} answered.`}
          {done && score === total && " Right today. Try it cold in a few days, in Practice."}
        </span>
        {best != null && (
          <span className="text-sm text-muted-foreground tnum">
            Best {best} of {total}
          </span>
        )}
        {done && <StreakLine className="w-full" />}
        {done && (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 hover:text-muted-foreground"
            onClick={() => {
              setAnswers({})
              setRound((r) => r + 1)
            }}
          >
            Take it again
          </button>
        )}
      </div>
    </div>
  )
}
