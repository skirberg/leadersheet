"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowLeft, ArrowRight, ChevronDown, Lock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Num } from "@/components/motion/number"
import { lessonPath, sessionById } from "@/data/course"
import { BRS_AGREE, BRS_ITEMS, BRS_NORMAL, brsBand, brsScore } from "@/data/brs"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Disclaimer, GameShell, ProgressLine, useNumberKeys } from "./games"
import { ShareResult } from "./share"

/*
  How fast do you bounce back? The Brief Resilience Scale's six statements, one per screen, in the original wording and
  answer labels (src/data/brs.ts). Built like the job survey: what it is and whose scale before you start, the result
  drawn on the scale's own line with PhenX's normal band on it, and plainly what it measures and what it does not.
*/

type Saved = { a: number[] }

/** The scale from 1 to 5 with the normal band shaded; your score on it once there is one. */
export function BrsLine({ score, label }: { score?: number; label: string }) {
  const at = (x: number) => `${((x - 1) / 4) * 100}%`
  return (
    <div className="grid gap-1" role="img" aria-label={label}>
      <div className="relative mt-6 h-2.5 max-w-[560px] rounded-full bg-border">
        <div className="absolute inset-y-0 rounded-full bg-foreground/25" style={{ left: at(BRS_NORMAL[0]), width: `calc(${at(BRS_NORMAL[1])} - ${at(BRS_NORMAL[0])})` }} />
        <span aria-hidden className="absolute -top-5 -translate-x-1/2 font-mono text-xs whitespace-nowrap text-muted-foreground tnum" style={{ left: at((BRS_NORMAL[0] + BRS_NORMAL[1]) / 2) }}>
          normal {BRS_NORMAL[0].toFixed(2)} to {BRS_NORMAL[1].toFixed(2)}
        </span>
        {score != null && <span aria-hidden className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-signal" style={{ left: at(score) }} />}
      </div>
      <div aria-hidden className="flex max-w-[560px] justify-between font-mono text-xs text-muted-foreground">
        <span>1</span>
        <span>5</span>
      </div>
    </div>
  )
}

export function BounceSurvey() {
  const { lab, setLab, touch, ready } = useProgress()
  const saved = lab<Saved | null>("g-bounce", null)
  const [answers, setAnswers] = React.useState<number[] | null>(null)
  const [i, setI] = React.useState(0)
  const [chosen, setChosen] = React.useState<number | null>(null)
  const advance = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(advance.current), [])

  const n = BRS_ITEMS.length
  const playing = answers !== null && i < n
  const finished = answers !== null && i >= n

  const start = () => {
    setAnswers(Array(n).fill(0))
    setI(0)
    setChosen(null)
  }

  const answer = (v: number) => {
    if (!answers || chosen !== null) return
    const next = answers.map((x, k) => (k === i ? v : x))
    setAnswers(next)
    setChosen(v)
    // a short beat so the tap shows, then the next statement
    clearTimeout(advance.current)
    advance.current = setTimeout(() => {
      setChosen(null)
      setI((k) => k + 1)
      if (i + 1 >= n) {
        setLab("g-bounce", { a: next } satisfies Saved)
        touch()
        track("Resilience scale finished", { band: brsBand(brsScore(next)) })
      }
    }, 220)
  }
  useNumberKeys(5, (k) => answer(k + 1), playing)

  if (!ready) return <div className="min-h-[420px] rounded-2xl bg-card" aria-busy="true" />

  const result = finished ? answers : !answers && saved?.a?.length === n ? saved.a : null
  if (result) return <BounceResult a={result} onAgain={start} />

  if (!playing)
    return (
      <GameShell kind="Survey · 1 min" title="How fast do you bounce back?">
        <p className="max-w-[52ch] text-lg">
          Six statements from the <b className="font-semibold">Brief Resilience Scale</b>. Say how much each one is true of you.
        </p>
        <BrsLine label="What you get: your score from 1 to 5, against the normal range" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button size="lg" onClick={start}>
            Start <ArrowRight className="size-4" />
          </Button>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock aria-hidden className="size-3.5" /> Stays in this browser
          </span>
        </div>
        <Disclaimer>Smith and colleagues (2008), The Brief Resilience Scale, International Journal of Behavioral Medicine. Wording and scoring as the PhenX Toolkit publishes them.</Disclaimer>
      </GameShell>
    )

  const it = BRS_ITEMS[i]
  return (
    <GameShell title="How fast do you bounce back?">
      <ProgressLine value={i} max={n} label="How true is this of you?" />
      <fieldset key={i} className="grid gap-4 animate-in fade-in duration-(--dur-ui)">
        <legend className="t-question mb-2">{it.q}.</legend>
        <div className="grid gap-2">
          {BRS_AGREE.map((l, k) => {
            const v = k + 1
            const on = chosen === v || (chosen === null && answers?.[i] === v)
            return (
              <button key={k} type="button" aria-pressed={on} onClick={() => answer(v)} className="choice group items-center press">
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-[4px] border border-rule/70 font-mono text-xs tnum", on ? "border-foreground bg-foreground text-background" : "text-muted-foreground")}>{v}</span>
                <span>{l}</span>
              </button>
            )
          })}
        </div>
      </fieldset>
      {i > 0 && (
        <div>
          <Button variant="ghost" onClick={() => (clearTimeout(advance.current), setChosen(null), setI((k) => k - 1))}>
            <ArrowLeft className="size-4" /> Back
          </Button>
        </div>
      )}
    </GameShell>
  )
}

function BounceResult({ a, onAgain }: { a: number[]; onAgain: () => void }) {
  const score = brsScore(a)
  const band = brsBand(score)
  const shown = Math.round(score * 100) / 100
  return (
    <GameShell title="How fast do you bounce back?">
      <div className="grid gap-3">
        <p className="label-mono">Brief Resilience Scale</p>
        <p className="font-mono text-7xl leading-none font-medium tracking-tight tnum">
          <Num value={shown} decimals={2} />
        </p>
        <p className="t-read">
          {band === "Normal" ? "In the normal range." : band === "Low" ? "Below the normal range." : "Above the normal range."}
        </p>
        <p role="status" className="sr-only">
          {shown.toFixed(2)}: {band.toLowerCase()} resilience on the Brief Resilience Scale.
        </p>
        <BrsLine score={score} label={`Your score, ${shown.toFixed(2)}, on the line from 1 to 5, against the normal range of 3.00 to 4.30`} />
      </div>

      <div className="feedback">
        <p className="label-mono text-foreground">What it measures</p>
        <p className="text-base">
          Bouncing back: how quickly you recover after stress, the first meaning of resilience. Not how much stress you meet, and not what helps you through it. Lesson {sessionById("s22")?.n} is about the other kind: what keeps a team from coming apart in a crisis.
        </p>
      </div>

      <details className="group/read">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
          <ChevronDown aria-hidden className="size-4 transition-transform group-open/read:rotate-180" />
          How to read it
        </summary>
        <div className="grid gap-2 pt-1 text-base">
          <p>Three statements say you bounce back and three say you struggle to; the second three are scored the other way round, then all six are averaged.</p>
          <p>It is a self-report on one day. Take it again after a hard month and the number can move.</p>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={lessonPath("s22")}>
            Lesson {sessionById("s22")?.n}: {sessionById("s22")?.title} <ArrowRight className="size-4" />
          </Link>
        </Button>
        <ShareResult text={`My Brief Resilience Scale score: ${shown.toFixed(2)} (normal is 3.00 to 4.30).`} path="/play/bounce/" />
        <Button variant="outline" onClick={onAgain}>
          <RotateCcw className="size-4" /> Take it again
        </Button>
      </div>
      <Disclaimer>Items, scoring and the normal range from the PhenX Toolkit&apos;s Brief Resilience Scale protocol (Smith and colleagues, 2008): freely available, no permission needed.</Disclaimer>
    </GameShell>
  )
}
