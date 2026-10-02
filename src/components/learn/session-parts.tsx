"use client"

import * as React from "react"
import { CheckRow } from "@/components/labs/kit"
import { Question } from "./quiz"
import { useProgress } from "@/lib/store"
import type { Session } from "@/data/course"

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
  React.useEffect(() => {
    if (done) setBest(s.id, score)
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
          onAnswer={(ok) => {
            markMiss(`${s.id}-${i}`, ok)
            setAnswers((a) => ({ ...a, [i]: ok }))
          }}
        />
      ))}
      <div className="flex flex-wrap items-center gap-4 border-t border-dashed border-border pt-4" role="status">
        <span className="font-mono text-sm font-medium tnum">
          {done ? `${score} of 3.` : `${Object.keys(answers).length} of 3 answered.`}
          {done && score === 3 && " Sheet signed off."}
        </span>
        {best != null && <span className="font-mono text-xs text-muted-foreground tnum">BEST {best}/3</span>}
        {done && (
          <button
            type="button"
            className="text-sm underline underline-offset-4 hover:text-foreground"
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

export function DueChecklist({ s }: { s: Session }) {
  const { state, setDue } = useProgress()
  if (!s.due?.length) return <p className="text-sm text-muted-foreground">Nothing due before this class.</p>
  return (
    <div>
      {s.due.map((x, i) => {
        const k = `${s.id}-${i}`
        return (
          <CheckRow key={k} id={`due-${k}`} checked={!!state.due[k]} onChange={(v) => setDue(k, v)}>
            {x}
          </CheckRow>
        )
      })}
    </div>
  )
}
