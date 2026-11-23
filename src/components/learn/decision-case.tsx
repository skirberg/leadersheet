"use client"

import * as React from "react"
import { track } from "@vercel/analytics"
import { ArrowUp, Check as CheckIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fwById } from "@/data/course"
import { GRADE_LABEL, caseKeys, type Case } from "@/data/cases"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"
import { FrameworkRail, rowLine } from "./call-parts"

export { PAIRED, rowLine } from "./call-parts"

/**
 * The lesson's decision case. Pick what you would do: what follows opens under the pick, where you made it, and the
 * framework's rail marks the row the choice uses; where the lesson's model keeps state, the choice moves that model.
 * Picking another moves the mark along the rail. The visitor's own model entries are saved before the first move and
 * can be put back.
 */
export function DecisionCase({ c }: { c: Case }) {
  const { lab, patchLab, touch, state, ready } = useProgress()
  const pickKey = `case-${c.sheet}`
  const wasKey = `case-${c.sheet}-was`
  const pick = ready ? lab<number | null>(pickKey, null) : null
  const was = lab<Record<string, unknown> | null>(wasKey, null)
  const keys = caseKeys(c)
  const f = fwById(c.fw)
  const ch = pick != null ? c.choices[pick] : undefined

  const choose = (i: number) => {
    const next = c.choices[i]
    const patch: Record<string, unknown> = { [pickKey]: i }
    if (keys.length && !was) {
      // null stands for "had nothing here", since JSON drops undefined.
      patch[wasKey] = Object.fromEntries(keys.map((k) => [k, k in state.lab ? state.lab[k] : null]))
    }
    for (const [k, v] of Object.entries(next.seed ?? {})) {
      const mine = state.lab[k]
      if (mine === undefined || mine === "") patch[k] = v
    }
    Object.assign(patch, next.set ?? {})
    patchLab(patch)
    touch()
    track("Case decided", { sheet: c.sheet, grade: next.grade })
  }

  const putBack = () => {
    const patch: Record<string, unknown> = { [pickKey]: undefined, [wasKey]: undefined }
    for (const [k, v] of Object.entries(was ?? {})) patch[k] = v === null ? undefined : v
    patchLab(patch)
  }
  const hadOwn = !!was && Object.values(was).some((v) => v !== null)

  return (
    <div className="grid gap-5 rounded-2xl bg-card p-5 sm:p-6">
      <p className="t-read">
        <b className="font-semibold">{c.role}</b> {c.setup}
      </p>
      <p className="t-question" id={`case-${c.sheet}-ask`}>
        {c.ask}
      </p>
      <div role="group" aria-labelledby={`case-${c.sheet}-ask`} className="grid gap-2">
        {c.choices.map((o, i) => {
          const on = pick === i
          return (
            <div key={i} className="grid gap-2">
              <button type="button" aria-pressed={on} onClick={() => choose(i)} className="choice">
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-rule/70",
                    on && o.grade === "strong" && "border-ok bg-ok text-background",
                    on && o.grade !== "strong" && "border-foreground bg-foreground text-background"
                  )}
                >
                  {on && (o.grade === "strong" ? <CheckIcon className="size-3" strokeWidth={3} /> : o.grade === "costly" ? <X className="size-3" strokeWidth={3} /> : <span className="block size-1.5 rounded-full bg-background" />)}
                </span>
                <span>{o.says}</span>
              </button>
              {/* What follows, under the pick (Brilliant explains where you answered). The live region below says it. */}
              {on && (
                <div aria-hidden className={cn("feedback rise", o.grade === "strong" && "feedback-ok")}>
                  <p className={cn("label-mono", o.grade === "strong" ? "text-ok" : "text-foreground")}>{GRADE_LABEL[o.grade]}</p>
                  <p className="t-read">{o.then}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div role="status" className="sr-only">
        {ch && `${GRADE_LABEL[ch.grade]}. ${ch.then}${f ? ` ${f.name}: ${rowLine(f.id, f.head, f.rows[ch.row])}` : ""}`}
      </div>

      {ch && f && <FrameworkRail f={f} marks={[{ row: ch.row, grade: ch.grade, you: true }]} at={ch.row} />}

      {ch && c.moves && ch.set && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
          <p className="w-full text-base">{c.moves}</p>
          <Button asChild variant="outline" size="sm">
            <a href="#see-it">
              <ArrowUp className="size-4" /> See it in the model
            </a>
          </Button>
          <button type="button" onClick={putBack} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 hover:text-muted-foreground">
            {hadOwn ? "Put back what I had" : "Reset the model"}
          </button>
        </div>
      )}
    </div>
  )
}
