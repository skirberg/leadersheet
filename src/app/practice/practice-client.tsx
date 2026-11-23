"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check as CheckIcon, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Question } from "@/components/learn/quiz"
import { FrameworkCard } from "@/components/learn/framework-card"
import { FRAMEWORKS, SESSIONS, findCheck, fwById, sessionById, sheetNo } from "@/data/course"
import { SCENARIOS } from "@/data/labs"
import { dueOf, useProgress } from "@/lib/store"
import { useStreak } from "@/components/learn/streak"
import { cn } from "@/lib/utils"
import { SheetLink } from "@/components/sheet/sheet-link"

const shuffle = <T,>(a: T[]) => {
  const x = [...a]
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j], x[i]]
  }
  return x
}

function Stats() {
  const { state, ready } = useProgress()
  const streak = useStreak()
  const answered = SESSIONS.reduce((a, s) => a + (state.best[s.id] ?? 0), 0)
  const total = SESSIONS.reduce((a, s) => a + s.checks.length, 0)
  const sureTally = ready ? (state.lab.calib as Record<string, [number, number]> | undefined)?.[0] : undefined
  const calib = sureTally && sureTally[1] > 0 ? sureTally : null
  // Each number gets a two- or three-word label and, where it helps, a drawing of what it counts: no caption sentences
  // in boxes. A row with hairlines between, the way Apple Maps' place card sets one fact per cell.
  const right = calib ? calib[0] / calib[1] : 0
  return (
    <dl className="grid grid-cols-2 gap-y-6 border-y border-border py-5 lg:grid-cols-4 lg:divide-x lg:divide-border [&>div]:px-4 lg:[&>div:first-child]:pl-0 max-lg:[&>div:nth-child(odd)]:border-r max-lg:[&>div:nth-child(odd)]:border-border max-lg:[&>div:nth-child(odd)]:pl-0">
      <div className="grid min-w-0 content-start gap-1.5">
        <dt className="label-mono order-2">Checks right</dt>
        <dd className="order-1 font-mono text-2xl font-medium tnum sm:text-3xl">
          {ready ? answered : 0}
          <span className="text-muted-foreground">/{total}</span>
        </dd>
        <dd aria-hidden className="order-3 h-1 overflow-hidden rounded-full bg-border">
          <span className="block h-full rounded-full bg-foreground" style={{ width: `${((ready ? answered : 0) / total) * 100}%` }} />
        </dd>
      </div>
      <div className="grid min-w-0 content-start gap-1.5">
        <dt className="label-mono order-2">Due today</dt>
        <dd className="order-1 font-mono text-2xl font-medium tnum sm:text-3xl">{ready ? dueOf(state.review).length : 0}</dd>
        {/* the schedule, drawn: a miss comes back after 1, 3, 7 and 21 days */}
        <dd className="order-3 mt-1">
          <span className="relative block h-5" role="img" aria-label="Misses come back 1, 3, 7 and 21 days later">
          <span aria-hidden className="absolute inset-x-0 top-1 h-px bg-border" />
          {[1, 3, 7, 21].map((d) => (
            <span key={d} aria-hidden className="absolute top-0 grid -translate-x-1/2 justify-items-center gap-0.5" style={{ left: `${(Math.sqrt(d) / Math.sqrt(21)) * 92 + 4}%` }}>
              <span className="size-2 rounded-full bg-foreground" />
              <span className="font-mono text-xs leading-none text-muted-foreground">{d}</span>
            </span>
          ))}
          </span>
        </dd>
      </div>
      <div className="grid min-w-0 content-start gap-1.5">
        <dt className="label-mono order-2">{calib ? "Right when sure" : "When sure"}</dt>
        <dd className="order-1 font-mono text-2xl font-medium tnum sm:text-3xl">
          {calib ? calib[0] : 0}
          {calib && <span className="text-muted-foreground">/{calib[1]}</span>}
        </dd>
        <dd aria-hidden className="order-3 h-1 overflow-hidden rounded-full bg-border">
          <span className="block h-full rounded-full bg-foreground" style={{ width: `${right * 100}%` }} />
        </dd>
      </div>
      <div className="grid min-w-0 content-start gap-1.5">
        <dt className="label-mono order-2">Days in a row</dt>
        <dd className="order-1 font-mono text-2xl font-medium tnum sm:text-3xl">{streak.count}</dd>
        {streak.count > 0 && !streak.today && <dd className="order-3 text-sm text-muted-foreground">Do one today.</dd>}
      </div>
    </dl>
  )
}

/* The drill takes ten questions from anywhere, misses first. The final test takes one from every lesson: a lesson's missed question if it has one, and lessons with a miss come first. Review asks only what is due today (store.tsx, review.ts). */
function Drill({ final = false, review = false }: { final?: boolean; review?: boolean }) {
  const { state, ready, markMiss } = useProgress()
  const [qs, setQs] = React.useState<string[] | null>(null)
  const [i, setI] = React.useState(0)
  const [score, setScore] = React.useState(0)
  const [answered, setAnswered] = React.useState(false)
  // The latest miss list, so "Drill again" and a returning visitor both start from what was actually missed.
  const missRef = React.useRef(state.miss)
  missRef.current = state.miss
  const reviewRef = React.useRef(state.review)
  reviewRef.current = state.review
  const start = React.useCallback(() => {
    const pool = SESSIONS.flatMap((s) => s.checks.map((_, k) => `${s.id}-${k}`))
    if (review) {
      setQs(dueOf(reviewRef.current).filter((x) => pool.includes(x)))
      setI(0)
      setScore(0)
      setAnswered(false)
      return
    }
    const miss = shuffle(missRef.current.filter((x) => pool.includes(x)))
    if (final) {
      const one = SESSIONS.map((s) => miss.find((x) => x.split("-")[0] === s.id) ?? `${s.id}-${Math.floor(Math.random() * s.checks.length)}`)
      setQs([...shuffle(one.filter((x) => miss.includes(x))), ...shuffle(one.filter((x) => !miss.includes(x)))])
    } else {
      const rest = shuffle(pool.filter((x) => !miss.includes(x)))
      setQs([...miss, ...rest].slice(0, 10))
    }
    setI(0)
    setScore(0)
    setAnswered(false)
  }, [final, review])
  // The first set waits for saved progress to load, so yesterday's misses come first too.
  React.useEffect(() => {
    if (ready) start()
  }, [ready, start])
  if (!qs) return <div className="h-80" />
  if (review && !qs.length) return <ReviewEmpty />
  if (i >= qs.length)
    return (
      <div className="rounded-2xl grid gap-4 bg-card p-6">
        <p className="font-mono text-6xl font-medium tnum">
          {score}
          <span className="text-muted-foreground">/{qs.length}</span>
        </p>
        <p className="text-muted-foreground">{review ? "Right ones come back later, a miss comes back tomorrow." : "Missed questions come back first next time."}</p>
        {!review && (
          <div>
            <Button onClick={start}>
              <RotateCcw className="size-4" /> {final ? "Take it again" : "Drill again"}
            </Button>
          </div>
        )}
      </div>
    )
  const qid = qs[i],
    q = findCheck(qid)!,
    s = sessionById(qid.split("-")[0])!
  return (
    <div className="rounded-2xl grid gap-5 bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="shrink-0 font-mono text-xs whitespace-nowrap text-muted-foreground tnum">
          {i + 1} of {qs.length}
        </span>
        <span className="label-mono text-right">
          {sheetNo(s.n)} · {s.title}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full origin-left bg-foreground transition-transform duration-(--dur-ui) ease-(--ease-draft)" style={{ transform: `scaleX(${i / qs.length})` }} />
      </div>
      <Question
        key={qid + i}
        q={q}
        qid={qid}
        onAnswer={(ok, sure) => {
          markMiss(qid, ok, sure)
          if (ok) setScore((x) => x + 1)
          setAnswered(true)
        }}
      />
      {answered && (
        <div>
          <Button
            autoFocus
            onClick={() => {
              setI((x) => x + 1)
              setAnswered(false)
            }}
          >
            Next <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

/* Nothing due: say when the next one is, or how review fills up. */
function ReviewEmpty() {
  const { state } = useProgress()
  const next = Object.values(state.review).map((r) => r.due).sort()[0]
  const when = next ? new Date(next + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : null
  return (
    <div className="grid gap-2 rounded-2xl bg-card p-6">
      <p className="text-xl font-semibold">Nothing due today.</p>
      <p className="text-muted-foreground">
        {when ? `The next question comes back ${when}.` : "A question you miss in a lesson's check or a drill comes back here the next day, then 3, 7 and 21 days after that."}
      </p>
    </div>
  )
}

function Match() {
  const [order, setOrder] = React.useState<number[] | null>(null)
  const [k, setK] = React.useState(0)
  const [score, setScore] = React.useState(0)
  const [opts, setOpts] = React.useState<string[]>([])
  const [pick, setPick] = React.useState<string | null>(null)
  const start = () => {
    setOrder(shuffle(SCENARIOS.map((_, i) => i)).slice(0, 6))
    setK(0)
    setScore(0)
    setPick(null)
  }
  React.useEffect(() => start(), [])
  React.useEffect(() => {
    if (!order || k >= order.length) return
    const right = SCENARIOS[order[k]][1]
    const others = shuffle(FRAMEWORKS.filter((f) => f.id !== right).map((f) => f.id)).slice(0, 3)
    setOpts(shuffle([...others, right]))
    setPick(null)
  }, [order, k])
  if (!order) return <div className="h-80" />
  if (k >= order.length)
    return (
      <div className="rounded-2xl grid gap-4 bg-card p-6">
        <p className="font-mono text-6xl font-medium tnum">
          {score}
          <span className="text-muted-foreground">/{order.length}</span>
        </p>
        <div>
          <Button onClick={start}>
            <RotateCcw className="size-4" /> Six more
          </Button>
        </div>
      </div>
    )
  const sc = SCENARIOS[order[k]],
    right = fwById(sc[1])!
  return (
    <div className="rounded-2xl grid gap-5 bg-card p-5 sm:p-6">
      <span className="font-mono text-xs text-muted-foreground tnum">
        Situation {k + 1} of {order.length}
      </span>
      <p className="t-question">{sc[0]}</p>
      <p className="text-sm text-muted-foreground">Which framework helps most?</p>
      <div className="grid gap-2">
        {opts.map((id) => {
          const f = fwById(id)!
          const isRight = pick && id === sc[1]
          const isWrong = pick === id && id !== sc[1]
          return (
            <button
              key={id}
              type="button"
              disabled={!!pick}
              onClick={() => {
                setPick(id)
                if (id === sc[1]) setScore((x) => x + 1)
              }}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-2.5 text-left text-base transition-colors",
                !pick && "hover:border-foreground/50",
                isRight && "border-ok bg-ok/8",
                isWrong && "text-muted-foreground line-through",
                pick && !isRight && !isWrong && "opacity-55"
              )}
            >
              <span aria-hidden className={cn("grid size-5 shrink-0 place-items-center rounded-full border border-rule/70", isRight && "border-ok bg-ok text-background")}>
                {isRight && <CheckIcon className="size-3" strokeWidth={3} />}
                {isWrong && <X className="size-3" strokeWidth={3} />}
              </span>
              <span>
                {f.name} <span className="text-muted-foreground">({f.by})</span>
              </span>
            </button>
          )
        })}
      </div>
      {pick && (
        <>
          <p role="status" className="text-sm text-muted-foreground">
            <b className="font-semibold text-foreground">{right.name}:</b> {right.one} {sheetNo(right.s)}.
          </p>
          <div>
            <Button autoFocus onClick={() => setK((x) => x + 1)}>
              Next <ArrowRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function Flashcards() {
  const [i, setI] = React.useState(0)
  const [back, setBack] = React.useState(false)
  const f = FRAMEWORKS[i]
  const go = (d: number) => {
    setBack(false)
    setI((x) => (x + d + FRAMEWORKS.length) % FRAMEWORKS.length)
  }
  return (
    <div
      className="grid gap-4"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1)
        if (e.key === "ArrowLeft") go(-1)
      }}
    >
      <button
        type="button"
        onClick={() => setBack((b) => !b)}
        aria-pressed={back}
        aria-label={back ? `${f.name}, answer side. Tap to flip back.` : `${f.name}. Tap to flip.`}
        // The answer is a table inside this button; the label above would hide it, so it is attached as the description and announced when it appears.
        aria-describedby={back ? `fw-${f.id}` : undefined}
        className="block w-full text-left [perspective:1400px]"
      >
        <div
          className="grid transition-transform duration-(--dur-draw) ease-(--ease-draft) [transform-style:preserve-3d]"
          style={{ transform: back ? "rotateY(180deg)" : "none" }}
        >
          <div
            aria-hidden={back}
            className="rounded-2xl col-start-1 row-start-1 grid min-h-[320px] place-items-center bg-card p-6 text-center [backface-visibility:hidden]"
          >
            <div className="grid gap-3">
              <span className="label-mono">
                {sheetNo(f.s)} · {f.by}
              </span>
              <span className="text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-4xl">{f.name}</span>
              <span className="text-sm text-muted-foreground">Say the parts out loud.</span>
            </div>
          </div>
          <div aria-hidden={!back} aria-live="polite" className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {back && <FrameworkCard f={f} className="min-h-[320px]" compact />}
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => go(-1)}>
          <ArrowLeft className="size-4" /> Previous
        </Button>
        <span className="font-mono text-xs text-muted-foreground tnum">
          {i + 1} of {FRAMEWORKS.length}
        </span>
        <Button variant="outline" onClick={() => go(1)}>
          Next <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function PracticeClient() {
  const { state, ready } = useProgress()
  const due = ready ? dueOf(state.review).length : 0
  const [tab, setTab] = React.useState<string | null>(null)
  // opens on Review when something is due, once saved progress has loaded
  React.useEffect(() => {
    if (ready && tab === null) setTab(dueOf(state.review).length ? "review" : "drill")
  }, [ready, tab, state.review])
  return (
    <div className="grid gap-6">
      <Stats />
      <SheetLink />
      <Tabs value={tab ?? "drill"} onValueChange={setTab} className="gap-5">
        <TabsList className="grid h-auto w-full grid-cols-2 group-data-[orientation=horizontal]/tabs:h-auto rounded-[24px] bg-muted p-1 sm:flex sm:w-fit sm:justify-start sm:rounded-full">
          {[
            ["review", due ? `Review · ${due}` : "Review"],
            ["drill", "Drill"],
            ["final", "Final test"],
            ["match", "Which framework?"],
            ["flash", "Flashcards"],
          ].map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className={cn(
                "min-h-11 flex-1 rounded-full px-4 text-sm text-muted-foreground not-data-active:hover:text-foreground data-active:bg-foreground data-active:font-semibold data-active:text-background sm:flex-none",
                // on a phone Review takes the first row to itself, so the other four sit two by two
                v === "review" && "col-span-2 sm:col-auto"
              )}
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="review">
          <Drill review />
        </TabsContent>
        <TabsContent value="drill">
          <Drill />
        </TabsContent>
        <TabsContent value="final">
          <Drill final />
        </TabsContent>
        <TabsContent value="match">
          <Match />
        </TabsContent>
        <TabsContent value="flash">
          <Flashcards />
        </TabsContent>
      </Tabs>
    </div>
  )
}
