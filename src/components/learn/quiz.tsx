"use client"

import * as React from "react"
import { Check as CheckIcon, ChevronDown, RotateCcw, X } from "lucide-react"
import { type Check, seededOrder } from "@/data/course"
import { SURE } from "@/data/daily"
import { cn } from "@/lib/utils"

/*
  One multiple-choice question, in three moves: pick an answer (you can change it), say how sure you are, then see
  why every option is right or wrong. The confidence comes before the reveal because a miss you were sure of is the
  one feedback corrects best (Butterfield and Metcalfe 2001), and a line for each wrong option because explaining
  beats marking right or wrong (Van der Kleij et al. 2015). A right answer you were guessing on is not counted as
  known: it comes back for review, as confidence-based learning tools do. Order is seeded so it renders the same on
  server and client.
*/
export function Question({
  q,
  qid,
  onAnswer,
  index,
}: {
  q: Check
  qid: string
  /** ok: the answer was right; sure: 0 sure, 1 fairly sure, 2 guessing (SURE in daily.ts) */
  onAnswer?: (ok: boolean, sure: number) => void
  index?: number
}) {
  const [pick, setPick] = React.useState<number | null>(null)
  const [sure, setSure] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState<number | null>(null)
  const order = React.useMemo(() => seededOrder(q.o.length, qid), [q.o.length, qid])
  const result = React.useRef<HTMLParagraphElement>(null)
  const done = sure !== null && pick !== null
  const ok = pick === q.a
  const id = `q-${qid}`

  const decide = (s: number) => {
    if (pick === null) return
    setSure(s)
    onAnswer?.(pick === q.a, s)
    // the buttons that had focus are gone, so move it to what happened
    requestAnimationFrame(() => result.current?.focus())
  }

  // Brilliant's problem card: a label, the question in the serif at 24 px, big choices, then feedback that
  // replaces the choices: a tinted banner with the verdict first and the reason at 20 px, in full ink.
  const head = (
    <div className="grid gap-2">
      {index != null && <span className="label-mono">Question {index + 1}</span>}
      <h3 id={`${id}-q`} className="t-question">
        {q.q}
      </h3>
    </div>
  )

  if (!done)
    return (
      <div className="grid gap-4">
        {head}
        <div role="group" aria-labelledby={`${id}-q`} className="grid gap-2">
          {order.map((i) => {
            const on = pick === i
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                onClick={() => setPick(i)}
                className="choice items-center"
              >
                <span aria-hidden className={cn("grid size-5 shrink-0 place-items-center rounded-full border border-rule/70", on && "border-foreground bg-foreground")} />
                <span>{q.o[i]}</span>
              </button>
            )
          })}
        </div>
        {pick !== null && (
          <div className="grid gap-2 pt-1">
            <span className="label-mono" id={`${id}-sure`}>
              How sure are you?
            </span>
            <div role="group" aria-labelledby={`${id}-sure`} className="flex flex-wrap gap-2">
              {SURE.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => decide(i)}
                  className="inline-flex min-h-11 items-center rounded-full border border-foreground px-5 text-base font-medium transition-colors duration-(--dur-ui) hover:bg-foreground hover:text-background active:scale-[0.98]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )

  const guessed = ok && sure === 2
  const right = ok && !guessed
  const verdict = ok ? (guessed ? "Right, on a guess" : "Right") : "Not quite"
  const others = order.filter((i) => i !== q.a && i !== pick)
  return (
    <div className="grid gap-4">
      {head}
      <div className={cn("feedback", right && "feedback-ok")}>
        <p ref={result} tabIndex={-1} role="status" className="grid gap-2 outline-none">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              aria-hidden
              className={cn("grid size-6 shrink-0 place-items-center rounded-full", right ? "bg-ok text-background" : "bg-foreground text-background")}
            >
              {ok ? <CheckIcon className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
            </span>
            <span className={cn("label-mono", right ? "text-ok" : "text-foreground")}>{verdict}</span>
            {sure === 0 && (
              <span className="label-mono basis-full pl-8">You were sure</span>
            )}
          </span>
          {ok ? (
            <span className="t-read">{q.why}</span>
          ) : (
            <>
              <span className="t-read">
                <b className="font-semibold">{q.o[pick!]}</b>: {q.not?.[pick!]}
              </span>
              <span className="text-base">
                <b className="font-semibold">The answer is {q.o[q.a]}.</b> {q.why}
              </span>
            </>
          )}
          {(guessed || !ok) && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <RotateCcw aria-hidden className="size-3.5" /> Review tomorrow
            </span>
          )}
        </p>
      </div>
      {others.length > 0 && (
        <div className="grid gap-2">
          <p className="label-mono">Why not the others</p>
          {/* each one says why not on a tap, so the reveal reads as the verdict and its reason first */}
          <ul className="grid gap-1">
            {others.map((i) => (
              <li key={i} className="grid">
                <button
                  type="button"
                  aria-expanded={open === i}
                  aria-controls={`${id}-why-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                  disabled={!q.not?.[i]}
                  className="-mx-3 grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-md px-3 py-2 text-left text-base font-semibold transition-colors duration-(--dur-ui) enabled:hover:bg-muted"
                >
                  {q.o[i]}
                  <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-(--dur-ui)", open === i && "rotate-180")} />
                </button>
                {q.not?.[i] && (
                  <p id={`${id}-why-${i}`} hidden={open !== i} className="pb-2 text-base">
                    {q.not[i]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
