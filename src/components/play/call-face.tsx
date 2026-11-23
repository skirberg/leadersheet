import type * as React from "react"
import type { Case } from "@/data/cases"
import { CASES } from "@/data/cases"
import { callScript } from "@/data/daily"
import { cn } from "@/lib/utils"

/*
  The first screen of a call: the day's line, whose call it is and what happened, the question, the choices. One set of
  parts for the live call (todays-call.tsx) and for the copy the page paints before any JavaScript arrives (CallPreviews),
  so the two cannot drift apart and nothing moves when the live one takes over.
*/

// The day's line only: the lesson a call comes from is linked under its result, so it is not named up here as well.
export function CallLine({ no }: { no: React.ReactNode }) {
  return <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">{no}</div>
}

export function CallCard({ c, askId, children }: { c: Case; askId: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-5 rounded-2xl bg-card p-5 sm:p-7">
      <p className="t-read">
        <b className="font-semibold">{c.role}</b> {c.setup}
      </p>
      <p className="t-question sm:text-3xl" id={askId}>
        {c.ask}
      </p>
      {children}
    </div>
  )
}

export function CallChoices({ c, askId, pick, onPick }: { c: Case; askId: string; pick?: number | null; onPick?: (i: number) => void }) {
  return (
    <div role="group" aria-labelledby={askId} className="grid gap-2">
      {c.choices.map((o, i) => {
        const on = pick === i
        return (
          <button key={i} type="button" aria-pressed={on} onClick={onPick && (() => onPick(i))} className="choice">
            <span aria-hidden className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-rule/70", on && "border-foreground bg-foreground")} />
            <span>{o.says}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Every case, hidden, and a few lines of script that show the visitor's own day's case while the page is still loading.
 * The day is the visitor's, so the server cannot pick it; without this the page drew a blank card until the bundle ran
 * (Lighthouse on a phone: the case painted at 4.3 s). React keeps the shown case and its date line as the script left
 * them (suppressHydrationWarning) until the live call replaces them with the same layout.
 */
export function CallPreviews() {
  return (
    <>
      {CASES.map((c, i) => (
        <div key={c.sheet} data-call={i} hidden suppressHydrationWarning className="grid gap-6">
          <CallLine no={<p className="label-mono" data-call-no suppressHydrationWarning>Today&apos;s call</p>} />
          <CallCard c={c} askId={`today-ask-${i}`}>
            <CallChoices c={c} askId={`today-ask-${i}`} />
          </CallCard>
        </div>
      ))}
      <script dangerouslySetInnerHTML={{ __html: callScript(CASES.length) }} />
    </>
  )
}
