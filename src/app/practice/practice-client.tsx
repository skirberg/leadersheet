"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check as CheckIcon, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Question } from "@/components/learn/quiz"
import { FrameworkCard } from "@/components/learn/framework-card"
import { FRAMEWORKS, SESSIONS, findCheck, fwById, sessionById, sheetNo } from "@/data/course"
import { SCENARIOS } from "@/data/labs"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

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
  const answered = SESSIONS.reduce((a, s) => a + (state.best[s.id] ?? 0), 0)
  const cells = [
    [ready ? `${answered}/36` : "0/36", "Check score"],
    [ready ? String(state.miss.length) : "0", "To review"],
    [String(FRAMEWORKS.length), "Frameworks"],
  ]
  return (
    <dl className="grid grid-cols-3 border-t border-l border-border">
      {cells.map(([v, k]) => (
        <div key={k} className="flex flex-col justify-between gap-1 border-r border-b border-border p-3 sm:p-4">
          <dt className="label-mono !text-[10px] sm:!text-[11px]">{k}</dt>
          <dd className="font-mono text-2xl font-medium tnum sm:text-3xl">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Drill() {
  const { state, markMiss } = useProgress()
  const [qs, setQs] = React.useState<string[] | null>(null)
  const [i, setI] = React.useState(0)
  const [score, setScore] = React.useState(0)
  const [answered, setAnswered] = React.useState(false)
  const start = React.useCallback(() => {
    const pool = SESSIONS.flatMap((s) => s.checks.map((_, k) => `${s.id}-${k}`))
    const miss = state.miss.filter((x) => pool.includes(x))
    const rest = shuffle(pool.filter((x) => !miss.includes(x)))
    setQs([...miss, ...rest].slice(0, 10))
    setI(0)
    setScore(0)
    setAnswered(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(() => start(), [start])
  if (!qs) return <div className="h-80" />
  if (i >= qs.length)
    return (
      <div className="corners grid gap-4 border border-border bg-card p-6">
        <p className="font-mono text-6xl font-medium tnum">
          {score}
          <span className="text-muted-foreground">/{qs.length}</span>
        </p>
        <p className="text-muted-foreground">Missed questions come back first next time.</p>
        <div>
          <Button onClick={start}>
            <RotateCcw className="size-4" /> Drill again
          </Button>
        </div>
      </div>
    )
  const qid = qs[i],
    q = findCheck(qid)!,
    s = sessionById(qid.split("-")[0])!
  return (
    <div className="corners grid gap-5 border border-border bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="shrink-0 font-mono text-xs whitespace-nowrap text-muted-foreground tnum">
          {String(i + 1).padStart(2, "0")} / {qs.length}
        </span>
        <span className="label-mono text-right">
          {sheetNo(s.n)} · {s.title}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-foreground transition-[width] duration-300" style={{ width: `${(i / qs.length) * 100}%` }} />
      </div>
      <Question
        key={qid + i}
        q={q}
        qid={qid}
        onAnswer={(ok) => {
          markMiss(qid, ok)
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
      <div className="corners grid gap-4 border border-border bg-card p-6">
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
    <div className="corners grid gap-5 border border-border bg-card p-5 sm:p-6">
      <span className="font-mono text-xs text-muted-foreground tnum">
        SITUATION {String(k + 1).padStart(2, "0")} / {order.length}
      </span>
      <p className="text-2xl leading-snug font-semibold tracking-[-0.01em]">{sc[0]}</p>
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
                "flex min-h-11 items-center gap-3 rounded-md border border-border bg-background/40 px-4 py-2.5 text-left text-[15px] transition-colors",
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
            <b className="font-semibold text-foreground">{right.name}:</b> {right.one} Sheet {sheetNo(right.s)}.
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
        className="block w-full text-left [perspective:1400px]"
      >
        <div
          className="grid transition-transform duration-500 ease-(--ease-draft) [transform-style:preserve-3d]"
          style={{ transform: back ? "rotateY(180deg)" : "none" }}
        >
          <div
            aria-hidden={back}
            className="corners drafting-grid col-start-1 row-start-1 grid min-h-[320px] place-items-center border border-border bg-card p-6 text-center [backface-visibility:hidden]"
          >
            <div className="grid gap-3">
              <span className="label-mono">
                {sheetNo(f.s)} · {f.by}
              </span>
              <span className="text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-4xl">{f.name}</span>
              <span className="text-sm text-muted-foreground">Say the parts out loud, then tap to flip.</span>
            </div>
          </div>
          <div aria-hidden={!back} className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <FrameworkCard f={f} className="min-h-[320px]" compact />
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => go(-1)}>
          <ArrowLeft className="size-4" /> Previous
        </Button>
        <span className="font-mono text-xs text-muted-foreground tnum">
          {String(i + 1).padStart(2, "0")} / {FRAMEWORKS.length}
        </span>
        <Button variant="outline" onClick={() => go(1)}>
          Next <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function PracticeClient() {
  return (
    <div className="grid gap-6">
      <Stats />
      <Tabs defaultValue="drill" className="gap-5">
        <TabsList className="h-auto w-full justify-start rounded-md border border-border bg-muted p-1 sm:w-fit">
          {[
            ["drill", "Drill"],
            ["match", "Which framework?"],
            ["flash", "Flashcards"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="min-h-10 flex-1 rounded-[4px] px-4 text-sm text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_var(--rule)] sm:flex-none">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="drill">
          <Drill />
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
