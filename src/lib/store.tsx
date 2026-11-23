"use client"

import { track } from "@vercel/analytics"
import * as React from "react"
import { localDay, reschedule, type Review } from "./review"

export { localDay }
export { REVIEW_GAPS, dueOf } from "./review"

/* Progress lives in this browser only. Nothing is sent anywhere. */
const KEY = "leadersheet-progress"

export type Mode = "study" | "play"

type State = {
  mode: Mode
  best: Record<string, number>
  miss: string[]
  seen: Record<string, 1>
  lab: Record<string, unknown>
  /** Local dates (YYYY-MM-DD) on which the visitor did something: answered, decided, played. Newest last. */
  days: string[]
  /** Missed check questions on a schedule: the box it is in and the local day it is next due. */
  review: Review
}
const EMPTY: State = { mode: "study", best: {}, miss: [], seen: {}, lab: {}, days: [], review: {} }




/**
 * Days in a row with some learning, counted back from today, or from yesterday when today has nothing yet
 * (the streak is still alive until the day ends). `today` says whether today already counts.
 */
export function streakOf(days: string[], now = new Date()) {
  const set = new Set(days)
  const today = set.has(localDay(now))
  const d = new Date(now)
  if (!today) d.setDate(d.getDate() - 1)
  let count = 0
  while (set.has(localDay(d))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return { count, today }
}

const withToday = (s: State): State => {
  const t = localDay()
  return s.days[s.days.length - 1] === t ? s : { ...s, days: [...s.days.filter((x) => x !== t), t].slice(-400) }
}

type Ctx = {
  ready: boolean
  state: State
  mode: Mode
  setMode: (m: Mode) => void
  setBest: (sid: string, n: number) => void
  /** sure: 0 sure, 1 fairly sure, 2 guessing (SURE in daily.ts); left out by callers that do not ask */
  markMiss: (qid: string, ok: boolean, sure?: number) => void
  markSeen: (sid: string) => void
  lab: <T>(k: string, fallback: T) => T
  setLab: (k: string, v: unknown) => void
  /** Several lab keys in one update; a key set to undefined is removed, so the lab falls back to its default. */
  patchLab: (patch: Record<string, unknown>) => void
  /** Counts today toward the streak: any answer, decision, lab or game. */
  touch: () => void
  reset: () => void
}

const ProgressContext = React.createContext<Ctx | null>(null)

function load(): State {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}")
    if (!v || typeof v !== "object") return EMPTY
    return {
      mode: v.mode === "play" ? "play" : "study",
      best: v.best ?? {},
      miss: Array.isArray(v.miss) ? v.miss : [],
      seen: v.seen ?? {},
      lab: v.lab ?? {},
      days: Array.isArray(v.days) ? v.days.filter((x: unknown) => typeof x === "string") : [],
      // misses saved before the schedule existed are due today
      review:
        v.review && typeof v.review === "object"
          ? v.review
          : Object.fromEntries((Array.isArray(v.miss) ? v.miss : []).map((q: string) => [q, { box: 0, due: localDay() }])),
    }
  } catch {
    return EMPTY
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(EMPTY)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setState(load())
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {}
  }, [state, ready])

  const value = React.useMemo<Ctx>(
    () => ({
      ready,
      state,
      mode: state.mode,
      setMode: (m) => {
        setState((s) => ({ ...s, mode: m }))
        track("Mode switched", { mode: m })
      },
      setBest: (sid, n) =>
        setState((s) => withToday({ ...s, best: { ...s.best, [sid]: Math.max(s.best[sid] ?? 0, n) } })),
      markMiss: (qid, ok, sure) =>
        setState((s) => {
          const has = s.miss.includes(qid)
          const miss = ok && has ? s.miss.filter((x) => x !== qid) : !ok && !has ? [...s.miss, qid] : s.miss
          // a right answer on a guess is not known yet, so review treats it like a miss (it is not counted as one)
          const next = reschedule(s.review[qid], ok && sure !== 2)
          const review = { ...s.review }
          if (next === null) delete review[qid]
          else if (next) review[qid] = next
          // how often each level of confidence was right: { "0": [right, answered], ... } (SURE in daily.ts)
          let lab = s.lab
          if (sure != null) {
            const calib = { ...((s.lab.calib as Record<string, [number, number]>) ?? {}) }
            const [r, n] = calib[sure] ?? [0, 0]
            calib[sure] = [r + (ok ? 1 : 0), n + 1]
            lab = { ...s.lab, calib }
          }
          return withToday({ ...s, miss, review, lab })
        }),
      touch: () => setState(withToday),
      markSeen: (sid) =>
        setState((s) => (s.seen[sid] ? s : { ...s, seen: { ...s.seen, [sid]: 1 } })),
      lab: <T,>(k: string, fallback: T) => (k in state.lab ? (state.lab[k] as T) : fallback),
      setLab: (k, v) => setState((s) => ({ ...s, lab: { ...s.lab, [k]: v } })),
      patchLab: (patch) =>
        setState((s) => {
          const lab = { ...s.lab, ...patch }
          for (const [k, v] of Object.entries(patch)) if (v === undefined) delete lab[k]
          return { ...s, lab }
        }),
      reset: () => setState((s) => ({ ...EMPTY, mode: s.mode, days: s.days, review: {} })),
    }),
    [ready, state]
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const c = React.useContext(ProgressContext)
  if (!c) throw new Error("useProgress needs ProgressProvider")
  return c
}

export function useReducedMotion() {
  const [rm, setRm] = React.useState(false)
  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)")
    setRm(m.matches)
    const on = () => setRm(m.matches)
    m.addEventListener("change", on)
    return () => m.removeEventListener("change", on)
  }, [])
  return rm
}
