"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowRight } from "lucide-react"
import { FrameworkRail, GradeMark, OtherCall } from "@/components/learn/call-parts"
import { CallCard, CallChoices, CallLine } from "@/components/play/call-face"
import { ShareResult } from "@/components/play/share"
import { CASES, GRADE_LABEL } from "@/data/cases"
import { fwById, lessonPath, sessionById } from "@/data/course"
import { SURE, callIndex, callNumber, minutesToNext } from "@/data/daily"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

/*
  Today's call. The day's decision: pick what you would do, say how sure you are, then see what follows, why each
  other call falls short, and where yours sits in the lesson's framework. One call a day, kept in the visitor's own
  browser; it counts for the streak like any other learning. The confidence comes before the reveal because a miss you
  were sure of is the one that sticks.
*/

type Log = Record<string, { i: number; sure: number }>
const callCase = (n: number) => CASES[callIndex(n, CASES.length)]

/** `children` is what shows until the browser has said what day it is: the page's painted copy of the day's case. */
export function TodaysCall({ children }: { children?: React.ReactNode }) {
  const { lab, patchLab, touch, ready } = useProgress()
  // the day is the visitor's own, so nothing is drawn until the browser says what day it is
  const [now, setNow] = React.useState<Date | null>(null)
  const [pick, setPick] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState<number | null>(null)
  React.useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  if (!now || !ready) return children ?? <div className="min-h-[520px] rounded-2xl bg-card" aria-busy="true" />

  const n = callNumber(now)
  const c = callCase(n)
  const log = lab<Log>("daily", {})
  const done = log[n]
  const lesson = sessionById(c.sheet)
  const f = fwById(c.fw)
  const chosen = done ? c.choices[done.i] : undefined

  const decide = (sure: number) => {
    if (pick == null) return
    patchLab({ daily: { ...log, [n]: { i: pick, sure } } })
    touch()
    track("Daily call", { n, sheet: c.sheet, grade: c.choices[pick].grade, sure: SURE[sure] })
  }

  // the record: every call made, and how often "sure" was right
  const made = Object.entries(log).map(([k, v]) => ({ grade: callCase(Number(k)).choices[v.i]?.grade, sure: v.sure }))
  const strong = made.filter((m) => m.grade === "strong").length
  const sureOnes = made.filter((m) => m.sure === 0)
  const sureRight = sureOnes.filter((m) => m.grade === "strong").length
  const mins = minutesToNext(now)

  return (
    <div className="grid gap-6">
      <CallLine no={<p className="label-mono">No. {n} · {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>} />

      <CallCard c={c} askId="today-ask">
        {!done && (
          <>
            <CallChoices c={c} askId="today-ask" pick={pick} onPick={setPick} />
            {pick != null && (
              <div className="grid gap-3 border-t border-border pt-5">
                <p className="label-mono" id="today-sure">How sure are you?</p>
                <div role="group" aria-labelledby="today-sure" className="flex flex-wrap gap-2">
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
          </>
        )}

        {done && chosen && (
          <div className="grid gap-5">
            <p role="status" className="sr-only">
              {GRADE_LABEL[chosen.grade]}, and you said {SURE[done.sure].toLowerCase()}. {chosen.then}
            </p>
            {/* Every call stays where it was and takes its mark (NYT Games reveals in the grid you played); yours says
                what follows, the others open on a tap. */}
            <ul className="grid gap-1.5" aria-label="Every call, and how it goes">
              <li className={cn("feedback mb-1", chosen.grade === "strong" && "feedback-ok")}>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <GradeMark g={chosen.grade} />
                  <span className={cn("label-mono", chosen.grade === "strong" ? "text-ok" : "text-foreground")}>{GRADE_LABEL[chosen.grade]}</span>
                  <span className="label-mono basis-full pl-7">You said {SURE[done.sure].toLowerCase()}</span>
                </p>
                <p className="text-base font-semibold">{chosen.says}</p>
                <p className="t-read">{chosen.then}</p>
              </li>
              {c.choices.map((o, i) =>
                i === done.i ? null : (
                  <OtherCall key={i} id={`today-why-${i}`} grade={o.grade} says={o.says} then={o.then} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
                )
              )}
            </ul>
            {f && (
              <FrameworkRail
                f={f}
                marks={c.choices.map((o, i) => ({ row: o.row, grade: o.grade, you: i === done.i }))}
                at={(open != null ? c.choices[open] : chosen).row}
                className="border-t border-border pt-4"
              />
            )}
          </div>
        )}
      </CallCard>

      {done && chosen && (
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-5">
          <div className="grid gap-2">
            <p className="text-lg font-semibold whitespace-nowrap">Next call in {mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`}</p>
            {/* The record as marks, one per call made (Wordle's grid, GitHub's year of squares), not a sentence. */}
            <ol className="flex flex-wrap gap-1" aria-label={`${made.length} ${made.length === 1 ? "call" : "calls"} made, ${strong} strong${sureOnes.length ? `; when you were sure, ${sureRight} of ${sureOnes.length} strong` : ""}`}>
              {made.slice(-28).map((m, k) => (
                <li key={k}>{m.grade ? <GradeMark g={m.grade} /> : null}</li>
              ))}
            </ol>
            {sureOnes.length > 1 && (
              <p className="text-sm text-muted-foreground tnum" aria-hidden>
                Sure: {sureRight} of {sureOnes.length} strong
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <ShareResult text={`Leadersheet, today's call No. ${n}: ${GRADE_LABEL[chosen.grade]}, and I was ${SURE[done.sure].toLowerCase()}.`} path="/today/" />
            {lesson && (
              <Link href={lessonPath(lesson.id)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-base font-medium underline-offset-4 hover:underline">
                Lesson {lesson.n}: {lesson.title} <ArrowRight className="size-4" />
              </Link>
            )}
            <Link href="/today/class/" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-base font-medium underline-offset-4 hover:underline">
              Run it with a room <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/** The way in from the home page: the call's number and its question, or how it went today. */
export function TodayLink() {
  const { lab, ready } = useProgress()
  const [now, setNow] = React.useState<Date | null>(null)
  React.useEffect(() => setNow(new Date()), [])
  if (!now || !ready) return <div className="min-h-[76px] w-full max-w-cols-6" />
  const n = callNumber(now)
  const c = callCase(n)
  const done = lab<Log>("daily", {})[n]
  const grade = done ? c.choices[done.i]?.grade : undefined
  return (
    <Link
      href="/today/"
      className="group grid w-full max-w-cols-6 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 rounded-2xl border border-border bg-card px-5 py-3.5 text-left transition-[border-color,transform] duration-(--dur-ui) hover:border-foreground/60 active:scale-[0.99]"
    >
      <span className="label-mono">Today&apos;s call</span>
      <ArrowRight className="row-span-2 size-5 transition-transform duration-(--dur-ui) group-hover:translate-x-0.5" />
      <span className="line-clamp-2 text-base leading-snug font-semibold">{grade ? `${GRADE_LABEL[grade]}. See why, and come back tomorrow.` : c.ask}</span>
    </Link>
  )
}
