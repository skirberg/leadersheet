"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowLeft, ArrowRight, Check as CheckIcon, ChevronDown, Maximize, Minus, Pause, Play, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Num } from "@/components/motion/number"
import { FrameworkRail } from "@/components/learn/call-parts"
import { CASES, GRADE_LABEL, type Case, type Grade } from "@/data/cases"
import { SESSIONS, fwById, lessonPath, sessionById } from "@/data/course"
import { callIndex, callNumber } from "@/data/daily"
import { cn } from "@/lib/utils"

/*
  Class mode: one decision for a room, on a projector, with no accounts and no network. The steps are peer
  instruction's: everyone votes alone, finds someone who chose differently and tries to convince them for two to
  four minutes, then votes again, and only then sees the reveal (Crouch and Mazur 2001). Discussion helps even when
  nobody in a group started with the strong answer (Smith et al. 2009). Votes are a show of hands the host counts in;
  counting is optional. Nothing is stored or sent.
*/

const STEPS = ["Think", "Vote", "Talk", "Vote again", "Reveal"] as const
const LETTERS = "ABCD"

function Tally({ c, votes, setVotes, before }: { c: Case; votes: number[]; setVotes: (v: number[]) => void; before?: number[] }) {
  const total = votes.reduce((a, b) => a + b, 0)
  return (
    <ul className="grid gap-3">
      {c.choices.map((o, i) => (
        <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-background/40 px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <span className="font-mono text-3xl font-medium">{LETTERS[i]}</span>
          <span className="line-clamp-2 text-lg leading-snug">{o.says}</span>
          <span className="col-span-2 flex items-center gap-2 justify-self-end sm:col-span-1">
            <Button variant="outline" size="icon" className="size-12" aria-label={`One fewer for ${LETTERS[i]}`} onClick={() => setVotes(votes.map((v, k) => (k === i ? Math.max(0, v - 1) : v)))}>
              <Minus className="size-5" />
            </Button>
            <span className="w-14 text-center font-mono text-4xl font-medium tnum" aria-live="polite" aria-label={`${votes[i]} for ${LETTERS[i]}`}>
              {votes[i]}
            </span>
            <Button variant="outline" size="icon" className="size-12" aria-label={`One more for ${LETTERS[i]}`} onClick={() => setVotes(votes.map((v, k) => (k === i ? v + 1 : v)))}>
              <Plus className="size-5" />
            </Button>
          </span>
          <div className="col-span-2 h-2 overflow-hidden rounded-full bg-border sm:col-span-3" aria-hidden>
            <div className="h-full rounded-full bg-foreground transition-[width] duration-(--dur-draw) ease-(--ease-draft)" style={{ width: total ? `${(votes[i] / total) * 100}%` : 0 }} />
          </div>
          {before && <p className="col-span-2 sm:col-span-3 font-mono text-xs text-muted-foreground tnum">First vote: {before[i]}</p>}
        </li>
      ))}
    </ul>
  )
}

function Timer() {
  const [secs, setSecs] = React.useState(120)
  const [left, setLeft] = React.useState(120)
  const [on, setOn] = React.useState(false)
  React.useEffect(() => {
    if (!on) return
    const end = Date.now() + left * 1000
    const h = setInterval(() => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setLeft(s)
      if (s === 0) setOn(false)
    }, 250)
    return () => clearInterval(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on])
  const set = (s: number) => {
    const v = Math.min(600, Math.max(30, s))
    setSecs(v)
    setLeft(v)
    setOn(false)
  }
  return (
    <div className="grid justify-items-center gap-4">
      <p className={cn("font-mono text-[96px] leading-none font-medium tracking-tight tnum sm:text-[140px]", left === 0 && "text-signal")} aria-label={`${Math.floor(left / 60)} minutes ${left % 60} seconds left`}>
        <Num value={Math.floor(left / 60)} />:<Num value={left % 60} pad={2} />
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={() => set(secs - 30)} aria-label="30 seconds less">
          <Minus className="size-4" /> 30 s
        </Button>
        <Button size="lg" onClick={() => (left === 0 ? (setLeft(secs), setOn(true)) : setOn(!on))}>
          {on ? <Pause className="size-4" /> : <Play className="size-4" />} {on ? "Pause" : left === secs ? "Start the clock" : left === 0 ? "Again" : "Resume"}
        </Button>
        <Button variant="outline" onClick={() => set(secs + 30)} aria-label="30 seconds more">
          <Plus className="size-4" /> 30 s
        </Button>
      </div>
    </div>
  )
}

/** How the room moved on one call: the first vote faint, the vote after talking in ink, each with its share. */
function Shift({ first, after }: { first: number | null; after: number | null }) {
  const row = (v: number, ink: boolean, label: string) => (
    <span className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3">
      <span className="h-2 overflow-hidden rounded-full bg-border">
        <span className={cn("block h-full rounded-full transition-[width] duration-(--dur-draw) ease-(--ease-draft)", ink ? "bg-foreground" : "bg-rule/60")} style={{ width: `${v}%` }} />
      </span>
      <span className={cn("font-mono text-sm tnum", !ink && "text-muted-foreground")}>
        {v}%<span className="sr-only"> {label}</span>
      </span>
    </span>
  )
  return (
    <span className="grid max-w-[440px] gap-1">
      {first != null && row(first, after == null, "on the first vote")}
      {after != null && row(after, true, "after talking")}
    </span>
  )
}

const Mark = ({ g }: { g: Grade }) => (
  <span aria-hidden className={cn("grid size-7 shrink-0 place-items-center rounded-full border", g === "strong" ? "border-ok bg-ok text-background" : "border-foreground bg-foreground text-background")}>
    {g === "strong" ? <CheckIcon className="size-4" strokeWidth={3} /> : g === "costly" ? <X className="size-4" strokeWidth={3} /> : <span className="block size-2 rounded-full bg-background" />}
  </span>
)

export function ClassMode() {
  // which case: today's call by default, or any lesson's (?case=s11); the day is the host's own, so it waits for the browser
  const [pick, setPick] = React.useState<string | null>(null)
  const [step, setStep] = React.useState(0)
  const [v1, setV1] = React.useState<number[]>([])
  const [v2, setV2] = React.useState<number[]>([])
  // which call's reason is open at the reveal: the strong one until the room asks about another (-1: none)
  const [open, setOpen] = React.useState<number | null>(null)
  const root = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const q = new URLSearchParams(location.search).get("case")
    setPick(q && CASES.some((c) => c.sheet === q) ? q : "today")
  }, [])

  const n = React.useMemo(() => callNumber(), [])
  const c = pick == null ? null : pick === "today" ? CASES[callIndex(n, CASES.length)] : CASES.find((x) => x.sheet === pick)!
  React.useEffect(() => {
    if (!c) return
    setV1(c.choices.map(() => 0))
    setV2(c.choices.map(() => 0))
    setOpen(null)
    setStep(0)
  }, [c])

  const go = React.useCallback((d: number) => setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d))), [])
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      // only fields that take typing or arrows keep their keys; after a click on Next, the arrows still move the steps
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1)
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1)
      if (e.key.toLowerCase() === "f") root.current?.requestFullscreen?.().catch(() => {})
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [go])
  // on a phone the Next button sits below the fold: bring the steps back into view when the step changes
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) return void (first.current = false)
    const r = root.current
    if (r && r.getBoundingClientRect().top < 0) r.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [step])
  React.useEffect(() => {
    if (step === STEPS.length - 1 && c) track("Class mode reveal", { sheet: c.sheet, counted: v1.some(Boolean) || v2.some(Boolean) ? "yes" : "no" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  if (!c) return <div className="min-h-[70vh] rounded-2xl bg-card" aria-busy="true" />
  const lesson = sessionById(c.sheet)
  const f = fwById(c.fw)
  const strong = c.choices.findIndex((o) => o.grade === "strong")
  const t1 = v1.reduce((a, b) => a + b, 0)
  const t2 = v2.reduce((a, b) => a + b, 0)
  const pct = (v: number[], t: number, i: number) => (t ? Math.round((v[i] / t) * 100) : 0)

  return (
    <div ref={root} className="grid min-h-[80vh] scroll-mt-24 content-start gap-6 bg-background py-2 [&:fullscreen]:overflow-y-auto [&:fullscreen]:p-6 sm:[&:fullscreen]:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex w-full min-w-0 items-center gap-2 text-sm sm:w-auto">
          <span className="label-mono shrink-0">Case</span>
          <select
            value={pick ?? "today"}
            onChange={(e) => {
              setPick(e.target.value)
              const u = new URL(location.href)
              if (e.target.value === "today") u.searchParams.delete("case")
              else u.searchParams.set("case", e.target.value)
              history.replaceState(null, "", u)
            }}
            className="min-h-11 w-full min-w-0 rounded-md border border-border bg-card px-3 text-base sm:w-auto"
          >
            <option value="today">Today&apos;s call, No. {n}</option>
            {SESSIONS.map((s) => (
              <option key={s.id} value={s.id}>
                Lesson {s.n}: {s.title}
              </option>
            ))}
          </select>
        </label>
        <Button variant="outline" onClick={() => root.current?.requestFullscreen?.().catch(() => {})}>
          <Maximize className="size-4" /> Full screen
        </Button>
      </div>

      {/* The five steps as stops on one line, the one you are on lit, instead of numbered pills. */}
      <ol className="relative grid grid-cols-5" aria-label="Steps">
        <span aria-hidden className="absolute top-[21px] right-[10%] left-[10%] h-px bg-border" />
        <span aria-hidden className="absolute top-[21px] left-[10%] h-px bg-foreground transition-[width] duration-(--dur-ui)" style={{ width: `${(step / (STEPS.length - 1)) * 80}%` }} />
        {STEPS.map((s, i) => (
          <li key={s} className="relative grid justify-items-center">
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className="grid min-h-11 justify-items-center gap-1.5 rounded-md px-1 pt-3.5 pb-1 text-center text-sm font-medium"
            >
              <span aria-hidden className={cn("size-3.5 rounded-full border-2 transition-colors duration-(--dur-ui)", i < step ? "border-foreground bg-foreground" : i === step ? "border-foreground bg-foreground ring-4 ring-foreground/15" : "border-rule/70 bg-background")} />
              <span className={cn(i === step ? "text-foreground" : i < step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-4">
        <p className="text-xl leading-relaxed sm:text-2xl">
          <b className="font-semibold">{c.role}</b> {c.setup}
        </p>
        <h2 className="text-3xl leading-tight font-semibold tracking-[-0.01em] text-balance sm:text-5xl">{c.ask}</h2>
      </div>

      {step === 0 && (
        <div className="grid gap-4">
          <ul className="grid gap-3">
            {c.choices.map((o, i) => (
              <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-4 rounded-xl border border-border bg-card px-5 py-4">
                <span className="font-mono text-3xl font-medium">{LETTERS[i]}</span>
                <span className="text-xl leading-snug sm:text-2xl">{o.says}</span>
              </li>
            ))}
          </ul>
          <p className="t-read">Everyone decides alone, without talking. Then hands up for A, B{c.choices.length > 2 ? ", C" : ""}{c.choices.length > 3 ? ", D" : ""}.</p>
        </div>
      )}
      {step === 1 && (
        <div className="grid gap-3">
          <p className="t-read">Hands up for each letter. Count them in, or skip the count.</p>
          <Tally c={c} votes={v1} setVotes={setV1} />
        </div>
      )}
      {step === 2 && (
        <div className="grid gap-6 py-4">
          <p className="text-center text-3xl leading-tight font-semibold text-balance sm:text-4xl">Find someone who chose differently. Convince them.</p>
          <Timer />
          <p className="text-center text-muted-foreground">Two to four minutes is the usual range for this step.</p>
        </div>
      )}
      {step === 3 && (
        <div className="grid gap-3">
          <p className="t-read">Same question, hands up again. Changing your mind is allowed.</p>
          <Tally c={c} votes={v2} setVotes={setV2} before={t1 ? v1 : undefined} />
        </div>
      )}
      {step === 4 && (
        <div className="grid gap-5" role="status">
          {t1 > 0 && t2 > 0 && (
            <p className="text-2xl font-semibold">
              The strong call: {pct(v1, t1, strong)}% on the first vote, {pct(v2, t2, strong)}% after talking.
            </p>
          )}
          <ul className="grid gap-3">
            {c.choices.map((o, i) => {
              const isOpen = (open ?? strong) === i
              return (
                <li key={i} className={cn("grid rounded-xl border bg-card", o.grade === "strong" ? "border-ok" : "border-border")}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`room-why-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 px-5 py-4 text-left sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <span className="font-mono text-3xl leading-none font-medium">{LETTERS[i]}</span>
                    <span className="grid gap-3">
                      <span className="text-xl leading-snug font-semibold">{o.says}</span>
                      {(t1 > 0 || t2 > 0) && <Shift first={t1 ? pct(v1, t1, i) : null} after={t2 ? pct(v2, t2, i) : null} />}
                    </span>
                    <span className="col-start-2 flex items-center gap-2 sm:col-start-3">
                      <Mark g={o.grade} />
                      <span className={cn("label-mono", o.grade === "strong" ? "text-ok" : "text-foreground")}>{GRADE_LABEL[o.grade]}</span>
                      <ChevronDown aria-hidden className={cn("size-5 transition-transform duration-(--dur-ui)", isOpen && "rotate-180")} />
                    </span>
                  </button>
                  <p id={`room-why-${i}`} hidden={!isOpen} className="px-5 pb-5 pl-[4.25rem] text-lg leading-relaxed">
                    {o.then}
                  </p>
                </li>
              )
            })}
          </ul>
          {f && (
            <FrameworkRail
              f={f}
              marks={c.choices.map((o, i) => ({ row: o.row, grade: o.grade, tag: LETTERS[i] }))}
              at={c.choices[open != null && open >= 0 ? open : strong].row}
            />
          )}
          {lesson && (
            <Link href={lessonPath(lesson.id)} className="inline-flex min-h-11 w-fit items-center gap-1.5 text-lg font-medium underline-offset-4 hover:underline">
              Lesson {lesson.n}: {lesson.title} <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button variant="outline" size="lg" onClick={() => go(-1)} disabled={step === 0}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">Arrow keys move, F for full screen</span>
        <Button size="lg" onClick={() => go(1)} disabled={step === STEPS.length - 1}>
          {step === STEPS.length - 2 ? "Reveal" : "Next"} <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
