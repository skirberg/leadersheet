"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowLeft, ArrowRight, ChevronDown, Lock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Num } from "@/components/motion/number"
import { lessonPath } from "@/data/course"
import { JDS_ACCURACY, JDS_DIMS, JDS_ITEMS, JDS_NORMS, jdsBand, jdsScore } from "@/data/jds"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Disclaimer, GameShell, ProgressLine, useNumberKeys } from "./games"
import { ShareResult } from "./share"

/*
  Diagnose your job: the Job Diagnostic Survey's fifteen core items, one per screen (src/data/jds.ts). Built the way
  the better self-assessment sites build theirs: say up front what it is, how long it takes, whose scale it is and
  that nothing leaves the device (Greater Good Science Center); keep the instrument's own wording and answer labels so
  the norms still apply; report a band, not a percentile, since the authors' data cannot support one; end on the one
  thing to change, not a label; say plainly what the score is not (VIA: "the scale does not trump the life").
*/

type Saved = { a: number[] }

// what to ask yourself about the characteristic furthest below the typical job: questions, not claims
const ASK = [
  "What part of the work could use a skill you rarely get to use?",
  "Could you take one piece of work from start to finish instead of handing it on halfway?",
  "Who uses what you make? Could you see it land, or hear from them?",
  "Which decision about how you do the work could you make yourself, without asking?",
  "How could the work itself show you how you did, without waiting for someone to tell you?",
]

export function JobSurvey() {
  const { lab, setLab, patchLab, touch, ready } = useProgress()
  const saved = lab<Saved | null>("g-job", null)
  const [answers, setAnswers] = React.useState<number[] | null>(null)
  const [i, setI] = React.useState(0)
  const [chosen, setChosen] = React.useState<number | null>(null)
  const advance = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(advance.current), [])

  const n = JDS_ITEMS.length
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
    // a short beat so the tap shows, then the next question
    clearTimeout(advance.current)
    advance.current = setTimeout(() => {
      setChosen(null)
      setI((k) => k + 1)
      if (i + 1 >= n) {
        setLab("g-job", { a: next } satisfies Saved)
        touch()
        track("Job survey finished", { mps: Math.round(jdsScore(next).mps) })
      }
    }, 220)
  }
  useNumberKeys(7, (k) => answer(k + 1), playing)

  if (!ready) return <div className="min-h-[520px] rounded-2xl bg-card" aria-busy="true" />

  // the result: just finished, or a saved one from before
  const result = finished ? answers : !answers && saved?.a?.length === n ? saved.a : null
  if (result) return <JobResult a={result} onAgain={start} patchLab={patchLab} />

  if (!playing)
    return (
      <GameShell kind="Survey · 4 min" title="Diagnose your job">
        <p className="max-w-[52ch] text-lg">
          Fifteen questions from Hackman and Oldham&apos;s <b className="font-semibold">Job Diagnostic Survey</b>. Describe the job as it is, not how much you like it.
        </p>
        {/* What you get, drawn before you start (the result's own bars, empty, with the typical job's tick). */}
        <JobBars label="What you get: your job's five characteristics against the typical job" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button size="lg" onClick={start}>
            Start <ArrowRight className="size-4" />
          </Button>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock aria-hidden className="size-3.5" /> Stays in this browser
          </span>
        </div>
        <Disclaimer>
          Items from Hackman and Oldham (1974), The Job Diagnostic Survey, Yale technical report No. 4. Norms from Hackman and Oldham (1980), Work Redesign: 6,930 employees in 876 jobs.
        </Disclaimer>
      </GameShell>
    )

  const it = JDS_ITEMS[i]
  const labels = it.part === 1 ? [it.anchors[0], "", "", it.anchors[1], "", "", it.anchors[2]] : JDS_ACCURACY
  // Part two rates statements, not questions, so it says what the scale is about; part one's anchors say it already.
  const stem = it.part === 2 ? "How accurately does this describe your job?" : null
  return (
    <GameShell title="Diagnose your job">
      <ProgressLine value={i} max={n} label={it.part === 1 ? "Part one" : "Part two"} />
      <fieldset key={i} className="grid gap-4 animate-in fade-in duration-(--dur-ui)">
        <legend className="grid gap-2">
          {stem && <span className="label-mono">{stem}</span>}
          <span className="t-question block">{it.q}</span>
        </legend>
        <div className="grid gap-1.5">
          {labels.map((l, k) => {
            const v = k + 1
            const on = chosen === v || (chosen === null && answers?.[i] === v)
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => answer(v)}
                className={cn(
                  "group flex min-h-11 w-full items-center gap-3 rounded-[14px] border border-border bg-card px-3 py-2 text-left text-base leading-snug press hover:border-foreground/60 hover:bg-background",
                  on && "border-foreground bg-foreground text-background hover:bg-foreground"
                )}
              >
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-[4px] border border-rule/70 font-mono text-xs tnum", on ? "border-background/50" : "text-muted-foreground")}>{v}</span>
                {l ? <span>{l}</span> : <span className="sr-only">{v} of 7</span>}
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

/**
 * The five characteristics as bars from 1 to 7, the typical job a tick on each, its value written on the tick (the
 * annotation on the picture, as Robinhood draws the previous close). Empty, it is the preview of what you get.
 */
export function JobBars({ dims, low, label }: { dims?: number[]; low?: number; label: string }) {
  const pos = (x: number) => `${((x - 1) / 6) * 100}%`
  return (
    <ul className="grid gap-4" aria-label={label}>
      {JDS_DIMS.map((name, k) => {
        const v = dims?.[k]
        const band = v == null ? null : jdsBand(k, v)
        const typ = JDS_NORMS.mean[k]
        return (
          <li key={k} className="grid gap-1">
            <p className="flex items-baseline justify-between gap-x-3">
              <span className={cn("font-semibold", v == null && "font-medium text-muted-foreground")}>{name}</span>
              {v != null && band && (
                <span className="font-mono text-sm tnum">
                  {band.where !== "Near" && <span className={cn("mr-2 font-sans text-sm", k === low ? "text-signal-text" : "text-muted-foreground")}>{band.where.toLowerCase()}</span>}
                  {v.toFixed(1)}
                  <span className="sr-only">, typical {typ.toFixed(1)}, {band.where.toLowerCase()}</span>
                </span>
              )}
            </p>
            <div className="relative mt-4 h-2.5 rounded-full bg-border" aria-hidden>
              {v != null && <div className={cn("absolute inset-y-0 left-0 rounded-full", k === low ? "bg-signal" : "bg-foreground")} style={{ width: pos(v) }} />}
              <div className="absolute -inset-y-1 w-0.5 rounded-full bg-muted-foreground" style={{ left: `calc(${pos(typ)} - 1px)` }} />
              <span className="absolute -top-5 -translate-x-1/2 font-mono text-xs whitespace-nowrap text-muted-foreground tnum" style={{ left: pos(typ) }}>
                {k === 0 ? `typical ${typ.toFixed(1)}` : typ.toFixed(1)}
              </span>
            </div>
          </li>
        )
      })}
      <li aria-hidden className="-mt-2 flex justify-between font-mono text-xs text-muted-foreground">
        <span>1</span>
        <span>7</span>
      </li>
    </ul>
  )
}

function JobResult({ a, onAgain, patchLab }: { a: number[]; onAgain: () => void; patchLab: (p: Record<string, unknown>) => void }) {
  const { dims, mps, mean } = jdsScore(a)
  const bands = dims.map((v, k) => jdsBand(k, v))
  // the lever: furthest below the typical job; on a tie, autonomy and feedback first, since they multiply the rest
  const order = dims.map((_, k) => k).sort((x, y) => bands[x].z - bands[y].z || (y >= 3 ? 1 : 0) - (x >= 3 ? 1 : 0))
  const low = order[0]
  const lowBelow = bands[low].z < 0
  const normMean = JDS_NORMS.mean.reduce((s, v) => s + v, 0) / 5
  const [placed, setPlaced] = React.useState(false)
  const r = Math.round(mps)
  // the score's own scale, 1 to 343, with the typical job on it
  const at = (x: number) => `${((x - 1) / 342) * 100}%`
  return (
    <GameShell title="Diagnose your job">
      <div className="grid gap-3">
        <p className="label-mono">Motivating potential score</p>
        <p className="font-mono text-7xl leading-none font-medium tracking-tight tnum">
          <Num value={r} />
        </p>
        <p role="status" className="sr-only">
          {r}. The typical job in Hackman and Oldham&apos;s norms scores {JDS_NORMS.mps}, on a range of 1 to 343.
        </p>
        <div aria-hidden className="relative mt-6 mb-5 h-2.5 max-w-[560px] rounded-full bg-border">
          <div className="absolute inset-y-0 left-0 rounded-full bg-foreground" style={{ width: at(r) }} />
          <div className="absolute -inset-y-1 w-0.5 rounded-full bg-muted-foreground" style={{ left: `calc(${at(JDS_NORMS.mps)} - 1px)` }} />
          <span aria-hidden className="absolute -top-5 -translate-x-1/2 font-mono text-xs whitespace-nowrap text-muted-foreground tnum" style={{ left: at(JDS_NORMS.mps) }}>
            typical {JDS_NORMS.mps}
          </span>
          <span aria-hidden className="absolute top-4 left-0 font-mono text-xs text-muted-foreground">1</span>
          <span aria-hidden className="absolute top-4 right-0 font-mono text-xs text-muted-foreground">343</span>
        </div>
      </div>

      <JobBars dims={dims} low={lowBelow ? low : undefined} label="Your job's five characteristics against the typical job" />

      <div className="grid gap-2 rounded-md border-l-2 border-foreground bg-muted px-4 py-3.5">
        {lowBelow ? (
          <>
            <p className="font-semibold">
              Furthest below the typical job: {JDS_DIMS[low].toLowerCase()}.
              {low >= 3 && " It multiplies the whole score, so a point here moves it most."}
            </p>
            <p className="text-base leading-relaxed">{ASK[low]}</p>
          </>
        ) : (
          <p className="font-semibold">Every characteristic is at or above the typical job. Ask whether the job feels that way.</p>
        )}
      </div>

      <details className="group/read">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
          <ChevronDown aria-hidden className="size-4 transition-transform group-open/read:rotate-180" />
          How to read it
        </summary>
        <div className="grid gap-2 pt-1 text-base">
          <p>
            The plain average of the five is {mean.toFixed(1)} (typical {normMean.toFixed(1)}). In Hackman and Oldham&apos;s own test, that simple average predicted motivation and satisfaction slightly better than the multiplied score.
          </p>
          <p>
            They built the survey for groups of five or more in the same job, not for one person. Read yours as a prompt, not a verdict: you know the job better than fifteen questions do.
          </p>
          <p>A difference under one standard deviation from the typical job is no real difference, so those bars carry no word.</p>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link
            href={`${lessonPath("s10")}#see-it`}
            onClick={() => {
              patchLab({ jcm: dims.map((v) => Math.min(7, Math.max(1, Math.round(v)))) })
              setPlaced(true)
            }}
          >
            {placed ? "Opening lesson 10" : "Put my job in lesson 10’s model"} <ArrowRight className="size-4" />
          </Link>
        </Button>
        <ShareResult text={`My job's motivating potential score on the Job Diagnostic Survey: ${r}. The typical job's is ${JDS_NORMS.mps}.`} path="/play/job/" />
        <Button variant="outline" onClick={onAgain}>
          <RotateCcw className="size-4" /> Take it again
        </Button>
      </div>
      <Disclaimer>
        Items from Hackman and Oldham (1974). Norms and the reading rule (under one standard deviation from the typical job is no real difference) from Work Redesign (1980). The simple-average result is from their 1976 test of the theory.
      </Disclaimer>
    </GameShell>
  )
}
